// 导入API配置
const apiConfig = require('../../config/api.js');

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
    
  },

  // 文件上传功能
  uploadFiles: function() {
    console.log('uploadFiles 方法被调用');
    console.log('当前上传的文件数量:', this.data.uploadedFiles.length);

    // 检查是否已经上传了文件
    if (this.data.uploadedFiles.length > 0) {
      var self = this;
      wx.showModal({
        title: '提示',
        content: '每个案例只需上传一个文件，是否要替换当前文件？',
        success: function(res) {
          if (res.confirm) {
            // 清空当前文件，允许上传新文件
            self.setData({
              uploadedFiles: []
            });
            self.showFileTypeSelection();
          }
        }
      });
      return;
    }

    this.showFileTypeSelection();
  },

  // 显示文件类型选择
  showFileTypeSelection: function() {
    console.log('showFileTypeSelection 方法被调用');
    var self = this;
    wx.showActionSheet({
      itemList: ['选择PDF文档', '选择Word文档'],
      success: function(res) {
        var fileTypes = ['pdf', 'doc'];
        var selectedType = fileTypes[res.tapIndex];
        console.log('选择的文件类型:', selectedType);
        self.chooseDocumentFiles(selectedType);
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
  chooseDocumentFiles: function(fileType) {
    console.log('开始选择文件，类型:', fileType);
    var self = this;

    // 注释掉开发环境模拟文件选择，进行前后端联调
    // var apiConfig = require('../../config/api.js');
    // if (apiConfig.isMockEnabled()) {
    //   // 模拟文件选择成功
    //   var mockFile = {
    //     name: fileType === 'pdf' ? '测试文档.pdf' : '测试文档.docx',
    //     size: 1024 * 1024 * 2, // 2MB
    //     tempFilePath: '/mock/path/test.' + (fileType === 'pdf' ? 'pdf' : 'docx')
    //   };

    //   wx.showModal({
    //     title: '模拟文件选择',
    //     content: '已选择文件：' + mockFile.name + '\n文件大小：' + self.formatFileSize(mockFile.size) + '\n\n这是开发模式的模拟选择，实际环境中会打开文件选择器。',
    //     confirmText: '确认上传',
    //     cancelText: '取消',
    //     success: function(res) {
    //       if (res.confirm) {
    //         self.uploadFilesToServer([mockFile], fileType);
    //       }
    //     }
    //   });
    //   return;
    // }

    // 前后端联调阶段使用真实的文件选择API
    try {
      wx.chooseMessageFile({
        count: 1,
        type: 'file',
        extension: fileType === 'pdf' ? ['pdf'] : ['doc', 'docx'],
        success: (res) => {
          console.log('文件选择成功:', res);
          // 过滤文件类型
          const validFiles = res.tempFiles.filter(file => {
            const fileName = file.name.toLowerCase();
            if (fileType === 'pdf') return fileName.endsWith('.pdf');
            if (fileType === 'doc') return fileName.endsWith('.doc') || fileName.endsWith('.docx');
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
            title: '选择文件失败，请重试',
            icon: 'none'
          });
        }
      });
    } catch (error) {
      console.error('文件选择API调用失败:', error);
      wx.showToast({
        title: '文件选择功能暂不可用',
        icon: 'none'
      });
    }
  },

  // 上传文件到服务器
  uploadFilesToServer(files, fileType) {
    // 参数验证：检查文件是否存在且有效
    if (!files || files.length === 0) {
      wx.showToast({
        title: '没有选择文件',
        icon: 'none'
      });
      return;
    }

    const file = files[0];
    
    // 检查文件的必要属性 - 兼容不同的文件路径属性
    let filePath = file.tempFilePath || file.path;
    if (!filePath) {
      console.error('文件路径为空，文件对象:', file);
      wx.showToast({
        title: '文件路径无效，请重新选择文件',
        icon: 'none'
      });
      return;
    }

    if (!file.name) {
      console.error('文件名为空:', file);
      wx.showToast({
        title: '文件名无效，请重新选择文件',
        icon: 'none'
      });
      return;
    }

    if (!file.size || file.size <= 0) {
      console.error('文件大小无效:', file);
      wx.showToast({
        title: '文件大小无效，请重新选择文件',
        icon: 'none'
      });
      return;
    }

    console.log('准备保存文件到本地状态:', {
      name: file.name,
      size: file.size,
      filePath: filePath,
      type: fileType,
      fileObject: file
    });
    
    // 只保存到本地状态，不调用上传接口
    const tempFile = {
      id: Date.now(),
      name: file.name,
      tempFilePath: filePath, // 保存临时路径
      type: fileType,
      size: file.size,
      sizeFormatted: this.formatFileSize(file.size),
      uploadTime: new Date().toISOString()
    };

    this.setData({
      uploadedFiles: [...this.data.uploadedFiles, tempFile]
    });

    // 显示成功提示
    wx.showModal({
      title: '✅ 文件已添加',
      content: `文件"${tempFile.name}"已添加到预览列表\n\n文件大小：${tempFile.sizeFormatted}\n文件类型：${fileType.toUpperCase()}\n\n点击"提交所有内容"时将统一上传`,
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
  },

  // 保存文件信息到后端
  saveFileInfoToBackend(file, fileType, fileUrl) {
    // 调用后端 /api/models 接口保存文件信息
    wx.request({
      url: apiConfig.buildUrl('/app/api/models'),
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        model_name: this.data.caseName, // 典型案例名称
        file_name: file.name, // 文件名
        file_size: file.size, // 文件大小
        file_url: fileUrl, // 文件URL
        file_type: fileType // 文件类型
      },
      success: (res) => {
        if (res.data.success) {
          // 添加到已上传文件列表
          const uploadedFile = {
            id: res.data.data.id,
            name: file.name,
            url: fileUrl,
            type: fileType,
            size: file.size,
            sizeFormatted: this.formatFileSize(file.size),
            uploadTime: new Date().toISOString()
          };

          this.setData({
            uploadedFiles: [...this.data.uploadedFiles, uploadedFile]
          });

          // 显示成功提示
          wx.showModal({
            title: '✅ 上传成功',
            content: `文件"${uploadedFile.name}"已成功上传并保存\n\n文件大小：${uploadedFile.sizeFormatted}\n文件类型：${fileType.toUpperCase()}`,
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
            title: res.data.message || '保存文件信息失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('保存文件信息失败:', err);
        wx.showToast({
          title: '保存文件信息失败',
          icon: 'none'
        });
      }
    });
  },

  // 新闻链接上传功能
  uploadNewsLinks() {
    // 检查是否已上传文件
    if (this.data.uploadedFiles.length === 0) {
      wx.showToast({
        title: '请先上传文件再上传新闻链接或视频',
        icon: 'none'
      });
      return;
    }

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

    // 只保存到本地状态，不调用上传接口
    const tempNewsLink = {
      id: Date.now(),
      title: title,
      url: url,
      addTime: new Date().toISOString()
    };

    this.setData({
      newsLinks: [...this.data.newsLinks, tempNewsLink]
    });

    // 显示成功提示
    wx.showModal({
      title: '✅ 链接已添加',
      content: `新闻链接"${title}"已添加到预览列表\n\n链接地址：${url}\n添加时间：${new Date().toLocaleString()}\n\n点击"提交所有内容"时将统一上传`,
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
  },

  // 验证URL格式
  isValidUrl(string) {
    // 更宽松的URL验证
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(string) || string.startsWith('http://') || string.startsWith('https://');
  },

  // 视频上传功能
  uploadVideos() {
    // 检查是否已上传文件
    if (this.data.uploadedFiles.length === 0) {
      wx.showToast({
        title: '请先上传文件再上传新闻链接或视频',
        icon: 'none'
      });
      return;
    }

    // 视频上传功能已注释并禁用
    wx.showToast({
      title: '视频上传功能已被禁用',
      icon: 'none',
      duration: 2000
    });
  },

  // 上传视频到服务器
  uploadVideosToServer(videos) {
    // 视频上传到服务器相关逻辑已注释并禁用
    wx.showToast({
      title: '视频上传功能已被禁用',
      icon: 'none',
      duration: 2000
    });
  },

  // 保存视频信息到后端
  saveVideoInfoToBackend(video, videoUrl) {
    // 保存视频信息到后端的逻辑已注释并禁用
    console.warn('saveVideoInfoToBackend 已被禁用');
  },

  // 删除已上传的文件
  deleteFile(e) {
    const fileId = e.currentTarget.dataset.id;
    
    // 直接从本地状态中删除文件
    const files = this.data.uploadedFiles.filter(file => file.id !== fileId);
    this.setData({
      uploadedFiles: files
    });
    wx.showToast({
      title: '文件已删除',
      icon: 'success'
    });
  },

  // 删除新闻链接
  deleteNewsLink(e) {
    const linkId = e.currentTarget.dataset.id;
    
    // 直接从本地状态中删除新闻链接
    const links = this.data.newsLinks.filter(link => link.id !== linkId);
    this.setData({
      newsLinks: links
    });
    wx.showToast({
      title: '新闻链接已删除',
      icon: 'success'
    });
  },

  // 删除已上传的视频
  deleteVideo(e) {
    const videoId = e.currentTarget.dataset.id;
    
    // 直接从本地状态中删除视频
    const videos = this.data.uploadedVideos.filter(video => video.id !== videoId);
    this.setData({
      uploadedVideos: videos
    });
    wx.showToast({
      title: '视频已删除',
      icon: 'success'
    });
  },

  // 预览文件
  previewFile(e) {
    const file = e.currentTarget.dataset.file;
    
    console.log('=== 典型案例添加文件预览 ===');
    console.log('file:', file);
    
    if (!file) {
      wx.showToast({
        title: '文件信息无效',
        icon: 'none'
      });
      return;
    }

    const fileUrl = file.url || file.path;
    const fileName = file.name || '文件';
    
    if (!fileUrl) {
      wx.showToast({
        title: '文件链接无效',
        icon: 'none'
      });
      return;
    }

    // 获取文件扩展名
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // 根据文件类型处理
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension) || file.type === 'image') {
      // 图片文件直接预览
      wx.previewImage({
        urls: [fileUrl],
        current: fileUrl
      });
    } else {
      // 文档文件需要先下载到本地再预览
      const apiConfig = require('../../config/api.js');
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : apiConfig.buildFileUrl(fileUrl);
      
      wx.showLoading({
        title: '正在下载文件...'
      });
      
      // 使用wx.downloadFile下载到本地临时文件，然后使用wx.openDocument打开
      wx.downloadFile({
        url: fullUrl,
        timeout: 10000, // 10秒超时
        success: (res) => {
          wx.hideLoading();
          if (res.statusCode === 200) {
            wx.openDocument({
              filePath: res.tempFilePath,
              success: () => {
                console.log('打开文档成功');
              },
              fail: (err) => {
                console.error('打开文档失败:', err);
                wx.showToast({
                  title: '无法预览此文件',
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
        fail: (err) => {
          wx.hideLoading();
          console.error('下载文件失败:', err);
          
          // 根据错误类型给出不同的提示
          let errorMessage = '文件下载失败';
          if (err.errMsg) {
            if (err.errMsg.includes('timeout')) {
              errorMessage = '下载超时，请检查网络连接';
            } else if (err.errMsg.includes('fail')) {
              errorMessage = '服务器连接失败，请检查服务器状态';
            } else if (err.errMsg.includes('abort')) {
              errorMessage = '下载被中断';
            }
          }
          
          wx.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 2000
          });
        }
      });
    }
  },

  // 预览视频
  previewVideo(e) {
    // 视频预览/播放已禁用
    wx.showToast({
      title: '视频播放功能已被禁用',
      icon: 'none',
      duration: 2000
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

    if (this.data.uploadedFiles.length === 0) {
      wx.showToast({
        title: '请先上传一个文件',
        icon: 'none'
      });
      return;
    }

    const fileName = this.data.uploadedFiles.length > 0 ? this.data.uploadedFiles[0].name : '无';
    const linkCount = this.data.newsLinks.length;
    const videoCount = this.data.uploadedVideos.length;

    let contentSummary = `案例名称：${this.data.caseName}\n\n文件：${fileName}`;
    if (linkCount > 0) {
      contentSummary += `\n新闻链接：${linkCount}个`;
    }
    if (videoCount > 0) {
      contentSummary += `\n视频：${videoCount}个`;
    }
    contentSummary += '\n\n确定要提交这些内容吗？';

    wx.showModal({
      title: '确认提交',
      content: contentSummary,
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

    // 按顺序调用三个上传接口：文件 → 新闻链接 → 视频
    this.uploadFilesSequentially()
      .then(() => {
        console.log('文件上传完成，开始上传新闻链接');
        return this.uploadNewsLinksSequentially();
      })
      .then(() => {
        console.log('新闻链接上传完成，开始上传视频');
        return this.uploadVideosSequentially();
      })
      .then(() => {
        console.log('所有内容上传完成');
        wx.hideLoading();
        
        const totalItems = this.data.uploadedFiles.length + this.data.newsLinks.length + this.data.uploadedVideos.length;
        wx.showModal({
          title: '🎉 提交成功',
          content: `典型案例"${this.data.caseName}"已成功提交\n\n📄 文件：${this.data.uploadedFiles.length}个\n🔗 链接：${this.data.newsLinks.length}个\n🎥 视频：${this.data.uploadedVideos.length}个\n\n总计：${totalItems}个项目\n\n所有数据已保存`,
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
      })
      .catch((error) => {
        wx.hideLoading();
        console.error('上传失败:', error);
        wx.showModal({
          title: '❌ 上传失败',
          content: `上传过程中出现错误：${error.message}\n\n请检查网络连接后重试`,
          showCancel: false,
          confirmText: '确定'
        });
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
  },

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // 按顺序上传文件
  uploadFilesSequentially() {
    return new Promise((resolve, reject) => {
      if (this.data.uploadedFiles.length === 0) {
        resolve();
        return;
      }

      let uploadedCount = 0;
      const totalFiles = this.data.uploadedFiles.length;

      const uploadNextFile = (index) => {
        if (index >= totalFiles) {
          resolve();
          return;
        }

        const file = this.data.uploadedFiles[index];
        const uploadServerUrl = apiConfig.buildUrl('/app/api/upload');
        
        wx.uploadFile({
          url: uploadServerUrl,
          filePath: file.tempFilePath,
          name: 'file',
          header: {
            'Authorization': `Bearer ${wx.getStorageSync('token')}`
          },
          formData: {
            fileType: file.type
          },
          success: (res) => {
            try {
              const result = JSON.parse(res.data);
              if (result.success) {
                // 文件上传成功后，调用后端接口保存文件信息
                this.saveFileInfoToBackend(file, file.type, result.file_url);
                uploadedCount++;
                
                if (uploadedCount === totalFiles) {
                  resolve();
                } else {
                  uploadNextFile(index + 1);
                }
              } else {
                reject(new Error(result.message || '文件上传失败'));
              }
            } catch (e) {
              reject(new Error('文件上传响应解析失败'));
            }
          },
          fail: (err) => {
            reject(new Error('文件上传失败：' + err.errMsg));
          }
        });
      };

      uploadNextFile(0);
    });
  },

  // 按顺序上传新闻链接
  uploadNewsLinksSequentially() {
    return new Promise((resolve, reject) => {
      if (this.data.newsLinks.length === 0) {
        resolve();
        return;
      }

      let uploadedCount = 0;
      const totalLinks = this.data.newsLinks.length;

      const uploadNextLink = (index) => {
        if (index >= totalLinks) {
          resolve();
          return;
        }

        const link = this.data.newsLinks[index];
        
        wx.request({
          url: apiConfig.buildUrl('/app/api/news'),
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          data: {
            model_name: this.data.caseName,
            news_title: link.title,
            news_url: link.url
          },
          success: (res) => {
            if (res.data.success) {
              uploadedCount++;
              
              if (uploadedCount === totalLinks) {
                resolve();
              } else {
                uploadNextLink(index + 1);
              }
            } else {
              reject(new Error(res.data.message || '新闻链接上传失败'));
            }
          },
          fail: (err) => {
            reject(new Error('新闻链接上传失败：' + err.errMsg));
          }
        });
      };

      uploadNextLink(0);
    });
  },

  // 按顺序上传视频
  uploadVideosSequentially() {
    // 视频批量上传逻辑已注释并禁用，直接返回 resolved
    return Promise.resolve();
  }
});