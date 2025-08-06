Page({
  data: {
    caseId: null,
    caseData: null,
    loading: true,
    fileCount: 0,
    videoCount: 0,
    linkCount: 0,
    detailContent: ''
  },

  onLoad(options) {
    console.log('案例文档页面加载', options);
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

          // 生成详细内容
          const detailContent = this.generateDetailContent(formattedCase);

          this.setData({
            caseData: formattedCase,
            fileCount: (formattedCase.files && formattedCase.files.length) || 0,
            videoCount: (formattedCase.videos && formattedCase.videos.length) || 0,
            linkCount: (formattedCase.links && formattedCase.links.length) || 0,
            detailContent: detailContent,
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
          const caseData = result.case;
          const detailContent = this.generateDetailContent(caseData);

          this.setData({
            caseData: caseData,
            fileCount: (caseData.files && caseData.files.length) || 0,
            videoCount: (caseData.videos && caseData.videos.length) || 0,
            linkCount: (caseData.links && caseData.links.length) || 0,
            detailContent: detailContent,
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

  // 生成详细内容
  generateDetailContent(caseData) {
    const templates = {
      '智慧城市建设典型案例': '项目采用先进的物联网技术，建设了全市统一的智慧城市管理平台。通过大数据分析和人工智能算法，实现了城市交通、环境、安全等多个领域的智能化管理。项目覆盖全市12个区县，服务人口超过500万，显著提升了城市治理效率和市民生活质量。',
      '绿色能源示范园区建设案例': '园区建设了总装机容量50MW的太阳能发电系统和20MW的风力发电系统，配套建设了大型储能设施。通过智能电网技术，实现了清洁能源的高效利用和智能调度。园区年发电量达到1.2亿千瓦时，减少二氧化碳排放8万吨，成为区域绿色发展的典型示范。',
      '数字化教育改革实践案例': '项目建设了覆盖全市200所学校的数字化教育平台，开发了适合不同年龄段学生的在线学习资源。通过人工智能技术，实现了个性化教学和精准评估。项目惠及师生15万人，显著提升了教育质量和教学效率，缩小了城乡教育差距。'
    };
    
    return templates[caseData.caseName || caseData.title] || caseData.description || '暂无详细内容';
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

  // 预览文件
  previewFile(e) {
    const file = e.currentTarget.dataset.file;
    const apiConfig = require('../../config/api.js');

    if (apiConfig.isMockEnabled()) {
      // 开发模式：显示文件信息
      wx.showModal({
        title: '文件预览（开发模式）',
        content: `文件名：${file.fileName || file.name}\n文件大小：${file.fileSize || file.size}\n文件类型：${file.fileType || '未知'}\n\n开发模式下无法实际打开文件，生产环境中将支持文件预览功能。`,
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }

    // 生产模式：实际预览文件
    const fileUrl = file.fileUrl || file.url;

    if (!fileUrl || fileUrl === '#') {
      wx.showToast({
        title: '文件链接无效',
        icon: 'none'
      });
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '正在加载文件...'
    });

    if (file.fileType === 'image' || this.isImageFile(file.fileName || file.name)) {
      // 图片文件直接预览
      wx.hideLoading();
      wx.previewImage({
        urls: [fileUrl],
        current: fileUrl,
        fail: (error) => {
          console.error('图片预览失败:', error);
          wx.showToast({
            title: '图片预览失败',
            icon: 'none'
          });
        }
      });
    } else if (file.fileType === 'pdf' || file.fileType === 'doc' || file.fileType === 'docx' ||
               file.fileType === 'excel' || file.fileType === 'ppt' || this.isDocumentFile(file.fileName || file.name)) {
      // 文档文件下载后打开
      wx.downloadFile({
        url: fileUrl,
        header: {
          'Content-Type': 'application/octet-stream'
        },
        success: (res) => {
          wx.hideLoading();
          if (res.statusCode === 200) {
            wx.openDocument({
              filePath: res.tempFilePath,
              fileType: file.fileType || this.getFileTypeFromName(file.fileName || file.name),
              success: () => {
                console.log('文档打开成功');
              },
              fail: (error) => {
                console.error('文档打开失败:', error);
                wx.showModal({
                  title: '文件打开失败',
                  content: '可能是文件格式不支持或文件已损坏，请尝试下载到本地查看。',
                  confirmText: '下载文件',
                  cancelText: '取消',
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      this.downloadFile(e);
                    }
                  }
                });
              }
            });
          } else {
            wx.hideLoading();
            wx.showToast({
              title: '文件下载失败',
              icon: 'none'
            });
          }
        },
        fail: (error) => {
          wx.hideLoading();
          console.error('文件下载失败:', error);
          wx.showModal({
            title: '文件下载失败',
            content: '网络连接异常或文件不存在，请检查网络连接后重试。',
            showCancel: false,
            confirmText: '知道了'
          });
        }
      });
    } else {
      // 其他类型文件提示下载
      wx.hideLoading();
      wx.showModal({
        title: '文件类型提示',
        content: '该文件类型暂不支持在线预览，是否下载到本地查看？',
        confirmText: '下载',
        cancelText: '取消',
        success: (modalRes) => {
          if (modalRes.confirm) {
            this.downloadFile(e);
          }
        }
      });
    }
  },

  // 判断是否为图片文件
  isImageFile(fileName) {
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
    const ext = fileName.split('.').pop().toLowerCase();
    return imageExts.includes(ext);
  },

  // 判断是否为文档文件
  isDocumentFile(fileName) {
    const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    const ext = fileName.split('.').pop().toLowerCase();
    return docExts.includes(ext);
  },

  // 从文件名获取文件类型
  getFileTypeFromName(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': 'pdf',
      'doc': 'doc',
      'docx': 'docx',
      'xls': 'xls',
      'xlsx': 'xlsx',
      'ppt': 'ppt',
      'pptx': 'pptx'
    };
    return typeMap[ext] || ext;
  },

  // 下载文件
  downloadFile(e) {
    const file = e.currentTarget.dataset.file;
    const apiConfig = require('../../config/api.js');

    if (apiConfig.isMockEnabled()) {
      wx.showToast({
        title: '下载功能开发中',
        icon: 'none'
      });
      return;
    }

    const fileUrl = file.fileUrl || file.url;

    if (!fileUrl || fileUrl === '#') {
      wx.showToast({
        title: '文件链接无效',
        icon: 'none'
      });
      return;
    }

    // 显示下载进度
    wx.showLoading({
      title: '正在下载...'
    });

    const downloadTask = wx.downloadFile({
      url: fileUrl,
      header: {
        'Content-Type': 'application/octet-stream'
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          // 保存文件到本地
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success: (saveRes) => {
              wx.showModal({
                title: '下载成功',
                content: `文件已保存到本地\n文件名：${file.fileName || file.name}`,
                confirmText: '打开文件',
                cancelText: '知道了',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    // 尝试打开已保存的文件
                    wx.openDocument({
                      filePath: saveRes.savedFilePath,
                      success: () => {
                        console.log('文件打开成功');
                      },
                      fail: (error) => {
                        console.error('文件打开失败:', error);
                        wx.showToast({
                          title: '文件已保存，但无法打开',
                          icon: 'none'
                        });
                      }
                    });
                  }
                }
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
        } else {
          wx.showToast({
            title: '文件下载失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        wx.hideLoading();
        console.error('文件下载失败:', error);
        wx.showModal({
          title: '下载失败',
          content: '网络连接异常或文件不存在，请检查网络连接后重试。',
          showCancel: false,
          confirmText: '知道了'
        });
      }
    });

    // 监听下载进度
    downloadTask.onProgressUpdate((res) => {
      if (res.progress > 0) {
        wx.showLoading({
          title: `下载中 ${res.progress}%`
        });
      }
    });
  },

  // 播放视频
  playVideo(e) {
    const video = e.currentTarget.dataset.video;
    const apiConfig = require('../../config/api.js');

    if (apiConfig.isMockEnabled()) {
      // 开发模式：显示视频信息
      wx.showModal({
        title: '视频播放（开发模式）',
        content: `视频名称：${video.videoName || video.name}\n视频时长：${video.videoDuration || video.duration || '未知'}\n\n开发模式下无法实际播放视频，生产环境中将支持视频播放功能。`,
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
      title: '打开新闻链接',
      content: `新闻标题：${link.linkTitle || link.title}\n链接地址：${link.linkUrl || link.url}\n\n是否复制链接到剪贴板？`,
      confirmText: '复制链接',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: link.linkUrl || link.url,
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
          { name: '智慧城市建设方案.pdf', size: '2.5MB' },
          { name: '技术架构图.png', size: '1.2MB' }
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
          { name: '绿色能源规划书.docx', size: '3.1MB' },
          { name: '能源效率报告.xlsx', size: '800KB' }
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
          { name: '数字化教育方案.pdf', size: '4.2MB' },
          { name: '教学效果评估.pptx', size: '6.8MB' }
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
      path: `/pages/case_document/case_document?id=${caseData.id}`
    };
  },

  onShareTimeline() {
    const caseData = this.data.caseData;
    return {
      title: caseData.caseName,
      desc: caseData.description,
      path: `/pages/case_document/case_document?id=${caseData.id}`
    };
  }
});
