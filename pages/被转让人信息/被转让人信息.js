// pages/被转让人信息/被转让人信息.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    transfereeInfo: {
      name: '',
      phone: '',
      wechat: ''
    },
    currentManagerPhone: '', // 当前负责人手机号
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
   * 微信号输入事件
   */
  onWechatInput(e) {
    this.setData({
      'transfereeInfo.wechat': e.detail.value
    });
    this.validateForm();
  },

  /**
   * 验证微信号格式
   */
  validateWechat(wechat) {
    // 验证微信号不为空
    const isValid = wechat && wechat.trim().length > 0;
    
    console.log('微信号验证详情:', {
      wechat: wechat,
      wechatLength: wechat ? wechat.length : 0,
      isValid: isValid
    });

    return isValid;
  },

  /**
   * 验证表单
   */
  validateForm() {
    const { name, phone, wechat } = this.data.transfereeInfo;
    const isNameValid = name && name.trim().length > 0;
    // 放宽手机号验证，只要不为空且长度合理即可
    const isPhoneValid = phone && phone.trim().length >= 10;
    const isWechatValid = this.validateWechat(wechat);

    const isFormValid = isNameValid && isPhoneValid && isWechatValid;

    this.setData({
      isFormValid: isFormValid
    });

    console.log('表单验证结果:', {
      name: name,
      phone: phone,
      wechat: wechat,
      isNameValid,
      isPhoneValid,
      isWechatValid,
      isFormValid,
      nameLength: name ? name.trim().length : 0,
      phoneLength: phone ? phone.trim().length : 0,
      wechatLength: wechat ? wechat.length : 0
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

    const { name, phone, wechat } = this.data.transfereeInfo;
    const currentPhone = this.data.currentManagerPhone;

    // 再次验证微信号
    if (!this.validateWechat(wechat)) {
      wx.showToast({
        title: '微信号格式不正确',
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
          // 调用后端transfer_principal接口进行转让
          this.callTransferAPI(name, phone, wechat, currentPhone);
        }
      }
    });
  },

  /**
   * 调用后端transfer_principal接口
   */
  callTransferAPI(name, phone, wechat, currentPhone) {
    wx.showLoading({
      title: '转让中...',
      mask: true
    });

    console.log('调用转让接口，参数:', {
      name: name,
      phone: phone,
      wx_openid: wechat,
      current_phone: currentPhone
    });

    // 调用后端 /user/transfer_principal 接口
    wx.request({
      url: 'http://127.0.0.1:5000/user/transfer_principal',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        name: name,
        phone: phone,
        wx_openid: wechat,
        current_phone: currentPhone
      },
      success: (res) => {
        wx.hideLoading();
        console.log('transfer_principal接口响应:', res);
        console.log('发送的数据:', { name, phone, wechat, currentPhone });

        if (res.statusCode === 200) {
          // 转让成功
          console.log('转让成功:', res.data);

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
        console.error('transfer_principal接口请求失败:', err);
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

    // 接收传递的当前负责人手机号
    if (options.currentPhone) {
      this.setData({
        currentManagerPhone: options.currentPhone
      });
      console.log('接收到的当前负责人手机号:', options.currentPhone);
    } else {
      // 如果没有传递参数，从全局获取用户信息
      const app = getApp();
      const userInfo = app.getUserInfo();
      this.setData({
        currentManagerPhone: userInfo.phone || ''
      });
      console.log('从全局获取的当前负责人手机号:', userInfo.phone);
    }

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
    if (options.wechat) {
      this.setData({
        'transfereeInfo.wechat': options.wechat
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