// app.js
App({
  globalData: {
    userInfo: {
      name: '谢佳艺',
      phone: '15816782067',
      password: '********'
    },
    // 十五项项目相关的全局数据
    editingProject: null,    // 正在编辑的项目数据
    updatedProject: null,    // 更新后的项目数据
    newProject: null         // 新添加的项目数据
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

    console.log('=== 全局用户信息更新完成 ===');
  },

  /**
   * 获取全局用户信息
   */
  getUserInfo() {
    return this.globalData.userInfo;
  },

  /**
   * 应用启动时的初始化
   */
  onLaunch() {
    console.log('应用启动');
    
    // 从本地存储恢复用户信息
    try {
      const storedUserInfo = wx.getStorageSync('currentUserInfo');
      if (storedUserInfo) {
        this.globalData.userInfo = storedUserInfo;
        console.log('从本地存储恢复用户信息:', storedUserInfo);
      }
    } catch (e) {
      console.error('从本地存储读取用户信息失败:', e);
    }
  },

  /**
   * 应用显示时
   */
  onShow() {
    console.log('应用显示');
  },

  /**
   * 应用隐藏时
   */
  onHide() {
    console.log('应用隐藏');
  }
});
