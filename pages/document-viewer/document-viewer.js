Page({
  data: {
    documentUrl: '',
    documentTitle: '文档预览',
    loading: true,
    error: false,
    errorMessage: ''
  },

  onLoad: function(options) {
    console.log('文档预览页面加载参数:', options);
    
    const url = options.url ? decodeURIComponent(options.url) : '';
    const title = options.title ? decodeURIComponent(options.title) : '文档预览';
    
    this.setData({
      documentUrl: url,
      documentTitle: title
    });

    if (url) {
      this.loadDocument(url);
    } else {
      this.setData({
        loading: false,
        error: true,
        errorMessage: '文档链接无效'
      });
    }
  },

  // 加载文档
  loadDocument: function(url) {
    console.log('开始加载文档:', url);
    
    // 如果是 wxfile:// 链接，提取真实路径
    const filePath = url.startsWith('wxfile://') ? url.replace('wxfile://', '') : url;
    
    wx.showLoading({
      title: '正在打开文档...',
      mask: true
    });

    // 尝试使用微信原生文档预览
    wx.openDocument({
      filePath: filePath,
      success: () => {
        wx.hideLoading();
        console.log('文档打开成功');
        this.setData({
          loading: false,
          error: false
        });
        
        // 文档打开成功后，可以选择返回上一页或保持当前页面
        setTimeout(() => {
          wx.navigateBack();
        }, 500);
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('文档打开失败:', err);
        
        this.setData({
          loading: false,
          error: true,
          errorMessage: '文档格式不支持或文件已损坏'
        });
        
        // 提供备用方案
        this.showAlternativeOptions(url);
      }
    });
  },

  // 显示备用选项
  showAlternativeOptions: function(url) {
    wx.showModal({
      title: '无法预览文档',
      content: '该文档无法直接预览，您可以选择：',
      showCancel: true,
      cancelText: '返回',
      confirmText: '复制链接',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: url,
            success: () => {
              wx.showToast({
                title: '链接已复制到剪贴板',
                icon: 'success'
              });
              setTimeout(() => {
                wx.navigateBack();
              }, 1500);
            }
          });
        } else {
          wx.navigateBack();
        }
      }
    });
  },

  // 重新加载
  onRetry: function() {
    this.setData({
      loading: true,
      error: false,
      errorMessage: ''
    });
    this.loadDocument(this.data.documentUrl);
  }
});
