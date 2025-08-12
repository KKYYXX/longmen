Page({
  data: {
    searchKeyword: '',
    projectList: [],
    allProjects: [], // 存储所有项目，用于搜索
    filteredProjects: [] // 搜索过滤后的项目
  },

  onLoad() {
    this.loadProjectList();
  },

  onShow() {
    console.log('十五项项目删除页面显示');

    // 检查是否有新添加的项目
    const app = getApp();
    if (app && app.globalData && app.globalData.newProject) {
      console.log('检测到新项目，刷新列表');

      // 检查项目是否已经在列表中（避免重复添加）
      const existingProject = this.data.projectList.find(p => p.id === app.globalData.newProject.id);
      if (!existingProject) {
        this.addProjectToList(app.globalData.newProject);

        wx.showToast({
          title: '项目已添加',
          icon: 'success'
        });
      }
    }
  },

  // 加载项目列表
  loadProjectList() {
    // TODO: 调用后端API获取十五项项目列表
    // wx.request({
    //   url: 'your-api-endpoint/fifteen-projects',
    //   method: 'GET',
    //   success: (res) => {
    //     this.setData({
    //       projectList: res.data.data || []
    //     });
    //   },
    //   fail: (err) => {
    //     console.error('获取十五项项目列表失败:', err);
    //     wx.showToast({
    //       title: '获取数据失败',
    //       icon: 'none'
    //     });
    //   }
    // });

    // 临时：使用模拟数据，与其他页面保持一致
    try {
      const allProjects = this.getDefaultProjects();
      console.log('删除页面获取到项目数据:', allProjects);

      this.setData({
        allProjects: allProjects || [],
        projectList: allProjects || [],
        filteredProjects: allProjects || []
      });
      console.log('删除页面项目列表设置完成，当前列表长度:', this.data.projectList.length);
    } catch (error) {
      console.error('加载项目数据失败:', error);
      this.setData({
        projectList: []
      });
    }
  },

  // 获取默认项目数据（与查询页面保持一致）
  getDefaultProjects: function() {
    console.log('开始获取默认项目数据');
    return [
      {
        id: 1,
        projectName: '智慧城市基础设施建设项目',
        projectType: '基础设施建设',
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        createDate: '2024-01-15',
        background: '随着城市化进程加快，传统城市管理模式面临挑战，需要通过智慧化手段提升城市治理效率。',
        content: '建设智慧城市管理平台，整合各类城市数据，实现城市运行状态的实时监控和智能分析。',
        objectives: '建设覆盖全市的智慧城市基础设施网络，包括物联网传感器、数据中心、通信网络等，提升城市治理效率，改善市民生活质量，推动城市可持续发展。',
        contactName: '张三',
        contactPosition: '项目经理',
        contactPhone: '13800138000',
        remarks: '重点项目，优先推进',
        progress: 75,
        projectManager: '李四',
        budget: '5000万元',
        status: '进行中'
      },
      {
        id: 2,
        projectName: '绿色能源发展项目',
        projectType: '环保治理',
        startDate: '2024-02-01',
        endDate: '2024-11-30',
        createDate: '2024-02-01',
        background: '为响应国家碳中和目标，推进清洁能源发展，减少对传统化石能源的依赖。',
        content: '建设太阳能发电站，推广风能利用技术，完善新能源配套设施。',
        objectives: '建设100MW太阳能发电站和50MW风力发电站，减少碳排放30%，提高清洁能源使用比例至60%以上。',
        contactName: '王五',
        contactPosition: '技术总监',
        contactPhone: '13900139000',
        remarks: '环保重点项目',
        progress: 60,
        projectManager: '赵六',
        budget: '8000万元',
        status: '进行中'
      },
      {
        id: 3,
        projectName: '数字化教育改革试点',
        projectType: '民生改善',
        startDate: '2024-03-01',
        endDate: '2024-08-31',
        createDate: '2024-03-01',
        background: '推进教育数字化转型，提升教育质量和教学效率，促进教育公平。',
        content: '建设智慧校园平台，推广在线教育，培训师资队伍。',
        objectives: '覆盖全市50所学校，培训教师1000名，建设数字化课程资源库，提升学生数字素养和创新能力。',
        contactName: '钱七',
        contactPosition: '教育专家',
        contactPhone: '13700137000',
        remarks: '教育创新项目',
        progress: 82,
        projectManager: '孙八',
        budget: '3000万元',
        status: '即将完成'
      }
    ];
  },

  // 搜索输入
  onSearchInput(e) {
    console.log('删除页面搜索输入:', e.detail.value);
    this.setData({
      searchKeyword: e.detail.value
    });
    // 实时搜索
    this.filterProjects();
  },

  // 搜索
  onSearch() {
    console.log('删除页面执行搜索，关键词:', this.data.searchKeyword);
    this.filterProjects();
  },

  // 筛选项目
  filterProjects() {
    console.log('删除页面开始筛选项目，总数:', this.data.allProjects.length);
    console.log('搜索关键词:', this.data.searchKeyword);

    let filtered = this.data.allProjects;

    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(project => {
        const projectName = (project.projectName || '').toLowerCase();
        return projectName.includes(keyword);
      });
      console.log('筛选后数量:', filtered.length);
    }

    this.setData({
      projectList: filtered,
      filteredProjects: filtered
    });
    console.log('删除页面筛选完成，显示项目数量:', filtered.length);
  },

  // 删除项目
  deleteProject(e) {
    const projectItem = e.currentTarget.dataset.project;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除项目"${projectItem.projectName}"吗？此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#e74c3c',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.performDelete(projectItem);
        }
      }
    });
  },

  // 执行删除操作
  performDelete(projectItem) {
    wx.showLoading({
      title: '删除中...'
    });

    // TODO: 调用后端API删除十五项项目
    // wx.request({
    //   url: 'your-api-endpoint/fifteen-projects/' + projectItem.id,
    //   method: 'DELETE',
    //   success: (res) => {
    //     wx.hideLoading();
    //     // 从列表中移除项目
    //     const projectList = this.data.projectList.filter(item => item.id !== projectItem.id);
    //     this.setData({
    //       projectList: projectList
    //     });
    //     wx.showToast({
    //       title: '删除成功',
    //       icon: 'success'
    //     });
    //   },
    //   fail: (err) => {
    //     wx.hideLoading();
    //     console.error('删除十五项项目失败:', err);
    //     wx.showToast({
    //       title: '删除失败',
    //       icon: 'none'
    //     });
    //   }
    // });

    // 临时：模拟删除成功
    setTimeout(() => {
      wx.hideLoading();
      const allProjects = this.data.allProjects.filter(item => item.id !== projectItem.id);
      const projectList = this.data.projectList.filter(item => item.id !== projectItem.id);
      this.setData({
        allProjects: allProjects,
        projectList: projectList,
        filteredProjects: projectList
      });
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    }, 1000);
  },

  // 添加新项目到列表
  addProjectToList: function(newProject) {
    const allProjects = [newProject, ...this.data.allProjects];
    const projectList = [newProject, ...this.data.projectList];
    this.setData({
      allProjects: allProjects,
      projectList: projectList,
      filteredProjects: allProjects
    });
  }
});
