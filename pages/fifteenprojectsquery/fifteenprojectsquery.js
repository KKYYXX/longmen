Page({
  data: {
    searchKeyword: '',
    startDate: '',
    endDate: '',
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    projectList: [],
    allProjects: [], // 存储所有项目，用于搜索
    showProjectDetail: false,
    selectedProject: null,

    // 时间查询相关
    selectedTimeRange: '',
    customStartDate: '',
    customEndDate: '',
    timeRangeOptions: [
      { label: '最近一周', value: 'week' },
      { label: '最近一月', value: 'month' },
      { label: '最近三月', value: 'quarter' },
      { label: '最近半年', value: 'halfYear' },
      { label: '最近一年', value: 'year' }
    ],

    // 进度记录相关
    progressList: [],
    showNoProgress: false,
    progressLoading: false
  },

  onLoad: function() {
    console.log('十五项项目查询页面加载');
    this.loadProjectList();
  },

  onShow: function() {
    console.log('十五项项目查询页面显示');

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

      // 清除全局数据
      app.globalData.newProject = null;
    }
  },

  // 开始时间选择
  onStartDateChange: function(e) {
    this.setData({
      startDate: e.detail.value
    });
    this.filterProjects();
  },

  // 结束时间选择
  onEndDateChange: function(e) {
    this.setData({
      endDate: e.detail.value
    });
    this.filterProjects();
  },

  // 加载项目列表
  loadProjectList: function(isRefresh) {
    console.log('开始加载项目列表', isRefresh);
    if (typeof isRefresh === 'undefined') isRefresh = false;
    if (this.data.loading) return;

    this.setData({
      loading: true
    });

    // TODO: 替换为真实的后端API调用
    // 接口：GET /api/fifteen-projects/list
    /*
    wx.request({
      url: 'http://127.0.0.1:5000/api/fifteen-projects/list',
      method: 'GET',
      data: {
        page: this.data.page,
        pageSize: this.data.pageSize,
        keyword: this.data.searchKeyword,
        startDate: this.data.startDate,
        endDate: this.data.endDate
      },
      header: {
        // 注释掉token验证
        // 'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        this.setData({
          loading: false
        });
        if (res.data.success) {
          const projects = res.data.projects || [];
          if (isRefresh) {
            this.setData({
              projectList: projects,
              page: 1,
              hasMore: projects.length === this.data.pageSize
            });
          } else {
            this.setData({
              projectList: [...this.data.projectList, ...projects],
              page: this.data.page + 1,
              hasMore: projects.length === this.data.pageSize
            });
          }
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
    */

    // 临时使用模拟数据，实际部署时删除以下代码
    try {
      const allProjects = this.getDefaultProjects();
      console.log('获取到项目数据:', allProjects);

      this.setData({
        allProjects: allProjects || [],
        projectList: allProjects || [],
        loading: false,
        hasMore: false
      });
      console.log('项目列表设置完成，当前列表长度:', this.data.projectList.length);
    } catch (error) {
      console.error('加载项目数据失败:', error);
      this.setData({
        projectList: [],
        loading: false
      });
    }
  },

  // 获取默认项目数据
  getDefaultProjects: function() {
    console.log('开始获取默认项目数据');
    var projects = [
      {
        id: 1,
        serialNumber: '001',
        cityLevel: '杭州市',
        pairedCounty: '临安区',
        pairedInstitution: '浙江大学、杭州电子科技大学',
        projectName: '智慧城市基础设施建设项目',
        implementationUnit: '浙江大学计算机学院',
        isKeyProject: '是',
        involvedAreas: '临安区青山湖街道、锦城街道',
        projectType: '基础设施建设',
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        background: '随着城市化进程加快，传统城市管理模式已无法满足现代化需求，急需通过智慧化手段提升城市治理水平。',
        content: '建设覆盖全市的智慧城市基础设施网络，包括物联网传感器部署、数据中心建设、智能交通系统等，分三个阶段实施。',
        objectives: '建设覆盖全市的智慧城市基础设施网络，包括物联网传感器部署、数据中心建设、智能交通系统等，提升城市管理效率和市民生活质量。预计完成后将服务人口500万，实现城市管理数字化转型。项目总投资15亿元，分三个阶段实施，将打造全国领先的智慧城市示范区。',
        contacts: [
          { name: '张三', phone: '13800138001' },
          { name: '李四', phone: '13800138002' }
        ],
        remarks: '项目需要与市政府各部门密切配合，确保数据互联互通。',
        progress: 68,
        status: '进行中',
        createDate: '2024-01-15'
      },
      {
        id: 2,
        serialNumber: '002',
        cityLevel: '宁波市',
        pairedCounty: '慈溪市',
        pairedInstitution: '宁波大学、中科院宁波材料所',
        projectName: '绿色能源产业园区建设',
        implementationUnit: '中科院宁波材料所',
        isKeyProject: '是',
        involvedAreas: '慈溪市观海卫镇、龙山镇',
        projectType: '产业发展',
        startDate: '2024-02-01',
        endDate: '2025-01-31',
        background: '为响应国家碳达峰碳中和目标，推动区域绿色低碳发展，建设清洁能源产业集群。',
        content: '建设集太阳能、风能、储能技术于一体的绿色能源产业园区，包括50MW太阳能发电站、20MW风力发电站和大型储能设施建设。',
        objectives: '建设集太阳能、风能、储能技术于一体的绿色能源产业园区，打造清洁能源产业集群。园区规划面积1000亩，预计引入企业50家，年产值达到100亿元，成为区域绿色发展示范基地。项目将建设50MW太阳能发电站、20MW风力发电站和大型储能设施。',
        contacts: [
          { name: '王五', phone: '13800138003' },
          { name: '赵六', phone: '13800138004' }
        ],
        remarks: '项目建设需要考虑环保要求，确保与当地生态环境协调发展。',
        progress: 52,
        status: '进行中',
        createDate: '2024-02-01'
      },
      {
        id: 3,
        serialNumber: '003',
        cityLevel: '温州市',
        pairedCounty: '瑞安市',
        pairedInstitution: '温州大学、温州医科大学',
        projectName: '数字化教育改革试点',
        implementationUnit: '温州大学教育学院',
        isKeyProject: '否',
        involvedAreas: '瑞安市安阳街道、玉海街道',
        projectType: '民生改善',
        startDate: '2024-03-01',
        endDate: '2024-11-30',
        background: '为推进教育现代化，缩小城乡教育差距，提升教育质量，实施数字化教育改革试点。',
        content: '在全市200所学校实施数字化教育改革，建设智慧教室、在线学习平台、教师培训体系等，包括建设1000间智慧教室、培训5000名教师、开发100门在线课程。',
        objectives: '在全市200所学校实施数字化教育改革，建设智慧教室、在线学习平台、教师培训体系等。通过技术手段实现个性化教学，提升教育质量，缩小城乡教育差距，惠及师生15万人。项目包括建设1000间智慧教室、培训5000名教师、开发100门在线课程。',
        contacts: [
          { name: '孙七', phone: '13800138005' }
        ],
        remarks: '项目实施过程中需要加强教师培训，确保技术应用效果。',
        progress: 82,
        status: '即将完成',
        createDate: '2024-03-01'
      },
      {
        id: 4,
        projectName: '城市轨道交通建设工程',
        projectType: '交通建设',
        startDate: '2024-01-01',
        endDate: '2026-12-31',
        objectives: '建设全长120公里的城市轨道交通网络，包括地铁1号线、2号线和轻轨3号线，缓解城市交通压力，提升公共交通服务水平。项目总投资800亿元，预计日客流量达到200万人次，将极大改善市民出行条件。',
        progress: 35,
        status: '建设中',
        createDate: '2024-01-01'
      },
      {
        id: 5,
        projectName: '现代农业科技示范园',
        projectType: '农业发展',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
        objectives: '建设占地5000亩的现代农业科技示范园，推广智慧农业技术，发展高效生态农业。园区将建设智能温室、无土栽培基地、农产品加工中心等，年产值预计达到10亿元，带动周边农民增收致富。',
        progress: 28,
        status: '建设中',
        createDate: '2024-04-01'
      },
      {
        id: 6,
        serialNumber: '006',
        cityLevel: '嘉兴市',
        pairedCounty: '桐乡市',
        pairedInstitution: '浙江理工大学',
        projectName: '智能制造产业升级项目',
        implementationUnit: '浙江理工大学机械学院',
        isKeyProject: '是',
        involvedAreas: '桐乡市梧桐街道、凤鸣街道',
        projectType: '产业发展',
        startDate: '2025-08-01',
        endDate: '2026-07-31',
        background: '推动传统制造业向智能制造转型升级，提升产业竞争力。',
        content: '建设智能制造示范基地，引入工业4.0技术，改造提升传统制造企业。',
        objectives: '通过智能制造技术改造传统制造业，建设10个智能工厂示范点，培训技术人员1000名，提升制造业整体水平和竞争力。',
        contacts: [
          { name: '陈八', phone: '13800138006' }
        ],
        remarks: '项目需要与当地制造企业深度合作。',
        progress: 0,
        status: '准备启动',
        createDate: '2024-12-01'
      },
      {
        id: 7,
        serialNumber: '007',
        cityLevel: '湖州市',
        pairedCounty: '安吉县',
        pairedInstitution: '浙江农林大学',
        projectName: '生态旅游开发项目',
        implementationUnit: '浙江农林大学旅游学院',
        isKeyProject: '否',
        involvedAreas: '安吉县天荒坪镇、梅溪镇',
        projectType: '旅游发展',
        startDate: '2025-08-05',
        endDate: '2026-08-04',
        background: '依托安吉优美的自然环境，发展高品质生态旅游。',
        content: '开发生态旅游线路，建设民宿集群，打造特色旅游产品。',
        objectives: '开发5条精品生态旅游线路，建设50家精品民宿，年接待游客100万人次，带动当地农民就业创业。',
        contacts: [
          { name: '刘九', phone: '13800138007' }
        ],
        remarks: '注重生态保护与旅游开发的平衡。',
        progress: 0,
        status: '准备启动',
        createDate: '2024-12-15'
      }
    ];
    console.log('返回项目数据，共', projects.length, '个项目');
    return projects;
  },

  // 搜索输入
  onSearchInput: function(e) {
    console.log('搜索输入:', e.detail.value);
    this.setData({
      searchKeyword: e.detail.value
    });
    // 实时搜索
    this.filterProjects();
  },

  // 搜索
  onSearch: function() {
    console.log('执行搜索，关键词:', this.data.searchKeyword);
    this.filterProjects();
  },

  // 筛选项目
  filterProjects: function() {
    console.log('开始筛选项目，总数:', this.data.allProjects.length);
    console.log('搜索关键词:', this.data.searchKeyword);
    console.log('开始时间:', this.data.startDate);
    console.log('结束时间:', this.data.endDate);

    let filtered = this.data.allProjects;

    // 关键词搜索 - 只搜索项目名称
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(project => {
        const projectName = (project.projectName || '').toLowerCase();
        return projectName.includes(keyword);
      });
      console.log('关键词筛选后数量:', filtered.length);
    }

    // 按项目开始时间筛选
    if (this.data.startDate || this.data.endDate) {
      filtered = filtered.filter(project => {
        if (!project.startDate) {
          return false; // 没有开始时间的项目不显示
        }

        const projectStartDate = new Date(project.startDate);
        let matchStart = true;
        let matchEnd = true;

        if (this.data.startDate) {
          const filterStartDate = new Date(this.data.startDate);
          matchStart = projectStartDate >= filterStartDate;
        }

        if (this.data.endDate) {
          const filterEndDate = new Date(this.data.endDate);
          matchEnd = projectStartDate <= filterEndDate;
        }

        return matchStart && matchEnd;
      });
      console.log('按项目开始时间筛选后数量:', filtered.length);
    }

    console.log('最终筛选结果数量:', filtered.length);
    this.setData({
      projectList: filtered
    });
  },

  // 刷新数据
  refreshData: function() {
    this.setData({
      page: 1,
      hasMore: true
    });
    this.loadProjectList(true);
  },

  // 项目点击事件
  onProjectTap: function(e) {
    const index = e.currentTarget.dataset.index;
    const project = this.data.projectList[index];

    // 显示项目详情弹窗
    this.setData({
      showProjectDetail: true,
      selectedProject: project
    });
  },

  // 关闭项目详情弹窗
  closeProjectDetail: function() {
    this.setData({
      showProjectDetail: false,
      selectedProject: null,
      selectedTimeRange: '',
      customStartDate: '',
      customEndDate: '',
      progressList: [],
      showNoProgress: false
    });
  },

  // 时间范围选择
  onTimeRangeSelect: function(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      selectedTimeRange: value,
      customStartDate: '',
      customEndDate: ''
    });
    this.queryProgressByTimeRange(value);
  },

  // 自定义开始时间选择
  onCustomStartDateChange: function(e) {
    this.setData({
      customStartDate: e.detail.value,
      selectedTimeRange: ''
    });
  },

  // 自定义结束时间选择
  onCustomEndDateChange: function(e) {
    this.setData({
      customEndDate: e.detail.value,
      selectedTimeRange: ''
    });
  },

  // 自定义时间查询
  onCustomTimeQuery: function() {
    if (!this.data.customStartDate || !this.data.customEndDate) {
      wx.showToast({
        title: '请选择完整的时间范围',
        icon: 'none'
      });
      return;
    }

    if (this.data.customStartDate > this.data.customEndDate) {
      wx.showToast({
        title: '开始时间不能晚于结束时间',
        icon: 'none'
      });
      return;
    }

    this.queryProgressByCustomTime(this.data.customStartDate, this.data.customEndDate);
  },

  // 根据时间范围查询进度
  queryProgressByTimeRange: function(timeRange) {
    if (!this.data.selectedProject) return;

    this.setData({
      progressLoading: true,
      showNoProgress: false
    });

    // 计算时间范围
    const endDate = new Date();
    const startDate = new Date();

    switch(timeRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'halfYear':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const startDateStr = this.formatDate(startDate);
    const endDateStr = this.formatDate(endDate);

    this.queryProgressByCustomTime(startDateStr, endDateStr);
  },

  // 根据自定义时间查询进度
  queryProgressByCustomTime: function(startDate, endDate) {
    if (!this.data.selectedProject) return;

    this.setData({
      progressLoading: true,
      showNoProgress: false
    });

    // TODO: 替换为真实的后端API调用
    // 这里使用模拟数据
    setTimeout(() => {
      const mockProgressData = this.generateMockProgressData(startDate, endDate);

      this.setData({
        progressList: mockProgressData,
        showNoProgress: mockProgressData.length === 0,
        progressLoading: false
      });
    }, 1000);
  },

  // 生成模拟进度数据
  generateMockProgressData: function(startDate, endDate) {
    const progressData = [
      {
        id: 1,
        person: '张三（项目经理）',
        time: '09:30',
        location: '智慧城市建设现场A区',
        content: '组织召开项目启动会议，确定了各部门分工和时间节点，完成了基础设施建设的前期准备工作，包括场地清理、设备调试和人员安排',
        date: '2024-01-15'
      },
      {
        id: 2,
        person: '李四（技术负责人）',
        time: '14:20',
        location: '市政府会议室B',
        content: '与规划局、建设局等相关部门协调项目推进事宜，汇报了当前进展情况，确定了下一阶段的工作计划和资源配置方案',
        date: '2024-01-16'
      },
      {
        id: 3,
        person: '王五（质量监督员）',
        time: '16:45',
        location: '项目技术中心',
        content: '完成智慧城市管理平台技术方案的专家评审工作，通过了关键技术节点的验收，确认了系统架构和数据接口标准',
        date: '2024-01-17'
      },
      {
        id: 4,
        person: '赵六（安全员）',
        time: '11:10',
        location: '建设现场C区域',
        content: '进行了全面的安全检查和质量监督工作，发现并及时解决了3个潜在安全隐患，确保了施工现场的安全规范',
        date: '2024-01-18'
      },
      {
        id: 5,
        person: '钱七（文档管理员）',
        time: '08:00',
        location: '项目办公楼D座',
        content: '整理完善项目相关文档资料，更新了最新的进度报告和财务报表，准备向市领导汇报项目整体推进情况',
        date: '2024-01-19'
      },
      {
        id: 6,
        person: '孙八（设备工程师）',
        time: '13:15',
        location: '设备安装现场',
        content: '完成了智能监控设备的安装调试工作，测试了数据传输功能，确保设备正常运行并与中央控制系统连接',
        date: '2024-01-20'
      },
      {
        id: 7,
        person: '周九（协调专员）',
        time: '10:30',
        location: '社区服务中心',
        content: '深入社区开展项目宣传工作，收集居民意见和建议，协调解决了施工过程中影响居民生活的相关问题',
        date: '2024-01-21'
      }
    ];

    // 根据时间范围过滤数据
    return progressData.filter(item => {
      return item.date >= startDate && item.date <= endDate;
    });
  },

  // 格式化日期
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },





  // 添加新项目到列表
  addProjectToList: function(newProject) {
    const allProjects = [newProject, ...this.data.allProjects];
    const projectList = [newProject, ...this.data.projectList];
    this.setData({
      allProjects: allProjects,
      projectList: projectList
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.refreshData();
    wx.stopPullDownRefresh();
  },

  // 上拉加载
  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadProjectList();
    }
  }
});
