// index.js
Page({
  // 跳转到典型案例页面
  goToTypicalCases() {
    wx.navigateTo({
      url: '/pages/typicalcases/typicalcases'
    })
  },

  // 跳转到十五项项目页面
  goToFifteenProjects() {
    wx.navigateTo({
      url: '/pages/fifteenprojects/fifteenprojects'
    })
  },

  // 跳转到政策文件页面
  goToPolicyDocuments() {
    wx.navigateTo({
      url: '/pages/zcdocuments/zcdocuments'
    })
  }
})
