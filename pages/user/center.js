const storage = require('../../utils/storage');
const app = getApp();

Page({
  data: {
    userInfo: null,
    menuItems: [
      { icon: '📋', name: '我的预约', url: '/pages/order/list', badge: '' },
      { icon: '💬', name: '我的咨询', url: '/pages/consult/list', badge: '' },
      { icon: '❤️', name: '我的收藏', url: '', badge: '敬请期待' },
      { icon: '📞', name: '联系客服', type: 'call', phone: '400-123-4567' }
    ]
  },

  onShow() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userInfo = storage.getUserInfo() || app.globalData.userInfo;
    this.setData({ userInfo });
  },

  goToProfile() {
    wx.navigateTo({ url: '/pages/user/profile' });
  },

  onMenuItem(e) {
    const item = e.currentTarget.dataset.item;
    if (item.type === 'call') {
      wx.makePhoneCall({ phoneNumber: item.phone });
    } else if (item.url) {
      wx.navigateTo({ url: item.url });
    }
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录？',
      success: (res) => {
        if (res.confirm) {
          storage.clear();
          app.globalData.userInfo = null;
          this.setData({ userInfo: null });
          wx.showToast({ title: '已退出', icon: 'none' });
        }
      }
    });
  }
});
