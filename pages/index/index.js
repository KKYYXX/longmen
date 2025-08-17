Page({
  data: {
    isLoggedIn: false,
    loginType: ''
  },
  
  onLoad() {
    console.log('页面加载成功');
    this.checkLoginStatus();
  },

  onShow() {
    console.log('页面显示');
    this.checkLoginStatus();
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const app = getApp();
    const loginStatus = app.getLoginStatus();
    
    this.setData({
      isLoggedIn: loginStatus.isLoggedIn,
      loginType: loginStatus.loginType
    });
    
    console.log('当前登录状态:', loginStatus);
  },
  
  // 图片加载成功
  imageLoad(e) {
    console.log('图片加载成功:', e);
  },

  // 图片加载失败
  imageError(e) {
    console.log('图片加载失败:', e);
    wx.showToast({
      title: '图片加载失败',
      icon: 'none'
    });
  },

  // 跳转到典型案例页面
  goToTypicalCases() {
    wx.navigateTo({  // 已修正拼写
      url: '/pages/typicalcases/typicalcases'
    })
  },

  // 跳转到十五项项目页面
  goToFifteenProjects() {
    wx.navigateTo({  // 已修正拼写
      url: '/pages/fifteenprojects/fifteenprojects'
    })
  },

  // 跳转到政策文件页面
  goToPolicyDocuments() {
    wx.navigateTo({  // 已修正拼写
      url: '/pages/zcdocuments/zcdocuments',
      success: () => {},
      fail: (err) => {
        console.error('页面跳转失败:', err);
      }
    });
  }
})
