Page({
  data: {
    searchKeyword: '',
    currentFilter: 'all',
    allCases: [],
    filteredCases: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad: function() {
    console.log('典型案例查询页面加载');
    this.loadCases();
  },

  onShow: function() {
    // 页面显示时重新加载数据，以防其他页面有更新
    this.loadCases();
  },

  loadCases: function() {
    this.setData({ loading: true });

    // 使用开发模式，从本地存储和默认数据加载
    const apiConfig = require('../../config/api.js');

    if (apiConfig.isMockEnabled()) {
      // 开发模式：从本地存储和默认数据加载
      setTimeout(() => {
        const storedCases = wx.getStorageSync('typicalCases') || [];
        const defaultCases = this.getDefaultCases();
        const allCases = [...defaultCases, ...storedCases];

        // 为每个案例添加统计信息和格式化数据
        const casesWithStats = allCases.map(caseItem => ({
          ...caseItem,
          title: caseItem.caseName || caseItem.title,
          type: caseItem.category || '典型案例',
          description: caseItem.description || caseItem.summary || '暂无描述',
          uploadTime: caseItem.uploadTime || caseItem.createDate,
          fileCount: (caseItem.files && caseItem.files.length) || 0,
          videoCount: (caseItem.videos && caseItem.videos.length) || 0,
          linkCount: (caseItem.links && caseItem.links.length) || 0,
          files: caseItem.files || [],
          videos: caseItem.videos || [],
          links: caseItem.links || []
        }));

        this.setData({
          allCases: casesWithStats,
          filteredCases: casesWithStats,
          loading: false
        });
        this.filterCases();
      }, 500);
      return;
    }

    // 生产模式：调用后端接口
    try {
      const dbService = require('../../utils/databaseService.js');
      const db = new dbService();

      db.getTypicalCases({
        keyword: this.data.searchKeyword,
        filter: this.data.currentFilter
      }).then(result => {
        if (result.success) {
          this.setData({
            allCases: result.cases,
            filteredCases: result.cases,
            loading: false
          });
        } else {
          wx.showToast({
            title: result.message || '加载失败',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      }).catch(error => {
        console.error('加载案例失败:', error);
        // 如果数据库服务失败，使用默认数据
        const defaultCases = this.getDefaultCases();
        this.setData({
          allCases: defaultCases,
          filteredCases: defaultCases,
          loading: false
        });
        this.filterCases();
      });
    } catch (error) {
      console.error('加载案例失败:', error);
      // 如果数据库服务失败，使用默认数据
      const defaultCases = this.getDefaultCases();
      this.setData({
        allCases: defaultCases,
        filteredCases: defaultCases,
        loading: false
      });
      this.filterCases();
    }
  },

  // 获取默认案例数据
  getDefaultCases: function() {
    // 所有默认案例
    const allDefaultCases = [
      {
        id: 1,
        caseName: '智慧城市建设典型案例',
        title: '智慧城市建设典型案例',
        category: '基础设施建设',
        type: '基础设施建设',
        createDate: '2024-01-15',
        uploadTime: '2024-01-15 10:30:00',
        updateDate: '2024-07-20',
        description: '通过物联网、大数据、人工智能等技术，构建智慧城市管理平台，实现城市治理现代化，提升市民生活质量。',
        summary: '通过物联网、大数据、人工智能等技术，构建智慧城市管理平台，实现城市治理现代化，提升市民生活质量。',
        author: '市信息化办公室',
        contact: '张主任 - 13800138000',
        files: [
          { name: '智慧城市建设方案.pdf', size: '2.5MB', sizeFormatted: '2.5MB' }
        ],
        videos: [
          { name: '智慧城市演示视频.mp4', duration: '5:30' }
        ],
        links: [
          { title: '智慧城市官方网站', url: 'https://smartcity.example.com' }
        ]
      },
      {
        id: 2,
        caseName: '绿色能源示范园区建设案例',
        title: '绿色能源示范园区建设案例',
        category: '环保治理',
        type: '环保治理',
        createDate: '2024-02-10',
        uploadTime: '2024-02-10 14:20:00',
        updateDate: '2024-07-18',
        description: '建设集太阳能、风能、储能于一体的绿色能源示范园区，实现清洁能源的高效利用和智能管理。',
        summary: '建设集太阳能、风能、储能于一体的绿色能源示范园区，实现清洁能源的高效利用和智能管理。',
        author: '市发改委',
        contact: '李处长 - 13900139000',
        files: [
          { name: '绿色能源规划书.docx', size: '3.1MB', sizeFormatted: '3.1MB' }
        ],
        videos: [
          { name: '园区建设纪录片.mp4', duration: '8:45' }
        ],
        links: [
          { title: '绿色能源政策解读', url: 'https://greenenergy.example.com' }
        ]
      },
      {
        id: 3,
        caseName: '数字化教育改革实践案例',
        title: '数字化教育改革实践案例',
        category: '民生改善',
        type: '民生改善',
        createDate: '2024-03-05',
        uploadTime: '2024-03-05 09:15:00',
        updateDate: '2024-07-15',
        description: '运用数字技术改革传统教育模式，建设智慧校园，推进教育公平和质量提升。',
        summary: '运用数字技术改革传统教育模式，建设智慧校园，推进教育公平和质量提升。',
        author: '市教育局',
        contact: '王局长 - 13700137000',
        files: [
          { name: '数字化教育方案.pdf', size: '4.2MB', sizeFormatted: '4.2MB' }
        ],
        videos: [
          { name: '智慧课堂演示.mp4', duration: '12:20' }
        ],
        links: [
          { title: '数字化教育平台', url: 'https://education.example.com' },
          { title: '在线学习资源', url: 'https://learning.example.com' }
        ]
      }
    ];

    // 过滤掉已删除的默认案例
    const deletedDefaultCases = wx.getStorageSync('deletedDefaultCases') || [];
    return allDefaultCases.filter(caseItem => !deletedDefaultCases.includes(caseItem.id));
  },

  generateMockCases: function() {
    // 保持向后兼容，调用新的方法
    return this.getDefaultCases();
  },

  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  onSearch: function() {
    this.filterCases();
  },

  setFilter: function(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      currentFilter: filter
    });
    this.filterCases();
  },

  filterCases: function() {
    let filtered = this.data.allCases;
    
    if (this.data.currentFilter !== 'all') {
      filtered = filtered.filter(case_item => {
        switch (this.data.currentFilter) {
          case 'files':
            return case_item.fileCount > 0;
          case 'links':
            return case_item.linkCount > 0;
          case 'videos':
            return case_item.videoCount > 0;
          default:
            return true;
        }
      });
    }
    
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(case_item => 
        case_item.title.toLowerCase().includes(keyword) ||
        case_item.description.toLowerCase().includes(keyword)
      );
    }
    
    this.setData({
      filteredCases: filtered
    });
  },

  viewCaseDetail: function(e) {
    const caseData = e.currentTarget.dataset.case;
    wx.showModal({
      title: caseData.title,
      content: caseData.description,
      showCancel: false
    });
  },

  previewCase: function(e) {
    const caseData = e.currentTarget.dataset.case;
    // 跳转到文档展示页面，显示完整的案例内容
    wx.navigateTo({
      url: `/pages/case_document/case_document?id=${caseData.id}`
    });
  },

  downloadCase: function(e) {
    wx.showToast({
      title: '下载功能开发中',
      icon: 'none'
    });
  },

  shareCase: function(e) {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  loadMore: function() {
    wx.showToast({
      title: '没有更多数据',
      icon: 'none'
    });
  }
});
