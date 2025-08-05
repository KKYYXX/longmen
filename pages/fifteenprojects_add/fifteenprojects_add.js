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
    // 检查用户权限
    this.checkUserPermission();
  },

  // 检查用户权限
  checkUserPermission() {
    // TODO: 调用后端接口检查用户是否有添加十五项项目的权限
    // 接口：GET /api/user/permissions
    wx.request({
      url: 'http://127.0.0.1:5000/api/user/permissions',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.data.success && res.data.permissions.includes('add_fifteen_project')) {
          console.log('用户有添加十五项项目权限');
        } else {
          wx.showModal({
            title: '权限不足',
            content: '您没有添加十五项项目的权限，请联系管理员。',
            showCancel: false,
            success: () => {
              wx.navigateBack();
            }
          });
        }
      },
      fail: (err) => {
        console.error('检查权限失败:', err);
        // 开发环境下允许继续操作
      }
    });
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
        this.uploadFilesToServer(res.tempFiles, 'image');
      }
    });
  },

  // 选择文档文件
  chooseDocumentFiles(fileType) {
    // 使用微信的文件选择API
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: fileType === 'pdf' ? ['pdf'] : 
                 fileType === 'doc' ? ['doc', 'docx'] : 
                 fileType === 'xlsx' ? ['xlsx', 'xls'] : ['all'],
      success: (res) => {
        // 过滤文件类型
        const validFiles = res.tempFiles.filter(file => {
          const fileName = file.name.toLowerCase();
          if (fileType === 'pdf') return fileName.endsWith('.pdf');
          if (fileType === 'doc') return fileName.endsWith('.doc') || fileName.endsWith('.docx');
          if (fileType === 'xlsx') return fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
          return true;
        });
        
        if (validFiles.length > 0) {
          this.uploadFilesToServer(validFiles, fileType);
        } else {
          wx.showToast({
            title: `请选择${fileType.toUpperCase()}格式的文件`,
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
    this.setData({
      isUploading: true,
      fileUploadProgress: 0
    });

    // 显示上传进度
    const progressTimer = setInterval(() => {
      if (this.data.fileUploadProgress < 90) {
        this.setData({
          fileUploadProgress: this.data.fileUploadProgress + 10
        });
      }
    }, 200);

    // 开发环境：模拟上传成功
    if (wx.getAccountInfoSync().miniProgram.envVersion === 'develop') {
      setTimeout(() => {
        clearInterval(progressTimer);
        this.setData({
          fileUploadProgress: 100,
          isUploading: false
        });

        // 模拟上传成功
        const uploadedFile = {
          id: Date.now(),
          name: files[0].name || `文件_${Date.now()}.${fileType}`,
          url: files[0].tempFilePath,
          type: fileType,
          size: files[0].size || 1024 * 1024,
          uploadTime: new Date().toISOString()
        };

        this.setData({
          uploadedFiles: [...this.data.uploadedFiles, uploadedFile]
        });

        wx.showToast({
          title: '文件上传成功（开发模式）',
          icon: 'success'
        });
      }, 2000);
      return;
    }

    // 生产环境：实际上传到服务器
    const serverUrl = 'https://your-server-domain.com/api/fifteen-projects/upload-files';
    
    wx.uploadFile({
      url: serverUrl,
      filePath: files[0].tempFilePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      formData: {
        fileType: fileType,
        projectId: Date.now() // 临时项目ID
      },
      success: (res) => {
        clearInterval(progressTimer);
        this.setData({
          fileUploadProgress: 100,
          isUploading: false
        });

        try {
          const result = JSON.parse(res.data);
          if (result.success) {
            // 添加到已上传文件列表
            const uploadedFile = {
              id: result.fileId,
              name: files[0].name,
              url: result.fileUrl,
              type: fileType,
              size: files[0].size,
              uploadTime: new Date().toISOString()
            };

            this.setData({
              uploadedFiles: [...this.data.uploadedFiles, uploadedFile]
            });

            wx.showToast({
              title: '文件上传成功',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: result.message || '文件上传失败',
              icon: 'none'
            });
          }
        } catch (e) {
          console.error('解析响应失败:', e);
          wx.showToast({
            title: '服务器响应异常',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        clearInterval(progressTimer);
        this.setData({
          isUploading: false
        });
        console.error('文件上传失败:', err);
        
        let errorMsg = '文件上传失败';
        if (err.errMsg.includes('timeout')) {
          errorMsg = '上传超时，请检查网络';
        } else if (err.errMsg.includes('fail')) {
          errorMsg = '网络连接失败';
        }
        
        wx.showToast({
          title: errorMsg,
          icon: 'none'
        });
      }
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
      url: 'http://127.0.0.1:5000/api/fifteen-projects/add-news-link',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
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
    this.setData({
      isUploading: true,
      videoUploadProgress: 0
    });

    // 显示上传进度
    const progressTimer = setInterval(() => {
      if (this.data.videoUploadProgress < 90) {
        this.setData({
          videoUploadProgress: this.data.videoUploadProgress + 10
        });
      }
    }, 300);

    // 调用后端接口上传视频
    // 接口：POST /api/fifteen-projects/upload-videos
    wx.uploadFile({
      url: 'http://127.0.0.1:5000/api/fifteen-projects/upload-videos',
      filePath: videos[0].tempFilePath,
      name: 'video',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      formData: {
        projectId: Date.now() // 临时项目ID
      },
      success: (res) => {
        clearInterval(progressTimer);
        this.setData({
          videoUploadProgress: 100,
          isUploading: false
        });

        const result = JSON.parse(res.data);
        if (result.success) {
          // 添加到已上传视频列表
          const uploadedVideo = {
            id: result.videoId,
            name: videos[0].name || `视频_${Date.now()}.mp4`,
            url: result.videoUrl,
            size: videos[0].size,
            duration: videos[0].duration,
            uploadTime: new Date().toISOString()
          };

          this.setData({
            uploadedVideos: [...this.data.uploadedVideos, uploadedVideo]
          });

          wx.showToast({
            title: '视频上传成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: result.message || '视频上传失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        clearInterval(progressTimer);
        this.setData({
          isUploading: false
        });
        console.error('视频上传失败:', err);
        wx.showToast({
          title: '视频上传失败',
          icon: 'none'
        });
      }
    });
  },

  // 删除已上传的文件
  deleteFile(e) {
    const fileId = e.currentTarget.dataset.id;
    
    // 调用后端接口删除文件
    // 接口：DELETE /api/fifteen-projects/delete-file/{fileId}
    wx.request({
      url: `http://127.0.0.1:5000/api/fifteen-projects/delete-file/${fileId}`,
      method: 'DELETE',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
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
      url: `http://127.0.0.1:5000/api/fifteen-projects/delete-news-link/${linkId}`,
      method: 'DELETE',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
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
      url: `http://127.0.0.1:5000/api/fifteen-projects/delete-video/${videoId}`,
      method: 'DELETE',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
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
      url: 'http://127.0.0.1:5000/api/fifteen-projects/submit-content',
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
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
