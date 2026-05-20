/**
 * 本地存储工具 - 对 wx.storage 的封装
 */

const storage = {
  /**
   * 同步获取
   */
  get(key, defaultValue = null) {
    try {
      const value = wx.getStorageSync(key);
      return value !== '' ? value : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  /**
   * 同步设置
   */
  set(key, value) {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * 删除
   */
  remove(key) {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * 清空
   */
  clear() {
    try {
      wx.clearStorageSync();
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    return this.get('userInfo', null);
  },

  /**
   * 获取 token
   */
  getToken() {
    return this.get('token', '');
  },

  /**
   * 是否已登录
   */
  isLogin() {
    return !!this.getToken();
  }
};

module.exports = storage;
