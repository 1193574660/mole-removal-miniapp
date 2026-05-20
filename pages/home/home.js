const { request } = require('../../utils/request');
const app = getApp();

Page({
  data: {
    banners: [
      { id: 1, image: '/images/banner-1.png', link: '' },
      { id: 2, image: '/images/banner-2.png', link: '' }
    ],
    categories: [
      { id: 1, name: '面部点痣', icon: '/images/icon-face.png' },
      { id: 2, name: '身体点痣', icon: '/images/icon-body.png' },
      { id: 3, name: '复合痣', icon: '/images/icon-complex.png' },
      { id: 4, name: '色素痣', icon: '/images/icon-pigment.png' }
    ],
    hotServices: [],
    featuredDoctors: [],
    newsList: []
  },

  onLoad() {
    this.loadHomeData();
  },

  onShow() {
    // 每次显示时刷新
  },

  onPullDownRefresh() {
    this.loadHomeData().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadHomeData() {
    try {
      // 并行请求首页数据
      const [services, doctors] = await Promise.all([
        request('/services', 'GET', { page: 1, pageSize: 4 }),
        request('/doctors', 'GET', { pageSize: 3 })
      ]);
      this.setData({
        hotServices: (services && services.list) || [],
        featuredDoctors: (doctors && doctors.list) || []
      });
    } catch (e) {
      // 使用静态数据作为 fallback
      this.setData({
        hotServices: this.getMockServices(),
        featuredDoctors: this.getMockDoctors()
      });
    }
  },

  // 跳转服务列表
  goToServiceList(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/service/list?categoryId=${id || ''}&categoryName=${name || '全部服务'}`
    });
  },

  // 跳转服务详情
  goToServiceDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/service/detail?id=${id}` });
  },

  // 快捷预约
  quickBook(e) {
    const serviceId = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/booking/select?serviceId=${serviceId}` });
  },

  // 拨打电话咨询
  callConsult() {
    wx.makePhoneCall({ phoneNumber: '400-123-4567' });
  },

  // Mock 数据（开发阶段）
  getMockServices() {
    return [
      { id: 1, name: '单颗普通点痣', cover_image: '', price: 19900, duration: 30, sales_count: 1280 },
      { id: 2, name: '面部点痣（3颗以内）', cover_image: '', price: 49900, duration: 60, sales_count: 856 },
      { id: 3, name: '复合痣点除', cover_image: '', price: 89900, duration: 90, sales_count: 432 },
      { id: 4, name: '全身点痣套餐', cover_image: '', price: 299900, duration: 180, sales_count: 156 }
    ];
  },

  getMockDoctors() {
    return [
      { id: 1, name: '李医生', title: '资深医美专家 · 15年经验', avatar: '' },
      { id: 2, name: '王医生', title: '皮肤科主治医师 · 10年经验', avatar: '' },
      { id: 3, name: '张医生', title: '医美顾问 · 8年经验', avatar: '' }
    ];
  }
});
