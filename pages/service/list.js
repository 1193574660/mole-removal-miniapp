const { request } = require('../../utils/request');

Page({
  data: {
    categoryId: '',
    categoryName: '全部服务',
    services: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad(options) {
    if (options.categoryId) {
      this.setData({
        categoryId: options.categoryId,
        categoryName: options.categoryName || '服务列表'
      });
      wx.setNavigationBarTitle({ title: options.categoryName || '服务列表' });
    }
    this.loadServices();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, services: [], hasMore: true });
    this.loadServices().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadServices();
    }
  },

  async loadServices() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    try {
      const params = { page: this.data.page, pageSize: this.data.pageSize };
      if (this.data.categoryId) params.categoryId = this.data.categoryId;

      const data = await request('/services', 'GET', params, false);
      const newServices = data.list || [];

      this.setData({
        services: this.data.page === 1 ? newServices : [...this.data.services, ...newServices],
        hasMore: newServices.length >= this.data.pageSize,
        page: this.data.page + 1,
        loading: false
      });
    } catch (e) {
      // Fallback mock data
      const mock = this.getMockServices();
      this.setData({
        services: this.data.page === 1 ? mock : [...this.data.services, ...mock],
        hasMore: false,
        loading: false
      });
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/service/detail?id=${id}` });
  },

  quickBook(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/booking/select?serviceId=${id}` });
  },

  getMockServices() {
    return [
      { id: 1, name: '单颗普通点痣', cover_image: '', price: 19900, duration: 30, sales_count: 1280, description: '适合单颗小面积痣' },
      { id: 2, name: '面部点痣（3颗以内）', cover_image: '', price: 49900, duration: 60, sales_count: 856, description: '面部精细点痣' },
      { id: 3, name: '复合痣点除', cover_image: '', price: 89900, duration: 90, sales_count: 432, description: '复合痣专业处理' },
      { id: 4, name: '色素痣激光去除', cover_image: '', price: 129900, duration: 45, sales_count: 620, description: '色素痣激光去除' },
      { id: 5, name: '全身点痣套餐', cover_image: '', price: 299900, duration: 180, sales_count: 156, description: '全身多处点痣' },
      { id: 6, name: '术后修复护理', cover_image: '', price: 29900, duration: 30, sales_count: 920, description: '术后专业修复' }
    ];
  }
});
