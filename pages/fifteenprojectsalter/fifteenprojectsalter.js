Page({
  data: {
    // 页面数据
    projectList: [],
    loading: false
  },

  onLoad() {
    console.log('十五项项目修改页面加载');
    this.loadProjectList();
  },

  // 加载项目列表
  loadProjectList() {
    this.setData({
      loading: true
    });

    // 调用后端接口获取项目列表
    // 接口：GET /api/fifteen-projects/list
    wx.request({
      url: 'http://127.0.0.1:5000/api/fifteen-projects/list',
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
            projectList: res.data.projects || []
          });
        } else {
          wx.showToast({
            title: res.data.message || '加载项目列表失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        this.setData({
          loading: false
        });
        console.error('加载项目列表失败:', err);
        wx.showToast({
          title: '加载项目列表失败',
          icon: 'none'
        });
      }
    });
  },

  // 新增列
  addColumn() {
    wx.navigateTo({
      url: '/pages/fifteenprojects_add_column/fifteenprojects_add_column'
    });
  },

  // 新增项目
  addProject() {
    wx.navigateTo({
      url: '/pages/fifteenprojects_add_project/fifteenprojects_add_project'
    });
  },

  // 修改项目
  modifyProject() {
    wx.navigateTo({
      url: '/pages/fifteenprojects_modify/fifteenprojects_modify'
    });
  },

  // 删除项目
  deleteProject() {
    wx.navigateTo({
      url: '/pages/fifteenprojects_delete/fifteenprojects_delete'
    });
  },

  // 项目进度管理
  manageProgress() {
    wx.navigateTo({
      url: '/pages/project_progress_manage/project_progress_manage'
    });
  },

  // 查看项目详情
  viewProjectDetail(e) {
    const projectId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/fifteenprojects_detail/fifteenprojects_detail?id=${projectId}`
    });
  },

  // 刷新数据
  onPullDownRefresh() {
    this.loadProjectList();
    wx.stopPullDownRefresh();
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});
