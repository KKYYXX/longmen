Page({
  // 增加文件按钮点击事件
  goToZcalterAdd() {
    wx.navigateTo({
      url: '/pages/zcalter_add/zcalter_add'
    });
  },

  // 删除文件按钮点击事件
  goToZcalterDelete() {
    wx.navigateTo({
      url: '/pages/zcalter_delete/zcalter_delete'
    });
  }
}); 