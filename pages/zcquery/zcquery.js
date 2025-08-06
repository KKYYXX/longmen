Page({
  data: {
    searchKeyword: '',
    fileList: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    totalCount: 0
  },

  onLoad() {
    this.loadFileListFromCache();
  },
  
  onShow() {
    // 页面显示时刷新数据
    this.refreshData();
  },

  // 从本地缓存加载文件列表
  loadFileListFromCache() {
    const fileList = wx.getStorageSync('zc_file_list') || [];
    const totalCount = wx.getStorageSync('zc_total_count') || 0;
    
    // 处理文件数据，添加展示所需的字段
    const processedFileList = fileList.map(file => ({
      id: file.id,
      fileName: file.file_name, // 使用后端返回的file_name字段
      fileSize: this.formatFileSize(file.file_size),
      updateDate: file.uploaded_at || '',
      fileUrl: file.file_url,
      expanded: false
    }));
    
    this.setData({
      fileList: processedFileList,
      totalCount: totalCount
    });
  },

  // 格式化文件大小
  formatFileSize(sizeInBytes) {
    if (!sizeInBytes) return '0 KB';
    
    const size = parseInt(sizeInBytes);
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + ' KB';
    } else {
      return (size / 1024 / 1024).toFixed(2) + ' MB';
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
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) {
      this.loadFileListFromCache();
      return;
    }

    // 从缓存中搜索
    const allFiles = wx.getStorageSync('zc_file_list') || [];
    const filteredList = allFiles.filter(file => 
      file.file_name.toLowerCase().includes(keyword.toLowerCase())
    );

    const processedFileList = filteredList.map(file => ({
      id: file.id,
      fileName: file.file_name,
      fileSize: this.formatFileSize(file.file_size),
      updateDate: file.uploaded_at || '',
      fileUrl: file.file_url,
      expanded: false
    }));

    this.setData({
      fileList: processedFileList
    });
  },

  // 点击文件项
  onFileTap(e) {
    const index = e.currentTarget.dataset.index;
    const file = this.data.fileList[index];
    
    // 直接预览文件内容
    this.previewFile(file);
  },

  // 预览文件内容
  previewFile(file) {
    const fileUrl = file.fileUrl;
    const fileName = file.fileName;
    
    // 判断是否为本地文件
    const isLocalFile = fileUrl.startsWith('D:\\') || fileUrl.startsWith('C:\\') || fileUrl.startsWith('/');
    
    if (isLocalFile) {
      // 本地文件，显示提示
      wx.showModal({
        title: '本地文件',
        content: '此文件存储在本地计算机上，无法直接预览。',
        showCancel: false,
        confirmText: '确定'
      });
    } else {
      // 网络文件，尝试预览
      wx.showLoading({
        title: '加载中...'
      });
      
      // 根据文件类型选择不同的预览方式
      const fileExtension = fileName.split('.').pop().toLowerCase();
      
      if (fileExtension === 'pdf') {
        // PDF文件直接使用微信预览
        wx.hideLoading();
        wx.downloadFile({
          url: fileUrl,
          success: (res) => {
            if (res.statusCode === 200) {
              wx.openDocument({
                filePath: res.tempFilePath,
                success: () => {
                  console.log('PDF文件打开成功');
                },
                fail: (err) => {
                  console.log('PDF文件打开失败', err);
                  wx.showToast({
                    title: '文件打开失败',
                    icon: 'none'
                  });
                }
              });
            } else {
              wx.showToast({
                title: '文件下载失败',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            wx.hideLoading();
            console.log('下载失败', err);
            wx.showToast({
              title: '文件访问失败',
              icon: 'none'
            });
          }
        });
      } else if (['doc', 'docx'].includes(fileExtension)) {
        // Word文档
        wx.hideLoading();
        wx.downloadFile({
          url: fileUrl,
          success: (res) => {
            if (res.statusCode === 200) {
              wx.openDocument({
                filePath: res.tempFilePath,
                success: () => {
                  console.log('Word文档打开成功');
                },
                fail: (err) => {
                  console.log('Word文档打开失败', err);
                  wx.showToast({
                    title: '文件打开失败',
                    icon: 'none'
                  });
                }
              });
            } else {
              wx.showToast({
                title: '文件下载失败',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            wx.hideLoading();
            console.log('下载失败', err);
            wx.showToast({
              title: '文件访问失败',
              icon: 'none'
            });
          }
        });
      } else {
        // 其他文件类型
        wx.hideLoading();
        wx.showModal({
          title: '文件预览',
          content: '暂不支持此文件类型的预览，请下载后查看。',
          showCancel: false,
          confirmText: '确定'
        });
      }
    }
  },

  // 刷新数据
  refreshData() {
    // 重新从缓存加载数据
    this.loadFileListFromCache();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshData();
    wx.stopPullDownRefresh();
  },

  // 上拉加载更多（由于数据已经全部加载，这里可以禁用或重新请求）
  onReachBottom() {
    // 如果数据量很大，可以在这里实现分页加载
    // 目前数据已经全部加载，所以这里不做处理
  }
}); 