Page({
  data: {
    projectInfo: {},
    selectedTimeType: 'week', // week, month, quarter, custom
    queryStartDate: '',
    queryEndDate: '',
    showProgressDetail: false,
    progressTimeRange: '',
    progressRecords: []
  },

  onLoad(options) {
    console.log('项目详情页面加载', options);
    
    // 获取项目ID
    const projectId = options.id;
    if (projectId) {
      this.loadProjectDetail(projectId);
    }
  },

  // 加载项目详情
  loadProjectDetail(projectId) {
    // 模拟数据，实际应该从后端获取
    const mockProjectData = {
      id: projectId,
      projectName: '智慧城市建设项目',
      projectType: '基础设施建设',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      progress: 75,
      objectives: '通过建设智慧城市管理平台，整合城市各类数据资源，提升城市治理效率和市民生活质量。具体目标包括：1. 建设统一的城市数据中心，整合人口、交通、环境等数据；2. 开发智慧交通管理系统，减少交通拥堵30%；3. 建设智慧环保监测网络，实现环境数据实时监控；4. 构建市民服务平台，提供一站式政务服务。',
      content: '项目分为四个阶段实施：第一阶段进行基础设施建设和数据中心搭建；第二阶段开发核心应用系统；第三阶段进行系统集成和测试；第四阶段全面上线运行。采用云计算、大数据、物联网等先进技术，确保系统的先进性和可扩展性。',
      contactName: '张三',
      contactPosition: '项目经理',
      contactPhone: '13800138000'
    };

    this.setData({
      projectInfo: mockProjectData
    });
  },

  // 选择时间类型
  selectTimeType(e) {
    const timeType = e.currentTarget.dataset.type;
    this.setData({
      selectedTimeType: timeType,
      showProgressDetail: false
    });

    // 如果不是自定义时间，自动设置时间范围
    if (timeType !== 'custom') {
      this.setTimeRange(timeType);
    }
  },

  // 设置时间范围
  setTimeRange(timeType) {
    const now = new Date();
    let startDate, endDate;

    switch (timeType) {
      case 'week':
        // 本周
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        startDate = this.formatDate(weekStart);
        endDate = this.formatDate(weekEnd);
        break;
      
      case 'month':
        // 本月
        startDate = this.formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
        endDate = this.formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        break;
      
      case 'quarter':
        // 本季度
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = this.formatDate(new Date(now.getFullYear(), quarter * 3, 1));
        endDate = this.formatDate(new Date(now.getFullYear(), quarter * 3 + 3, 0));
        break;
    }

    this.setData({
      queryStartDate: startDate,
      queryEndDate: endDate
    });
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 自定义开始时间选择
  onQueryStartDateChange(e) {
    this.setData({
      queryStartDate: e.detail.value,
      showProgressDetail: false
    });
  },

  // 自定义结束时间选择
  onQueryEndDateChange(e) {
    this.setData({
      queryEndDate: e.detail.value,
      showProgressDetail: false
    });
  },

  // 查询进度详情
  queryProgress() {
    const { selectedTimeType, queryStartDate, queryEndDate } = this.data;
    
    // 验证时间选择
    if (!queryStartDate || !queryEndDate) {
      wx.showToast({
        title: '请选择查询时间范围',
        icon: 'none'
      });
      return;
    }

    // 设置时间范围显示文本
    let timeRangeText = '';
    switch (selectedTimeType) {
      case 'week':
        timeRangeText = '本周进度';
        break;
      case 'month':
        timeRangeText = '本月进度';
        break;
      case 'quarter':
        timeRangeText = '本季度进度';
        break;
      case 'custom':
        timeRangeText = `${queryStartDate} 至 ${queryEndDate}`;
        break;
    }

    // 模拟进度数据
    const mockProgressData = [
      {
        id: 1,
        date: '2024-01-15',
        time: '09:00',
        person: '张三',
        location: '市政府会议室',
        description: '召开项目启动会议，确定项目实施方案和时间节点',
        result: '会议顺利召开，各部门达成一致意见'
      },
      {
        id: 2,
        date: '2024-01-18',
        time: '14:30',
        person: '李四',
        location: '数据中心机房',
        description: '进行服务器设备安装和网络配置',
        result: '完成50%的设备安装工作'
      },
      {
        id: 3,
        date: '2024-01-22',
        time: '10:15',
        person: '王五',
        location: '软件开发中心',
        description: '开展系统需求分析和架构设计工作',
        result: '完成核心模块需求分析文档'
      },
      {
        id: 4,
        date: '2024-01-25',
        time: '16:00',
        person: '赵六',
        location: '测试实验室',
        description: '进行系统功能测试和性能优化',
        result: '发现并修复3个关键问题'
      }
    ];

    this.setData({
      showProgressDetail: true,
      progressTimeRange: timeRangeText,
      progressRecords: mockProgressData
    });

    // 滚动到进度详情区域
    wx.pageScrollTo({
      selector: '.progress-detail-section',
      duration: 500
    });
  }
});
