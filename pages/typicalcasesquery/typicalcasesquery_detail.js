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

  loadCaseDetail() {
    this.setData({ loading: true });

    const apiConfig = require('../../config/api.js');

    if (apiConfig.isMockEnabled()) {
      // 开发模式：从本地存储和默认数据加载
      setTimeout(() => {
        const storedCases = wx.getStorageSync('typicalCases') || [];
        const defaultCases = this.getDefaultCases();
        const allCases = [...defaultCases, ...storedCases];

        const caseData = allCases.find(item => item.id === this.data.caseId);

        if (caseData) {
          // 格式化案例数据，确保所有字段都存在
          const formattedCase = {
            ...caseData,
            caseName: caseData.caseName || caseData.title,
            description: caseData.description || caseData.summary || '暂无描述',
            files: (caseData.files || []).map(file => ({
              ...file,
              fileType: this.getFileType(file.name),
              fileUrl: file.url || '#', // 开发模式下使用占位符
              fileName: file.name,
              fileSize: file.sizeFormatted || file.size
            })),
            videos: (caseData.videos || []).map(video => ({
              ...video,
              videoUrl: video.url || '#', // 开发模式下使用占位符
              videoName: video.name,
              videoDuration: video.duration
            })),
            links: (caseData.links || []).map(link => ({
              ...link,
              linkUrl: link.url,
              linkTitle: link.title
            }))
          };

          this.setData({
            caseData: formattedCase,
            loading: false
          });
        } else {
          wx.showToast({
            title: '案例不存在',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      }, 500);
      return;
    }

    // 生产模式：调用数据库服务
    try {
      const dbService = require('../../utils/databaseService.js');
      const db = new dbService();

      db.getTypicalCaseById(this.data.caseId).then(result => {
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
      }).catch(error => {
        console.error('加载案例详情失败:', error);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      });
    } catch (error) {
      console.error('加载案例详情失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 获取默认案例数据
  getDefaultCases() {
    return [
      {
        id: 1,
        caseName: '智慧城市建设典型案例',
        title: '智慧城市建设典型案例',
        category: '基础设施建设',
        createDate: '2024-01-15',
        uploadTime: '2024-01-15 10:30:00',
        description: '通过物联网、大数据、人工智能等技术，构建智慧城市管理平台，实现城市治理现代化，提升市民生活质量。',
        author: '市信息化办公室',
        contact: '张主任 - 13800138000',
        files: [
          { name: '智慧城市建设方案.pdf', size: '2.5MB', sizeFormatted: '2.5MB' },
          { name: '技术架构图.png', size: '1.2MB', sizeFormatted: '1.2MB' }
        ],
        videos: [
          { name: '智慧城市演示视频.mp4', duration: '5:30' }
        ],
        links: [
          { title: '智慧城市官方网站', url: 'https://smartcity.example.com' }
        ]
      },
      {
        id: 2,
        caseName: '绿色能源示范园区建设案例',
        title: '绿色能源示范园区建设案例',
        category: '环保治理',
        createDate: '2024-02-10',
        uploadTime: '2024-02-10 14:20:00',
        description: '建设集太阳能、风能、储能于一体的绿色能源示范园区，实现清洁能源的高效利用和智能管理。',
        author: '市发改委',
        contact: '李处长 - 13900139000',
        files: [
          { name: '绿色能源规划书.docx', size: '3.1MB', sizeFormatted: '3.1MB' },
          { name: '能源效率报告.xlsx', size: '800KB', sizeFormatted: '800KB' }
        ],
        videos: [
          { name: '园区建设纪录片.mp4', duration: '8:45' }
        ],
        links: [
          { title: '绿色能源政策解读', url: 'https://greenenergy.example.com' }
        ]
      },
      {
        id: 3,
        caseName: '数字化教育改革实践案例',
        title: '数字化教育改革实践案例',
        category: '民生改善',
        createDate: '2024-03-05',
        uploadTime: '2024-03-05 09:15:00',
        description: '运用数字技术改革传统教育模式，建设智慧校园，推进教育公平和质量提升。',
        author: '市教育局',
        contact: '王局长 - 13700137000',
        files: [
          { name: '数字化教育方案.pdf', size: '4.2MB', sizeFormatted: '4.2MB' },
          { name: '教学效果评估.pptx', size: '6.8MB', sizeFormatted: '6.8MB' }
        ],
        videos: [
          { name: '智慧课堂演示.mp4', duration: '12:20' }
        ],
        links: [
          { title: '数字化教育平台', url: 'https://education.example.com' },
          { title: '在线学习资源', url: 'https://learning.example.com' }
        ]
      }
    ];
  },

  // 获取文件类型
  getFileType(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': 'pdf',
      'doc': 'doc',
      'docx': 'docx',
      'xls': 'excel',
      'xlsx': 'excel',
      'ppt': 'ppt',
      'pptx': 'ppt',
      'png': 'image',
      'jpg': 'image',
      'jpeg': 'image',
      'gif': 'image'
    };
    return typeMap[ext] || 'other';
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
    const apiConfig = require('../../config/api.js');

    if (apiConfig.isMockEnabled()) {
      // 开发模式：显示文件信息
      wx.showModal({
        title: '文件预览（开发模式）',
        content: `文件名：${file.fileName}\n文件大小：${file.fileSize}\n文件类型：${file.fileType}\n\n开发模式下无法实际打开文件，生产环境中将支持文件预览功能。`,
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }

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
    } else if (file.fileType === 'image') {
      // 图片预览
      wx.previewImage({
        urls: [file.fileUrl],
        current: file.fileUrl
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
    const apiConfig = require('../../config/api.js');

    if (apiConfig.isMockEnabled()) {
      // 开发模式：显示视频信息
      wx.showModal({
        title: '视频播放（开发模式）',
        content: `视频名称：${video.videoName}\n视频时长：${video.videoDuration}\n\n开发模式下无法实际播放视频，生产环境中将支持视频播放功能。`,
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/video-player/video-player?url=${encodeURIComponent(video.videoUrl)}&title=${encodeURIComponent(video.videoName)}`
    });
  },

  // 打开链接
  openLink(e) {
    const link = e.currentTarget.dataset.link;

    wx.showModal({
      title: '打开链接',
      content: `链接标题：${link.linkTitle}\n链接地址：${link.linkUrl}\n\n是否复制链接到剪贴板？`,
      confirmText: '复制链接',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 复制链接到剪贴板
          wx.setClipboardData({
            data: link.linkUrl,
            success: () => {
              wx.showToast({
                title: '链接已复制到剪贴板',
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