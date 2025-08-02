Page({
  // 增加文件按钮点击事件
  goToZcalterAdd() {
    wx.showToast({
      title: '正在进入...',
      icon: 'success',
      duration: 1500
    });
    
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/zcalter_add/zcalter_add'
      });
    }, 800);
  },

  // 删除文件按钮点击事件
  goToZcalterDelete() {
    wx.showToast({
      title: '正在进入...',
      icon: 'success',
      duration: 1500
    });
    
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/zcalter_delete/zcalter_delete'
      });
    }, 800);
  }
}); 