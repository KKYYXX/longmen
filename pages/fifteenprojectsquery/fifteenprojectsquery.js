Page({
  data: {
    searchKeyword: '',
    startDate: '',
    endDate: '',
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    projectList: []
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

    // 模拟加载延迟，实际项目中这里会调用后端API
    setTimeout(() => {
      // 获取默认项目数据
      const allProjects = this.getDefaultProjects();

      this.setData({
        projectList: allProjects,
        loading: false,
        hasMore: false
      });
    }, 500);
  },

  // 获取默认项目数据
  getDefaultProjects() {
    return [
      {
        id: 1,
        projectName: '智慧城市基础设施建设项目',
        projectType: '基础设施建设',
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        background: '随着城市化进程加快，传统城市管理模式面临挑战，需要运用现代信息技术手段，构建智慧化城市管理体系，提升城市治理水平和服务效率。',
        content: '建设智慧城市管理平台，整合各类城市数据资源，包括交通、环境、安全、民生等多个领域。通过大数据分析、人工智能等技术，实现城市运行状态的实时监控、预警和智能决策。',
        objectives: '建设覆盖全市的智慧城市基础设施网络，包括物联网传感器部署、数据中心建设、智能交通系统等，提升城市管理效率和市民生活质量。预计完成后将服务人口500万，实现城市管理数字化转型。项目总投资15亿元，分三个阶段实施，将打造全国领先的智慧城市示范区。',
        contactName: '张三',
        contactPosition: '项目经理',
        contactPhone: '13800138000',
        remarks: '重点项目，优先推进，已获得市政府专项资金支持',
        progress: 68,
        projectManager: '李四',
        budget: '15亿元',
        status: '进行中',
        createDate: '2024-01-15',
        expanded: false
      },
      {
        id: 2,
        projectName: '绿色能源产业园区建设',
        projectType: '产业发展',
        startDate: '2024-02-01',
        endDate: '2025-01-31',
        background: '为响应国家碳中和目标，推进清洁能源发展，减少化石能源依赖，建设可持续发展的能源体系，促进经济社会绿色低碳转型。',
        content: '建设太阳能发电站，推广风能利用技术，开展分布式能源示范项目。同时加强能源储存技术研发，完善清洁能源配套基础设施建设。',
        objectives: '建设集太阳能、风能、储能技术于一体的绿色能源产业园区，打造清洁能源产业集群。园区规划面积1000亩，预计引入企业50家，年产值达到100亿元，成为区域绿色发展示范基地。项目将建设50MW太阳能发电站、20MW风力发电站和大型储能设施。',
        contactName: '王五',
        contactPosition: '技术总监',
        contactPhone: '13900139000',
        remarks: '环保重点项目，与国际组织合作',
        progress: 52,
        projectManager: '赵六',
        budget: '100亿元',
        status: '进行中',
        createDate: '2024-02-01',
        expanded: false
      },
      {
        id: 3,
        projectName: '数字化教育改革试点',
        projectType: '民生改善',
        startDate: '2024-03-01',
        endDate: '2024-11-30',
        background: '推进教育现代化，利用数字技术改革传统教育模式，提高教育质量和效率，促进教育公平，培养适应数字时代的人才。',
        content: '建设在线教育平台，开发数字化教学资源，推广智慧课堂应用，建立教育大数据分析系统，实现个性化教学和精准教育管理。',
        objectives: '在全市200所学校实施数字化教育改革，建设智慧教室、在线学习平台、教师培训体系等。通过技术手段实现个性化教学，提升教育质量，缩小城乡教育差距，惠及师生15万人。项目包括建设1000间智慧教室、培训5000名教师、开发100门在线课程。',
        contactName: '刘七',
        contactPosition: '教育局副局长',
        contactPhone: '13700137000',
        remarks: '教育部重点支持项目',
        progress: 82,
        projectManager: '陈八',
        budget: '5亿元',
        status: '即将完成',
        createDate: '2024-03-01',
        expanded: false
      },
      {
        id: 4,
        projectName: '城市轨道交通建设工程',
        projectType: '交通建设',
        startDate: '2024-01-01',
        endDate: '2026-12-31',
        background: '随着城市人口增长和交通需求增加，现有交通系统已无法满足市民出行需求，急需建设现代化轨道交通系统。',
        content: '建设地铁1号线、2号线和轻轨3号线，总长度120公里，设置车站80座，配套建设车辆段、控制中心等设施。',
        objectives: '建设全长120公里的城市轨道交通网络，包括地铁1号线、2号线和轻轨3号线，缓解城市交通压力，提升公共交通服务水平。项目总投资800亿元，预计日客流量达到200万人次，将极大改善市民出行条件。',
        contactName: '陈九',
        contactPosition: '工程总监',
        contactPhone: '13600136000',
        remarks: '国家重大基础设施项目',
        progress: 35,
        projectManager: '吴十',
        budget: '800亿元',
        status: '建设中',
        createDate: '2024-01-01',
        expanded: false
      },
      {
        id: 5,
        projectName: '现代农业科技示范园',
        projectType: '农业发展',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
        background: '传统农业面临效率低、收益少等问题，需要通过科技创新推动农业现代化，提高农业生产效率和农民收入。',
        content: '建设智能温室、无土栽培基地、农产品加工中心、农业科研实验室，推广智慧农业技术和现代农业管理模式。',
        objectives: '建设占地5000亩的现代农业科技示范园，推广智慧农业技术，发展高效生态农业。园区将建设智能温室、无土栽培基地、农产品加工中心等，年产值预计达到10亿元，带动周边农民增收致富。',
        contactName: '刘一',
        contactPosition: '农业专家',
        contactPhone: '13500135000',
        remarks: '农业部示范项目',
        progress: 28,
        projectManager: '钱二',
        budget: '12亿元',
        status: '建设中',
        createDate: '2024-04-01',
        expanded: false
      }
    ];
  },

    // TODO: 生产环境中调用后端API获取十五项项目数据
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
    const project = this.data.projectList[index];

    // 跳转到项目进度详情页面
    wx.navigateTo({
      url: `/pages/project_progress/project_progress?id=${project.id}`
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
