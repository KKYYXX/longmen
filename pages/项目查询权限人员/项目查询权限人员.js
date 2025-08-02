// pages/项目查询权限人员/项目查询权限人员.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    name: '',  // 用户姓名
    phone: '',  // 用户电话
    userList: []  // 用于存储接口返回的用户列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载时可做其他初始化
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
  },

  /**
   * 点击“目前人员”按钮，获取并显示用户名单
   */
  onViewUsers: function() {
    wx.request({
      url: 'http://127.0.0.1:5000/user/query_15',  // 替换为你的实际接口地址
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            userList: res.data  // 更新页面的用户名单
          });
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 删除用户，调用删除接口
   */
  onDeleteUser: function(e) {
    const { name, phone } = e.currentTarget.dataset; // 获取要删除的用户姓名和电话

    // 调用删除接口
    wx.request({
      url: 'http://127.0.0.1:5000/user/query_15_delete', // 替换为实际的删除接口地址
      method: 'POST',
      data: {
        name: name,
        phone: phone
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
          this.setData({
            userList: res.data  // 更新页面显示的用户列表
          });
        } else {
          wx.showToast({
            title: res.data.message || '删除失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        });
      }
    });
  }
});
