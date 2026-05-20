const { request } = require('../../utils/request');
const storage = require('../../utils/storage');

Page({
  data: {
    serviceIds: '',
    doctorId: '',
    serviceDate: '',
    timeSlot: '',
    services: [],
    doctor: null,
    totalPrice: 0,
    // 表单
    name: '',
    phone: '',
    remark: '',
    // 支付
    orderNo: '',
    submitting: false
  },

  onLoad(options) {
    const { serviceIds, doctorId, date, slot } = options;
    this.setData({
      serviceIds: serviceIds || '',
      doctorId: doctorId || '',
      serviceDate: date || '',
      timeSlot: slot || ''
    });

    // 自动填充上次的联系信息
    const lastBooking = storage.get('lastBooking');
    if (lastBooking) {
      this.setData({
        name: lastBooking.name || '',
        phone: lastBooking.phone || ''
      });
    }

    this.loadPreview();
  },

  async loadPreview() {
    try {
      const data = await request('/orders/preview', 'POST', {
        serviceIds: this.data.serviceIds.split(',').map(Number),
        doctorId: this.data.doctorId,
        serviceDate: this.data.serviceDate,
        timeSlot: this.data.timeSlot
      });
      this.setData({
        services: data.services || [],
        doctor: data.doctor || this.getMockDoctor(),
        totalPrice: data.totalPrice || this.calcMockPrice()
      });
    } catch (e) {
      this.setData({
        services: this.getMockServices(),
        doctor: this.getMockDoctor(),
        totalPrice: this.calcMockPrice()
      });
    }
  },

  // 表单输入
  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },
  onRemarkInput(e) { this.setData({ remark: e.detail.value }); },

  // 提交订单并支付
  async submitOrder() {
    const { name, phone, submitting } = this.data;
    if (!name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!phone.trim() || !/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    if (submitting) return;

    this.setData({ submitting: true });

    try {
      // 创建订单
      const order = await request('/orders/create', 'POST', {
        serviceIds: this.data.serviceIds.split(',').map(Number),
        doctorId: this.data.doctorId,
        serviceDate: this.data.serviceDate,
        timeSlot: this.data.timeSlot,
        name: name.trim(),
        phone: phone.trim(),
        remark: this.data.remark.trim()
      });

      this.setData({ orderNo: order.orderNo });

      // 保存联系信息
      storage.set('lastBooking', { name: name.trim(), phone: phone.trim() });

      // 发起微信支付
      await this.requestPayment(order.orderNo);
    } catch (e) {
      this.setData({ submitting: false });
      wx.showToast({ title: e.message || '提交失败', icon: 'none' });
    }
  },

  // 微信支付
  async requestPayment(orderNo) {
    try {
      const payData = await request(`/orders/${orderNo}/pay`, 'POST');

      // 调起微信支付
      wx.requestPayment({
        timeStamp: payData.timeStamp,
        nonceStr: payData.nonceStr,
        package: payData.package,
        signType: payData.signType || 'MD5',
        paySign: payData.paySign,
        success: () => {
          wx.showToast({ title: '支付成功', icon: 'success' });
          setTimeout(() => {
            wx.redirectTo({ url: `/pages/order/detail?orderNo=${orderNo}` });
          }, 1500);
        },
        fail: () => {
          this.setData({ submitting: false });
          wx.showModal({
            title: '提示',
            content: '支付未完成，订单已生成，可在订单列表继续支付',
            confirmText: '查看订单',
            success: (res) => {
              if (res.confirm) {
                wx.redirectTo({ url: '/pages/order/list' });
              }
            }
          });
        }
      });
    } catch (e) {
      this.setData({ submitting: false });
      wx.showToast({ title: '支付发起失败', icon: 'none' });
    }
  },

  calcMockPrice() {
    const ids = (this.data.serviceIds || '').split(',').map(Number);
    const priceMap = { 1: 19900, 2: 49900, 3: 89900, 4: 129900 };
    return ids.reduce((sum, id) => sum + (priceMap[id] || 0), 0);
  },

  getMockServices() {
    const ids = (this.data.serviceIds || '').split(',').map(Number);
    const allServices = [
      { id: 1, name: '单颗普通点痣', price: 19900, duration: 30 },
      { id: 2, name: '面部点痣（3颗）', price: 49900, duration: 60 },
      { id: 3, name: '复合痣点除', price: 89900, duration: 90 },
      { id: 4, name: '色素痣激光去除', price: 129900, duration: 45 }
    ];
    return allServices.filter(s => ids.includes(s.id));
  },

  getMockDoctor() {
    const doctorMap = {
      '1': { id: 1, name: '李医生', title: '资深医美专家', avatar: '' },
      '2': { id: 2, name: '王医生', title: '皮肤科主治医师', avatar: '' },
      '3': { id: 3, name: '张医生', title: '医美顾问', avatar: '' }
    };
    return doctorMap[this.data.doctorId] || doctorMap['1'];
  }
});
