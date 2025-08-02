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
  goToFifteenProjectsQuery() {
    // 首先检查是否已登录
    if (!this.data.isLoggedIn) {
      this.showLoginModal('查询');
      return;
    }

    // 已登录，直接跳转到查询页面
    wx.navigateTo({
      url: '/pages/fifteenprojectsquery/fifteenprojectsquery'
    });
  },

  // 删改按钮点击事件
  goToFifteenProjectsAlter() {
    // 首先检查是否已登录
    if (!this.data.isLoggedIn) {
      this.showLoginModal('删改');
      return;
    }

    // 检查用户权限
    this.checkUserPermission();
  },

  // 显示登录提示框
  showLoginModal(action = '') {
    wx.showModal({
      title: '提示',
      content: `请先进行登录才能${action}十五项项目`,
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
  },

  // 检查用户权限
  checkUserPermission() {
    wx.showLoading({
      title: '验证权限中...'
    });

    // 模拟调用后端API验证权限
    // 实际项目中这里应该调用wx.request()获取后端数据
    setTimeout(() => {
      wx.hideLoading();
      
      // 模拟权限验证结果
      // 这里应该根据实际的后端API返回结果进行判断
      const hasPermission = this.checkPermissionFromBackend();
      
      if (hasPermission) {
        // 有权限，跳转到删改页面
        wx.navigateTo({
          url: '/pages/fifteenprojectsalter/fifteenprojectsalter'
        });
      } else {
        // 没有权限，显示提示
        this.showNoPermissionModal();
      }
    }, 1000);
  },

  // 模拟从后端获取权限信息
  // 实际项目中这里应该调用真实的后端API
  checkPermissionFromBackend() {
    // 临时设置：任何登录用户都有删改权限，便于测试
    const userInfo = this.data.userInfo;
    if (!userInfo) {
      return false;
    }

    // 测试阶段：任何登录用户都有权限
    return true;
    
    // 正式环境下的权限检查逻辑（注释掉，等后端完成后启用）
    // const allowedRoles = ['admin', 'editor', 'manager'];
    // return allowedRoles.includes(userInfo.role);
  },

  // 显示无权限提示框
  showNoPermissionModal() {
    wx.showModal({
      title: '权限不足',
      content: '您没有删改十五项项目的权限',
      showCancel: false,
      confirmText: '确定',
      success: (res) => {
        if (res.confirm) {
          // 可以在这里添加其他逻辑，比如跳转到权限申请页面
          console.log('用户确认了权限不足提示');
        }
      }
    });
  }
});
