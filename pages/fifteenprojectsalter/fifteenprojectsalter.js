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

    // 使用模拟数据，实际项目中应该调用后端接口
    try {
      const projects = this.getDefaultProjects();
      this.setData({
        projectList: projects,
        loading: false
      });
      console.log('项目列表加载完成，共', projects.length, '个项目');
    } catch (error) {
      console.error('加载项目列表失败:', error);
      this.setData({
        projectList: [],
        loading: false
      });
      wx.showToast({
        title: '加载项目列表失败',
        icon: 'none'
      });
    }
  },

  // 获取默认项目数据
  getDefaultProjects() {
    return [
      {
        id: 1,
        projectName: '智慧城市基础设施建设项目',
        projectType: '基础设施建设',
        progress: 68,
        status: '进行中',
        createDate: '2024-01-15'
      },
      {
        id: 2,
        projectName: '绿色能源产业园区建设',
        projectType: '产业发展',
        progress: 52,
        status: '进行中',
        createDate: '2024-02-01'
      },
      {
        id: 3,
        projectName: '数字化教育改革试点',
        projectType: '民生改善',
        progress: 82,
        status: '即将完成',
        createDate: '2024-03-01'
      },
      {
        id: 4,
        projectName: '城市轨道交通建设工程',
        projectType: '交通建设',
        progress: 35,
        status: '建设中',
        createDate: '2024-01-01'
      },
      {
        id: 5,
        projectName: '现代农业科技示范园',
        projectType: '农业发展',
        progress: 28,
        status: '建设中',
        createDate: '2024-04-01'
      }
    ];
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
