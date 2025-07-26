// app.js
App({
  globalData: {
    userInfo: {
      name: '谢佳艺',
      phone: '15816782067',
      password: '********'
    }
  },

  /**
   * 更新全局用户信息
   */
  updateUserInfo(newUserInfo) {
    console.log('=== 开始更新全局用户信息 ===');
    console.log('旧信息:', JSON.stringify(this.globalData.userInfo));
    console.log('新信息:', JSON.stringify(newUserInfo));

    // 直接替换用户信息
    this.globalData.userInfo = {
      name: newUserInfo.name || this.globalData.userInfo.name,
      phone: newUserInfo.phone || this.globalData.userInfo.phone,
      password: newUserInfo.password || this.globalData.userInfo.password
    };

    console.log('更新后信息:', JSON.stringify(this.globalData.userInfo));

    // 保存到本地存储
    try {
      wx.setStorageSync('currentUserInfo', this.globalData.userInfo);
      console.log('用户信息已保存到本地存储');
    } catch (e) {
      console.error('保存用户信息到本地存储失败:', e);
    }

    console.log('=== 用户信息更新完成 ===');
  },

  /**
   * 获取全局用户信息
   */
  getUserInfo() {
    // 优先从本地存储获取最新信息
    try {
      const localUserInfo = wx.getStorageSync('currentUserInfo');
      if (localUserInfo && localUserInfo.name) {
        this.globalData.userInfo = localUserInfo;
        console.log('从本地存储获取用户信息:', JSON.stringify(localUserInfo));
        return localUserInfo;
      }
    } catch (e) {
      console.log('获取本地用户信息失败:', e);
    }

    console.log('返回默认用户信息:', JSON.stringify(this.globalData.userInfo));
    return this.globalData.userInfo;
  }
})
