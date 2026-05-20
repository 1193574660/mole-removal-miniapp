const { request } = require('../../utils/request');
const { formatDate, getOrderStatus } = require('../../utils/util');

Page({
  data: {
    orderNo: '',
    order: null,
    loading: true
  },

  onLoad(options) {
    if (options.orderNo) {
      this.setData({ orderNo: options.orderNo });
      this.loadDetail(options.orderNo);
    }
  },

  async loadDetail(orderNo) {
    try {
      const data = await request(`/orders/${orderNo}`);
      this.setData({
        order: {
          ...data,
          statusInfo: getOrderStatus(data.status),
          createdStr: formatDate(data.created_at, 'YYYY-MM-DD HH:mm'),
          paidStr: data.paid_at ? formatDate(data.paid_at, 'YYYY-MM-DD HH:mm') : ''
        },
        loading: false
      });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  goPay() {
    const orderNo = this.data.orderNo;
    request(`/orders/${orderNo}/pay`, 'POST').then(payData => {
      wx.requestPayment({
        timeStamp: payData.timeStamp,
        nonceStr: payData.nonceStr,
        package: payData.package,
        signType: payData.signType || 'MD5',
        paySign: payData.paySign,
        success: () => {
          wx.showToast({ title: '支付成功', icon: 'success' });
          this.loadDetail(orderNo);
        },
        fail: () => {
          wx.showToast({ title: '支付取消', icon: 'none' });
        }
      });
    }).catch(e => {
      wx.showToast({ title: '支付发起失败', icon: 'none' });
    });
  },

  cancelOrder() {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消此订单吗？',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await request(`/orders/${this.data.orderNo}/cancel`, 'POST');
          wx.showToast({ title: '已取消', icon: 'success' });
          this.loadDetail(this.data.orderNo);
        } catch (e) {
          wx.showToast({ title: e.message || '取消失败', icon: 'none' });
        }
      }
    });
  },

  callService() {
    wx.makePhoneCall({ phoneNumber: '400-123-4567' });
  }
});
