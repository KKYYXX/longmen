// pages/admin/admin.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      name: '',
      phone: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('=== admin页面加载 ===');
    console.log('权限管理中心页面加载', options);
    
    // 接收登录传递的用户信息
    if (options.name && options.phone) {
      this.setData({
        'userInfo.name': decodeURIComponent(options.name),
        'userInfo.phone': options.phone
      });
    }
    
    this.loadUserInfo();

    // 显示欢迎信息
    if (options.name) {
      wx.showToast({
        title: `欢迎 ${decodeURIComponent(options.name)}`,
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('=== admin页面显示 ===');
    this.loadUserInfo();
  },

  /**
   * 处理页面返回事件
   */
  onBackPress() {
    // 当用户点击左上角返回按钮时，返回到上一个页面（登录后的页面）
    wx.navigateBack({
      delta: 1
    });
    return true; // 阻止默认的返回行为
  },

  /**
   * 页面加载完成后的处理
   */
  onReady() {
    // 设置导航栏返回按钮的点击事件
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#f9e286'
    });
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const app = getApp();
    const userInfo = app.getUserInfo();

    console.log('admin页面获取到的用户信息:', JSON.stringify(userInfo));

    this.setData({
      userInfo: {
        name: userInfo.name || '未知用户',
        phone: userInfo.phone || '未知电话'
      }
    });

    console.log('admin页面设置的用户信息:', JSON.stringify(this.data.userInfo));
  },

  /**
   * 权限管理按钮点击事件
   */
  onLimitedManage() {
    console.log('点击了权限管理按钮');

    // 跳转到权限管理人员名单页面
    wx.navigateTo({
      url: '/pages/权限管理人员名单/权限管理人员名单',
      success: function() {
        console.log('成功跳转到权限管理人员名单页面');
      },
      fail: function(err) {
        console.error('跳转失败:', err);
        console.error('错误详情:', JSON.stringify(err));
        wx.showToast({
          title: '页面跳转失败: ' + (err.errMsg || '未知错误'),
          icon: 'none',
          duration: 3000
        });
      }
    });
  },

  /**
   * 负责人转让按钮点击事件
   */
  onTransferOwnership() {
    console.log('点击了负责人转让按钮');

    // 获取当前用户信息
    const userInfo = this.data.userInfo;
    console.log('传递用户信息:', userInfo);

    // 构建跳转URL，传递用户信息
    let url = '/pages/当前负责人/当前负责人';
    if (userInfo.name && userInfo.phone) {
      url += `?name=${encodeURIComponent(userInfo.name)}&phone=${userInfo.phone}`;
    }

    // 跳转到当前负责人页面
    wx.navigateTo({
      url: url,
      success: function() {
        console.log('成功跳转到当前负责人页面');
      },
      fail: function(err) {
        console.error('跳转失败:', err);
        console.error('错误详情:', JSON.stringify(err));
        wx.showToast({
          title: '页面跳转失败: ' + (err.errMsg || '未知错误'),
          icon: 'none',
          duration: 3000
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

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
    console.log('=== admin页面卸载 ===');
    
    // 检查登录状态
    const app = getApp();
    const loginStatus = app.getLoginStatus();
    
    // 如果用户已登录且是权限管理登录，跳转到登录后的页面
    if (loginStatus.isLoggedIn && loginStatus.loginType === 'admin') {
      console.log('权限管理用户退出，跳转到登录后的页面');
      
      // 使用setTimeout确保页面卸载完成后再跳转
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/登录后的页面/登录后的页面'
        });
      }, 100);
    }
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

  }

})
