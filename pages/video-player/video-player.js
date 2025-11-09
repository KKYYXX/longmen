Page({
  data: {
    videoUrl: '',
    videoTitle: '',
    loading: true
  },

  onLoad(options) {
    console.log('视频播放器页面加载', options);
    
    // 接收从typicalcasesquery页面传递的参数
    if (options.video_url && options.title) {
      this.setData({
        videoUrl: decodeURIComponent(options.video_url),
        videoTitle: decodeURIComponent(options.title),
        loading: false
      });
    } else if (options.url && options.title) {
      // 兼容原有的参数格式
      this.setData({
        videoUrl: decodeURIComponent(options.url),
        videoTitle: decodeURIComponent(options.title),
        loading: false
      });
    } else {
      // 视频播放页已被禁用，直接提示并返回
      wx.showToast({
        title: '视频播放功能已被禁用',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1200);
    }
  },

  onVideoError(e) {
    // 视频播放已被禁用，原始错误处理已注释
    wx.showToast({
      title: '视频播放功能已被禁用',
      icon: 'none'
    });
  },

  onVideoLoad() {
    // 已禁用视频播放
  },

  onVideoPlay() {
    // 已禁用视频播放
  },

  onVideoPause() {
    // 已禁用视频播放
  },

  onVideoEnded() {
    // 已禁用视频播放
  },

  onVideoTimeUpdate(e) {
    // 已禁用视频播放
  },

  onVideoFullscreenChange(e) {
    // 已禁用视频播放
  },

  onVideoTap() {
    // 已禁用视频播放
  },

  onVideoLongTap() {
    // 已禁用视频播放
  },

  navigateBack() {
    wx.navigateBack();
  }
}); 