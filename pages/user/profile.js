const { request } = require('../../utils/request');
const storage = require('../../utils/storage');
const app = getApp();

Page({
  data: {
    nickname: '',
    phone: '',
    avatar: '',
    canEditPhone: true
  },

  onLoad() {
    const userInfo = storage.getUserInfo() || app.globalData.userInfo || {};
    this.setData({
      nickname: userInfo.nickname || '',
      phone: userInfo.phone || '',
      avatar: userInfo.avatar || ''
    });
  },

  // 选择头像
  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePath = res.tempFilePaths[0];
        this.setData({ avatar: filePath });
        this.uploadAvatar(filePath);
      }
    });
  },

  async uploadAvatar(filePath) {
    try {
      const { uploadImage } = require('../../utils/request');
      const url = await uploadImage(filePath);
      this.setData({ avatar: url });
    } catch (e) {
      // 上传失败但保留本地预览
    }
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value });
  },

  // 获取手机号（微信授权）
  getPhoneNumber(e) {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 向后台发送加密的手机号数据
      request('/auth/phone', 'POST', {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      }).then(data => {
        this.setData({ phone: data.phone || '' });
      }).catch(() => {
        wx.showToast({ title: '获取手机号失败', icon: 'none' });
      });
    }
  },

  // 保存
  async saveProfile() {
    if (!this.data.nickname.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    try {
      const userInfo = await request('/users/profile', 'PUT', {
        nickname: this.data.nickname.trim(),
        avatar: this.data.avatar,
        phone: this.data.phone
      });
      storage.set('userInfo', userInfo);
      app.globalData.userInfo = userInfo;
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  }
});
