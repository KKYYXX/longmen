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
    
    // 测试接口连接
    this.testInterfaces();
  },

  // 测试接口连接
  testInterfaces() {
    console.log('开始测试接口连接...');
    
    // 测试搜索接口
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/15projects/search',
      method: 'GET',
      data: {
        project_name: '测试项目'
      },
      success: (res) => {
        console.log('搜索接口测试结果:', res);
      },
      fail: (err) => {
        console.error('搜索接口测试失败:', err);
      }
    });
    
    // 测试详情接口
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/15projects/detail',
      method: 'GET',
      data: {
        project_id: 1
      },
      success: (res) => {
        console.log('详情接口测试结果:', res);
      },
      fail: (err) => {
        console.error('详情接口测试失败:', err);
      }
    });
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

    // 每次显示页面时刷新项目列表，确保数据最新
    this.loadProjectList();
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

  // 清除时间筛选
  clearTimeFilter: function() {
    this.setData({
      startDate: '',
      endDate: ''
    });
    this.filterProjects();
    wx.showToast({
      title: '已清除时间筛选',
      icon: 'success'
    });
  },

  // 清除搜索关键词
  clearSearch: function() {
    this.setData({
      searchKeyword: ''
    });
    this.filterProjects();
    wx.showToast({
      title: '已清除搜索',
      icon: 'success'
    });
  },



  // 加载项目列表
  loadProjectList: function(isRefresh) {
    console.log('开始加载项目列表', isRefresh);
    if (typeof isRefresh === 'undefined') isRefresh = false;
    if (this.data.loading) return;

    this.setData({
      loading: true
    });

    // 调用后端接口获取项目列表
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/15projects/names',
      method: 'GET',
      success: (res) => {
        this.setData({
          loading: false
        });
        
        if (res.statusCode === 200 && res.data && res.data.success && Array.isArray(res.data.data)) {
          const projectNames = res.data.data;
          console.log('从数据库获取到项目名称:', projectNames);
          
          // 先创建基础项目结构，然后逐个获取详细信息
          const mappedProjects = projectNames.map((projectName, index) => ({
            id: index + 1, // 临时ID，用于前端显示
            serialNumber: String(index + 1).padStart(3, '0'),
            cityLevel: '待设置',
            pairedCounty: '待设置',
            pairedInstitution: '待设置',
            projectName: projectName,
            implementationUnit: '待设置',
            isKeyProject: '待设置',
            involvedAreas: '待设置',
            projectType: '待分类',
            startDate: '待设置',
            endDate: '待设置',
            background: '待补充',
            content: '待补充',
            objectives: '待补充',
            contacts: [
              { name: '张三', phone: '13800138001' },
              { name: '李四', phone: '13800138002' }
            ],
            remarks: '待补充',
            progress: 0,
            status: '进行中',
            createDate: ''
          }));

          // 先显示基础信息
          this.setData({
            allProjects: mappedProjects,
            projectList: mappedProjects,
            page: 1,
            hasMore: false
          });
          
          console.log('从数据库加载项目列表完成，数量：', mappedProjects.length);
          wx.showToast({
            title: `加载成功，共${mappedProjects.length}个项目`,
            icon: 'success'
          });

          // 逐个获取项目详细信息
          this.loadAllProjectDetails(mappedProjects);
        } else {
          console.warn('获取数据库项目列表失败或数据为空：', res);
          wx.showToast({
            title: '获取数据失败',
            icon: 'none'
          });
          // 如果接口失败，使用模拟数据
          this.useMockData();
        }
      },
      fail: (err) => {
        this.setData({
          loading: false
        });
        console.error('请求数据库项目列表失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        // 如果接口失败，使用模拟数据
        this.useMockData();
      }
    });
  },

  // 批量获取所有项目的详细信息
  loadAllProjectDetails(projects) {
    console.log('开始批量获取项目详细信息，项目数量:', projects.length);
    
    let completedCount = 0;
    const totalCount = projects.length;
    
    projects.forEach((project, index) => {
      // 为每个项目获取详细信息
      this.getProjectDetailForList(project, (enhancedProject) => {
        completedCount++;
        console.log(`项目详情获取进度: ${completedCount}/${totalCount}`);
        
        // 更新列表中的项目信息
        this.updateProjectInList(enhancedProject);
        
        // 所有项目都获取完成后，显示完成提示
        if (completedCount === totalCount) {
          console.log('所有项目详细信息获取完成');
          wx.showToast({
            title: '详细信息加载完成',
            icon: 'success',
            duration: 1500
          });
        }
      });
    });
  },

  // 获取单个项目的详细信息（用于列表显示）
  getProjectDetailForList(project, callback) {
    console.log('获取项目详细信息用于列表显示:', project.projectName);
    
    // 先通过项目名称查找项目ID
    this.findProjectIdByName(project.projectName, (projectId) => {
      if (projectId) {
        console.log('找到项目ID:', projectId, '开始获取详细信息');
        // 找到项目ID后，获取详细信息
        this.getProjectDetailData(projectId, project, callback);
      } else {
        console.warn('未找到项目ID，项目名称:', project.projectName);
        // 如果找不到ID，直接返回原项目数据
        callback(project);
      }
    });
  },

  // 获取项目详细数据（不显示弹窗）
  getProjectDetailData(projectId, originalProject, callback) {
    console.log('获取项目详细数据，项目ID:', projectId);
    console.log('原始项目数据:', originalProject);
    
    wx.request({
      url: `http://127.0.0.1:5000/app/api/15projects/detail/${projectId}`,
      method: 'GET',
      data: {
        project_id: projectId
      },
      success: (res) => {
        console.log('详情接口响应:', res);
        
        if (res.statusCode === 200 && res.data && res.data.success && res.data.data) {
          // 获取到详细信息，合并原有数据和详细信息
          const detailData = res.data.data;
          console.log('获取到的详细数据:', detailData);
          console.log('start_date 字段值:', detailData.start_date);
          console.log('end_date 字段值:', detailData.end_date);
          
          // 检查每个字段，如果后端返回空值或undefined，则使用"未设置"
          const enhancedProject = {
            ...originalProject,
            // 确保关键字段存在，优先使用后端返回的数据，空值时显示"未设置"
            projectName: detailData.project_name || originalProject.projectName || '未设置',
            serialNumber: detailData.serial_number || originalProject.serialNumber || '未设置',
            cityLevel: detailData.city || originalProject.cityLevel || '未设置',
            pairedCounty: detailData.county || originalProject.pairedCounty || '未设置',
            pairedInstitution: detailData.universities || originalProject.pairedInstitution || '未设置',
            implementationUnit: detailData.implementing_institutions || originalProject.implementationUnit || '未设置',
            isKeyProject: detailData.is_key_project ? '是' : '否',
            involvedAreas: detailData.involved_areas || originalProject.involvedAreas || '未设置',
            projectType: detailData.project_type || originalProject.projectType || '未设置',
            startDate: detailData.start_date || originalProject.startDate || '未设置',
            endDate: detailData.end_date || originalProject.endDate || '未设置',
            background: detailData.background || originalProject.background || '未设置',
            content: detailData.content_and_measures || originalProject.content || '待补充',
            objectives: detailData.objectives || originalProject.objectives || '待补充',
            contacts: this.processContactsData(detailData.contacts) || originalProject.contacts || [],
            remarks: detailData.remarks || originalProject.remarks || '待补充'
          };

          console.log('增强后的项目数据:', enhancedProject);
          console.log('最终 startDate:', enhancedProject.startDate);
          console.log('最终 endDate:', enhancedProject.endDate);
          callback(enhancedProject);
        } else {
          console.warn('获取项目详情失败，使用原有数据:', res);
          callback(originalProject);
        }
      },
      fail: (err) => {
        console.error('获取项目详情失败:', err);
        callback(originalProject);
      }
    });
  },

  // 使用模拟数据（接口失败时调用）
  useMockData() {
    try {
      const allProjects = this.getDefaultProjects();
      console.log('使用模拟数据加载项目列表');

      this.setData({
        allProjects: allProjects || [],
        projectList: allProjects || [],
        loading: false,
        hasMore: false
      });
      console.log('项目列表设置完成，当前列表长度:', this.data.projectList.length);
      
      // 提示用户当前使用的是模拟数据
      wx.showToast({
        title: '使用模拟数据',
        icon: 'none',
        duration: 2000
      });
    } catch (error) {
      console.error('加载模拟数据失败:', error);
      this.setData({
        allProjects: [],
        projectList: [],
        loading: false
      });
      
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
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
        serialNumber: '004',
        cityLevel: '绍兴市',
        pairedCounty: '诸暨市',
        pairedInstitution: '浙江工业大学',
        projectName: '城市轨道交通建设工程',
        implementationUnit: '浙江工业大学土木学院',
        isKeyProject: '是',
        involvedAreas: '诸暨市暨阳街道、陶朱街道',
        projectType: '交通建设',
        startDate: '2024-01-01',
        endDate: '2026-12-31',
        background: '随着城市发展，交通拥堵问题日益严重，需要建设轨道交通缓解压力。',
        content: '建设全长120公里的城市轨道交通网络，包括地铁1号线、2号线和轻轨3号线。',
        objectives: '建设全长120公里的城市轨道交通网络，包括地铁1号线、2号线和轻轨3号线，缓解城市交通压力，提升公共交通服务水平。项目总投资800亿元，预计日客流量达到200万人次，将极大改善市民出行条件。',
        contacts: [
          { name: '周十', phone: '13800138008' },
          { name: '吴十一', phone: '13800138009' }
        ],
        remarks: '项目建设需要与城市规划紧密结合，确保交通便民。',
        progress: 35,
        status: '建设中',
        createDate: '2024-01-01'
      },
      {
        id: 5,
        serialNumber: '005',
        cityLevel: '台州市',
        pairedCounty: '临海市',
        pairedInstitution: '浙江农林大学',
        projectName: '现代农业科技示范园',
        implementationUnit: '浙江农林大学农学院',
        isKeyProject: '否',
        involvedAreas: '临海市古城街道、大洋街道',
        projectType: '农业发展',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
        background: '推进农业现代化，发展高效生态农业，提升农业科技水平。',
        content: '建设占地5000亩的现代农业科技示范园，推广智慧农业技术，建设智能温室、无土栽培基地、农产品加工中心等。',
        objectives: '建设占地5000亩的现代农业科技示范园，推广智慧农业技术，发展高效生态农业。园区将建设智能温室、无土栽培基地、农产品加工中心等，年产值预计达到10亿元，带动周边农民增收致富。',
        contacts: [
          { name: '郑十二', phone: '13800138010' }
        ],
        remarks: '项目要注重生态环保，实现可持续发展。',
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
        if (!project.startDate || project.startDate === '待设置') {
          console.log('项目没有开始时间:', project.projectName, project.startDate);
          return false; // 没有开始时间的项目不显示
        }

        // 智能解析项目开始时间
        const projectStartDate = this.parseProjectDate(project.startDate);
        if (!projectStartDate) {
          console.log('无法解析项目开始时间:', project.projectName, project.startDate);
          return false; // 无法解析的日期不显示
        }

        let matchStart = true;
        let matchEnd = true;

        if (this.data.startDate) {
          const filterStartDate = new Date(this.data.startDate);
          matchStart = projectStartDate >= filterStartDate;
          console.log(`项目 ${project.projectName} 开始时间比较:`, {
            projectStart: project.startDate,
            parsedProjectStart: projectStartDate,
            filterStart: this.data.startDate,
            parsedFilterStart: filterStartDate,
            matchStart: matchStart
          });
        }

        if (this.data.endDate) {
          const filterEndDate = new Date(this.data.endDate);
          // 如果项目只有年月，则使用月末作为比较基准
          if (this.isYearMonthOnly(project.startDate)) {
            const monthEndDate = this.getMonthEndDate(projectStartDate);
            matchEnd = monthEndDate <= filterEndDate;
            console.log(`项目 ${project.projectName} 结束时间比较(年月格式):`, {
              projectStart: project.startDate,
              monthEnd: monthEndDate,
              filterEnd: this.data.endDate,
              parsedFilterEnd: filterEndDate,
              matchEnd: matchEnd
            });
          } else {
            matchEnd = projectStartDate <= filterEndDate;
            console.log(`项目 ${project.projectName} 结束时间比较(年月日格式):`, {
              projectStart: project.startDate,
              parsedProjectStart: projectStartDate,
              filterEnd: this.data.endDate,
              parsedFilterEnd: filterEndDate,
              matchEnd: matchEnd
            });
          }
        }

        const finalMatch = matchStart && matchEnd;
        console.log(`项目 ${project.projectName} 最终匹配结果:`, {
          startMatch: matchStart,
          endMatch: matchEnd,
          finalMatch: finalMatch
        });

        return finalMatch;
      });
      console.log('按项目开始时间筛选后数量:', filtered.length);
    }

    console.log('最终筛选结果数量:', filtered.length);
    this.setData({
      projectList: filtered
    });
  },

  // 智能解析项目日期
  parseProjectDate: function(dateString) {
    if (!dateString || dateString === '待设置') {
      return null;
    }

    // 处理 "2025.1" 格式（年月）
    if (/^\d{4}\.\d{1,2}$/.test(dateString)) {
      const [year, month] = dateString.split('.');
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }

    // 处理 "2025.1.15" 格式（年月日）
    if (/^\d{4}\.\d{1,2}\.\d{1,2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('.');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    // 处理标准日期格式 "2025-01-15"
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(dateString);
    }

    // 处理其他可能的日期格式
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    console.warn('无法解析的日期格式:', dateString);
    return null;
  },

  // 判断是否为年月格式（不包含日）
  isYearMonthOnly: function(dateString) {
    return /^\d{4}\.\d{1,2}$/.test(dateString);
  },

  // 获取月末日期
  getMonthEndDate: function(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
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
    
    console.log('点击项目:', project.projectName);

    // 检查项目是否已经有详细信息
    if (project.startDate && project.startDate !== '待设置' && 
        project.objectives && project.objectives !== '待补充') {
      console.log('项目已有详细信息，直接显示详情弹窗');
      this.setData({
        showProjectDetail: true,
        selectedProject: project
      });
      return;
    }

    // 如果没有详细信息，才去获取
    console.log('项目缺少详细信息，开始获取详情');
    wx.showLoading({
      title: '加载详情中...'
    });

    // 先通过项目名称查找项目ID
    this.findProjectIdByName(project.projectName, (projectId) => {
      if (projectId) {
        console.log('找到项目ID:', projectId, '开始获取详细信息');
        // 找到项目ID后，获取详细信息
        this.getProjectDetail(projectId, project);
      } else {
        wx.hideLoading();
        wx.showToast({
          title: '未找到项目详情',
          icon: 'none'
        });
        console.error('未找到项目ID，项目名称:', project.projectName);
      }
    });
  },

  // 通过项目名称查找项目ID
  findProjectIdByName(projectName, callback) {
    console.log('开始查找项目ID，项目名称:', projectName);
    
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/15projects/search',
      method: 'GET',
      data: {
        project_name: projectName
      },
      success: (res) => {
        console.log('搜索接口响应:', res);
        console.log('搜索接口状态码:', res.statusCode);
        console.log('搜索接口数据:', res.data);
        
        if (res.statusCode === 200 && res.data && res.data.success && res.data.data) {
          // 找到项目，返回数据库中的真实ID
          const projectId = res.data.data.id;
          console.log('在数据库中找到项目:', projectName, '真实ID:', projectId);
          callback(projectId);
        } else if (res.statusCode === 404) {
          // 数据库中没有找到该项目名称
          console.error('数据库中没有找到项目名称:', projectName);
          console.error('404响应:', res.data);
          callback(null);
        } else {
          // 其他错误
          console.error('查询项目信息失败:', res);
          console.error('错误状态码:', res.statusCode);
          console.error('错误数据:', res.data);
          callback(null);
        }
      },
      fail: (err) => {
        console.error('请求项目信息失败:', err);
        console.error('错误详情:', err);
        callback(null);
      }
    });
  },

  // 获取项目详细信息
  getProjectDetail(projectId, originalProject) {
    console.log('开始获取项目详情，项目ID:', projectId);
    console.log('原始项目数据:', originalProject);
    
    wx.request({
      url: `http://127.0.0.1:5000/app/api/15projects/detail/${projectId}`,
      method: 'GET',
      data: {
        project_id: projectId
      },
      success: (res) => {
        wx.hideLoading();
        console.log('详情接口响应:', res);
        console.log('响应状态码:', res.statusCode);
        console.log('响应数据:', res.data);
        
        if (res.statusCode === 200 && res.data && res.data.success && res.data.data) {
          // 获取到详细信息，合并原有数据和详细信息
          const detailData = res.data.data;
          console.log('获取到的详细数据:', detailData);
          
          // 检查每个字段，如果后端返回空值或undefined，则使用"未设置"
          const enhancedProject = {
            ...originalProject,
            // 确保关键字段存在，优先使用后端返回的数据，空值时显示"未设置"
            projectName: detailData.project_name || originalProject.projectName || '未设置',
            serialNumber: detailData.serial_number || originalProject.serialNumber || '未设置',
            cityLevel: detailData.city || originalProject.cityLevel || '未设置',
            pairedCounty: detailData.county || originalProject.pairedCounty || '未设置',
            pairedInstitution: detailData.universities || originalProject.pairedInstitution || '未设置',
            implementationUnit: detailData.implementing_institutions || originalProject.implementationUnit || '未设置',
            isKeyProject: detailData.is_key_project ? '是' : '否',
            involvedAreas: detailData.involved_areas || originalProject.involvedAreas || '未设置',
            projectType: detailData.project_type || originalProject.projectType || '未设置',
            startDate: detailData.start_date || originalProject.startDate || '未设置',
            endDate: detailData.end_date || originalProject.endDate || '未设置',
            background: detailData.background || originalProject.background || '未设置',
            content: detailData.content_and_measures || originalProject.content || '未设置',
            objectives: detailData.objectives || originalProject.objectives || '未设置',
            contacts: this.processContactsData(detailData.contacts) || originalProject.contacts || [],
            remarks: detailData.remarks || originalProject.remarks || '未设置'
          };

          console.log('增强后的项目数据:', enhancedProject);

          // 显示项目详情弹窗
          this.setData({
            showProjectDetail: true,
            selectedProject: enhancedProject
          });
          
          // 同时更新列表项中的开始时间和主要目标
          this.updateProjectInList(enhancedProject);
          
          console.log('项目详情加载成功，显示详情弹窗');
          wx.showToast({
            title: '详情加载成功',
            icon: 'success'
          });
        } else {
          // 如果获取详情失败，使用原有数据
          console.warn('获取项目详情失败，使用原有数据:', res);
          console.warn('失败原因:', res.data?.message || '未知错误');
          
          wx.showToast({
            title: res.data?.message || '获取详情失败，显示基本信息',
            icon: 'none',
            duration: 3000
          });
          
          this.setData({
            showProjectDetail: true,
            selectedProject: originalProject
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('获取项目详情失败:', err);
        console.error('错误详情:', err);
        
        wx.showToast({
          title: '获取详情失败',
          icon: 'none',
          duration: 3000
        });
        
        // 如果获取详情失败，使用原有数据
        this.setData({
          showProjectDetail: true,
          selectedProject: originalProject
        });
      }
    });
  },

  // 处理联系人数据
  processContactsData(rawContacts) {
    console.log('处理联系人数据，原始数据:', rawContacts);
    console.log('数据类型:', typeof rawContacts);
    
    if (!rawContacts) {
      console.log('联系人数据为空，返回空数组');
      return [];
    }
    
    if (typeof rawContacts === 'string') {
      // 如果是字符串，尝试解析
      console.log('联系人是字符串格式，尝试解析');
      try {
        // 尝试解析JSON字符串
        const parsed = JSON.parse(rawContacts);
        if (Array.isArray(parsed)) {
          return this.processContactsData(parsed);
        }
      } catch (e) {
        console.log('JSON解析失败，按普通字符串处理');
        // 按普通字符串处理，假设格式是 "姓名 (电话)"
        const match = rawContacts.match(/^(.*?)\s*\((\d+)\)$/);
        if (match && match.length === 3) {
          return [{ name: match[1].trim(), phone: match[2].trim() }];
        }
        return [{ name: rawContacts.trim(), phone: '' }];
      }
    }
    
    if (Array.isArray(rawContacts)) {
      console.log('联系人是数组格式，处理每个元素');
      return rawContacts.map((contact, index) => {
        console.log(`处理第${index + 1}个联系人:`, contact);
        
        if (typeof contact === 'string') {
          // 字符串格式：尝试解析 "姓名 (电话)"
          const match = contact.match(/^(.*?)\s*\((\d+)\)$/);
          if (match && match.length === 3) {
            return { name: match[1].trim(), phone: match[2].trim() };
          }
          return { name: contact.trim(), phone: '' };
        } else if (typeof contact === 'object' && contact !== null) {
          // 对象格式：提取name和phone字段
          const name = contact.name || contact.contact_name || contact.contactName || '姓名未知';
          const phone = contact.phone || contact.contact_phone || contact.contactPhone || contact.telephone || '';
          return { name: name.toString().trim(), phone: phone.toString().trim() };
        }
        
        console.log(`未知格式的联系人数据:`, contact);
        return { name: '格式错误', phone: '' };
      });
    }
    
    console.log('无法识别的联系人数据格式，返回空数组');
    return [];
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

  // 更新列表中的项目信息
  updateProjectInList(updatedProject) {
    console.log('开始更新列表项目:', updatedProject);
    
    // 同时更新 projectList 和 allProjects
    const projectIndex = this.data.projectList.findIndex(p => p.id === updatedProject.id);
    const allProjectIndex = this.data.allProjects.findIndex(p => p.id === updatedProject.id);
    
    if (projectIndex !== -1) {
      const newProjectList = [...this.data.projectList];
      newProjectList[projectIndex] = updatedProject;
      this.setData({
        projectList: newProjectList
      });
      console.log('projectList 已更新，ID:', updatedProject.id, '开始时间:', updatedProject.startDate, '主要目标:', updatedProject.objectives);
    } else {
      console.warn('未找到项目ID，无法更新 projectList:', updatedProject.id);
    }
    
    if (allProjectIndex !== -1) {
      const newAllProjects = [...this.data.allProjects];
      newAllProjects[allProjectIndex] = updatedProject;
      this.setData({
        allProjects: newAllProjects
      });
      console.log('allProjects 已更新，ID:', updatedProject.id, '开始时间:', updatedProject.startDate, '主要目标:', updatedProject.objectives);
    } else {
      console.warn('未找到项目ID，无法更新 allProjects:', updatedProject.id);
    }
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
