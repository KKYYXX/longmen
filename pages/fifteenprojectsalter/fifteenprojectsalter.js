Page({
  // 新增列按钮点击事件
  goToAddColumn() {
    wx.navigateTo({
      url: '/pages/fifteenprojects_add_column/fifteenprojects_add_column'
    });
  },

  // 新增项目按钮点击事件
  goToAddProject() {
    wx.navigateTo({
      url: '/pages/fifteenprojects_add_project/fifteenprojects_add_project'
    });
  },

  // 修改项目按钮点击事件
  goToModifyProjects() {
    wx.navigateTo({
      url: '/pages/fifteenprojects_modify/fifteenprojects_modify'
    });
  },

  // 删除项目按钮点击事件
  goToFifteenProjectsDelete() {
    wx.navigateTo({
      url: '/pages/fifteenprojects_delete/fifteenprojects_delete'
    });
  }
});
