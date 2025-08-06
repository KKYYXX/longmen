// pages/权限管理人员名单/权限管理人员名单.js
Page({
  data: {},

  onProjectQuery() {
    // 跳转到项目查询权限人员页面
    wx.navigateTo({
      url: '/pages/项目查询权限人员/项目查询权限人员',
      success: function() {
        console.log('成功跳转到项目查询权限人员页面');
      },
      fail: function(err) {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  onProjectModify() {
    // 跳转到项目修改权限人员页面
    wx.navigateTo({
      url: '/pages/项目修改权限人员/项目修改权限人员',
      success: function() {
        console.log('成功跳转到项目修改权限人员页面');
      },
      fail: function(err) {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  onPolicyModify() {
    // 跳转到政策文件修改权限人员页面
    wx.navigateTo({
      url: '/pages/政策文件修改权限人员/政策文件修改权限人员',
      success: function() {
        console.log('成功跳转到政策文件修改权限人员页面');
      },
      fail: function(err) {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  onCaseModify() {
    // 跳转到典型案例修改权限人员页面
    wx.navigateTo({
      url: '/pages/典型案例修改权限人员/典型案例修改权限人员',
      success: function() {
        console.log('成功跳转到典型案例修改权限人员页面');
      },
      fail: function(err) {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  onProgressModify() {
    // 跳转到项目进度修改权限人员页面
    wx.navigateTo({
      url: '/pages/项目进度修改权限人员/项目进度修改权限人员',
      success: function() {
        console.log('成功跳转到项目进度修改权限人员页面');
      },
      fail: function(err) {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});
