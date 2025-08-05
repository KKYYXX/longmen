Page({
  data: {
    userInfo: null,
    isLoggedIn: false
  },

  onLoad() {
    // 页面加载时检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    // 每次显示页面时检查登录状态
    this.checkLoginStatus();
  },

  onReady() {
    // 页面初次渲染完成
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
  goToZcquery() {
    wx.showToast({
      title: '正在查询...',
      icon: 'loading',
      duration: 1000
    });

    // 调用后端接口获取文件列表
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/zcdocuments',
      method: 'GET',
      timeout: 10000, // 10秒超时
      success: (res) => {
        wx.hideToast();
        console.log('请求成功:', res);
        
        if (res.data.success) {
          const fileList = res.data.data;
          const totalCount = res.data.total_count;
          
          // 将文件数据存储到本地缓存
          wx.setStorageSync('zc_file_list', fileList);
          wx.setStorageSync('zc_total_count', totalCount);
          
          // 跳转到查询页面
          wx.navigateTo({
            url: '/pages/zcquery/zcquery'
          });
        } else {
          wx.showToast({
            title: '查询失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideToast();
        
        console.error('请求失败详情:', err);
        console.error('错误状态码:', err.statusCode);
        console.error('错误信息:', err.errMsg);
        
        // 检查是否在开发模式下，如果是则使用测试数据
        if (this.isDevelopmentMode()) {
          console.log('使用测试数据模式');
          this.useTestData();
          return;
        }
        
        // 根据错误类型显示不同的提示
        if (err.errMsg && err.errMsg.includes('timeout')) {
          wx.showModal({
            title: '连接超时',
            content: '后端服务器响应超时，请检查服务器是否正常运行',
            showCancel: false,
            confirmText: '确定'
          });
        } else if (err.statusCode === 404) {
          wx.showModal({
            title: '接口不存在',
            content: `接口返回404错误，请检查后端路由是否正确注册。\n\n错误详情：${err.errMsg}`,
            showCancel: false,
            confirmText: '确定'
          });
        } else {
          wx.showModal({
            title: '网络错误',
            content: `无法连接到后端服务器，错误信息：${err.errMsg || '未知错误'}\n\n状态码：${err.statusCode}`,
            showCancel: false,
            confirmText: '确定'
          });
        }
      }
    });
  },

  // 检查是否为开发模式
  isDevelopmentMode() {
    // 可以通过环境变量或其他方式判断
    return true; // 临时设置为true，方便测试
  },

  // 使用测试数据
  useTestData() {
    const testData = [
      {
        id: 1,
        file_name: 'git代管.docx',
        file_size: 111,
        file_url: 'D:\\111.docx',
        uploaded_at: '2025-08-03 13:27:47'
      },
      {
        id: 2,
        file_name: '项目文档.pdf',
        file_size: 2048,
        file_url: 'C:\\Documents\\项目文档.pdf',
        uploaded_at: '2025-08-02 10:15:30'
      },
    ];

    // 存储测试数据
    wx.setStorageSync('zc_file_list', testData);
    wx.setStorageSync('zc_total_count', testData.length);

    wx.showToast({
      title: '使用测试数据',
      icon: 'success',
      duration: 1500
    });

    // 跳转到查询页面
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/zcquery/zcquery'
      });
    }, 1500);
  },

  // 删改按钮点击事件
  goToZcalter() {
    // 首先检查是否已登录
    if (!this.data.isLoggedIn) {
      this.showLoginModal();
      return;
    }

    // 检查用户权限
    this.checkUserPermission();
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

    // 调用后端API验证权限
    wx.request({
      url: 'http://127.0.0.1:5000/app/user/alter_zc',
      method: 'GET',
      timeout: 10000,
      success: (res) => {
        wx.hideLoading();
        console.log('权限验证响应:', res);
        
        if (res.statusCode === 200) {
          const authorizedUsers = res.data;
          const userInfo = this.data.userInfo;
          
          // 检查当前用户是否在授权名单中
          const hasPermission = this.checkUserInAuthorizedList(userInfo, authorizedUsers);
          
          if (hasPermission) {
            // 有权限，跳转到删改页面
            wx.navigateTo({
              url: '/pages/zcalter/zcalter'
            });
          } else {
            // 没有权限，显示提示
            this.showNoPermissionModal();
          }
        } else {
          console.error('权限验证失败:', res);
          wx.showToast({
            title: '权限验证失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('权限验证请求失败:', err);
        
        // 检查是否在开发模式下，如果是则使用测试数据
        if (this.isDevelopmentMode()) {
          console.log('使用测试权限验证模式');
          this.useTestPermissionCheck();
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

  // 开发模式下的测试权限检查
  useTestPermissionCheck() {
    const userInfo = this.data.userInfo;
    if (!userInfo) {
      this.showNoPermissionModal();
      return;
    }

    // 测试阶段：任何登录用户都有权限
    wx.navigateTo({
      url: '/pages/zcalter/zcalter'
    });
  },

  // 显示无权限提示框
  showNoPermissionModal() {
    wx.showModal({
      title: '权限不足',
      content: '您暂无修改政策文件的权限',
      showCancel: false,
      confirmText: '确定',
      success: (res) => {
        if (res.confirm) {
          // 可以在这里添加其他逻辑，比如跳转到权限申请页面
          console.log('用户确认了权限不足提示');
        }
      }
    });
  },

  // 实际的后端API调用示例（供参考）
  callBackendPermissionAPI() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://your-backend-api.com/api/check-permission',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${wx.getStorageSync('token')}`
        },
        data: {
          userId: this.data.userInfo.id,
          permission: 'alter_policy_files'
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data.hasPermission);
          } else {
            reject(new Error('权限验证失败'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },
/*
  // 测试方法：清除登录状态（用于测试）
  clearLoginStatus() {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isLoggedIn');
    this.checkLoginStatus();
    wx.showToast({
      title: '已清除登录状态',
      icon: 'success'
    });
  },

  // 测试方法：设置特定用户角色（用于测试）
  setTestUserRole(role) {
    const userInfo = this.data.userInfo;
    if (userInfo) {
      userInfo.role = role;
      wx.setStorageSync('userInfo', userInfo);
      this.setData({
        userInfo: userInfo
      });
      wx.showToast({
        title: `已设置为${role}角色`,
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
    }
  },

  // 测试方法：显示当前用户信息（用于调试）
  showCurrentUserInfo() {
    const userInfo = this.data.userInfo;
    const isLoggedIn = this.data.isLoggedIn;
    
    console.log('当前登录状态:', isLoggedIn);
    console.log('当前用户信息:', userInfo);
    
    wx.showModal({
      title: '当前用户信息',
      content: `登录状态: ${isLoggedIn ? '已登录' : '未登录'}\n姓名: ${userInfo ? userInfo.name : '无'}\n手机: ${userInfo ? userInfo.phone : '无'}`,
      showCancel: false,
      confirmText: '确定'
    });
  },

  // 测试方法：手动测试权限验证
  testPermissionCheck() {
    console.log('开始手动测试权限验证...');
    this.checkUserPermission();
  }*/
}); 