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
    
    // 直接预览文件
    this.previewFile(file);
  },



  // 预览文件内容 - 参考项目进度修改内容页面的实现
  previewFile(file) {
    console.log('=== 政策文件预览 ===');
    console.log('file:', file);
    
    const fileUrl = file.fileUrl;
    const fileName = file.fileName;
    
    if (!fileUrl) {
      wx.showToast({
        title: '文件链接无效',
        icon: 'none'
      });
      return;
    }

    // 获取文件扩展名
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // 根据文件类型处理 - 参考项目进度修改内容页面的逻辑
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension)) {
      // 图片文件直接预览
      wx.previewImage({
        urls: [fileUrl],
        current: fileUrl
      });
    } else {
      // 文档文件需要先下载到本地再预览
      const apiConfig = require('../../config/api.js');
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : apiConfig.buildFileUrl(fileUrl);
      
      wx.showLoading({
        title: '正在下载文件...'
      });
      
      // 使用wx.downloadFile下载到本地临时文件，然后使用wx.openDocument打开
      wx.downloadFile({
        url: fullUrl,
        timeout: 10000, // 10秒超时
        success: (res) => {
          wx.hideLoading();
          if (res.statusCode === 200) {
            wx.openDocument({
              filePath: res.tempFilePath,
              success: () => {
                console.log('打开文档成功');
              },
              fail: (err) => {
                console.error('打开文档失败:', err);
                wx.showToast({
                  title: '无法预览此文件',
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
          console.error('下载文件失败:', err);
          
          // 根据错误类型给出不同的提示
          let errorMessage = '文件下载失败';
          if (err.errMsg) {
            if (err.errMsg.includes('timeout')) {
              errorMessage = '下载超时，请检查网络连接';
            } else if (err.errMsg.includes('fail')) {
              errorMessage = '服务器连接失败，请检查服务器状态';
            } else if (err.errMsg.includes('abort')) {
              errorMessage = '下载被中断';
            }
          }
          
          wx.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 2000
          });
        }
      });
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
  },


}); 