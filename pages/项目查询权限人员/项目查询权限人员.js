// pages/项目查询权限人员/项目查询权限人员.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    name: '',  // 用户姓名
    phone: '',  // 用户电话
    userList: [],  // 用于存储接口返回的用户列表
    showModal: false,  // 控制弹窗显示
    modalTitle: '',  // 弹窗标题
    inputName: '',  // 弹窗输入的姓名
    inputPhone: '',  // 弹窗输入的电话
    currentAction: ''  // 当前操作类型：'add' 或 'delete'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载时可做其他初始化
  },

  /**
   * 点击"添加"按钮的事件处理
   */
  onAddClick: function() {
    this.setData({
      showModal: true,
      modalTitle: '添加用户',
      inputName: '',
      inputPhone: '',
      currentAction: 'add'
    });
  },

  /**
   * 点击"删除"按钮的事件处理
   */
  onDeleteUser: function() {
    this.setData({
      showModal: true,
      modalTitle: '删除用户',
      inputName: '',
      inputPhone: '',
      currentAction: 'delete'
    });
  },

  /**
   * 处理姓名输入
   */
  onNameInput: function(e) {
    this.setData({
      inputName: e.detail.value
    });
  },

  /**
   * 处理电话输入
   */
  onPhoneInput: function(e) {
    this.setData({
      inputPhone: e.detail.value
    });
  },

  /**
   * 关闭弹窗
   */
  onModalClose: function() {
    this.setData({
      showModal: false,
      inputName: '',
      inputPhone: ''
    });
  },

  /**
   * 阻止弹窗内容点击事件冒泡
   */
  onModalContentTap: function() {
    // 阻止事件冒泡，防止点击内容区域时关闭弹窗
  },

  /**
   * 确认按钮点击事件
   */
  onConfirm: function() {
    const { inputName, inputPhone, currentAction } = this.data;
    
    // 验证输入
    if (!inputName.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }
    
    if (!inputPhone.trim()) {
      wx.showToast({
        title: '请输入电话号码',
        icon: 'none'
      });
      return;
    }

    if (currentAction === 'add') {
      this.addUser(inputName, inputPhone);
    } else if (currentAction === 'delete') {
      this.deleteUser(inputName, inputPhone);
    }
  },

  /**
   * 添加用户
   */
  addUser: function(name, phone) {
    wx.request({
      url: 'http://127.0.0.1:5000/app/user/query_15_add',
      method: 'POST',
      data: {
        name: name,
        phone: phone
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '添加成功',
            icon: 'success'
          });
          this.setData({
            showModal: false,
            inputName: '',
            inputPhone: '',
            userList: res.data
          });
        } else {
          wx.showToast({
            title: res.data.message || '添加失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 删除用户
   */
  deleteUser: function(name, phone) {
    wx.request({
      url: 'http://127.0.0.1:5000/app/user/query_15_delete',
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
            showModal: false,
            inputName: '',
            inputPhone: '',
            userList: res.data
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
   * 点击"目前人员"按钮，获取并显示用户名单
   */
  onViewUsers: function() {
    wx.request({
      url: 'http://127.0.0.1:5000/app/user/query_15',  // 替换为你的实际接口地址
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
  }
});
