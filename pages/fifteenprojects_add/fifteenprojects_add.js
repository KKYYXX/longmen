// 导入API配置
const apiConfig = require('../../config/api.js');
// 导入文件上传工具
const fileUpload = require('../../utils/fileUpload.js');

Page({
  data: {
    // 文件上传相关
    uploadedFiles: [],
    fileUploadProgress: 0,
    
    // 新闻链接相关
    newsLinks: [],
    
    // 视频上传相关
    uploadedVideos: [],
    videoUploadProgress: 0,
    
    // 上传状态
    isUploading: false
  },

  onLoad() {
    console.log('十五项项目添加页面加载');
    this.initPage();
  },

  // 初始化页面
  initPage() {
    // 页面初始化完成
    console.log('十五项项目添加页面初始化完成');
  },

  // 文件上传功能
  uploadFiles() {
    wx.showActionSheet({
      itemList: ['选择PDF文档', '选择Word文档', '选择Excel文档', '选择图片文档'],
      success: (res) => {
        const fileTypes = ['pdf', 'doc', 'xlsx', 'image'];
        const selectedType = fileTypes[res.tapIndex];
        
        if (selectedType === 'image') {
          this.chooseImageFiles();
        } else {
          this.chooseDocumentFiles(selectedType);
        }
      }
    });
  },

  // 选择图片文件
  chooseImageFiles() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('选择的图片文件:', res.tempFiles);
        this.uploadFilesToServer(res.tempFiles, 'image');
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  // 选择文档文件
  chooseDocumentFiles(fileType) {
    // 使用微信的文件选择API
    wx.chooseMessageFile({
      count: 3,
      type: 'file',
      success: (res) => {
        console.log('选择的文件:', res.tempFiles);
        
        // 过滤和验证文件类型
        const validFiles = res.tempFiles.filter(file => {
          const fileExtension = file.name.split('.').pop().toLowerCase();
          const allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
          
          if (!allowedTypes.includes(fileExtension)) {
            wx.showToast({
              title: `只支持 ${allowedTypes.join(', ')} 格式`,
              icon: 'none'
            });
            return false;
          }
          
          // 检查文件大小（50MB限制）
          const maxSize = 50 * 1024 * 1024;
          if (file.size > maxSize) {
            wx.showToast({
              title: '文件大小不能超过50MB',
              icon: 'none'
            });
            return false;
          }
          
          return true;
        });
        
        if (validFiles.length > 0) {
          this.uploadFilesToServer(validFiles, 'document');
        } else {
          wx.showToast({
            title: '没有有效的文件被选择',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('选择文件失败:', err);
        wx.showToast({
          title: '选择文件失败',
          icon: 'none'
        });
      }
    });
  },

  // 上传文件到服务器
  uploadFilesToServer(files, fileType) {
    console.log('开始上传文件:', files);

    // 批量上传文件到服务器
    const uploadPromises = files.map((file, index) => {
      const fileName = file.name || `文件_${Date.now()}_${index}.${fileType}`;
      return fileUpload.uploadDocument(file.tempFilePath, fileName);
    });

    Promise.all(uploadPromises)
      .then(results => {
        // 处理上传结果
        results.forEach((result, index) => {
          if (result.success) {
            // 添加到已上传文件列表
            const uploadedFile = {
              id: Date.now() + index,
              name: result.fileName,
              url: result.fileUrl,
              serverUrl: result.fileUrl,
              type: fileType,
              size: result.fileSize,
              sizeText: fileUpload.formatFileSize(result.fileSize),
              uploadTime: new Date().toISOString()
            };

            this.setData({
              uploadedFiles: [...this.data.uploadedFiles, uploadedFile]
            });
          } else {
            wx.showToast({
              title: `文件${index + 1}上传失败: ${result.error || '未知错误'}`,
              icon: 'none'
            });
          }
        });

        const successCount = results.filter(r => r.success).length;
        if (successCount > 0) {
          wx.showToast({
            title: `已上传${successCount}个文件`,
            icon: 'success'
          });
        }
      })
      .catch(error => {
        console.error('文件上传失败:', error);
        wx.showToast({
          title: `文件上传失败: ${error.message}`,
          icon: 'none'
        });
      });
  },

  // 新闻链接上传功能
  uploadNewsLinks() {
    wx.showModal({
      title: '添加新闻链接',
      editable: true,
      placeholderText: '请输入新闻标题',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          wx.showModal({
            title: '输入链接地址',
            editable: true,
            placeholderText: '请输入新闻链接URL',
            success: (urlRes) => {
              if (urlRes.confirm && urlRes.content.trim()) {
                this.addNewsLink(res.content.trim(), urlRes.content.trim());
              }
            }
          });
        }
      }
    });
  },

  // 添加新闻链接
  addNewsLink(title, url) {
    // 验证URL格式
    if (!this.isValidUrl(url)) {
      wx.showToast({
        title: '请输入有效的链接地址',
        icon: 'none'
      });
      return;
    }

    // 调用后端接口保存新闻链接
    // 接口：POST /api/fifteen-projects/add-news-link
    wx.request({
      url: apiConfig.buildUrl('/api/fifteen-projects/add-news-link'),
      method: 'POST',
      header: {
        // 注释掉token验证
        // 'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: {
        title: title,
        url: url,
        projectId: Date.now() // 临时项目ID
      },
      success: (res) => {
        if (res.data.success) {
          const newsLink = {
            id: res.data.linkId,
            title: title,
            url: url,
            addTime: new Date().toISOString()
          };

          this.setData({
            newsLinks: [...this.data.newsLinks, newsLink]
          });

          wx.showToast({
            title: '新闻链接添加成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message || '新闻链接添加失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('添加新闻链接失败:', err);
        wx.showToast({
          title: '新闻链接添加失败',
          icon: 'none'
        });
      }
    });
  },

  // 验证URL格式
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  },

  // 视频上传功能
  uploadVideos() {
    // 显示选择来源的弹窗
    wx.showActionSheet({
      itemList: ['从相册选择', '从聊天记录选择', '拍摄视频'],
      success: (res) => {
        let sourceType = [];
        switch (res.tapIndex) {
          case 0: // 相册
            sourceType = ['album'];
            break;
          case 1: // 聊天记录
            sourceType = ['album']; // 微信会自动显示聊天记录选项
            break;
          case 2: // 拍摄
            sourceType = ['camera'];
            break;
          default:
            return;
        }
        
        wx.chooseMedia({
          count: 3,
          mediaType: ['video'],
          sourceType: sourceType,
          maxDuration: 300, // 最大5分钟
          success: (res) => {
            console.log('选择的视频文件:', res.tempFiles);
            this.uploadVideosToServer(res.tempFiles);
          },
          fail: (err) => {
            console.error('选择视频失败:', err);
            wx.showToast({
              title: '选择视频失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  // 上传视频到服务器
  uploadVideosToServer(videos) {
    console.log('开始上传视频:', videos);

    // 批量上传视频到服务器
    const uploadPromises = videos.map((video, index) => {
      const fileName = video.name || `文件_${Date.now()}_${index}.mp4`;
      return fileUpload.uploadVideo(video.tempFilePath, fileName);
    });

    Promise.all(uploadPromises)
      .then(results => {
        // 处理上传结果
        results.forEach((result, index) => {
          if (result.success) {
            // 添加到已上传视频列表
            const uploadedVideo = {
              id: Date.now() + index,
              name: result.fileName,
              url: result.fileUrl,
              serverUrl: result.fileUrl,
              size: result.fileSize,
              sizeText: fileUpload.formatFileSize(result.fileSize),
              duration: videos[index].duration,
              uploadTime: new Date().toISOString()
            };

            this.setData({
              uploadedVideos: [...this.data.uploadedVideos, uploadedVideo]
            });
          } else {
            wx.showToast({
              title: `视频${index + 1}上传失败: ${result.error || '未知错误'}`,
              icon: 'none'
            });
          }
        });

        const successCount = results.filter(r => r.success).length;
        if (successCount > 0) {
          wx.showToast({
            title: `已上传${successCount}个视频`,
            icon: 'success'
          });
        }
      })
      .catch(error => {
        console.error('视频上传失败:', error);
        wx.showToast({
          title: `视频上传失败: ${error.message}`,
          icon: 'none'
        });
      });
  },

  // 删除已上传的文件
  deleteFile(e) {
    const fileId = e.currentTarget.dataset.id;
    
    // 调用后端接口删除文件
    // 接口：DELETE /api/fifteen-projects/delete-file/{fileId}
    wx.request({
      url: apiConfig.buildUrl(`/api/fifteen-projects/delete-file/${fileId}`),
      method: 'DELETE',
      header: {
        // 注释掉token验证
        // 'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.data.success) {
          const files = this.data.uploadedFiles.filter(file => file.id !== fileId);
          this.setData({
            uploadedFiles: files
          });
          wx.showToast({
            title: '文件删除成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message || '文件删除失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('删除文件失败:', err);
        wx.showToast({
          title: '文件删除失败',
          icon: 'none'
        });
      }
    });
  },

  // 删除新闻链接
  deleteNewsLink(e) {
    const linkId = e.currentTarget.dataset.id;
    
    // 调用后端接口删除新闻链接
    // 接口：DELETE /api/fifteen-projects/delete-news-link/{linkId}
    wx.request({
      url: apiConfig.buildUrl(`/api/fifteen-projects/delete-news-link/${linkId}`),
      method: 'DELETE',
      header: {
        // 注释掉token验证
        // 'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.data.success) {
          const links = this.data.newsLinks.filter(link => link.id !== linkId);
          this.setData({
            newsLinks: links
          });
          wx.showToast({
            title: '新闻链接删除成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message || '新闻链接删除失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('删除新闻链接失败:', err);
        wx.showToast({
          title: '新闻链接删除失败',
          icon: 'none'
        });
      }
    });
  },

  // 删除已上传的视频
  deleteVideo(e) {
    const videoId = e.currentTarget.dataset.id;
    
    // 调用后端接口删除视频
    // 接口：DELETE /api/fifteen-projects/delete-video/{videoId}
    wx.request({
      url: apiConfig.buildUrl(`/api/fifteen-projects/delete-video/${videoId}`),
      method: 'DELETE',
      header: {
        // 注释掉token验证
        // 'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.data.success) {
          const videos = this.data.uploadedVideos.filter(video => video.id !== videoId);
          this.setData({
            uploadedVideos: videos
          });
          wx.showToast({
            title: '视频删除成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message || '视频删除失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('删除视频失败:', err);
        wx.showToast({
          title: '视频删除失败',
          icon: 'none'
        });
      }
    });
  },

  // 预览文件
  previewFile(e) {
    const file = e.currentTarget.dataset.file;
    if (file.type === 'image') {
      wx.previewImage({
        urls: [file.url],
        current: file.url
      });
    } else {
      wx.showModal({
        title: '文件预览',
        content: `文件：${file.name}\n大小：${(file.size / 1024 / 1024).toFixed(2)}MB\n类型：${file.type}`,
        showCancel: false
      });
    }
  },

  // 预览视频
  previewVideo(e) {
    const video = e.currentTarget.dataset.video;
    wx.navigateTo({
      url: `/pages/video-player/video-player?url=${encodeURIComponent(video.url)}&title=${encodeURIComponent(video.name)}`
    });
  },

  // 打开新闻链接
  openNewsLink(e) {
    const link = e.currentTarget.dataset.link;
    wx.setClipboardData({
      data: link.url,
      success: () => {
        wx.showToast({
          title: '链接已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  // 提交所有内容
  submitAllContent() {
    if (this.data.uploadedFiles.length === 0 && 
        this.data.newsLinks.length === 0 && 
        this.data.uploadedVideos.length === 0) {
      wx.showToast({
        title: '请至少上传一个文件、链接或视频',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认提交',
      content: `文件：${this.data.uploadedFiles.length}个\n新闻链接：${this.data.newsLinks.length}个\n视频：${this.data.uploadedVideos.length}个\n\n确定要提交这些内容吗？`,
      success: (res) => {
        if (res.confirm) {
          this.submitToServer();
        }
      }
    });
  },

  // 提交到服务器
  submitToServer() {
    wx.showLoading({
      title: '提交中...'
    });

    // 调用后端接口提交所有内容
    // 接口：POST /api/fifteen-projects/submit-content
    wx.request({
      url: apiConfig.buildUrl('/api/fifteen-projects/submit-content'),
      method: 'POST',
      header: {
        // 注释掉token验证
        // 'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: {
        files: this.data.uploadedFiles,
        newsLinks: this.data.newsLinks,
        videos: this.data.uploadedVideos,
        submitTime: new Date().toISOString()
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.success) {
          wx.showModal({
            title: '提交成功',
            content: '所有内容已成功提交到服务器！',
            showCancel: false,
            success: () => {
              wx.navigateBack();
            }
          });
        } else {
          wx.showToast({
            title: res.data.message || '提交失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('提交失败:', err);
        wx.showToast({
          title: '提交失败',
          icon: 'none'
        });
      }
    });
  },

  // 返回上一页
  goBack() {
    if (this.data.uploadedFiles.length > 0 || 
        this.data.newsLinks.length > 0 || 
        this.data.uploadedVideos.length > 0) {
      wx.showModal({
        title: '确认返回',
        content: '返回将丢失已上传的内容，确定要返回吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  }
});
