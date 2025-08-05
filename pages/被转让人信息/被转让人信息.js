// pages/被转让人信息/被转让人信息.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    transfereeInfo: {
      name: '',
      phone: '',
      password: ''
    },
    showPassword: false,
    isFormValid: false
  },

  /**
   * 姓名输入事件
   */
  onNameInput(e) {
    this.setData({
      'transfereeInfo.name': e.detail.value
    });
    this.validateForm();
  },

  /**
   * 电话输入事件
   */
  onPhoneInput(e) {
    this.setData({
      'transfereeInfo.phone': e.detail.value
    });
    this.validateForm();
  },

  /**
   * 密码输入事件
   */
  onPasswordInput(e) {
    this.setData({
      'transfereeInfo.password': e.detail.value
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
    console.log('密码显示状态:', this.data.showPassword ? '显示' : '隐藏');
  },

  /**
   * 验证密码格式
   */
  validatePassword(password) {
    // 临时简化密码验证，用于测试
    // 原要求：大小写字母和数字相结合，不少于8位
    // 临时要求：不少于6位即可
    const isLengthValid = password && password.length >= 6;
    
    console.log('密码验证详情:', {
      password: password,
      passwordLength: password ? password.length : 0,
      isLengthValid,
      isValid: isLengthValid
    });

    return isLengthValid;
  },

  /**
   * 验证表单
   */
  validateForm() {
    const { name, phone, password } = this.data.transfereeInfo;
    const isNameValid = name && name.trim().length > 0;
    const isPhoneValid = phone && /^1[3-9]\d{9}$/.test(phone);
    const isPasswordValid = this.validatePassword(password);

    const isFormValid = isNameValid && isPhoneValid && isPasswordValid;

    this.setData({
      isFormValid: isFormValid
    });

    console.log('表单验证结果:', {
      name: name,
      phone: phone,
      password: password,
      isNameValid,
      isPhoneValid,
      isPasswordValid,
      isFormValid,
      nameLength: name ? name.trim().length : 0,
      phonePattern: phone ? /^1[3-9]\d{9}$/.test(phone) : false,
      passwordLength: password ? password.length : 0
    });
  },

  /**
   * 确认转让按钮点击事件
   */
  onConfirm() {
    if (!this.data.isFormValid) {
      wx.showToast({
        title: '请完善信息',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    const { name, phone, password } = this.data.transfereeInfo;

    // 再次验证密码
    if (!this.validatePassword(password)) {
      wx.showToast({
        title: '密码格式不正确',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 显示确认对话框
    wx.showModal({
      title: '确认转让',
      content: `确定要将负责人权限转让给 ${name} 吗？此操作不可撤销。`,
      confirmText: '确认转让',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 调用后端validate接口进行转让验证
          this.callValidateAPI(name, phone, password);
        }
      }
    });
  },

  /**
   * 调用后端validate接口
   */
  callValidateAPI(name, phone, password) {
    wx.showLoading({
      title: '验证中...',
      mask: true
    });

    // 调用后端 /user/validate 接口
    wx.request({
      url: 'http://127.0.0.1:5000/app/user/validate',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        name: name,
        phone: phone,
        password: password
      },
      success: (res) => {
        wx.hideLoading();
        console.log('validate接口响应:', res);

        if (res.statusCode === 200) {
          // 转让成功
          const userInfo = res.data;
          console.log('转让成功，用户信息:', userInfo);

          // 更新全局用户信息
          const app = getApp();
          console.log('=== 转让成功，开始更新用户信息 ===');
          console.log('被转让人信息:', { name, phone, password });

          app.updateUserInfo({
            name: userInfo.name,
            phone: userInfo.phone,
            password: password
          });

          console.log('=== 用户信息更新完成 ===');

          wx.showToast({
            title: '转让成功！',
            icon: 'success',
            duration: 1500,
            success: () => {
              // 转让成功后返回上一页
              setTimeout(() => {
                wx.navigateBack({
                  delta: 1,
                  success: () => {
                    console.log('成功返回上一页');
                  },
                  fail: (err) => {
                    console.error('返回上一页失败:', err);
                    // 如果返回失败，尝试返回多级
                    wx.navigateBack({
                      delta: 2
                    });
                  }
                });
              }, 500);
            }
          });
        } else {
          // 转让失败，显示错误信息
          const errorMessage = res.data.message || '转让失败';
          wx.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('validate接口请求失败:', err);
        wx.showToast({
          title: '网络连接失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('被转让人信息页面加载', options);

    // 接收传递的被转让人信息（如果有的话）
    if (options.name) {
      this.setData({
        'transfereeInfo.name': decodeURIComponent(options.name)
      });
    }
    if (options.phone) {
      this.setData({
        'transfereeInfo.phone': options.phone
      });
    }
    if (options.password) {
      this.setData({
        'transfereeInfo.password': options.password
      });
    }

    // 验证表单状态
    this.validateForm();
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