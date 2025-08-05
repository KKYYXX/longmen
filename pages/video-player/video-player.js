Page({
  data: {
    videoUrl: '',
    videoTitle: '',
    loading: true
  },

  onLoad(options) {
    console.log('视频播放器页面加载', options);
    if (options.url && options.title) {
      this.setData({
        videoUrl: decodeURIComponent(options.url),
        videoTitle: decodeURIComponent(options.title),
        loading: false
      });
    } else {
      wx.showToast({
        title: '视频参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  onVideoError(e) {
    console.error('视频播放错误:', e.detail);
    wx.showToast({
      title: '视频播放失败',
      icon: 'none'
    });
  },

  onVideoLoad() {
    console.log('视频加载成功');
  },

  onVideoPlay() {
    console.log('视频开始播放');
  },

  onVideoPause() {
    console.log('视频暂停');
  },

  onVideoEnded() {
    console.log('视频播放结束');
  },

  onVideoTimeUpdate(e) {
    // 可以在这里处理视频播放进度
    const currentTime = e.detail.currentTime;
    const duration = e.detail.duration;
    console.log(`播放进度: ${currentTime}/${duration}`);
  },

  onVideoFullscreenChange(e) {
    console.log('全屏状态变化:', e.detail.fullScreen);
  },

  onVideoTap() {
    console.log('视频被点击');
  },

  onVideoLongTap() {
    console.log('视频被长按');
  },

  navigateBack() {
    wx.navigateBack();
  }
}); 