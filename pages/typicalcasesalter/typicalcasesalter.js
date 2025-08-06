Page({
  data: {
    // 页面数据
  },

  onLoad() {
    console.log('典型案例修改页面加载');
  },



  // 增加案例
  addCase() {
    wx.navigateTo({
      url: '/pages/typicalcases_add/typicalcases_add'
    });
  },

  // 删除案例（跳转到删除页面）
  deleteCase() {
    wx.navigateTo({
      url: '/pages/typicalcases_delete/typicalcases_delete'
    });
  }
});
