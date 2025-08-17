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
    newProject: null,        // 新添加的项目数据
    
    // 登录状态管理
    isLoggedIn: false,       // 是否已登录
    loginType: '',           // 登录类型：'normal' 或 'admin'
    currentUser: null        // 当前登录用户信息
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
   * 设置登录状态
   */
  setLoginStatus(isLoggedIn, loginType, userInfo) {
    this.globalData.isLoggedIn = isLoggedIn;
    this.globalData.loginType = loginType;
    this.globalData.currentUser = userInfo;
    
    // 保存到本地存储
    try {
      wx.setStorageSync('isLoggedIn', isLoggedIn);
      wx.setStorageSync('loginType', loginType);
      wx.setStorageSync('currentUser', userInfo);
      console.log('登录状态已保存到本地存储');
    } catch (e) {
      console.error('保存登录状态到本地存储失败:', e);
    }
  },

  /**
   * 获取登录状态
   */
  getLoginStatus() {
    return {
      isLoggedIn: this.globalData.isLoggedIn,
      loginType: this.globalData.loginType,
      currentUser: this.globalData.currentUser
    };
  },

  /**
   * 清除登录状态
   */
  clearLoginStatus() {
    this.globalData.isLoggedIn = false;
    this.globalData.loginType = '';
    this.globalData.currentUser = null;
    
    // 清除本地存储
    try {
      wx.removeStorageSync('isLoggedIn');
      wx.removeStorageSync('loginType');
      wx.removeStorageSync('currentUser');
      console.log('登录状态已清除');
    } catch (e) {
      console.error('清除登录状态失败:', e);
    }
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
      
      // 从本地存储恢复登录状态
      const isLoggedIn = wx.getStorageSync('isLoggedIn');
      const loginType = wx.getStorageSync('loginType');
      const currentUser = wx.getStorageSync('currentUser');
      
      if (isLoggedIn && loginType && currentUser) {
        this.globalData.isLoggedIn = isLoggedIn;
        this.globalData.loginType = loginType;
        this.globalData.currentUser = currentUser;
        console.log('从本地存储恢复登录状态:', { isLoggedIn, loginType, currentUser });
      }
    } catch (e) {
      console.error('从本地存储读取信息失败:', e);
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
