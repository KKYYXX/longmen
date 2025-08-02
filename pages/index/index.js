// index.js
Page({
  data: {
    
  },
  
  onLoad() {
    console.log('页面加载成功');
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
  
  goToTypicalCase() {
    wx.showToast({
      title: '典型案例功能开发中',
      icon: 'none'
    });
  },

  goToBuildList() {
    wx.showToast({
      title: '15项共建清单功能开发中',
      icon: 'none'
    });
  },

  goToPolicyDocuments() {
    wx.navigateTo({
      url: '/pages/zcdocuments/zcdocuments'
    });
  }
})
