const { request } = require('../../utils/request');

Page({
  data: {
    selectedServiceIds: [],   // 已选服务ID
    selectedServices: [],     // 已选服务详情
    selectedDoctorId: '',
    doctors: [],
    services: []
  },

  onLoad(options) {
    // 如果有传入 serviceId，预选该服务
    if (options.serviceId) {
      this.setData({
        selectedServiceIds: [parseInt(options.serviceId)]
      });
    }
    this.loadData();
  },

  async loadData() {
    try {
      const [servicesRes, doctorsRes] = await Promise.all([
        request('/services', 'GET', { pageSize: 50 }),
        request('/doctors', 'GET')
      ]);
      this.setData({
        services: servicesRes.list || this.getMockServices(),
        doctors: doctorsRes.list || this.getMockDoctors()
      });
    } catch (e) {
      this.setData({
        services: this.getMockServices(),
        doctors: this.getMockDoctors()
      });
    }
  },

  // 切换服务选择
  toggleService(e) {
    const id = e.currentTarget.dataset.id;
    let ids = [...this.data.selectedServiceIds];
    const idx = ids.indexOf(id);
    if (idx > -1) {
      ids.splice(idx, 1);
    } else {
      ids.push(id);
    }
    this.setData({ selectedServiceIds: ids });
  },

  // 选择医生
  selectDoctor(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ selectedDoctorId: id });
  },

  // 下一步 -> 选择日期
  goNext() {
    const { selectedServiceIds, selectedDoctorId } = this.data;
    if (selectedServiceIds.length === 0) {
      wx.showToast({ title: '请选择服务项目', icon: 'none' });
      return;
    }
    if (!selectedDoctorId) {
      wx.showToast({ title: '请选择医生', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: `/pages/booking/calendar?serviceIds=${selectedServiceIds.join(',')}&doctorId=${selectedDoctorId}`
    });
  },

  getMockServices() {
    return [
      { id: 1, name: '单颗普通点痣', price: 19900, duration: 30 },
      { id: 2, name: '面部点痣（3颗）', price: 49900, duration: 60 },
      { id: 3, name: '复合痣点除', price: 89900, duration: 90 },
      { id: 4, name: '色素痣激光去除', price: 129900, duration: 45 }
    ];
  },

  getMockDoctors() {
    return [
      { id: 1, name: '李医生', title: '资深医美专家', avatar: '' },
      { id: 2, name: '王医生', title: '皮肤科主治医师', avatar: '' },
      { id: 3, name: '张医生', title: '医美顾问', avatar: '' }
    ];
  }
});
