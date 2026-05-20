App({
  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      this.login();
    }
  },

  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            wx.request({
              url: this.globalData.apiBase + '/auth/login',
              method: 'POST',
              data: { code: res.code },
              success: (resp) => {
                if (resp.statusCode === 200 && resp.data.code === 0) {
                  const { token, userInfo } = resp.data.data;
                  wx.setStorageSync('token', token);
                  wx.setStorageSync('userInfo', userInfo);
                  this.globalData.userInfo = userInfo;
                  resolve(userInfo);
                } else {
                  reject(resp.data);
                }
              },
              fail: reject
            });
          } else {
            reject(res);
          }
        },
        fail: reject
      });
    });
  },

  globalData: {
    apiBase: 'https://api.example.com/v1',
    userInfo: null
  }
});
