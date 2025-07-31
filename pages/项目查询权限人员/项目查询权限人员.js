// pages/项目查询权限人员/项目查询权限人员.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    name: '',  // 用户姓名
    phone: ''  // 用户电话
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 点击“添加”按钮的事件处理
   */
  onAddClick: function() {
    // 获取页面上的姓名和电话
    const { name, phone } = this.data;

    // 调用添加接口
    wx.request({
      url: 'http://127.0.0.1:5000/app/user/add', // 实际的接口地址
      method: 'POST',
      data: {
        name: name,
        phone: phone
      },
      success: function(res) {
        if (res.data.success) {
          wx.showToast({
            title: '添加成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message || '添加失败',
            icon: 'none'
          });
        }
      },
      fail: function(error) {
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 处理输入框内容变化
   */
  onInputChange: function(e) {
    const { field } = e.target.dataset;  // 获取字段名，name 或 phone
    this.setData({
      [field]: e.detail.value
    });
  }
});
