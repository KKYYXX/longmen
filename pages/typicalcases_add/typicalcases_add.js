Page({
  data: {
    currentStep: 1,
    caseData: {
      title: '',
      category: '',
      summary: '',
      content: '',
      achievements: '',
      experience: '',
      author: '',
      contact: '',
      tags: []
    },
    categories: ['基础设施建设', '环保治理', '民生改善', '科技创新', '产业发展', '其他'],
    selectedImages: [],
    selectedVideos: [],
    selectedReports: [],
    links: [],
    tagInput: '',
    showTagInput: false
  },

  onLoad() {
    console.log('添加典型案例页面加载');
  },

  // 步骤导航
  nextStep() {
    // 第一步验证
    if (this.data.currentStep === 1) {
      if (!this.data.caseData.title.trim()) {
        wx.showToast({
          title: '请输入案例标题',
          icon: 'none'
        });
        return;
      }
      if (!this.data.caseData.category) {
        wx.showToast({
          title: '请选择案例分类',
          icon: 'none'
        });
        return;
      }
    }

    if (this.data.currentStep < 4) {
      this.setData({
        currentStep: this.data.currentStep + 1
      });
    }
  },

  prevStep() {
    if (this.data.currentStep > 1) {
      this.setData({
        currentStep: this.data.currentStep - 1
      });
    }
  },

  // 基本信息输入
  onTitleInput(e) {
    this.setData({
      'caseData.title': e.detail.value
    });
  },

  onCategoryChange(e) {
    this.setData({
      'caseData.category': this.data.categories[e.detail.value]
    });
  },

  onSummaryInput(e) {
    this.setData({
      'caseData.summary': e.detail.value
    });
  },

  onContentInput(e) {
    this.setData({
      'caseData.content': e.detail.value
    });
  },

  onAchievementsInput(e) {
    this.setData({
      'caseData.achievements': e.detail.value
    });
  },

  onExperienceInput(e) {
    this.setData({
      'caseData.experience': e.detail.value
    });
  },

  onAuthorInput(e) {
    this.setData({
      'caseData.author': e.detail.value
    });
  },

  onContactInput(e) {
    this.setData({
      'caseData.contact': e.detail.value
    });
  },

  // 图片选择
  chooseImages() {
    wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const images = res.tempFiles.map(file => ({
          name: `图片_${Date.now()}.jpg`,
          url: file.tempFilePath,
          size: file.size,
          sizeText: `${(file.size / 1024 / 1024).toFixed(2)}MB`
        }));

        this.setData({
          selectedImages: [...this.data.selectedImages, ...images]
        });
      }
    });
  },

  // 删除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.selectedImages;
    images.splice(index, 1);
    this.setData({
      selectedImages: images
    });
  },

  // 视频选择
  chooseVideos() {
    wx.chooseMedia({
      count: 3,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const videos = res.tempFiles.map(file => ({
          name: `视频_${Date.now()}.mp4`,
          url: file.tempFilePath,
          size: file.size,
          sizeText: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          duration: file.duration || 0
        }));

        this.setData({
          selectedVideos: [...this.data.selectedVideos, ...videos]
        });
      }
    });
  },

  // 删除视频
  removeVideo(e) {
    const index = e.currentTarget.dataset.index;
    const videos = this.data.selectedVideos;
    videos.splice(index, 1);
    this.setData({
      selectedVideos: videos
    });
  },

  // 选择文档
  chooseReports() {
    // 模拟文档选择
    wx.showActionSheet({
      itemList: ['选择PDF文档', '选择Word文档', '选择Excel文档'],
      success: (res) => {
        const types = ['PDF', 'Word', 'Excel'];
        const extensions = ['.pdf', '.docx', '.xlsx'];
        const selectedType = types[res.tapIndex];
        const extension = extensions[res.tapIndex];

        const fileSize = Math.floor(Math.random() * 5000000) + 100000; // 随机大小
        const report = {
          name: `${selectedType}文档_${Date.now()}${extension}`,
          url: `/temp/reports/document${extension}`,
          type: selectedType,
          size: fileSize,
          sizeText: `${(fileSize / 1024 / 1024).toFixed(2)}MB`
        };

        this.setData({
          selectedReports: [...this.data.selectedReports, report]
        });

        wx.showToast({
          title: `已添加${selectedType}文档`,
          icon: 'success'
        });
      }
    });
  },

  // 删除文档
  removeReport(e) {
    const index = e.currentTarget.dataset.index;
    const reports = this.data.selectedReports;
    reports.splice(index, 1);
    this.setData({
      selectedReports: reports
    });
  },

  // 添加链接
  addLink() {
    wx.showModal({
      title: '添加相关链接',
      editable: true,
      placeholderText: '请输入链接名称',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          wx.showModal({
            title: '输入链接地址',
            editable: true,
            placeholderText: '请输入链接URL',
            success: (urlRes) => {
              if (urlRes.confirm && urlRes.content.trim()) {
                const link = {
                  name: res.content.trim(),
                  url: urlRes.content.trim()
                };

                this.setData({
                  links: [...this.data.links, link]
                });
              }
            }
          });
        }
      }
    });
  },

  // 删除链接
  removeLink(e) {
    const index = e.currentTarget.dataset.index;
    const links = this.data.links;
    links.splice(index, 1);
    this.setData({
      links: links
    });
  },

  // 标签管理
  showTagInput() {
    this.setData({
      showTagInput: true
    });
  },

  onTagInput(e) {
    this.setData({
      tagInput: e.detail.value
    });
  },

  addTag() {
    const tag = this.data.tagInput.trim();
    if (tag && !this.data.caseData.tags.includes(tag)) {
      this.setData({
        'caseData.tags': [...this.data.caseData.tags, tag],
        tagInput: '',
        showTagInput: false
      });
    }
  },

  removeTag(e) {
    const index = e.currentTarget.dataset.index;
    const tags = this.data.caseData.tags;
    tags.splice(index, 1);
    this.setData({
      'caseData.tags': tags
    });
  },

  // 预览功能
  previewCase() {
    const { caseData, selectedImages, selectedVideos, selectedReports, links } = this.data;

    // 验证必填字段
    if (!caseData.title.trim()) {
      wx.showToast({
        title: '请输入案例标题',
        icon: 'none'
      });
      return;
    }

    if (!caseData.category) {
      wx.showToast({
        title: '请选择案例分类',
        icon: 'none'
      });
      return;
    }

    // 显示预览信息
    const previewInfo = `
标题：${caseData.title}
分类：${caseData.category}
摘要：${caseData.summary || '无'}
图片：${selectedImages.length}张
视频：${selectedVideos.length}个
文档：${selectedReports.length}个
链接：${links.length}个
标签：${caseData.tags.join(', ') || '无'}
    `;

    wx.showModal({
      title: '案例预览',
      content: previewInfo,
      confirmText: '确认提交',
      cancelText: '继续编辑',
      success: (res) => {
        if (res.confirm) {
          this.submitCase();
        }
      }
    });
  },

  // 提交案例
  submitCase() {
    wx.showLoading({
      title: '提交中...'
    });

    // 构建新案例数据
    const newCase = {
      id: Date.now(), // 使用时间戳作为ID
      title: this.data.caseData.title,
      category: this.data.caseData.category,
      summary: this.data.caseData.summary || '暂无摘要',
      content: this.data.caseData.content || '暂无详细内容',
      achievements: this.data.caseData.achievements || '暂无成效描述',
      experience: this.data.caseData.experience || '暂无经验总结',
      author: this.data.caseData.author || '未知来源',
      contact: this.data.caseData.contact || '暂无联系方式',
      tags: this.data.caseData.tags || [],
      createDate: new Date().toISOString().split('T')[0], // 格式：2024-07-30
      updateDate: new Date().toISOString().split('T')[0],
      images: this.data.selectedImages || [],
      videos: this.data.selectedVideos || [],
      reports: this.data.selectedReports || [],
      links: this.data.links || [],
      status: '已发布'
    };

    // 模拟提交过程
    setTimeout(() => {
      try {
        // 获取现有案例列表
        const existingCases = wx.getStorageSync('typicalCases') || [];

        // 添加新案例到列表开头
        existingCases.unshift(newCase);

        // 保存到本地存储
        wx.setStorageSync('typicalCases', existingCases);

        wx.hideLoading();
        wx.showModal({
          title: '提交成功',
          content: `典型案例"${newCase.title}"已成功添加！\n\n您可以在典型案例查询页面查看。`,
          showCancel: false,
          success: () => {
            // 返回上一页并刷新数据
            wx.navigateBack({
              success: () => {
                // 通知其他页面数据已更新
                wx.setStorageSync('caseListNeedRefresh', true);
              }
            });
          }
        });
      } catch (error) {
        wx.hideLoading();
        wx.showModal({
          title: '提交失败',
          content: '保存案例时出现错误，请重试。',
          showCancel: false
        });
        console.error('保存案例失败:', error);
      }
    }, 1500);
  },

  // 取消操作
  cancel() {
    wx.showModal({
      title: '确认取消',
      content: '取消后将丢失已填写的内容，确定要取消吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
});
