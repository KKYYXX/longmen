Page({
  // 增加案例按钮点击事件
  goToTypicalCasesAdd() {
    wx.navigateTo({
      url: '/pages/typicalcases_add/typicalcases_add'
    });
  },

  // 删除案例按钮点击事件
  goToTypicalCasesDelete() {
    wx.navigateTo({
      url: '/pages/typicalcases_delete/typicalcases_delete'
    });
  }
});
