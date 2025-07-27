Page({
  data: {
    searchKeyword: '',
    fileList: []
  },

  onLoad() {
    this.loadFileList();
  },

  // 加载文件列表
  loadFileList() {
    // 模拟从后端获取文件列表
    const mockFiles = [
      {
        id: 1,
        fileName: '政策文件_2024年第一季度.pdf',
        fileSize: '2.5MB',
        updateDate: '2024-01-15'
      },
      {
        id: 2,
        fileName: '项目申报指南.docx',
        fileSize: '1.8MB',
        updateDate: '2024-01-10'
      },
      {
        id: 3,
        fileName: '典型案例分析报告.xlsx',
        fileSize: '3.2MB',
        updateDate: '2024-01-08'
      },
      {
        id: 4,
        fileName: '管理制度汇编.pdf',
        fileSize: '5.1MB',
        updateDate: '2024-01-05'
      },
      {
        id: 5,
        fileName: '年度工作总结.docx',
        fileSize: '2.8MB',
        updateDate: '2024-01-01'
      }
    ];

    this.setData({
      fileList: mockFiles
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
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) {
      this.loadFileList();
      return;
    }

    // 模拟搜索功能
    const allFiles = [
      {
        id: 1,
        fileName: '政策文件_2024年第一季度.pdf',
        fileSize: '2.5MB',
        updateDate: '2024-01-15'
      },
      {
        id: 2,
        fileName: '项目申报指南.docx',
        fileSize: '1.8MB',
        updateDate: '2024-01-10'
      },
      {
        id: 3,
        fileName: '典型案例分析报告.xlsx',
        fileSize: '3.2MB',
        updateDate: '2024-01-08'
      },
      {
        id: 4,
        fileName: '管理制度汇编.pdf',
        fileSize: '5.1MB',
        updateDate: '2024-01-05'
      },
      {
        id: 5,
        fileName: '年度工作总结.docx',
        fileSize: '2.8MB',
        updateDate: '2024-01-01'
      }
    ];

    const filteredList = allFiles.filter(item => 
      item.fileName.toLowerCase().includes(keyword.toLowerCase())
    );

    this.setData({
      fileList: filteredList
    });
  },

  // 删除文件
  deleteFile(e) {
    const file = e.currentTarget.dataset.file;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除文件"${file.fileName}"吗？此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#e74c3c',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.performDelete(file);
        }
      }
    });
  },

  // 执行删除操作
  performDelete(file) {
    wx.showLoading({
      title: '删除中...'
    });

    // 模拟删除过程
    setTimeout(() => {
      wx.hideLoading();
      
      // 从列表中移除文件
      const fileList = this.data.fileList.filter(item => item.id !== file.id);
      this.setData({
        fileList: fileList
      });

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    }, 1000);
  }
}); 