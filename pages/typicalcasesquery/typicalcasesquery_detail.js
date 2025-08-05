Page({
  data: {
    caseId: null,
    caseData: null,
    activeTab: 'files', // files, videos, links
    loading: true
  },

  onLoad(options) {
    console.log('典型案例详情页面加载', options);
    if (options.id) {
      this.setData({
        caseId: parseInt(options.id)
      });
      this.loadCaseDetail();
    }
  },

  navigateBack() {
    wx.navigateBack();
  },

  async loadCaseDetail() {
    this.setData({ loading: true });
    
    try {
      const dbService = require('../../utils/databaseService.js');
      const db = new dbService();
      
      const result = await db.getTypicalCaseById(this.data.caseId);
      
      if (result.success) {
        this.setData({
          caseData: result.case,
          loading: false
        });
      } else {
        wx.showToast({
          title: result.message || '加载失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    } catch (error) {
      console.error('加载案例详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
  },

  // 预览文件
  previewFile(e) {
    const file = e.currentTarget.dataset.file;
    
    if (file.fileType === 'pdf' || file.fileType === 'doc' || file.fileType === 'docx') {
      // 使用微信文档预览
      wx.downloadFile({
        url: file.fileUrl,
        success: (res) => {
          wx.openDocument({
            filePath: res.tempFilePath,
            success: () => {
              console.log('文档打开成功');
            },
            fail: (error) => {
              console.error('文档打开失败:', error);
              wx.showToast({
                title: '文件打开失败',
                icon: 'none'
              });
            }
          });
        },
        fail: (error) => {
          console.error('文件下载失败:', error);
          wx.showToast({
            title: '文件下载失败',
            icon: 'none'
          });
        }
      });
    } else {
      // 其他文件类型直接下载
      wx.downloadFile({
        url: file.fileUrl,
        success: (res) => {
          wx.showToast({
            title: '文件已下载',
            icon: 'success'
          });
        },
        fail: (error) => {
          console.error('文件下载失败:', error);
          wx.showToast({
            title: '文件下载失败',
            icon: 'none'
          });
        }
      });
    }
  },

  // 播放视频
  playVideo(e) {
    const video = e.currentTarget.dataset.video;
    
    wx.navigateTo({
      url: `/pages/video-player/video-player?url=${encodeURIComponent(video.videoUrl)}&title=${encodeURIComponent(video.videoName)}`
    });
  },

  // 打开链接
  openLink(e) {
    const link = e.currentTarget.dataset.link;
    
    wx.showModal({
      title: '确认打开链接',
      content: `是否打开链接：${link.linkTitle}`,
      success: (res) => {
        if (res.confirm) {
          // 复制链接到剪贴板
          wx.setClipboardData({
            data: link.linkUrl,
            success: () => {
              wx.showToast({
                title: '链接已复制',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  },

  // 下载文件
  downloadFile(e) {
    const file = e.currentTarget.dataset.file;
    
    wx.downloadFile({
      url: file.fileUrl,
      success: (res) => {
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success: () => {
            wx.showToast({
              title: '文件已保存',
              icon: 'success'
            });
          },
          fail: (error) => {
            console.error('文件保存失败:', error);
            wx.showToast({
              title: '文件保存失败',
              icon: 'none'
            });
          }
        });
      },
      fail: (error) => {
        console.error('文件下载失败:', error);
        wx.showToast({
          title: '文件下载失败',
          icon: 'none'
        });
      }
    });
  },

  // 分享案例
  shareCase() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShareAppMessage() {
    const caseData = this.data.caseData;
    return {
      title: caseData.caseName,
      desc: caseData.description,
      path: `/pages/typicalcasesquery/typicalcasesquery_detail?id=${caseData.id}`
    };
  },

  onShareTimeline() {
    const caseData = this.data.caseData;
    return {
      title: caseData.caseName,
      desc: caseData.description,
      path: `/pages/typicalcasesquery/typicalcasesquery_detail?id=${caseData.id}`
    };
  }
}); 