// 导入API配置
const apiConfig = require('../../config/api.js');

Page({
  data: {
    userInfo: null,
    isLoggedIn: false
  },

  onLoad() {
    console.log('十五项项目页面加载');
    this.checkLoginStatus();
  },

  onShow() {
    console.log('十五项项目页面显示');
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
      this.showLoginModal();
      return;
    }

    // 检查用户查询权限
    this.checkUserQueryPermission();
    
  },

  // 删改按钮点击事件
  goToFifteenProjectsAlter() {

    // 首先检查是否已登录
    if (!this.data.isLoggedIn) {
      this.showLoginModal();
      return;
    }

    // 检查用户修改权限
    this.checkUserAlterPermission();
    

    
  },

  // 显示登录提示框
  showLoginModal() {
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
  },

  // 检查用户查询权限
  checkUserQueryPermission() {
    wx.showLoading({
      title: '验证权限中...'
    });

    // 调用后端API验证查询权限
    wx.request({
      url: apiConfig.buildUrl('/app/user/query_15'),
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        wx.hideLoading();
        console.log('查询权限验证响应:', res);
        
        if (res.statusCode === 200) {
          const authorizedUsers = res.data;
          const userInfo = this.data.userInfo;
          
          // 检查当前用户是否在授权名单中
          const hasPermission = this.checkUserInAuthorizedList(userInfo, authorizedUsers);
          
          if (hasPermission) {
            // 有权限，跳转到查询页面
            wx.navigateTo({
              url: '/pages/fifteenprojectsquery/fifteenprojectsquery'
            });
          } else {
            // 没有权限，显示提示
            this.showNoPermissionModal('查询');
          }
        } else {
          console.error('查询权限验证失败:', res);
          wx.showToast({
            title: '权限验证失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('查询权限验证请求失败:', err);
        
        // 检查是否在开发模式下，如果是则使用测试数据
        if (this.isDevelopmentMode()) {
          console.log('使用测试查询权限验证模式');
          this.useTestPermissionCheck('query');
          return;
        }
        
        wx.showModal({
          title: '网络错误',
          content: '无法连接到服务器进行权限验证',
          showCancel: false,
          confirmText: '确定'
        });
      }
    });
  },

  // 检查用户修改权限
  checkUserAlterPermission() {
    wx.showLoading({
      title: '验证权限中...'
    });

    // 调用后端API验证修改权限
    wx.request({
      url: apiConfig.buildUrl('/app/user/alter_15'),
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        wx.hideLoading();
        console.log('修改权限验证响应:', res);
        
        if (res.statusCode === 200) {
          const authorizedUsers = res.data;
          const userInfo = this.data.userInfo;
          
          // 检查当前用户是否在授权名单中
          const hasPermission = this.checkUserInAuthorizedList(userInfo, authorizedUsers);
          
          if (hasPermission) {
            // 有权限，跳转到删改页面
            wx.navigateTo({
              url: '/pages/fifteenprojectsalter/fifteenprojectsalter'
            });
          } else {
            // 没有权限，显示提示
            this.showNoPermissionModal('修改');
          }
        } else {
          console.error('修改权限验证失败:', res);
          wx.showToast({
            title: '权限验证失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('修改权限验证请求失败:', err);
        
        // 检查是否在开发模式下，如果是则使用测试数据
        if (this.isDevelopmentMode()) {
          console.log('使用测试修改权限验证模式');
          this.useTestPermissionCheck('alter');
          return;
        }
        
        wx.showModal({
          title: '网络错误',
          content: '无法连接到服务器进行权限验证',
          showCancel: false,
          confirmText: '确定'
        });
      }
    });
  },

  // 检查用户是否在授权名单中
  checkUserInAuthorizedList(userInfo, authorizedUsers) {
    if (!userInfo || !authorizedUsers || !Array.isArray(authorizedUsers)) {
      console.log('权限检查失败：用户信息或授权列表无效');
      console.log('用户信息:', userInfo);
      console.log('授权列表:', authorizedUsers);
      return false;
    }

    console.log('当前用户信息:', userInfo);
    console.log('授权用户列表:', authorizedUsers);

    // 遍历授权用户列表，检查姓名和手机号是否匹配
    for (const authorizedUser of authorizedUsers) {
      console.log('检查授权用户:', authorizedUser);
      if (authorizedUser.name === userInfo.name && authorizedUser.phone === userInfo.phone) {
        console.log('权限验证成功！用户匹配:', authorizedUser);
        return true;
      }
    }
    
    console.log('权限验证失败：用户不在授权列表中');
    return false;
  },

  // 检查是否为开发模式
  isDevelopmentMode() {
    // 可以通过环境变量或其他方式判断
    return true; // 临时设置为true，方便测试
  },

  // 开发模式下的测试权限检查
  useTestPermissionCheck(type) {
    const userInfo = this.data.userInfo;
    if (!userInfo) {
      this.showNoPermissionModal(type);
      return;
    }

    // 测试阶段：任何登录用户都有权限
    if (type === 'query') {
      wx.navigateTo({
        url: '/pages/fifteenprojectsquery/fifteenprojectsquery'
      });
    } else if (type === 'alter') {
      wx.navigateTo({
        url: '/pages/fifteenprojectsalter/fifteenprojectsalter'
      });
    }
  },

  // 显示无权限提示框
  showNoPermissionModal(actionType) {
    wx.showModal({
      title: '权限不足',
      content: `您暂无${actionType}十五项项目的权限`,
      showCancel: false,
      confirmText: '确定',
      success: (res) => {
        if (res.confirm) {
          // 可以在这里添加其他逻辑，比如跳转到权限申请页面
          console.log(`用户确认了${actionType}权限不足提示`);
        }
      }
    });
  }

});
