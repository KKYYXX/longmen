// pages/当前负责人/当前负责人.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    managerInfo: {
      name: '',
      phone: ''
    }
  },

  /**
   * 转让按钮点击事件
   */
  onTransfer() {
    console.log('点击了转让按钮');
    console.log('当前负责人信息:', this.data.managerInfo);

    // 跳转到被转让人信息页面，传递当前负责人手机号
    wx.navigateTo({
      url: `/pages/被转让人信息/被转让人信息?currentPhone=${this.data.managerInfo.phone}`,
      success: function() {
        console.log('成功跳转到被转让人信息页面');
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
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('当前负责人页面加载', options);

    // 接收传递的负责人信息
    if (options.name && options.phone) {
      this.setData({
        'managerInfo.name': decodeURIComponent(options.name),
        'managerInfo.phone': options.phone
      });
      console.log('使用传递的用户信息:', {
        name: decodeURIComponent(options.name),
        phone: options.phone
      });
    } else {
      // 如果没有传递参数，从全局获取用户信息
      const app = getApp();
      const userInfo = app.getUserInfo();
      this.setData({
        managerInfo: {
          name: userInfo.name,
          phone: userInfo.phone
        }
      });
      console.log('使用全局用户信息:', userInfo);
    }
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
    console.log('当前负责人页面显示，开始刷新负责人信息');
    // 每次显示页面时从后端获取最新的负责人信息
    this.refreshCurrentManager();
  },

  /**
   * 从后端获取当前负责人信息
   */
  refreshCurrentManager() {
    console.log('开始刷新当前负责人信息');
    
    // 检查是否有新的用户信息可用
    const app = getApp();
    const currentUserInfo = app.getUserInfo();
    const oldManagerInfo = this.data.managerInfo;
    
    // 更新页面数据
    this.setData({
      managerInfo: {
        name: currentUserInfo.name || '未知用户',
        phone: currentUserInfo.phone || '未知电话'
      }
    });
    
    console.log('当前负责人信息已更新:', this.data.managerInfo);
    
    // 如果负责人信息有变化，显示提示
    if (oldManagerInfo.name && oldManagerInfo.name !== currentUserInfo.name) {
      wx.showToast({
        title: `负责人已更新为: ${currentUserInfo.name}`,
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 使用全局用户信息（备用方案）
   */
  useGlobalUserInfo() {
    const app = getApp();
    const userInfo = app.getUserInfo();
    
    this.setData({
      managerInfo: {
        name: userInfo.name || '未知用户',
        phone: userInfo.phone || '未知电话'
      }
    });
    
    console.log('使用全局用户信息:', this.data.managerInfo);
  },

  /**
   * 用户信息更新回调
   */
  onUserInfoUpdate(newUserInfo) {
    console.log('当前负责人页面收到用户信息更新:', newUserInfo);
    this.setData({
      managerInfo: {
        name: newUserInfo.name,
        phone: newUserInfo.phone
      }
    });
    console.log('当前负责人页面用户信息已更新:', this.data.managerInfo);
  },

  /**
   * 刷新用户信息
   */
  refreshUserInfo() {
    console.log('当前负责人页面刷新用户信息');
    const app = getApp();
    const userInfo = app.getUserInfo();
    this.setData({
      managerInfo: {
        name: userInfo.name,
        phone: userInfo.phone
      }
    });
    console.log('当前负责人页面用户信息刷新完成:', this.data.managerInfo);
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
});