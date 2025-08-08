Page({
  data: {
    // 页面数据
  },

  onLoad() {
    console.log('十五项项目页面加载');
  },

  onShow() {
    console.log('十五项项目页面显示');
  },

  // 查询按钮点击事件
  goToFifteenProjectsQuery() {
    // 直接跳转到查询页面
    wx.navigateTo({
      url: '/pages/fifteenprojectsquery/fifteenprojectsquery'
    });
  },

  // 删改按钮点击事件
  goToFifteenProjectsAlter() {
    // 直接跳转到删改页面
    wx.navigateTo({
      url: '/pages/fifteenprojectsalter/fifteenprojectsalter'
    });
  },


});
