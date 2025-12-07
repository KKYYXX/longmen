// pages/homepage/homepage.js
const apiConfig = require('../../config/api.js');
const app = getApp();

Page({
  data: {},

  onShow() {
    console.log('首页（homepage）显示，开始检查登录与权限');

    try {
      const isLoggedIn = app.globalData?.isLoggedIn;
      const currentUser = app.globalData?.currentUser;

      if (!isLoggedIn || !currentUser) {
        console.log('用户未登录，弹出提示并提供去登录按钮');
        wx.showModal({
          title: '提示',
          content: '请先进行登录',
          confirmText: '去登录',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              // 登录页位于 tabBar，使用 switchTab
              wx.switchTab({
                url: '/pages/登录后的页面/登录后的页面'
              });
            }
          }
        });
        return;
      }

      // 已登录，调用多个权限接口进行校验：query_15, query_zc, query_model, query_sum
      console.log('用户已登录，开始调用多个权限接口进行校验');
      const endpoints = ['/user/query_15', '/user/query_zc', '/user/query_model', '/user/query_sum'];
      let completed = 0;
      let allowed = false;

      const tryMatchList = (resData) => {
        let list = [];
        try {
          if (Array.isArray(resData)) {
            list = resData;
          } else if (resData && Array.isArray(resData.data)) {
            list = resData.data;
          } else if (resData && resData.data) {
            list = Array.isArray(resData.data) ? resData.data : [resData.data];
          }
        } catch (e) {
          console.error('解析权限接口返回数据失败', e, resData);
          list = [];
        }

        if (!list || list.length === 0) return false;

        const curName = (currentUser.name || currentUser.realname || '').toString().trim();
        const curPhone = (currentUser.phone || currentUser.telephone || currentUser.mobile || '').toString().trim();

        const match = list.find(item => {
          if (!item) return false;
          const name = (item.name || item.realname || item.user_name || item.username || '').toString().trim();
          const phone = (item.phone || item.telephone || item.mobile || item.tel || '').toString().trim();
          return ((name && curName && name === curName) && (phone && curPhone && phone === curPhone))
            || (phone && curPhone && phone === curPhone);
        });

        return !!match;
      };

      endpoints.forEach((ep) => {
        const url = apiConfig.buildAppUrl(ep);
        console.log('请求权限接口 URL:', url);

        wx.request({
          url: url,
          method: 'GET',
          success: (res) => {
            console.log('权限接口返回：', res);
            if (!allowed && res.statusCode === 200 && res.data) {
              try {
                if (tryMatchList(res.data)) {
                  allowed = true;
                  console.log('任一权限接口匹配成功，跳转到 index 页');
                  wx.switchTab({ url: '/pages/index/index' });
                }
              } catch (e) {
                console.error('处理权限返回时异常', e);
              }
            }
          },
          fail: (err) => {
            console.error('权限接口请求失败', err, ep);
          },
          complete: () => {
            completed++;
            // 所有接口都返回且都未匹配，则提示无权限进入
            if (completed === endpoints.length && !allowed) {
              console.warn('所有权限接口均未匹配到当前用户，提示无权限进入');
              wx.showModal({
                title: '提示',
                content: '您暂无权限进入',
                showCancel: false
              });
            }
          }
        });
      });

    } catch (e) {
      console.error('首页权限检查异常', e);
      wx.showModal({
        title: '提示',
        content: '发生错误，请重试',
        showCancel: false
      });
    }
  }
});