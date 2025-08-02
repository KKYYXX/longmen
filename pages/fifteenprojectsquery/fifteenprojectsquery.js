Page({
  data: {
    searchKeyword: '',
    startDate: '',
    endDate: '',
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    projectList: [
      {
        id: 1,
        projectName: '智慧城市建设项目',
        projectType: '基础设施建设',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        background: '随着城市化进程加快，传统城市管理模式面临挑战，需要运用现代信息技术手段，构建智慧化城市管理体系，提升城市治理水平和服务效率。',
        content: '建设智慧城市管理平台，整合各类城市数据资源，包括交通、环境、安全、民生等多个领域。通过大数据分析、人工智能等技术，实现城市运行状态的实时监控、预警和智能决策。',
        objectives: '提升城市治理效率30%，改善市民生活质量，建设数字化、智能化的现代城市管理体系，为市民提供更便民、高效的公共服务。',
        contactName: '张三',
        contactPosition: '项目经理',
        contactPhone: '13800138000',
        remarks: '重点项目，优先推进，已获得市政府专项资金支持',
        progress: 75,
        projectManager: '李四',
        budget: '5000万元',
        status: '进行中',
        projectReports: [
          { name: '智慧城市建设方案.pdf', url: '/files/reports/smart_city_plan.pdf' },
          { name: '项目进度报告.docx', url: '/files/reports/progress_report.docx' }
        ],
        relatedFiles: [
          { name: '技术架构图.png', url: '/files/images/architecture.png' },
          { name: '演示视频.mp4', url: '/files/videos/demo.mp4' }
        ]
      },
      {
        id: 2,
        projectName: '绿色能源发展项目',
        projectType: '环保治理',
        startDate: '2024-02-01',
        endDate: '2024-11-30',
        background: '为响应国家碳中和目标，推进清洁能源发展，减少化石能源依赖，建设可持续发展的能源体系，促进经济社会绿色低碳转型。',
        content: '建设太阳能发电站，推广风能利用技术，开展分布式能源示范项目。同时加强能源储存技术研发，完善清洁能源配套基础设施建设。',
        objectives: '减少碳排放20%，提高清洁能源使用比例至40%，建成3个示范性绿色能源基地，培养专业技术人才100名。',
        contactName: '王五',
        contactPosition: '技术总监',
        contactPhone: '13900139000',
        remarks: '环保重点项目，与国际组织合作',
        progress: 60,
        projectManager: '赵六',
        budget: '8000万元',
        status: '进行中',
        projectReports: [
          { name: '绿色能源发展规划.pdf', url: '/files/reports/green_energy_plan.pdf' }
        ],
        relatedFiles: [
          { name: '太阳能电站效果图.jpg', url: '/files/images/solar_plant.jpg' }
        ]
      },
      {
        id: 3,
        projectName: '数字化教育改革项目',
        projectType: '民生改善',
        startDate: '2024-03-01',
        endDate: '2025-02-28',
        background: '推进教育现代化，利用数字技术改革传统教育模式，提高教育质量和效率，促进教育公平，培养适应数字时代的人才。',
        content: '建设在线教育平台，开发数字化教学资源，推广智慧课堂应用，建立教育大数据分析系统，实现个性化教学和精准教育管理。',
        objectives: '覆盖全市200所学校，培训教师5000名，开发优质数字课程500门，提升学生学习效果15%。',
        contactName: '刘七',
        contactPosition: '教育局副局长',
        contactPhone: '13700137000',
        remarks: '教育部重点支持项目',
        progress: 45,
        projectManager: '陈八',
        budget: '3000万元',
        status: '进行中',
        projectReports: [
          { name: '数字化教育实施方案.pdf', url: '/files/reports/digital_education.pdf' }
        ],
        relatedFiles: [
          { name: '智慧课堂演示.mp4', url: '/files/videos/smart_classroom.mp4' }
        ]
      }
    ]
  },

  onLoad() {
    this.loadProjectList();
  },

  onShow() {
    // 页面显示时刷新数据
    this.refreshData();
  },

  // 开始时间选择
  onStartDateChange(e) {
    this.setData({
      startDate: e.detail.value
    });
    this.onSearch();
  },

  // 结束时间选择
  onEndDateChange(e) {
    this.setData({
      endDate: e.detail.value
    });
    this.onSearch();
  },

  // 加载项目列表
  loadProjectList(isRefresh = false) {
    if (this.data.loading) return;

    this.setData({
      loading: true
    });

    const page = isRefresh ? 1 : this.data.page;

    // TODO: 调用后端API获取十五项项目数据
    // wx.request({
    //   url: 'your-api-endpoint/fifteen-projects',
    //   method: 'GET',
    //   data: {
    //     page: page,
    //     pageSize: this.data.pageSize,
    //     keyword: this.data.searchKeyword,
    //     startDate: this.data.startDate,
    //     endDate: this.data.endDate
    //   },
    //   success: (res) => {
    //     const data = res.data.data || [];
    //     if (isRefresh) {
    //       this.setData({
    //         projectList: data,
    //         page: 1,
    //         hasMore: data.length === this.data.pageSize
    //       });
    //     } else {
    //       this.setData({
    //         projectList: [...this.data.projectList, ...data],
    //         page: page + 1,
    //         hasMore: data.length === this.data.pageSize
    //       });
    //     }
    //   },
    //   fail: (err) => {
    //     console.error('获取十五项项目数据失败:', err);
    //     wx.showToast({
    //       title: '获取数据失败',
    //       icon: 'none'
    //     });
    //   },
    //   complete: () => {
    //     this.setData({
    //       loading: false
    //     });
    //   }
    // });

    // 临时：设置空数据，等待后端接口
    this.setData({
      projectList: [],
      loading: false,
      hasMore: false
    });
  },



  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 搜索
  onSearch() {
    this.refreshData();
  },

  // 刷新数据
  refreshData() {
    this.setData({
      page: 1,
      hasMore: true
    });
    this.loadProjectList(true);
  },

  // 项目项点击
  onProjectTap(e) {
    const index = e.currentTarget.dataset.index;
    const projectList = this.data.projectList;
    projectList[index].expanded = !projectList[index].expanded;
    
    this.setData({
      projectList: projectList
    });
  },

  // 图片预览
  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    const urls = e.currentTarget.dataset.urls;
    
    wx.previewImage({
      current: src,
      urls: urls
    });
  },

  // 文件下载
  downloadFile(e) {
    const file = e.currentTarget.dataset.file;
    
    wx.showModal({
      title: '下载文件',
      content: `确定要下载文件"${file.fileName}"吗？`,
      success: (res) => {
        if (res.confirm) {
          // 这里应该调用实际的文件下载API
          wx.showToast({
            title: '下载功能待实现',
            icon: 'none'
          });
        }
      }
    });
  },

  // 加载更多
  loadMore() {
    this.loadProjectList();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshData();
    wx.stopPullDownRefresh();
  },

  // 上拉加载
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore();
    }
  }
});
