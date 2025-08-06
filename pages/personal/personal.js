// pages/personal/personal.js


Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    // 初始化用户数据库
    this.initUserDatabase();
  },

  /**
   * 初始化用户数据库
   */
  initUserDatabase() {
    // 检查是否已有用户数据，如果没有则初始化
    const users = wx.getStorageSync('userDatabase');
    if (!users) {
      wx.setStorageSync('userDatabase', []);
    }
  },

  /**
   * 检查用户是否已注册
   */
  checkUserExists(identifier, type) {
    const users = wx.getStorageSync('userDatabase') || [];
    
    if (type === 'phone') {
      return users.find(user => user.phone === identifier);
    } else {
      return users.find(user => user.wechat === identifier);
    }
  },

  /**
   * 验证用户登录信息
   */
  validateUserLogin(identifier, password, type) {
    const users = wx.getStorageSync('userDatabase') || [];
    
    if (type === 'phone') {
      return users.find(user => user.phone === identifier && user.password === password);
    } else {
      return users.find(user => user.wechat === identifier && user.password === password);
    }
  },

  /**
   * 注册新用户
   */
  registerNewUser(userData) {
    const users = wx.getStorageSync('userDatabase') || [];
    
    // 检查手机号是否已存在
    if (users.find(user => user.phone === userData.phone)) {
      return { success: false, message: '该手机号已被注册' };
    }
    
    // 检查微信号是否已存在
    if (users.find(user => user.wechat === userData.wechat)) {
      return { success: false, message: '该微信号已被注册' };
    }
    
    // 添加新用户
    const newUser = {
      id: Date.now(),
      name: userData.name,
      phone: userData.phone,
      wechat: userData.wechat,
      password: userData.password, // 直接存储密码
      registerTime: new Date().toISOString()
    };
    
    users.push(newUser);
    wx.setStorageSync('userDatabase', users);
    
    return { success: true, user: newUser };
  },

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

  // ========== 登录表单处理 ==========
  
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

    if (!this.validatePassword(password)) {
      this.setData({ errorMessage: '密码格式不正确，请确保包含大小写字母和数字，且不少于8位' });
      return;
    }

    if (password !== confirmPassword) {
      this.setData({ errorMessage: '两次输入的密码不一致' });
      return;
    }

    // 尝试注册新用户
    const result = this.registerNewUser({ name, phone, wechat, password });
    
    if (!result.success) {
      this.setData({ errorMessage: result.message });
      return;
    }

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

    console.log('注册成功：', result.user);
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

      // 检查用户是否已注册
      const existingUser = this.checkUserExists(phone, 'phone');
      if (!existingUser) {
        this.setData({ errorMessage: '该手机号未注册，请先注册' });
        return;
      }

      // 验证登录信息
      const user = this.validateUserLogin(phone, password, 'phone');
      if (!user) {
        this.setData({ errorMessage: '手机号或密码错误' });
        return;
      }

      // 普通登录成功
      this.handleNormalLoginSuccess(user);
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

      // 检查用户是否已注册
      const existingUser = this.checkUserExists(wechat, 'wechat');
      if (!existingUser) {
        this.setData({ errorMessage: '该微信号未注册，请先注册' });
        return;
      }

      // 验证登录信息
      const user = this.validateUserLogin(wechat, password, 'wechat');
      if (!user) {
        this.setData({ errorMessage: '微信号或密码错误' });
        return;
      }

      // 普通登录成功
      this.handleNormalLoginSuccess(user);
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

      // 检查用户是否已注册
      const existingUser = this.checkUserExists(phone, 'phone');
      if (!existingUser) {
        this.setData({ errorMessage: '该手机号未注册，请先注册' });
        return;
      }

      // 验证登录信息
      const user = this.validateUserLogin(phone, password, 'phone');
      if (!user) {
        this.setData({ errorMessage: '手机号或密码错误' });
        return;
      }

      // 权限管理登录成功
      this.handleAdminLoginSuccess(user);
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

      // 检查用户是否已注册
      const existingUser = this.checkUserExists(wechat, 'wechat');
      if (!existingUser) {
        this.setData({ errorMessage: '该微信号未注册，请先注册' });
        return;
      }

      // 验证登录信息
      const user = this.validateUserLogin(wechat, password, 'wechat');
      if (!user) {
        this.setData({ errorMessage: '微信号或密码错误' });
        return;
      }

      // 权限管理登录成功
      this.handleAdminLoginSuccess(user);
    }
  },

  /**
   * 处理普通登录成功
   */
  handleNormalLoginSuccess(user) {
    // 存储用户信息和登录状态
    wx.setStorageSync('userInfo', user);
    wx.setStorageSync('isLoggedIn', true);
    wx.setStorageSync('loginType', 'normal');

    // 普通登录成功处理
    wx.showToast({
      title: '普通登录成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        // 延迟跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 1500);
      }
    });

    console.log('普通登录成功：', user);
  },

  /**
   * 处理权限管理登录成功
   */
  handleAdminLoginSuccess(user) {
    // 存储用户信息和登录状态
    wx.setStorageSync('userInfo', user);
    wx.setStorageSync('isLoggedIn', true);
    wx.setStorageSync('loginType', 'admin');

    // 权限管理登录成功处理
    wx.showToast({
      title: '权限管理登录成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        // 延迟跳转到权限管理中心
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/admin/admin?name=' + encodeURIComponent(user.name) + '&phone=' + user.phone
          });
        }, 1500);
      }
    });

    console.log('权限管理登录成功：', user);
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

  }
})