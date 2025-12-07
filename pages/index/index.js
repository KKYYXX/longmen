// 引入 API 配置
const apiConfig = require('../../config/api.js');

Page({
  data: {
    isLoggedIn: false,
    loginType: ''
  },

  // 通用权限检查：调用 /app 前缀接口并根据返回的名单匹配当前用户
  checkPermissionAndThen(appPath, onAllowed) {
    const appInst = getApp();
    const currentUser = appInst.getUserInfo ? appInst.getUserInfo() : appInst.globalData.currentUser;

    // 构建接口 URL（会变为 baseUrl + '/app' + appPath）
    const url = apiConfig.buildAppUrl(appPath);
    console.log('检查权限，调用接口：', url);

    wx.request({
      url: url,
      method: 'GET',
      success: (res) => {
        console.log('权限接口返回：', res);
        if (res.statusCode === 200 && res.data) {
          let list = [];
          try {
            if (Array.isArray(res.data)) {
              list = res.data;
            } else if (Array.isArray(res.data.data)) {
              list = res.data.data;
            } else if (res.data.data) {
              list = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
            }
          } catch (e) {
            console.error('解析权限接口返回数据失败', e, res);
            list = [];
          }

          console.log('归一化后的权限列表：', list);

          const curName = (currentUser && (currentUser.name || currentUser.realname)) ? (currentUser.name || currentUser.realname).toString().trim() : '';
          const curPhone = (currentUser && (currentUser.phone || currentUser.telephone || currentUser.mobile)) ? (currentUser.phone || currentUser.telephone || currentUser.mobile).toString().trim() : '';

          const match = list.find(item => {
            if (!item) return false;
            const name = (item.name || item.realname || item.user_name || item.username || '').toString().trim();
            const phone = (item.phone || item.telephone || item.mobile || item.tel || '').toString().trim();
            return ((name && curName && name === curName) && (phone && curPhone && phone === curPhone)) || (phone && curPhone && phone === curPhone);
          });

          if (match) {
            console.log('权限匹配成功');
            if (typeof onAllowed === 'function') onAllowed();
          } else {
            console.warn('没有匹配到权限人员，弹出无权限提示');
            wx.showModal({
              title: '提示',
              content: '您暂无权限查看',
              showCancel: false
            });
          }
        } else {
          console.error('权限接口返回异常或无数据', res);
          wx.showModal({
            title: '提示',
            content: '权限校验失败，请稍后重试',
            showCancel: false
          });
        }
      },
      fail: (err) => {
        console.error('权限接口请求失败', err);
        wx.showModal({
          title: '提示',
          content: '网络错误，权限校验失败',
          showCancel: false
        });
      }
    });
  },
  
  onLoad() {
    console.log('页面加载成功');
    this.checkLoginStatus();
  },

  onShow() {
    console.log('页面显示');
    this.checkLoginStatus();
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const app = getApp();
    const loginStatus = app.getLoginStatus();
    
    this.setData({
      isLoggedIn: loginStatus.isLoggedIn,
      loginType: loginStatus.loginType
    });
    
    console.log('当前登录状态:', loginStatus);
  },
  
  // 图片加载成功
  imageLoad(e) {
    console.log('图片加载成功:', e);
  },

  // 图片加载失败
  imageError(e) {
    console.log('图片加载失败:', e);
    wx.showToast({
      title: '图片加载失败',
      icon: 'none'
    });
  },

  // 跳转到典型案例页面
  goToTypicalCases() {
    // 先检查权限：/app/user/query_model
    this.checkPermissionAndThen('/user/query_model', () => {
      wx.navigateTo({
        url: '/pages/typicalcases/typicalcases'
      });
    });
  },

  // 跳转到十五项项目页面
  goToFifteenProjects() {
    wx.navigateTo({  // 已修正拼写
      url: '/pages/fifteenprojects/fifteenprojects'
    })
  },

  // 跳转到政策文件页面
  goToPolicyDocuments() {
    // 先检查权限：/app/user/query_zc
    this.checkPermissionAndThen('/user/query_zc', () => {
      wx.navigateTo({
        url: '/pages/zcdocuments/zcdocuments',
        success: () => {},
        fail: (err) => {
          console.error('页面跳转失败:', err);
        }
      });
    });
  },

  goToWorkSummy(){
    // 先检查权限：/app/user/query_sum
    this.checkPermissionAndThen('/user/query_sum', () => {
      wx.navigateTo({
        url: '/pages/worksummy/worksummy',
        success: () => {},
        fail: (err) => {
          console.error('页面跳转失败:', err);
        }
      });
    });
  },

  // 首页tab点击事件
  onHomeTab() {
    console.log('点击首页tab');
    // 首页tab不需要跳转
  },

  // 个人tab点击事件
  onPersonalTab() {
    console.log('点击个人tab');
    wx.navigateTo({
      url: '/pages/personal/personal',
      success: () => {
        console.log('跳转个人页面成功');
      },
      fail: (err) => {
        console.error('跳转个人页面失败:', err);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  }
})
