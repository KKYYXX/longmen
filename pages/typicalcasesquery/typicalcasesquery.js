Page({
  data: {
    searchKeyword: '',
    startDate: '',
    endDate: '',
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    caseList: [
      {
        id: 1,
        title: '智慧城市建设典型案例',
        category: '基础设施建设',
        createDate: '2024-01-15',
        updateDate: '2024-07-20',
        summary: '通过物联网、大数据、人工智能等技术，构建智慧城市管理平台，实现城市治理现代化，提升市民生活质量。',
        content: '该项目是我市智慧城市建设的重要组成部分，通过整合各类城市数据资源，建立统一的城市管理平台。项目涵盖智慧交通、智慧环保、智慧安防、智慧民生等多个领域，实现了城市运行状态的实时监控、预警和智能决策。\n\n项目实施过程中，我们采用了先进的物联网技术，在全市部署了超过10000个传感器节点，实时采集交通流量、空气质量、噪音水平等数据。通过大数据分析平台，我们能够及时发现城市运行中的问题，并提供智能化的解决方案。',
        achievements: '项目实施以来，城市治理效率提升了35%，市民满意度提高了28%，城市运行成本降低了20%。获得了国家智慧城市建设优秀案例奖。',
        experience: '1. 统筹规划，分步实施；2. 注重数据安全和隐私保护；3. 加强部门协调，打破信息孤岛；4. 重视市民参与和反馈。',
        images: [
          { name: '智慧城市管理中心.jpg', url: '/images/cases/smart_city_center.jpg' },
          { name: '数据大屏展示.png', url: '/images/cases/data_dashboard.png' },
          { name: '移动端应用界面.jpg', url: '/images/cases/mobile_app.jpg' }
        ],
        videos: [
          { name: '智慧城市建设宣传片.mp4', url: '/videos/cases/smart_city_intro.mp4' },
          { name: '系统操作演示.mp4', url: '/videos/cases/system_demo.mp4' }
        ],
        links: [
          { name: '智慧城市官方网站', url: 'https://smartcity.example.com' },
          { name: '项目技术文档', url: 'https://docs.smartcity.example.com' }
        ],
        reports: [
          { name: '智慧城市建设总结报告.pdf', url: '/reports/cases/smart_city_summary.pdf' },
          { name: '技术实施方案.docx', url: '/reports/cases/technical_plan.docx' },
          { name: '效果评估报告.pdf', url: '/reports/cases/evaluation_report.pdf' }
        ],
        tags: ['智慧城市', '物联网', '大数据', '人工智能'],
        author: '市信息化办公室',
        contact: '张主任 - 13800138000'
      },
      {
        id: 2,
        title: '绿色能源示范园区建设案例',
        category: '环保治理',
        createDate: '2024-02-10',
        updateDate: '2024-07-18',
        summary: '建设集太阳能、风能、储能于一体的绿色能源示范园区，实现清洁能源的高效利用和智能管理。',
        content: '绿色能源示范园区占地500亩，是我市推进碳中和目标的重要举措。园区采用"光伏+风电+储能"的综合能源解决方案，年发电量达到5000万千瓦时，可满足周边2万户居民的用电需求。\n\n园区建设了智能能源管理系统，实现了发电、储能、用电的智能调度和优化配置。通过AI算法预测天气变化和用电需求，自动调节发电和储能策略，最大化提升能源利用效率。',
        achievements: '园区年减少碳排放3万吨，节约标准煤1.2万吨，获得国家绿色能源示范项目称号，成为全省清洁能源发展的标杆。',
        experience: '1. 因地制宜选择能源类型；2. 重视储能技术应用；3. 建立智能管理系统；4. 加强与电网的协调配合。',
        images: [
          { name: '太阳能发电区.jpg', url: '/images/cases/solar_area.jpg' },
          { name: '风力发电机组.jpg', url: '/images/cases/wind_turbines.jpg' },
          { name: '储能设备.png', url: '/images/cases/energy_storage.png' }
        ],
        videos: [
          { name: '园区建设纪录片.mp4', url: '/videos/cases/park_construction.mp4' }
        ],
        links: [
          { name: '绿色能源园区官网', url: 'https://greenpark.example.com' }
        ],
        reports: [
          { name: '园区建设可行性报告.pdf', url: '/reports/cases/feasibility_study.pdf' },
          { name: '环境影响评估.pdf', url: '/reports/cases/environmental_impact.pdf' }
        ],
        tags: ['绿色能源', '太阳能', '风能', '储能', '碳中和'],
        author: '市发改委',
        contact: '李处长 - 13900139000'
      },
      {
        id: 3,
        title: '数字化教育改革实践案例',
        category: '民生改善',
        createDate: '2024-03-05',
        updateDate: '2024-07-15',
        summary: '运用数字技术改革传统教育模式，建设智慧校园，推进教育公平和质量提升。',
        content: '数字化教育改革项目覆盖全市200所中小学，建设了统一的教育云平台，开发了丰富的数字化教学资源。项目实现了"三个一"目标：一个平台（统一教育云平台）、一套资源（优质数字教学资源）、一种模式（线上线下融合教学）。\n\n通过建设智慧课堂，配备交互式电子白板、平板电脑等设备，实现了师生互动、生生互动的新型教学模式。同时建立了学习分析系统，通过数据挖掘技术分析学生学习行为，为个性化教学提供支撑。',
        achievements: '学生学习兴趣提升40%，教学效果提高25%，城乡教育差距明显缩小，获得教育部数字化教育示范区称号。',
        experience: '1. 加强教师培训，提升数字化教学能力；2. 注重教学内容与技术的深度融合；3. 建立可持续的运维保障机制；4. 重视数据安全和学生隐私保护。',
        images: [
          { name: '智慧课堂.jpg', url: '/images/cases/smart_classroom.jpg' },
          { name: '教育云平台.png', url: '/images/cases/education_platform.png' }
        ],
        videos: [
          { name: '数字化教学演示.mp4', url: '/videos/cases/digital_teaching.mp4' }
        ],
        links: [
          { name: '教育云平台', url: 'https://educloud.example.com' }
        ],
        reports: [
          { name: '数字化教育实施报告.pdf', url: '/reports/cases/digital_education.pdf' }
        ],
        tags: ['数字化教育', '智慧校园', '在线教学', '教育公平'],
        author: '市教育局',
        contact: '王局长 - 13700137000'
      }
    ]
  },

  onLoad() {
    console.log('典型案例查询页面加载');
    this.loadCaseList();
  },

  onShow() {
    // 检查是否需要刷新数据
    const needRefresh = wx.getStorageSync('caseListNeedRefresh');
    if (needRefresh) {
      wx.removeStorageSync('caseListNeedRefresh');
      this.refreshData();
    } else {
      // 页面显示时刷新数据
      this.refreshData();
    }
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

  // 加载案例列表
  loadCaseList(isRefresh = false) {
    if (this.data.loading) return;

    this.setData({
      loading: true
    });

    const page = isRefresh ? 1 : this.data.page;

    // TODO: 调用后端API获取典型案例数据
    // wx.request({
    //   url: 'your-api-endpoint/typical-cases',
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
    //         caseList: data,
    //         page: 1,
    //         hasMore: data.length === this.data.pageSize
    //       });
    //     } else {
    //       this.setData({
    //         caseList: [...this.data.caseList, ...data],
    //         page: page + 1,
    //         hasMore: data.length === this.data.pageSize
    //       });
    //     }
    //   },
    //   fail: (err) => {
    //     console.error('获取典型案例数据失败:', err);
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

    try {
      // 从本地存储获取用户添加的案例
      const storedCases = wx.getStorageSync('typicalCases') || [];

      // 合并默认示例数据和用户添加的数据
      const defaultCases = [
        {
          id: 1001,
          title: '智慧城市建设典型案例',
          category: '基础设施建设',
          createDate: '2024-01-15',
          updateDate: '2024-07-20',
          summary: '通过物联网、大数据、人工智能等技术，构建智慧城市管理平台，实现城市治理现代化，提升市民生活质量。',
          content: '该项目采用先进的物联网技术，建设了覆盖全市的智能感知网络，实现了对城市基础设施的实时监控和智能管理。',
          achievements: '提升城市管理效率30%，市民满意度达到95%以上。',
          experience: '技术创新与管理创新相结合，注重市民参与和反馈。',
          author: '市信息化办公室',
          contact: '张主任 - 13800138000',
          tags: ['智慧城市', '物联网', '大数据'],
          status: '已发布'
        },
        {
          id: 1002,
          title: '绿色能源示范园区建设案例',
          category: '环保治理',
          createDate: '2024-02-10',
          updateDate: '2024-07-18',
          summary: '建设集太阳能、风能、储能于一体的绿色能源示范园区，实现清洁能源的高效利用和智能管理。',
          content: '园区采用分布式能源系统，集成太阳能光伏、风力发电和储能技术，建立智能能源管理平台。',
          achievements: '年发电量达到500万千瓦时，减少碳排放3000吨。',
          experience: '多能互补、智能调度是关键，政策支持不可缺少。',
          author: '市发改委',
          contact: '李处长 - 13900139000',
          tags: ['绿色能源', '环保', '可持续发展'],
          status: '已发布'
        },
        {
          id: 1003,
          title: '数字化教育改革实践案例',
          category: '民生改善',
          createDate: '2024-03-05',
          updateDate: '2024-07-15',
          summary: '运用数字技术改革传统教育模式，建设智慧校园，推进教育公平和质量提升。',
          content: '通过建设数字化教学平台，实现优质教育资源共享，推动教育教学方式变革。',
          achievements: '覆盖学校200所，受益学生10万人，教学质量显著提升。',
          experience: '师资培训是基础，技术应用要与教学深度融合。',
          author: '市教育局',
          contact: '王局长 - 13700137000',
          tags: ['数字化教育', '智慧校园', '教育公平'],
          status: '已发布'
        }
      ];

      // 合并数据：用户添加的案例在前，默认案例在后
      const allCases = [...storedCases, ...defaultCases];

      // 应用搜索和分类过滤
      let filteredCases = allCases;

      if (this.data.searchKeyword) {
        const keyword = this.data.searchKeyword.toLowerCase();
        filteredCases = filteredCases.filter(item =>
          item.title.toLowerCase().includes(keyword) ||
          item.summary.toLowerCase().includes(keyword) ||
          (item.content && item.content.toLowerCase().includes(keyword))
        );
      }

      if (this.data.selectedCategory && this.data.selectedCategory !== '全部') {
        filteredCases = filteredCases.filter(item =>
          item.category === this.data.selectedCategory
        );
      }

      this.setData({
        caseList: filteredCases,
        loading: false,
        hasMore: false
      });

      console.log('案例列表加载完成，总数量：', allCases.length, '过滤后数量：', filteredCases.length);
      console.log('用户添加的案例数量：', storedCases.length);

    } catch (error) {
      console.error('加载案例列表失败:', error);
      this.setData({
        loading: false,
        hasMore: false
      });
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    }
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
    this.loadCaseList(true);
  },

  // 案例项点击
  onCaseTap(e) {
    const index = e.currentTarget.dataset.index;
    const caseList = this.data.caseList;
    caseList[index].expanded = !caseList[index].expanded;
    
    this.setData({
      caseList: caseList
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
    this.loadCaseList();
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
  },

  // 预览图片
  previewImage(e) {
    const src = e.currentTarget.dataset.src;
    const urls = e.currentTarget.dataset.urls;

    // 提取图片URL数组
    const imageUrls = urls.map(img => img.url);

    wx.previewImage({
      current: src,
      urls: imageUrls
    });
  },

  // 打开链接
  openLink(e) {
    const url = e.currentTarget.dataset.url;

    wx.showModal({
      title: '打开链接',
      content: `是否要打开链接：${url}`,
      success: (res) => {
        if (res.confirm) {
          // 在小程序中，通常复制链接到剪贴板
          wx.setClipboardData({
            data: url,
            success: () => {
              wx.showToast({
                title: '链接已复制到剪贴板',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  // 下载报告
  downloadReport(e) {
    const url = e.currentTarget.dataset.url;
    const name = e.currentTarget.dataset.name;

    wx.showLoading({
      title: '准备下载...'
    });

    // 模拟下载过程
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: '下载提示',
        content: `报告"${name}"下载功能需要在实际环境中配置文件服务器。当前为演示模式。`,
        showCancel: false
      });
    }, 1000);
  }
});
