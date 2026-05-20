const { request } = require('../../utils/request');

Page({
  data: {
    sessions: [],
    unreadCount: 0,
    loading: false
  },

  onShow() {
    this.loadSessions();
    this.loadUnreadCount();
  },

  onPullDownRefresh() {
    this.loadSessions().then(() => wx.stopPullDownRefresh());
  },

  async loadSessions() {
    this.setData({ loading: true });
    try {
      const data = await request('/consult/sessions');
      this.setData({ sessions: data.list || [], loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  async loadUnreadCount() {
    try {
      const data = await request('/consult/unread');
      const total = data.total || 0;
      this.setData({ unreadCount: total });
      // 更新 tabBar 红点
      if (total > 0) {
        wx.setTabBarBadge({ index: 1, text: String(total) });
      } else {
        wx.removeTabBarBadge({ index: 1 });
      }
    } catch (e) {
      // ignore
    }
  },

  goToChat(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/consult/chat?receiverId=${id}&receiverName=${name}` });
  }
});
