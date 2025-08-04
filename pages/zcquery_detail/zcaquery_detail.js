// pages/zcquery_detail/zcaquery_detail.js
Page({
  data: {
    fileName: '',
    fileUrl: '',
    fileType: '',
    fileSize: '',
    uploadTime: '',
    isLocalFile: false

  },

  onLoad(options) {
    if (options.file_name && options.file_url) {
      const fileName = decodeURIComponent(options.file_name);
      const fileUrl = decodeURIComponent(options.file_url);
      
      // 判断是否为本地文件
      const isLocalFile = fileUrl.startsWith('D:\\') || fileUrl.startsWith('C:\\') || fileUrl.startsWith('/');
      
      this.setData({
        fileName: fileName,
        fileUrl: fileUrl,
        isLocalFile: isLocalFile
      });
      
      // 获取文件类型
      this.getFileType(fileName);


    }
  },

  // 获取文件类型
  getFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    let fileType = '';
    
    switch (extension) {
      case 'pdf':
        fileType = 'PDF文档';
        break;
      case 'doc':
      case 'docx':
        fileType = 'Word文档';
        break;
      default:
        fileType = '未知文件类型';
    }
    
    this.setData({
      fileType: fileType
    });
  },

  // 预览文件
  previewFile() {
    const { fileUrl, isLocalFile, fileName } = this.data;
    
    if (isLocalFile) {
      // 本地文件，显示提示
      wx.showModal({
        title: '本地文件',
        content: `文件路径：${fileUrl}\n\n此文件存储在本地计算机上，无法直接预览。`,
        showCancel: false,
        confirmText: '确定'
      });
    } else {
      // 网络文件，尝试预览
      wx.showLoading({
        title: '加载中...'
      });
      
      // 这里可以根据文件类型选择不同的预览方式
      // 对于PDF等文件，可以使用web-view组件
      wx.hideLoading();
      
      wx.showToast({
        title: '暂不支持此文件类型预览',
        icon: 'none'
      });
    }
  },

  // 下载文件
  downloadFile() {
    const { fileUrl, isLocalFile, fileName } = this.data;
    
    if (isLocalFile) {
      wx.showModal({
        title: '本地文件',
        content: '此文件存储在本地计算机上，无法直接下载。',
        showCancel: false,
        confirmText: '确定'
      });
    } else {
      wx.showLoading({
        title: '下载中...'
      });
      
      // 这里可以实现文件下载逻辑
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({
          title: '下载功能开发中',
          icon: 'none'
        });
      }, 1000);
    }
  },

  // 分享文件
  shareFile() {
    const { fileName, fileUrl } = this.data;
    
    wx.showModal({
      title: '分享文件',
      content: `文件名：${fileName}\n文件地址：${fileUrl}`,
      showCancel: false,
      confirmText: '确定'
    });
  },

  // 复制文件路径
  copyFilePath() {
    const { fileUrl } = this.data;
    
    wx.setClipboardData({
      data: fileUrl,
      success: () => {
        wx.showToast({
          title: '路径已复制',
          icon: 'success'
        });
      }
    });
  }
});