Page({
  data: {
    // 典型案例名称
    caseName: '',
    
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
    console.log('典型案例添加页面加载');
    this.initPage();
  },

  // 初始化页面
  initPage() {
    // 检查用户权限
    this.checkUserPermission();
  },

  // 检查用户权限
  checkUserPermission() {
    // 开发环境跳过权限检查
    const apiConfig = require('../../config/api.js');
    if (apiConfig.isMockEnabled()) {
      console.log('开发环境：跳过权限检查');
      return;
    }

    // TODO: 调用后端接口检查用户是否有添加典型案例的权限
    // 接口：GET /api/user/permissions
    wx.request({
      url: apiConfig.buildApiUrl(apiConfig.api.user.permissions),
      method: 'GET',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      success: (res) => {
        if (res.data.success && res.data.permissions.includes('add_typical_case')) {
          console.log('用户有添加典型案例权限');
        } else {
          wx.showModal({
            title: '权限不足',
            content: '您没有添加典型案例的权限，请联系管理员。',
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
      itemList: ['选择PDF文档', '选择Word文档'],
      success: (res) => {
        const fileTypes = ['pdf', 'doc'];
        const selectedType = fileTypes[res.tapIndex];
        this.chooseDocumentFiles(selectedType);
      }
    });
  },

  // 选择图片文件（已移除，只支持PDF和DOC）
  chooseImageFiles() {
    wx.showToast({
      title: '暂不支持图片上传',
      icon: 'none'
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
    const apiConfig = require('../../config/api.js');
    
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
    if (apiConfig.isMockEnabled()) {
      setTimeout(() => {
        clearInterval(progressTimer);
        this.setData({
          fileUploadProgress: 100,
          isUploading: false
        });

        // 模拟上传成功
        const fileSize = files[0].size || 1024 * 1024;
        const uploadedFile = {
          id: Date.now(),
          name: files[0].name || `文件_${Date.now()}.${fileType}`,
          url: files[0].tempFilePath,
          type: fileType,
          size: fileSize,
          sizeFormatted: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
          uploadTime: new Date().toISOString()
        };

        this.setData({
          uploadedFiles: [...this.data.uploadedFiles, uploadedFile]
        });

        // 显示更明显的成功提示
        wx.showModal({
          title: '✅ 上传成功',
          content: `文件"${uploadedFile.name}"已成功上传！\n\n文件大小：${uploadedFile.sizeFormatted}\n文件类型：${fileType.toUpperCase()}`,
          showCancel: false,
          confirmText: '确定',
          success: () => {
            // 显示Toast提示
            wx.showToast({
              title: '文件已添加到预览列表',
              icon: 'success',
              duration: 2000
            });
          }
        });
      }, 2000);
      return;
    }

    // 生产环境：实际上传到服务器
    const serverUrl = apiConfig.buildApiUrl(apiConfig.api.typicalCases.uploadFiles);
    
    wx.uploadFile({
      url: serverUrl,
      filePath: files[0].tempFilePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      formData: {
        fileType: fileType,
        caseId: Date.now() // 临时案例ID
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
            const fileSize = files[0].size;
            const uploadedFile = {
              id: result.fileId,
              name: files[0].name,
              url: result.fileUrl,
              type: fileType,
              size: fileSize,
              sizeFormatted: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
              uploadTime: new Date().toISOString()
            };

            this.setData({
              uploadedFiles: [...this.data.uploadedFiles, uploadedFile]
            });

            // 显示更明显的成功提示
            wx.showModal({
              title: '✅ 上传成功',
              content: `文件"${uploadedFile.name}"已成功上传到服务器！\n\n文件大小：${uploadedFile.sizeFormatted}\n文件类型：${fileType.toUpperCase()}`,
              showCancel: false,
              confirmText: '确定',
              success: () => {
                wx.showToast({
                  title: '文件已添加到预览列表',
                  icon: 'success',
                  duration: 2000
                });
              }
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
    const apiConfig = require('../../config/api.js');
    
    // 验证URL格式
    if (!this.isValidUrl(url)) {
      wx.showToast({
        title: '请输入有效的链接地址',
        icon: 'none'
      });
      return;
    }

    // 开发环境：模拟添加成功
    if (apiConfig.isMockEnabled()) {
      const newsLink = {
        id: Date.now(),
        title: title,
        url: url,
        addTime: new Date().toISOString()
      };

      this.setData({
        newsLinks: [...this.data.newsLinks, newsLink]
      });

      // 显示更明显的成功提示
      wx.showModal({
        title: '✅ 链接添加成功',
        content: `新闻链接"${title}"已成功添加！\n\n链接地址：${url}\n添加时间：${new Date().toLocaleString()}`,
        showCancel: false,
        confirmText: '确定',
        success: () => {
          wx.showToast({
            title: '链接已添加到预览列表',
            icon: 'success',
            duration: 2000
          });
        }
      });
      return;
    }

    // 生产环境：调用后端接口保存新闻链接
    // 接口：POST /api/typical-cases/add-news-link
    wx.request({
      url: apiConfig.buildApiUrl(apiConfig.api.typicalCases.addNewsLink),
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: {
        title: title,
        url: url,
        caseId: Date.now() // 临时案例ID
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

          // 显示更明显的成功提示
          wx.showModal({
            title: '✅ 链接添加成功',
            content: `新闻链接"${title}"已成功保存到服务器！\n\n链接地址：${url}\n添加时间：${new Date().toLocaleString()}`,
            showCancel: false,
            confirmText: '确定',
            success: () => {
              wx.showToast({
                title: '链接已添加到预览列表',
                icon: 'success',
                duration: 2000
              });
            }
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
    // 更宽松的URL验证
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(string) || string.startsWith('http://') || string.startsWith('https://');
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
    const apiConfig = require('../../config/api.js');
    
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

    // 开发环境：模拟上传成功
    if (apiConfig.isMockEnabled()) {
      setTimeout(() => {
        clearInterval(progressTimer);
        this.setData({
          videoUploadProgress: 100,
          isUploading: false
        });

        // 模拟上传成功
        const videoSize = videos[0].size || 1024 * 1024;
        const uploadedVideo = {
          id: Date.now(),
          name: videos[0].name || `视频_${Date.now()}.mp4`,
          url: videos[0].tempFilePath,
          size: videoSize,
          sizeFormatted: `${(videoSize / 1024 / 1024).toFixed(2)}MB`,
          duration: videos[0].duration || 60,
          uploadTime: new Date().toISOString()
        };

        this.setData({
          uploadedVideos: [...this.data.uploadedVideos, uploadedVideo]
        });

        // 显示更明显的成功提示
        wx.showModal({
          title: '✅ 视频上传成功',
          content: `视频"${uploadedVideo.name}"已成功上传！\n\n视频大小：${uploadedVideo.sizeFormatted}\n视频时长：${uploadedVideo.duration}秒`,
          showCancel: false,
          confirmText: '确定',
          success: () => {
            wx.showToast({
              title: '视频已添加到预览列表',
              icon: 'success',
              duration: 2000
            });
          }
        });
      }, 2000);
      return;
    }

    // 生产环境：实际上传到服务器
    const serverUrl = apiConfig.buildApiUrl(apiConfig.api.typicalCases.uploadVideos);
    
    wx.uploadFile({
      url: serverUrl,
      filePath: videos[0].tempFilePath,
      name: 'video',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`
      },
      formData: {
        caseId: Date.now() // 临时案例ID
      },
      success: (res) => {
        clearInterval(progressTimer);
        this.setData({
          videoUploadProgress: 100,
          isUploading: false
        });

        try {
          const result = JSON.parse(res.data);
          if (result.success) {
            // 添加到已上传视频列表
            const videoSize = videos[0].size;
            const uploadedVideo = {
              id: result.videoId,
              name: videos[0].name || `视频_${Date.now()}.mp4`,
              url: result.videoUrl,
              size: videoSize,
              sizeFormatted: `${(videoSize / 1024 / 1024).toFixed(2)}MB`,
              duration: videos[0].duration,
              uploadTime: new Date().toISOString()
            };

            this.setData({
              uploadedVideos: [...this.data.uploadedVideos, uploadedVideo]
            });

            // 显示更明显的成功提示
            wx.showModal({
              title: '✅ 视频上传成功',
              content: `视频"${uploadedVideo.name}"已成功上传到服务器！\n\n视频大小：${uploadedVideo.sizeFormatted}\n视频时长：${uploadedVideo.duration}秒`,
              showCancel: false,
              confirmText: '确定',
              success: () => {
                wx.showToast({
                  title: '视频已添加到预览列表',
                  icon: 'success',
                  duration: 2000
                });
              }
            });
          } else {
            wx.showToast({
              title: result.message || '视频上传失败',
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
        console.error('视频上传失败:', err);
        
        let errorMsg = '视频上传失败';
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

  // 删除已上传的文件
  deleteFile(e) {
    const fileId = e.currentTarget.dataset.id;
    
    // 调用后端接口删除文件
    // 接口：DELETE /api/typical-cases/delete-file/{fileId}
    wx.request({
      url: `http://127.0.0.1:5000/api/typical-cases/delete-file/${fileId}`,
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
    // 接口：DELETE /api/typical-cases/delete-news-link/{linkId}
    wx.request({
      url: `http://127.0.0.1:5000/api/typical-cases/delete-news-link/${linkId}`,
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
    // 接口：DELETE /api/typical-cases/delete-video/{videoId}
    wx.request({
      url: `http://127.0.0.1:5000/api/typical-cases/delete-video/${videoId}`,
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
    
    wx.showActionSheet({
      itemList: ['查看文件信息', '打开文件'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 查看文件信息
          wx.showModal({
            title: '文件信息',
            content: `文件名：${file.name}\n文件大小：${file.sizeFormatted}\n文件类型：${file.type.toUpperCase()}\n上传时间：${new Date(file.uploadTime).toLocaleString()}`,
            showCancel: false
          });
        } else if (res.tapIndex === 1) {
          // 打开文件
          wx.showModal({
            title: '打开文件',
            content: `确定要打开文件"${file.name}"吗？\n\n文件类型：${file.type.toUpperCase()}\n文件大小：${file.sizeFormatted}`,
            success: (modalRes) => {
              if (modalRes.confirm) {
                // 这里可以调用文件打开API
                wx.showToast({
                  title: '文件打开功能开发中',
                  icon: 'none'
                });
              }
            }
          });
        }
      }
    });
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
    
    wx.showActionSheet({
      itemList: ['查看链接信息', '打开链接'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 查看链接信息
          wx.showModal({
            title: '链接信息',
            content: `新闻标题：${link.title}\n链接地址：${link.url}\n添加时间：${new Date(link.addTime).toLocaleString()}`,
            showCancel: false
          });
        } else if (res.tapIndex === 1) {
          // 打开链接
          wx.showModal({
            title: '打开链接',
            content: `确定要打开新闻链接"${link.title}"吗？\n\n链接地址：${link.url}`,
            success: (modalRes) => {
              if (modalRes.confirm) {
                // 复制链接到剪贴板
                wx.setClipboardData({
                  data: link.url,
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
        }
      }
    });
  },

  // 典型案例名称输入
  onCaseNameInput(e) {
    this.setData({
      caseName: e.detail.value
    });
  },

  // 预览所有内容
  previewAllContent() {
    if (!this.data.caseName.trim()) {
      wx.showToast({
        title: '请先输入典型案例名称',
        icon: 'none'
      });
      return;
    }

    const totalItems = this.data.uploadedFiles.length + this.data.newsLinks.length + this.data.uploadedVideos.length;
    
    // 构建详细的预览内容
    let previewContent = `📋 典型案例预览\n\n`;
    previewContent += `📝 项目标题：${this.data.caseName}\n\n`;
    
    if (this.data.uploadedFiles.length > 0) {
      previewContent += `📄 文件 (${this.data.uploadedFiles.length}个)：\n`;
      this.data.uploadedFiles.forEach((file, index) => {
        previewContent += `  ${index + 1}. ${file.name} (${file.sizeFormatted})\n`;
      });
      previewContent += '\n';
    }
    
    if (this.data.uploadedVideos.length > 0) {
      previewContent += `🎥 视频 (${this.data.uploadedVideos.length}个)：\n`;
      this.data.uploadedVideos.forEach((video, index) => {
        previewContent += `  ${index + 1}. ${video.name} (${video.sizeFormatted})\n`;
      });
      previewContent += '\n';
    }
    
    if (this.data.newsLinks.length > 0) {
      previewContent += `🔗 新闻标题 (${this.data.newsLinks.length}个)：\n`;
      this.data.newsLinks.forEach((link, index) => {
        previewContent += `  ${index + 1}. ${link.title}\n`;
      });
      previewContent += '\n';
    }
    
    previewContent += `总计：${totalItems}个项目`;
    
    wx.showModal({
      title: '📋 典型案例预览',
      content: previewContent,
      confirmText: '确认提交',
      cancelText: '继续编辑',
      success: (res) => {
        if (res.confirm) {
          this.submitAllContent();
        }
      }
    });
  },

  // 提交所有内容
  submitAllContent() {
    if (!this.data.caseName.trim()) {
      wx.showToast({
        title: '请先输入典型案例名称',
        icon: 'none'
      });
      return;
    }

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
      content: `案例名称：${this.data.caseName}\n\n文件：${this.data.uploadedFiles.length}个\n新闻链接：${this.data.newsLinks.length}个\n视频：${this.data.uploadedVideos.length}个\n\n确定要提交这些内容吗？`,
      success: (res) => {
        if (res.confirm) {
          this.submitToServer();
        }
      }
    });
  },

  // 提交到服务器
  submitToServer() {
    const apiConfig = require('../../config/api.js');
    
    wx.showLoading({
      title: '提交中...'
    });

    // 开发环境：模拟提交成功
    if (apiConfig.isMockEnabled()) {
      setTimeout(() => {
        wx.hideLoading();
        const totalItems = this.data.uploadedFiles.length + this.data.newsLinks.length + this.data.uploadedVideos.length;
        wx.showModal({
          title: '🎉 提交成功（开发模式）',
          content: `典型案例"${this.data.caseName}"已成功提交！\n\n📄 文件：${this.data.uploadedFiles.length}个\n🔗 链接：${this.data.newsLinks.length}个\n🎥 视频：${this.data.uploadedVideos.length}个\n\n总计：${totalItems}个项目\n\n（开发模式下为模拟提交）`,
          showCancel: false,
          confirmText: '完成',
          success: () => {
            wx.showToast({
              title: '提交完成，返回上一页',
              icon: 'success',
              duration: 2000
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 2000);
          }
        });
      }, 2000);
      return;
    }

    // 生产环境：实际上传到服务器
    wx.request({
      url: apiConfig.buildApiUrl('/api/typical-cases/submit-content'),
      method: 'POST',
      header: {
        'Authorization': `Bearer ${wx.getStorageSync('token')}`,
        'Content-Type': 'application/json'
      },
      data: {
        caseName: this.data.caseName,
        files: this.data.uploadedFiles,
        newsLinks: this.data.newsLinks,
        videos: this.data.uploadedVideos,
        submitTime: new Date().toISOString()
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.success) {
          // 显示详细的成功提示
          const totalItems = this.data.uploadedFiles.length + this.data.newsLinks.length + this.data.uploadedVideos.length;
          wx.showModal({
            title: '🎉 提交成功',
            content: `典型案例"${this.data.caseName}"已成功提交到服务器！\n\n📄 文件：${this.data.uploadedFiles.length}个\n🔗 链接：${this.data.newsLinks.length}个\n🎥 视频：${this.data.uploadedVideos.length}个\n\n总计：${totalItems}个项目`,
            showCancel: false,
            confirmText: '完成',
            success: () => {
              wx.showToast({
                title: '提交完成，返回上一页',
                icon: 'success',
                duration: 2000
              });
              setTimeout(() => {
                wx.navigateBack();
              }, 2000);
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

  // 清空文件列表
  clearFiles() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有已上传的文件吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            uploadedFiles: []
          });
          wx.showToast({
            title: '文件已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  // 清空新闻链接列表
  clearNewsLinks() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有新闻链接吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            newsLinks: []
          });
          wx.showToast({
            title: '新闻链接已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  // 清空视频列表
  clearVideos() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有已上传的视频吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            uploadedVideos: []
          });
          wx.showToast({
            title: '视频已清空',
            icon: 'success'
          });
        }
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