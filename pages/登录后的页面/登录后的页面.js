// pages/登录后的页面/登录后的页面.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 登录状态
    isLoggedIn: false,
    userInfo: null,
    
    // 当前模式：login 或 register
    currentMode: 'login',
    // 登录方式：phone 或 wechat
    loginType: 'phone',
    
    // 登录表单数据
    loginForm: {
      phone: '',
      wechat: '',
      password: ''
    },
    
    // 注册表单数据
    registerForm: {
      name: '',
      phone: '',
      wechat: '',
      password: '',
      confirmPassword: ''
    },
    
    // 密码显示状态
    showLoginPassword: false,
    showRegisterPassword: false,
    showConfirmPassword: false,
    
    // 表单验证状态
    isLoginFormValid: false,
    isRegisterFormValid: false,
    
    // 错误信息
    errorMessage: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('=== 登录后的页面加载 ===');
    this.loadUserInfo();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('=== 登录后的页面显示 ===');
    this.loadUserInfo();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 处理页面返回事件
   */
  onBackPress() {
    // 当用户点击左上角返回按钮时，跳转到首页而不是回到登录页面
    wx.switchTab({
      url: '/pages/index/index'
    });
    return true; // 阻止默认的返回行为
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const app = getApp();
    const loginStatus = app.getLoginStatus();
    
    if (loginStatus.isLoggedIn && loginStatus.currentUser) {
      // 从本地存储获取登录类型
      const loginType = wx.getStorageSync('loginType') || 'normal';
      
      this.setData({
        isLoggedIn: true,
        userInfo: loginStatus.currentUser,
        loginType: loginType
      });
      console.log('加载用户信息成功:', loginStatus.currentUser, '登录类型:', loginType);
    } else {
      this.setData({
        isLoggedIn: false,
        userInfo: null,
        loginType: 'phone'
      });
      console.log('用户未登录，显示登录表单');
    }
  },

  // ========== 登录表单处理 ==========
  
  /**
   * 切换到登录模式
   */
  switchToLogin() {
    this.setData({
      currentMode: 'login',
      errorMessage: ''
    });
  },

  /**
   * 切换到注册模式
   */
  switchToRegister() {
    this.setData({
      currentMode: 'register',
      errorMessage: ''
    });
  },

  /**
   * 切换登录方式
   */
  switchLoginType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      loginType: type,
      errorMessage: ''
    });
    this.validateLoginForm();
  },

  /**
   * 登录手机号输入处理
   */
  onLoginPhoneInput(e) {
    this.setData({
      'loginForm.phone': e.detail.value,
      errorMessage: ''
    });
    this.validateLoginForm();
  },

  /**
   * 登录微信号输入处理
   */
  onLoginWechatInput(e) {
    this.setData({
      'loginForm.wechat': e.detail.value,
      errorMessage: ''
    });
    this.validateLoginForm();
  },

  /**
   * 登录密码输入处理
   */
  onLoginPasswordInput(e) {
    this.setData({
      'loginForm.password': e.detail.value,
      errorMessage: ''
    });
    this.validateLoginForm();
  },

  /**
   * 切换登录密码显示/隐藏
   */
  toggleLoginPassword() {
    this.setData({
      showLoginPassword: !this.data.showLoginPassword
    });
  },

  /**
   * 登录表单验证
   */
  validateLoginForm() {
    const { loginType, loginForm } = this.data;
    
    if (loginType === 'phone') {
      // 手机号登录验证
      const { phone, password } = loginForm;
      if (!phone.trim() || !password.trim()) {
        this.setData({ isLoginFormValid: false });
        return;
      }
      
      // 验证手机号格式
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        this.setData({ isLoginFormValid: false });
        return;
      }
    } else {
      // 微信登录验证
      const { wechat, password } = loginForm;
      if (!wechat.trim() || !password.trim()) {
        this.setData({ isLoginFormValid: false });
        return;
      }
    }

    this.setData({ isLoginFormValid: true });
  },

  // ========== 注册表单处理 ==========
  
  /**
   * 注册姓名输入处理
   */
  onRegisterNameInput(e) {
    this.setData({
      'registerForm.name': e.detail.value,
      errorMessage: ''
    });
    this.validateRegisterForm();
  },

  /**
   * 注册手机号输入处理
   */
  onRegisterPhoneInput(e) {
    this.setData({
      'registerForm.phone': e.detail.value,
      errorMessage: ''
    });
    this.validateRegisterForm();
  },

  /**
   * 注册微信号输入处理
   */
  onRegisterWechatInput(e) {
    this.setData({
      'registerForm.wechat': e.detail.value,
      errorMessage: ''
    });
    this.validateRegisterForm();
  },

  /**
   * 注册密码输入处理
   */
  onRegisterPasswordInput(e) {
    this.setData({
      'registerForm.password': e.detail.value,
      errorMessage: ''
    });
    this.validateRegisterForm();
  },

  /**
   * 确认密码输入处理
   */
  onConfirmPasswordInput(e) {
    this.setData({
      'registerForm.confirmPassword': e.detail.value,
      errorMessage: ''
    });
    this.validateRegisterForm();
  },

  /**
   * 切换注册密码显示/隐藏
   */
  toggleRegisterPassword() {
    this.setData({
      showRegisterPassword: !this.data.showRegisterPassword
    });
  },

  /**
   * 切换确认密码显示/隐藏
   */
  toggleConfirmPassword() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword
    });
  },

  /**
   * 注册表单验证
   */
  validateRegisterForm() {
    const { name, phone, wechat, password, confirmPassword } = this.data.registerForm;

    // 检查所有字段是否填写
    if (!name.trim() || !phone.trim() || !wechat.trim() || !password.trim() || !confirmPassword.trim()) {
      this.setData({ isRegisterFormValid: false });
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      this.setData({ isRegisterFormValid: false });
      return;
    }

    // 验证密码格式
    if (!this.validatePassword(password)) {
      this.setData({ isRegisterFormValid: false });
      return;
    }

    // 验证确认密码
    if (password !== confirmPassword) {
      this.setData({ isRegisterFormValid: false });
      return;
    }

    this.setData({ isRegisterFormValid: true });
  },

  /**
   * 密码验证
   */
  validatePassword(password) {
    // 至少8位
    if (password.length < 8) {
      return false;
    }

    // 包含大写字母
    const hasUpperCase = /[A-Z]/.test(password);
    // 包含小写字母
    const hasLowerCase = /[a-z]/.test(password);
    // 包含数字
    const hasNumber = /\d/.test(password);

    return hasUpperCase && hasLowerCase && hasNumber;
  },

  /**
   * 注册处理
   */
  onRegister() {
    if (!this.data.isRegisterFormValid) {
      return;
    }

    const { name, phone, wechat, password, confirmPassword } = this.data.registerForm;

    // 最终验证
    if (!name.trim()) {
      this.setData({ errorMessage: '请输入姓名' });
      return;
    }

    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      this.setData({ errorMessage: '请输入正确的手机号码' });
      return;
    }

    if (!wechat.trim()) {
      this.setData({ errorMessage: '请输入微信号' });
      return;
    }

    if (password.length < 6) {
      this.setData({ errorMessage: '密码至少6位' });
      return;
    }

    if (password !== confirmPassword) {
      this.setData({ errorMessage: '两次输入的密码不一致' });
      return;
    }

    // 连接后端注册接口
    wx.request({
      url: 'http://127.0.0.1:5000/app/user/register',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        name: name.trim(),
        phone: phone.trim(),
        wx_openid: wechat.trim(),
        password: password
      },
      success: (res) => {
        if (res.data.success) {
          // 注册成功
          wx.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 1500,
            success: () => {
              // 延迟切换到登录页面
              setTimeout(() => {
                this.setData({
                  currentMode: 'login',
                  loginType: 'phone',
                  errorMessage: '',
                  loginForm: {
                    phone: phone,
                    wechat: wechat,
                    password: ''
                  }
                });
              }, 1500);
            }
          });
          console.log('注册成功');
        } else {
          this.setData({ errorMessage: res.data.message || '注册失败' });
        }
      },
      fail: (err) => {
        console.error('注册请求失败:', err);
        this.setData({ errorMessage: '网络错误，请稍后重试' });
      }
    });
  },

  /**
   * 普通登录处理
   */
  onNormalLogin() {
    if (!this.data.isLoginFormValid) {
      return;
    }

    const { loginType, loginForm } = this.data;

    if (loginType === 'phone') {
      // 手机号登录验证
      const { phone, password } = loginForm;
      
      if (!phone.trim()) {
        this.setData({ errorMessage: '请输入手机号码' });
        return;
      }

      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        this.setData({ errorMessage: '请输入正确的手机号码' });
        return;
      }

      if (!password.trim()) {
        this.setData({ errorMessage: '请输入密码' });
        return;
      }

      // 连接后端普通登录接口 - 手机号登录
      wx.request({
        url: 'http://127.0.0.1:5000/app/user/common_login',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          phone: phone.trim(),
          password: password
        },
        success: (res) => {
          if (res.data.success) {
            this.handleNormalLoginSuccess(res.data.user);
          } else {
            this.setData({ errorMessage: res.data.message || '登录失败' });
          }
        },
        fail: (err) => {
          console.error('普通登录请求失败:', err);
          this.setData({ errorMessage: '网络错误，请稍后重试' });
        }
      });

    } else {
      // 微信登录验证
      const { wechat, password } = loginForm;
      
      if (!wechat.trim()) {
        this.setData({ errorMessage: '请输入微信号' });
        return;
      }

      if (!password.trim()) {
        this.setData({ errorMessage: '请输入密码' });
        return;
      }

      // 连接后端普通登录接口 - 微信号登录
      wx.request({
        url: 'http://127.0.0.1:5000/app/user/common_login',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          wx_openid: wechat.trim(),
          password: password
        },
        success: (res) => {
          if (res.data.success) {
            this.handleNormalLoginSuccess(res.data.user);
          } else {
            this.setData({ errorMessage: res.data.message || '登录失败' });
          }
        },
        fail: (err) => {
          console.error('普通登录请求失败:', err);
          this.setData({ errorMessage: '网络错误，请稍后重试' });
        }
      });
    }
  },

  /**
   * 权限管理登录处理
   */
  onAdminLogin() {
    if (!this.data.isLoginFormValid) {
      return;
    }

    const { loginType, loginForm } = this.data;

    if (loginType === 'phone') {
      // 手机号登录验证
      const { phone, password } = loginForm;
      
      if (!phone.trim()) {
        this.setData({ errorMessage: '请输入手机号码' });
        return;
      }

      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        this.setData({ errorMessage: '请输入正确的手机号码' });
        return;
      }

      if (!password.trim()) {
        this.setData({ errorMessage: '请输入密码' });
        return;
      }

      // 连接后端权限管理登录接口 - 手机号登录
      wx.request({
        url: 'http://127.0.0.1:5000/app/user/principal_login',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          phone: phone.trim(),
          password: password
        },
        success: (res) => {
          if (res.data.success) {
            this.handleAdminLoginSuccess(res.data.user);
          } else {
            this.setData({ errorMessage: res.data.message || '权限登录失败' });
          }
        },
        fail: (err) => {
          console.error('权限登录请求失败:', err);
          this.setData({ errorMessage: '网络错误，请稍后重试' });
        }
      });

    } else {
      // 微信登录验证
      const { wechat, password } = loginForm;
      
      if (!wechat.trim()) {
        this.setData({ errorMessage: '请输入微信号' });
        return;
      }

      if (!password.trim()) {
        this.setData({ errorMessage: '请输入密码' });
        return;
      }

      // 连接后端权限管理登录接口 - 微信号登录
      wx.request({
        url: 'http://127.0.0.1:5000/app/user/principal_login',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: {
          wx_openid: wechat.trim(),
          password: password
        },
        success: (res) => {
          if (res.data.success) {
            this.handleAdminLoginSuccess(res.data.user);
          } else {
            this.setData({ errorMessage: res.data.message || '权限登录失败' });
          }
        },
        fail: (err) => {
          console.error('权限登录请求失败:', err);
          this.setData({ errorMessage: '网络错误，请稍后重试' });
        }
      });
    }
  },

  /**
   * 处理普通登录成功
   */
  handleNormalLoginSuccess(user) {
    const app = getApp();
    
    // 使用app.js的登录状态管理
    app.setLoginStatus(true, 'normal', user);
    
    // 存储用户信息和登录状态（保持兼容性）
    wx.setStorageSync('userInfo', user);
    wx.setStorageSync('isLoggedIn', true);
    wx.setStorageSync('loginType', 'normal');

    // 普通登录成功处理
    wx.showToast({
      title: '普通登录成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        // 延迟刷新页面状态
        setTimeout(() => {
          this.loadUserInfo();
        }, 1500);
      }
    });

    console.log('普通登录成功：', user);
  },

  /**
   * 处理权限管理登录成功
   */
  handleAdminLoginSuccess(user) {
    const app = getApp();
    
    // 使用app.js的登录状态管理
    app.setLoginStatus(true, 'admin', user);
    
    // 存储用户信息和登录状态（保持兼容性）
    wx.setStorageSync('userInfo', user);
    wx.setStorageSync('isLoggedIn', true);
    wx.setStorageSync('loginType', 'admin');

    // 权限管理登录成功处理
    wx.showToast({
      title: '权限管理登录成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        // 延迟跳转到权限管理中心，使用navigateTo保持页面堆栈
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/admin/admin?name=' + encodeURIComponent(user.name) + '&phone=' + user.phone,
            success: () => {
              console.log('跳转权限管理中心成功');
            },
            fail: (err) => {
              console.error('跳转权限管理中心失败:', err);
              wx.showToast({
                title: '跳转失败',
                icon: 'none'
              });
            }
          });
        }, 1500);
      }
    });

    console.log('权限管理登录成功：', user);
  },

  /**
   * 返回权限管理中心
   */
  onBackToAdmin() {
    // 从本地存储获取最新的登录类型
    const loginType = wx.getStorageSync('loginType');
    
    if (loginType === 'admin') {
      wx.navigateTo({
        url: '/pages/admin/admin',
        success: () => {
          console.log('跳转权限管理中心成功');
        },
        fail: (err) => {
          console.error('跳转权限管理中心失败:', err);
          wx.showToast({
            title: '跳转失败',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '您没有权限访问',
        icon: 'none'
      });
    }
  },

  /**
   * 退出登录
   */
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.clearLoginStatus();
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 1500,
            success: () => {
              setTimeout(() => {
                // 刷新页面状态，显示登录表单
                this.loadUserInfo();
              }, 1500);
            }
          });
        }
      }
    });
  },

  /**
   * 点击首页标签
   */
  onHomeTab() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
})