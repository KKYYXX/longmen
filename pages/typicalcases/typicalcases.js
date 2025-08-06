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
            // 跳转到登录页面
            wx.navigateTo({
              url: '/pages/personal/personal'
            });
          }
        }
      });
      return;
    }

    //下面验证用户权限加进来的时候以下三行要删掉
    wx.navigateTo({
      url: '/pages/typicalcasesalter/typicalcasesalter'
    });
/*
    // 检查用户权限
    this.checkUserPermission();
  },

  // 检查用户权限
  checkUserPermission() {
    wx.showLoading({
      title: '验证权限中...'
    });

    // 调用后端API获取有权限的用户列表
    wx.request({
      url: 'http://127.0.0.1:5000/app/user/alter_model',
      method: 'GET',
      timeout: 10000, // 10秒超时
      success: (res) => {
        wx.hideLoading();
        
        if (res.statusCode === 200) {
          // 获取有权限的用户列表
          const authorizedUsers = res.data;
          const currentUser = this.data.userInfo;
          
          // 检查当前用户是否在权限列表中
          const hasPermission = this.checkUserInAuthorizedList(currentUser, authorizedUsers);
          
          if (hasPermission) {
            // 有权限，跳转到修改页面
            wx.navigateTo({
              url: '/pages/typicalcasesalter/typicalcasesalter'
            });
          } else {
            // 没有权限，显示提示
            wx.showModal({
              title: '权限不足',
              content: '您暂无修改案例的权限',
              showCancel: false,
              confirmText: '确定'
            });
          }
        } else {
          // API调用失败
          wx.showModal({
            title: '错误',
            content: '权限验证失败，请稍后重试',
            showCancel: false,
            confirmText: '确定'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('权限验证请求失败:', err);
        wx.showModal({
          title: '网络错误',
          content: '网络连接失败，请检查网络后重试',
          showCancel: false,
          confirmText: '确定'
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
    
    return false;*/
  }
});
