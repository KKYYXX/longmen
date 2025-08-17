// pages/登录后的页面/登录后的页面.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    loginType: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('=== 登录后的页面加载 ===');
    this.loadUserInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('=== 登录后的页面显示 ===');
    this.loadUserInfo();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 处理页面返回事件
   */
  onBackPress() {
    // 当用户点击左上角返回按钮时，跳转到首页而不是回到登录页面
    wx.switchTab({
      url: '/pages/index/index'
    });
    return true; // 阻止默认的返回行为
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const app = getApp();
    const loginStatus = app.getLoginStatus();
    
    if (loginStatus.isLoggedIn && loginStatus.currentUser) {
      this.setData({
        userInfo: loginStatus.currentUser,
        loginType: loginStatus.loginType
      });
      console.log('加载用户信息成功:', loginStatus.currentUser);
    } else {
      console.log('用户未登录，跳转回登录页面');
      wx.switchTab({
        url: '/pages/personal/personal'
      });
    }
  },

  /**
   * 返回权限管理中心
   */
  onBackToAdmin() {
    if (this.data.loginType === 'admin') {
      wx.navigateTo({
        url: '/pages/admin/admin',
        success: () => {
          console.log('跳转权限管理中心成功');
        },
        fail: (err) => {
          console.error('跳转权限管理中心失败:', err);
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    }
  },

  /**
   * 退出登录
   */
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.clearLoginStatus();
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 1500,
            success: () => {
              setTimeout(() => {
                // 跳转到personal页面
                wx.switchTab({
                  url: '/pages/personal/personal'
                });
              }, 1500);
            }
          });
        }
      }
    });
  },

  /**
   * 点击首页标签
   */
  onHomeTab() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
})