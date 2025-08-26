Page({
  data: {
    webUrl: '',
    originalUrl: '',
    loading: true,
    error: false,
    errorMessage: ''
  },

  onLoad(options) {
    console.log('WebView页面加载', options);
    
    if (options.url) {
      const originalUrl = decodeURIComponent(options.url);
      const fileName = options.fileName ? decodeURIComponent(options.fileName) : '';
      const isLocal = options.isLocal === 'true';
      
      console.log('要打开的URL:', originalUrl);
      console.log('文件名:', fileName);
      console.log('是否本地文件:', isLocal);
      
      this.setData({
        originalUrl: originalUrl,
        fileName: fileName,
        isLocal: isLocal,
        webUrl: this.processUrl(originalUrl, isLocal)
      });
    } else {
      this.setData({
        error: true,
        errorMessage: '没有提供有效的链接地址',
        loading: false
      });
    }
  },

  // 处理URL，确保可以在微信中打开
  processUrl(url, isLocal = false) {
    if (isLocal) {
      // 本地文件，返回一个特殊的处理URL
      return 'https://example.com/local-file-placeholder';
    }
    
    // 确保URL有协议
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // 检查是否是微信支持的域名
    const supportedDomains = [
      'qq.com',
      'weixin.qq.com', 
      'mp.weixin.qq.com',
      'github.com',
      'gitee.com',
      'baidu.com',
      'sina.com.cn',
      'sohu.com',
      '163.com',
      'people.com.cn',
      'xinhuanet.com'
    ];
    
    const domain = this.extractDomain(url);
    const isSupported = supportedDomains.some(supportedDomain => 
      domain.includes(supportedDomain)
    );
    
    if (!isSupported) {
      console.log('域名可能不被支持:', domain);
      // 对于不支持的域名，我们仍然尝试打开
    }
    
    return url;
  },

  // 提取域名
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return '';
    }
  },

  // WebView加载成功
  onWebViewLoad(e) {
    console.log('WebView加载成功', e);
    this.setData({
      loading: false,
      error: false
    });
    
    wx.showToast({
      title: '页面加载成功',
      icon: 'success',
      duration: 1500
    });
  },

  // WebView加载失败
  onWebViewError(e) {
    console.error('WebView加载失败', e);
    this.setData({
      loading: false,
      error: true,
      errorMessage: '网页加载失败，可能是网络问题或该网站不支持在微信中打开'
    });
  },

  // 重新加载
  retryLoad() {
    this.setData({
      loading: true,
      error: false,
      errorMessage: ''
    });
    
    // 重新设置URL触发加载
    const currentUrl = this.data.webUrl;
    this.setData({
      webUrl: ''
    });
    
    setTimeout(() => {
      this.setData({
        webUrl: currentUrl
      });
    }, 100);
  },

  // 复制链接
  copyUrl() {
    wx.setClipboardData({
      data: this.data.originalUrl,
      success: () => {
        wx.showModal({
          title: '🔗 链接已复制',
          content: `链接已复制到剪贴板：\n\n${this.data.originalUrl}\n\n您可以：\n1. 打开浏览器粘贴访问\n2. 发送给朋友打开\n3. 在微信聊天中粘贴点击`,
          confirmText: '知道了',
          showCancel: false
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      fail: () => {
        // 如果无法返回，跳转到首页
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    });
  }
});
