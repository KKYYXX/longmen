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

  onLoad() {
    console.log('典型案例查询页面加载');
    this.loadCases();
  },

  async loadCases() {
    this.setData({ loading: true });
    
    try {
      const dbService = require('../../utils/databaseService.js');
      const db = new dbService();
      
      const result = await db.getTypicalCases({
        keyword: this.data.searchKeyword,
        filter: this.data.currentFilter
      });
      
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
    } catch (error) {
      console.error('加载案例失败:', error);
      // 如果数据库服务失败，使用模拟数据
      const mockCases = this.generateMockCases();
      this.setData({
        allCases: mockCases,
        filteredCases: mockCases,
        loading: false
      });
      this.filterCases();
    }
  },

  generateMockCases() {
    return [
      {
        id: 1,
        title: '智慧城市建设典型案例',
        type: '城市管理',
        description: '通过数字化手段提升城市管理效率，实现智慧化治理',
        uploadTime: '2024-01-15',
        fileCount: 2,
        linkCount: 1,
        videoCount: 1,
        files: [
          { name: '项目报告.pdf', size: '2.5MB' },
          { name: '技术方案.docx', size: '1.8MB' }
        ],
        links: [
          { title: '相关新闻报道', url: 'https://example.com/news1' }
        ],
        videos: [
          { name: '项目演示.mp4', size: '15.2MB' }
        ]
      },
      {
        id: 2,
        title: '环保技术创新项目',
        type: '环境保护',
        description: '采用新型环保技术，实现废物资源化利用',
        uploadTime: '2024-01-10',
        fileCount: 1,
        linkCount: 2,
        videoCount: 1,
        files: [
          { name: '技术专利.pdf', size: '3.2MB' }
        ],
        links: [
          { title: '环保政策解读', url: 'https://example.com/policy' },
          { title: '技术应用案例', url: 'https://example.com/case' }
        ],
        videos: [
          { name: '技术演示.mp4', size: '8.5MB' }
        ]
      }
    ];
  },

  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  onSearch() {
    this.filterCases();
  },

  setFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      currentFilter: filter
    });
    this.filterCases();
  },

  filterCases() {
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

  viewCaseDetail(e) {
    const caseData = e.currentTarget.dataset.case;
    wx.showModal({
      title: caseData.title,
      content: caseData.description,
      showCancel: false
    });
  },

  previewCase(e) {
    const caseData = e.currentTarget.dataset.case;
    wx.navigateTo({
      url: `/pages/typicalcasesquery/typicalcasesquery_detail?id=${caseData.id}`
    });
  },

  downloadCase(e) {
    wx.showToast({
      title: '下载功能开发中',
      icon: 'none'
    });
  },

  shareCase(e) {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  loadMore() {
    wx.showToast({
      title: '没有更多数据',
      icon: 'none'
    });
  }
});
