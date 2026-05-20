const { request } = require('../../utils/request');

Page({
  data: {
    serviceId: '',
    service: null,
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ serviceId: options.id });
      this.loadDetail(options.id);
    }
  },

  async loadDetail(id) {
    try {
      const data = await request(`/services/${id}`);
      this.setData({ service: data, loading: false });
    } catch (e) {
      // Fallback mock
      this.setData({
        loading: false,
        service: {
          id: parseInt(id),
          name: '单颗普通点痣',
          cover_image: '',
          images: [],
          price: 19900,
          duration: 30,
          sales_count: 1280,
          description: '<p>采用先进激光技术，精准去除单颗普通痣，创伤小、恢复快。</p><p>适合面部、身体等各部位常规痣。</p>',
          notes: '1. 术前需保持皮肤清洁\n2. 术后24小时内避免沾水\n3. 一周内避免阳光直射\n4. 如有异常及时联系医生',
          tags: ['激光', '无痛', '快速']
        }
      });
    }
  },

  goToBooking() {
    wx.navigateTo({
      url: `/pages/booking/select?serviceId=${this.data.serviceId}`
    });
  },

  onShareAppMessage() {
    const s = this.data.service;
    return {
      title: s ? s.name : '点痣医美',
      path: `/pages/service/detail?id=${this.data.serviceId}`
    };
  }
});
