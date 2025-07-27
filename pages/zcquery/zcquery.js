Page({
  data: {
    searchKeyword: '',
    fileList: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.loadFileList();
  },

  onShow() {
    // 页面显示时刷新数据
    this.refreshData();
  },

  // 加载文件列表
  loadFileList(isRefresh = false) {
    if (this.data.loading) return;

    this.setData({
      loading: true
    });

    const page = isRefresh ? 1 : this.data.page;
    
    // 模拟从后端获取数据
    // 实际项目中这里应该调用wx.request()获取数据
    setTimeout(() => {
      const mockData = this.getMockFileData(page);
      
      if (isRefresh) {
        this.setData({
          fileList: mockData,
          page: 1,
          hasMore: mockData.length === this.data.pageSize
        });
      } else {
        this.setData({
          fileList: [...this.data.fileList, ...mockData],
          page: page + 1,
          hasMore: mockData.length === this.data.pageSize
        });
      }
      
      this.setData({
        loading: false
      });
    }, 500);
  },

  // 模拟数据 - 实际项目中应该从后端获取
  getMockFileData(page) {
    const mockFiles = [
      {
        id: page * 10 + 1,
        fileName: '政策文件_2024年第一季度.pdf',
        fileSize: '2.5MB',
        updateDate: '2024-01-15',
        content: '这是2024年第一季度的政策文件内容，包含了最新的政策规定和实施细则...',
        expanded: false
      },
      {
        id: page * 10 + 2,
        fileName: '项目申报指南.docx',
        fileSize: '1.8MB',
        updateDate: '2024-01-10',
        content: '项目申报指南详细说明了申报流程、所需材料、注意事项等...',
        expanded: false
      },
      {
        id: page * 10 + 3,
        fileName: '典型案例分析报告.xlsx',
        fileSize: '3.2MB',
        updateDate: '2024-01-08',
        content: '典型案例分析报告包含了多个成功案例的详细分析和经验总结...',
        expanded: false
      },
      {
        id: page * 10 + 4,
        fileName: '管理制度汇编.pdf',
        fileSize: '5.1MB',
        updateDate: '2024-01-05',
        content: '管理制度汇编涵盖了各项管理制度的详细规定和操作流程...',
        expanded: false
      },
      {
        id: page * 10 + 5,
        fileName: '年度工作总结.docx',
        fileSize: '2.8MB',
        updateDate: '2024-01-01',
        content: '年度工作总结回顾了过去一年的工作成果、存在的问题和下一步计划...',
        expanded: false
      }
    ];

    return mockFiles.slice(0, this.data.pageSize);
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 搜索
  onSearch() {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) {
      this.refreshData();
      return;
    }

    // 模拟搜索功能
    this.setData({
      loading: true
    });

    setTimeout(() => {
      const filteredList = this.data.fileList.filter(item => 
        item.fileName.toLowerCase().includes(keyword.toLowerCase()) ||
        item.content.toLowerCase().includes(keyword.toLowerCase())
      );

      this.setData({
        fileList: filteredList,
        loading: false
      });
    }, 300);
  },

  // 点击文件项
  onFileTap(e) {
    const index = e.currentTarget.dataset.index;
    const fileList = this.data.fileList;
    
    // 切换展开状态
    fileList[index].expanded = !fileList[index].expanded;
    
    this.setData({
      fileList: fileList
    });
  },

  // 下载文件
  onDownload(e) {
    const file = e.currentTarget.dataset.file;
    
    wx.showLoading({
      title: '下载中...'
    });

    // 模拟下载过程
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '下载成功',
        icon: 'success'
      });
    }, 2000);
  },

  // 分享文件
  onShare(e) {
    const file = e.currentTarget.dataset.file;
    
    wx.showActionSheet({
      itemList: ['分享给好友', '复制链接', '生成二维码'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            wx.showToast({
              title: '分享给好友',
              icon: 'success'
            });
            break;
          case 1:
            wx.setClipboardData({
              data: `https://example.com/file/${file.id}`,
              success: () => {
                wx.showToast({
                  title: '链接已复制',
                  icon: 'success'
                });
              }
            });
            break;
          case 2:
            wx.showToast({
              title: '二维码已生成',
              icon: 'success'
            });
            break;
        }
      }
    });
  },

  // 加载更多
  onLoadMore() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadFileList();
  },

  // 刷新数据
  refreshData() {
    this.loadFileList(true);
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshData();
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多
  onReachBottom() {
    this.onLoadMore();
  }
}); 