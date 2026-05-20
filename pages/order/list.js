const { request } = require('../../utils/request');
const { formatDate, getOrderStatus } = require('../../utils/util');

Page({
  data: {
    orders: [],
    activeTab: 0,
    tabs: [
      { id: -1, name: '全部' },
      { id: 0, name: '待付款' },
      { id: 1, name: '待服务' },
      { id: 2, name: '已完成' },
      { id: 3, name: '已取消' }
    ],
    page: 1,
    hasMore: true,
    loading: false,
    refreshing: false
  },

  onShow() {
    this.resetAndLoad();
  },

  onPullDownRefresh() {
    this.resetAndLoad().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadOrders();
    }
  },

  switchTab(e) {
    const idx = e.currentTarget.dataset.index;
    this.setData({ activeTab: idx });
    this.resetAndLoad();
  },

  resetAndLoad() {
    this.setData({ page: 1, orders: [], hasMore: true });
    return this.loadOrders();
  },

  async loadOrders() {
    if (this.data.loading) return;
    this.setData({ loading: true });

    const tab = this.data.tabs[this.data.activeTab];
    const params = { page: this.data.page, pageSize: 10 };
    if (tab.id !== -1) params.status = tab.id;

    try {
      const data = await request('/orders', 'GET', params);
      const orders = (data.list || []).map(o => ({
        ...o,
        statusInfo: getOrderStatus(o.status),
        dateStr: formatDate(o.created_at, 'YYYY-MM-DD HH:mm')
      }));

      this.setData({
        orders: this.data.page === 1 ? orders : [...this.data.orders, ...orders],
        hasMore: orders.length >= 10,
        page: this.data.page + 1,
        loading: false
      });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  goToDetail(e) {
    const orderNo = e.currentTarget.dataset.orderNo;
    wx.navigateTo({ url: `/pages/order/detail?orderNo=${orderNo}` });
  },

  // 取消订单
  cancelOrder(e) {
    const orderNo = e.currentTarget.dataset.orderNo;
    const idx = e.currentTarget.dataset.index;
    const order = this.data.orders[idx];

    wx.showModal({
      title: '取消订单',
      content: '确定要取消这个订单吗？',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await request(`/orders/${orderNo}/cancel`, 'POST');
          wx.showToast({ title: '已取消', icon: 'success' });
          const orders = [...this.data.orders];
          orders[idx].status = 3;
          orders[idx].statusInfo = getOrderStatus(3);
          this.setData({ orders });
        } catch (e) {
          wx.showToast({ title: e.message || '取消失败', icon: 'none' });
        }
      }
    });
  },

  // 去支付
  goPay(e) {
    const orderNo = e.currentTarget.dataset.orderNo;
    this.requestPayment(orderNo);
  },

  async requestPayment(orderNo) {
    try {
      const payData = await request(`/orders/${orderNo}/pay`, 'POST');
      wx.requestPayment({
        timeStamp: payData.timeStamp,
        nonceStr: payData.nonceStr,
        package: payData.package,
        signType: payData.signType || 'MD5',
        paySign: payData.paySign,
        success: () => {
          wx.showToast({ title: '支付成功', icon: 'success' });
          this.resetAndLoad();
        },
        fail: () => {
          wx.showToast({ title: '支付取消', icon: 'none' });
        }
      });
    } catch (e) {
      wx.showToast({ title: '支付发起失败', icon: 'none' });
    }
  }
});
