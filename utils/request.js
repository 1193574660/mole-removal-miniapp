const config = require('./config');

/**
 * 封装 wx.request，自动携带 token，处理 401
 * @param {string} url - 接口路径（不含 base）
 * @param {string} method - GET/POST/PUT/DELETE
 * @param {object} data - 请求参数
 * @param {boolean} showLoading - 是否显示 loading
 */
const request = (url, method = 'GET', data = {}, showLoading = true) => {
  const token = wx.getStorageSync('token');

  if (showLoading) {
    wx.showLoading({ title: '加载中...', mask: true });
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: config.apiBase + url,
      method,
      data,
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (showLoading) wx.hideLoading();

        if (res.statusCode === 200 && res.data.code === 0) {
          resolve(res.data.data);
        } else if (res.statusCode === 401) {
          // token 过期，清除并重新登录
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          const app = getApp();
          app.login().then(() => {
            // 重新发起请求
            request(url, method, data, showLoading).then(resolve).catch(reject);
          }).catch(() => {
            wx.showToast({ title: '登录已过期，请重试', icon: 'none' });
            reject(res.data);
          });
        } else {
          const msg = (res.data && res.data.message) || '请求失败';
          wx.showToast({ title: msg, icon: 'none' });
          reject(res.data || { message: msg });
        }
      },
      fail: (err) => {
        if (showLoading) wx.hideLoading();
        wx.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
        reject(err);
      }
    });
  });
};

/**
 * 上传图片到云存储（腾讯云 COS 示例）
 * 实际部署时需要替换为真实上传逻辑
 */
const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: '上传中...' });

    wx.uploadFile({
      url: config.apiBase + '/upload/image',
      filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data);
          if (data.code === 0) {
            resolve(data.data.url);
          } else {
            wx.showToast({ title: data.message || '上传失败', icon: 'none' });
            reject(data);
          }
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '上传失败', icon: 'none' });
        reject(err);
      }
    });
  });
};

module.exports = { request, uploadImage };
