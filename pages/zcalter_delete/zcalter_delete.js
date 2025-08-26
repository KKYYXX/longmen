// 导入API配置
const apiConfig = require('../../config/api.js');

Page({
  data: {
    searchKeyword: '',
    fileList: [],
    loading: false,
    totalCount: 0
  },

  onLoad() {
    this.loadFileList();
  },

  onShow() {
    // 页面显示时刷新数据
    this.refreshData();
  },

  // 从后端加载文件列表
  loadFileList() {
    this.setData({ loading: true });

    wx.request({
      url: apiConfig.buildUrl('/app/api/zcdocuments'),
      method: 'GET',
      success: (res) => {
        if (res.data.success) {
          const fileList = res.data.data.map(file => ({
            id: file.id,
            fileName: file.file_name,
            fileSize: this.formatFileSize(file.file_size),
            updateDate: file.uploaded_at || '',
            fileUrl: file.file_url
          }));

          this.setData({
            fileList: fileList,
            totalCount: res.data.total_count,
            loading: false
          });

          // 缓存数据到本地
          wx.setStorageSync('zc_file_list', res.data.data);
          wx.setStorageSync('zc_total_count', res.data.total_count);
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'error'
          });
          this.setData({ loading: false });
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'error'
        });
        this.setData({ loading: false });
      }
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
      this.loadFileList();
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
      fileUrl: file.file_url
    }));

    this.setData({
      fileList: processedFileList
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

    wx.request({
      url: apiConfig.buildUrl(`/app/api/zcdocuments/${file.id}`),
      method: 'DELETE',
      success: (res) => {
        wx.hideLoading();
        
        if (res.data.success) {
          // 从列表中移除文件
          const fileList = this.data.fileList.filter(item => item.id !== file.id);
          this.setData({
            fileList: fileList,
            totalCount: this.data.totalCount - 1
          });

          // 更新本地缓存
          const cachedFiles = wx.getStorageSync('zc_file_list') || [];
          const updatedCachedFiles = cachedFiles.filter(item => item.id !== file.id);
          wx.setStorageSync('zc_file_list', updatedCachedFiles);
          wx.setStorageSync('zc_total_count', this.data.totalCount - 1);

          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message || '删除失败',
            icon: 'error'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('删除请求失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'error'
        });
      }
    });
  },

  // 刷新数据
  refreshData() {
    this.loadFileList();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshData();
    wx.stopPullDownRefresh();
  }
}); 