Page({
  data: {
    // 页面数据
    caseList: [],
    loading: false
  },

  onLoad() {
    console.log('典型案例修改页面加载');
    this.loadCaseList();
  },

  // 加载案例列表
  loadCaseList() {
    this.setData({
      loading: true
    });

    // 调用后端接口获取案例列表
    // 接口：GET /api/typical-cases/list
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/typical-cases/list',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        this.setData({
          loading: false
        });
        if (res.data.success) {
          this.setData({
            caseList: res.data.cases || []
          });
        } else {
          wx.showToast({
            title: res.data.message || '加载案例列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        this.setData({
          loading: false
        });
        console.error('加载案例列表失败:', err);
        wx.showToast({
          title: '加载案例列表失败',
          icon: 'none'
        });
      }
    });
  },

  // 增加案例
  addCase() {
    wx.navigateTo({
      url: '/pages/typicalcases_add/typicalcases_add'
    });
  },

  // 删除案例
  deleteCase() {
    wx.navigateTo({
      url: '/pages/typicalcases_delete/typicalcases_delete'
    });
  },

  // 修改案例
  modifyCase(e) {
    const caseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/typicalcases_modify/typicalcases_modify?id=${caseId}`
    });
  },

  // 查看案例详情
  viewCaseDetail(e) {
    const caseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/typicalcases_detail/typicalcases_detail?id=${caseId}`
    });
  },

  // 刷新数据
  onPullDownRefresh() {
    this.loadCaseList();
    wx.stopPullDownRefresh();
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});
