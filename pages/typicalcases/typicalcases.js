// 导入API配置
const apiConfig = require('../../config/api.js');

Page({
  data: {
    userInfo: null,
    isLoggedIn: false
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时检查登录状态
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    const isLoggedIn = wx.getStorageSync('isLoggedIn') || false;
    
    this.setData({
      userInfo: userInfo,
      isLoggedIn: isLoggedIn
    });
  },

  // 查询按钮点击事件
  goToTypicalCasesQuery() {
    wx.navigateTo({
      url: '/pages/typicalcasesquery/typicalcasesquery'
    });
  },

  
  // 修改案例按钮点击事件
  goToTypicalCasesAlter() {
    // 首先检查是否已登录
    if (!this.data.isLoggedIn) {
      wx.showModal({
        title: '提示',
        content: '请先进行登录',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            console.log('用户点击去登录，准备跳转...');
            // 跳转到登录页面（使用switchTab因为登录后的页面是tabBar页面）
            wx.switchTab({
              url: '/pages/登录后的页面/登录后的页面',
              success: () => {
                console.log('跳转成功');
              },
              fail: (err) => {
                console.error('跳转失败:', err);
                // 如果switchTab失败，尝试使用navigateTo
                wx.navigateTo({
                  url: '/pages/personal/personal',
                  fail: (navErr) => {
                    console.error('navigateTo也失败了:', navErr);
                    wx.showToast({
                      title: '跳转失败',
                      icon: 'none'
                    });
                  }
                });
              }
            });
          }
        }
      });
      return;
    }

    // 检查用户权限
    this.checkUserPermission();
  },

  // 检查用户权限
  checkUserPermission() {
    wx.showLoading({
      title: '验证权限中...'
    });

    wx.request({
      url: apiConfig.buildUrl('/app/user/alter_model'),
      method: 'GET',
      success: (res) => {
        wx.hideLoading();
        console.log('权限验证响应:', res);
        
        if (res.statusCode === 200) {
          // 获取当前登录用户信息
          const currentUser = this.data.userInfo;
          const authorizedUsers = res.data || [];
          
          // 检查当前用户是否在授权列表中
          if (this.checkUserInAuthorizedList(currentUser, authorizedUsers)) {
            // 有权限，跳转到典型案例修改页面
            wx.navigateTo({
              url: '/pages/typicalcasesalter/typicalcasesalter'
            });
          } else {
            // 没有权限，显示提示
            wx.showToast({
              title: '您没有修改典型案例的权限',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          wx.showToast({
            title: '权限验证失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('权限验证失败:', error);
        wx.showToast({
          title: '权限验证失败',
          icon: 'none'
        });
      }
    });
  },

  // 检查当前用户是否在授权列表中
  checkUserInAuthorizedList(currentUser, authorizedUsers) {
    if (!currentUser || !authorizedUsers || !Array.isArray(authorizedUsers)) {
      return false;
    }

    // 遍历授权用户列表，检查姓名和手机号是否匹配
    for (let authorizedUser of authorizedUsers) {
      if (authorizedUser.name === currentUser.name && 
          authorizedUser.phone === currentUser.phone) {
        return true;
      }
    }
    
    return false;
  }
});
