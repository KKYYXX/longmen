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
    showProjectDetail: false,
    selectedProject: null
  },

  onLoad: function() {
    console.log('十五项项目查询页面加载');
    this.loadProjectList();
  },

  onShow: function() {
    console.log('十五项项目查询页面显示');
  },

  // 开始时间选择
  onStartDateChange: function(e) {
    this.setData({
      startDate: e.detail.value
    });
    this.onSearch();
  },

  // 结束时间选择
  onEndDateChange: function(e) {
    this.setData({
      endDate: e.detail.value
    });
    this.onSearch();
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
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
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
        projectName: '智慧城市基础设施建设项目',
        projectType: '基础设施建设',
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        objectives: '建设覆盖全市的智慧城市基础设施网络，包括物联网传感器部署、数据中心建设、智能交通系统等，提升城市管理效率和市民生活质量。预计完成后将服务人口500万，实现城市管理数字化转型。项目总投资15亿元，分三个阶段实施，将打造全国领先的智慧城市示范区。',
        progress: 68,
        status: '进行中',
        createDate: '2024-01-15'
      },
      {
        id: 2,
        projectName: '绿色能源产业园区建设',
        projectType: '产业发展',
        startDate: '2024-02-01',
        endDate: '2025-01-31',
        objectives: '建设集太阳能、风能、储能技术于一体的绿色能源产业园区，打造清洁能源产业集群。园区规划面积1000亩，预计引入企业50家，年产值达到100亿元，成为区域绿色发展示范基地。项目将建设50MW太阳能发电站、20MW风力发电站和大型储能设施。',
        progress: 52,
        status: '进行中',
        createDate: '2024-02-01'
      },
      {
        id: 3,
        projectName: '数字化教育改革试点',
        projectType: '民生改善',
        startDate: '2024-03-01',
        endDate: '2024-11-30',
        objectives: '在全市200所学校实施数字化教育改革，建设智慧教室、在线学习平台、教师培训体系等。通过技术手段实现个性化教学，提升教育质量，缩小城乡教育差距，惠及师生15万人。项目包括建设1000间智慧教室、培训5000名教师、开发100门在线课程。',
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
      }
    ];
    console.log('返回项目数据，共', projects.length, '个项目');
    return projects;
  },

  // 搜索输入
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 搜索
  onSearch: function() {
    this.refreshData();
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
      selectedProject: null
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
