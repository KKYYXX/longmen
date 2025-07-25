// pages/personal/personal.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 表单数据
    formData: {
      name: '',
      phone: '',
      password: ''
    },
    // 密码显示状态
    showPassword: false,
    // 表单验证状态
    isFormValid: false,
    // 错误信息
    errorMessage: ''
  },

  /**
   * 姓名输入处理
   */
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value,
      errorMessage: ''
    });
    this.validateForm();
  },

  /**
   * 手机号码输入处理
   */
  onPhoneInput(e) {
    this.setData({
      'formData.phone': e.detail.value,
      errorMessage: ''
    });
    this.validateForm();
  },

  /**
   * 密码输入处理
   */
  onPasswordInput(e) {
    this.setData({
      'formData.password': e.detail.value,
      errorMessage: ''
    });
    this.validateForm();
  },

  /**
   * 切换密码显示/隐藏
   */
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { name, phone, password } = this.data.formData;

    // 检查所有字段是否填写
    if (!name.trim() || !phone.trim() || !password.trim()) {
      this.setData({ isFormValid: false });
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      this.setData({ isFormValid: false });
      return;
    }

    // 验证密码格式
    if (!this.validatePassword(password)) {
      this.setData({ isFormValid: false });
      return;
    }

    this.setData({ isFormValid: true });
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
   * 登录处理
   */
  onLogin() {
    if (!this.data.isFormValid) {
      return;
    }

    const { name, phone, password } = this.data.formData;

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

    if (!this.validatePassword(password)) {
      this.setData({ errorMessage: '密码格式不正确，请确保包含大小写字母和数字，且不少于8位' });
      return;
    }

    // 登录成功处理
    wx.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500,
      success: () => {
        // 延迟跳转到权限管理中心
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/admin/admin?name=' + encodeURIComponent(name) + '&phone=' + phone
          });
        }, 1500);
      }
    });

    // 这里可以添加实际的登录逻辑，比如调用API
    console.log('登录信息：', { name, phone, password });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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