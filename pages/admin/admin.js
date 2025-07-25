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
   * 有限管理按钮点击事件
   */
  onLimitedManage() {
    wx.showToast({
      title: '有限管理功能',
      icon: 'success',
      duration: 2000
    });
    console.log('点击了有限管理');
  },

  /**
   * 负责人转让按钮点击事件
   */
  onTransferOwnership() {
    wx.showModal({
      title: '负责人转让',
      content: '确定要进行负责人转让操作吗？',
      success: function(res) {
        if (res.confirm) {
          wx.showToast({
            title: '转让功能开发中',
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 接收登录传递的用户信息
    if (options.name && options.phone) {
      this.setData({
        'userInfo.name': decodeURIComponent(options.name),
        'userInfo.phone': options.phone
      });
    }
    console.log('权限管理中心页面加载', options);

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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

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
})
