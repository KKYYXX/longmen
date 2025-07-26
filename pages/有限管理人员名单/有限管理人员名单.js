// pages/有限管理人员名单/有限管理人员名单.js
Page({
  data: {},

  onProjectQuery() {
    wx.showToast({
      title: '项目查询功能',
      icon: 'none'
    });
  },

  onProjectModify() {
    wx.showToast({
      title: '项目修改功能',
      icon: 'none'
    });
  },

  onPolicyModify() {
    wx.showToast({
      title: '政策文件修改功能',
      icon: 'none'
    });
  },

  onCaseModify() {
    wx.showToast({
      title: '典型案例修改功能',
      icon: 'none'
    });
  }
})