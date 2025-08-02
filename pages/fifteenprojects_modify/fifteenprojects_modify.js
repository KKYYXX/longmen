Page({
  data: {
    currentStep: 1,
    selectedProject: null,
    selectedColumn: null,
    selectedAction: '',
    newContent: '',
    showLinkInput: false,
    linkUrl: '',
    linkTitle: '',
    addedItems: [],
    projectList: [
      {
        id: 1,
        name: '智慧城市建设项目',
        description: '利用物联网技术建设智慧城市管理平台',
        projectName: '智慧城市建设项目',
        projectType: '基础设施建设',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        background: '随着城市化进程加快，传统城市管理模式面临挑战...',
        content: '建设智慧城市管理平台，整合各类城市数据...',
        objectives: '提升城市治理效率，改善市民生活质量...',
        contactName: '张三',
        contactPosition: '项目经理',
        contactPhone: '13800138000',
        remarks: '重点项目，优先推进',
        progress: 75,
        projectManager: '李四',
        budget: '5000',
        status: '进行中'
      },
      {
        id: 2,
        name: '绿色能源发展项目',
        description: '推广太阳能和风能等清洁能源技术',
        projectName: '绿色能源发展项目',
        projectType: '环保治理',
        startDate: '2024-02-01',
        endDate: '2024-11-30',
        background: '为响应国家碳中和目标，推进清洁能源发展...',
        content: '建设太阳能发电站，推广风能利用技术...',
        objectives: '减少碳排放，提高清洁能源使用比例...',
        contactName: '王五',
        contactPosition: '技术总监',
        contactPhone: '13900139000',
        remarks: '环保重点项目',
        progress: 60,
        projectManager: '赵六',
        budget: '8000',
        status: '进行中'
      }
    ],
    projectColumns: [
      { name: '项目名称', key: 'projectName', type: 'text' },
      { name: '项目类型', key: 'projectType', type: 'text' },
      { name: '开始时间', key: 'startDate', type: 'text' },
      { name: '结束时间', key: 'endDate', type: 'text' },
      { name: '项目背景', key: 'background', type: 'textarea' },
      { name: '项目内容和落实举措', key: 'content', type: 'textarea' },
      { name: '主要任务目标', key: 'objectives', type: 'textarea' },
      { name: '联系人姓名', key: 'contactName', type: 'text' },
      { name: '联系人职务', key: 'contactPosition', type: 'text' },
      { name: '联系方式', key: 'contactPhone', type: 'text' },
      { name: '备注', key: 'remarks', type: 'textarea' },
      { name: '项目进度', key: 'progress', type: 'text' },
      { name: '项目负责人', key: 'projectManager', type: 'text' },
      { name: '预算金额', key: 'budget', type: 'text' },
      { name: '完成状态', key: 'status', type: 'text' }
    ]
  },

  onLoad() {
    // 数据已在data中初始化
  },

  // 选择项目
  selectProject(e) {
    const project = e.currentTarget.dataset.project;
    this.setData({
      selectedProject: project
    });
  },

  // 选择列
  selectColumn(e) {
    const column = e.currentTarget.dataset.column;
    this.setData({
      selectedColumn: column
    });
  },

  // 选择操作类型
  selectAction(e) {
    const action = e.currentTarget.dataset.action;
    this.setData({
      selectedAction: action,
      newContent: '',
      addedItems: [],
      showLinkInput: false
    });
  },

  // 下一步
  nextStep() {
    const currentStep = this.data.currentStep;
    this.setData({
      currentStep: currentStep + 1
    });
  },

  // 上一步
  prevStep() {
    const currentStep = this.data.currentStep;
    if (currentStep > 1) {
      this.setData({
        currentStep: currentStep - 1
      });
    }
  },

  // 新内容输入
  onNewContentInput(e) {
    this.setData({
      newContent: e.detail.value
    });
  },

  // 保存修改
  saveModification() {
    const { selectedProject, selectedColumn, newContent } = this.data;

    if (!newContent.trim()) {
      wx.showToast({
        title: '请输入新内容',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '保存中...'
    });

    // TODO: 调用后端API保存修改
    const submitData = {
      projectId: selectedProject.id,
      columnKey: selectedColumn.key,
      newContent: newContent.trim(),
      oldContent: selectedProject[selectedColumn.key] || ''
    };

    // 模拟随机成功/失败
    const isSuccess = Math.random() > 0.2; // 80%成功率

    setTimeout(() => {
      wx.hideLoading();

      if (isSuccess) {
        // 更新本地数据
        const projectList = [...this.data.projectList];
        const projectIndex = projectList.findIndex(p => p.id === selectedProject.id);
        if (projectIndex > -1) {
          projectList[projectIndex][selectedColumn.key] = newContent.trim();
        }

        this.setData({
          projectList: projectList,
          selectedProject: projectList[projectIndex]
        });

        wx.showModal({
          title: '操作结果',
          content: `修改成功！\n项目：${selectedProject.name}\n列：${selectedColumn.name}\n已更新为新内容。`,
          showCancel: false,
          success: () => {
            this.setData({
              currentStep: 1,
              selectedProject: null,
              selectedColumn: null,
              selectedAction: '',
              newContent: ''
            });
          }
        });
      } else {
        wx.showModal({
          title: '操作结果',
          content: '修改失败，请检查网络连接后重试！',
          showCancel: false
        });
      }
    }, 1500);
  },

  // 上传图片
  uploadImage() {
    wx.chooseImage({
      count: 3,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        tempFilePaths.forEach((path, index) => {
          this.addItem({
            type: '图片',
            name: `图片${this.data.addedItems.length + index + 1}.jpg`,
            path: path
          });
        });

        wx.showToast({
          title: `已添加${tempFilePaths.length}张图片`,
          icon: 'success'
        });
      }
    });
  },

  // 上传视频
  uploadVideo() {
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        this.addItem({
          type: '视频',
          name: `视频${this.data.addedItems.length + 1}.mp4`,
          path: res.tempFilePath
        });

        wx.showToast({
          title: '已添加视频',
          icon: 'success'
        });
      }
    });
  },

  // 添加链接
  addLink() {
    this.setData({
      showLinkInput: true,
      linkUrl: '',
      linkTitle: ''
    });
  },

  // 链接地址输入
  onLinkInput(e) {
    this.setData({
      linkUrl: e.detail.value
    });
  },

  // 链接标题输入
  onLinkTitleInput(e) {
    this.setData({
      linkTitle: e.detail.value
    });
  },

  // 确认添加链接
  confirmAddLink() {
    const { linkUrl, linkTitle } = this.data;

    if (!linkUrl.trim()) {
      wx.showToast({
        title: '请输入链接地址',
        icon: 'none'
      });
      return;
    }

    if (!linkTitle.trim()) {
      wx.showToast({
        title: '请输入链接标题',
        icon: 'none'
      });
      return;
    }

    this.addItem({
      type: '链接',
      name: linkTitle.trim(),
      url: linkUrl.trim()
    });

    this.setData({
      showLinkInput: false,
      linkUrl: '',
      linkTitle: ''
    });

    wx.showToast({
      title: '已添加链接',
      icon: 'success'
    });
  },

  // 上传文档
  uploadDocument() {
    wx.chooseMessageFile({
      count: 3,
      type: 'file',
      success: (res) => {
        res.tempFiles.forEach((file, index) => {
          this.addItem({
            type: '新闻稿',
            name: file.name || `文档${this.data.addedItems.length + index + 1}`,
            path: file.path,
            size: file.size
          });
        });

        wx.showToast({
          title: `已添加${res.tempFiles.length}个文档`,
          icon: 'success'
        });
      }
    });
  },

  // 添加项目到列表
  addItem(item) {
    const addedItems = [...this.data.addedItems, item];
    this.setData({
      addedItems: addedItems
    });
  },

  // 移除项目
  removeItem(e) {
    const index = e.currentTarget.dataset.index;
    const addedItems = [...this.data.addedItems];
    addedItems.splice(index, 1);
    this.setData({
      addedItems: addedItems
    });

    wx.showToast({
      title: '已移除',
      icon: 'success'
    });
  },

  // 保存添加的内容
  saveAddition() {
    const { selectedProject, selectedColumn, addedItems } = this.data;

    if (addedItems.length === 0) {
      wx.showToast({
        title: '请先添加内容',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '上传中...'
    });

    // TODO: 调用后端API上传文件和保存数据
    const submitData = {
      projectId: selectedProject.id,
      columnKey: selectedColumn.key,
      addedItems: addedItems
    };

    // 模拟随机成功/失败
    const isSuccess = Math.random() > 0.3; // 70%成功率

    setTimeout(() => {
      wx.hideLoading();

      if (isSuccess) {
        wx.showModal({
          title: '操作结果',
          content: `上传成功！\n项目：${selectedProject.name}\n列：${selectedColumn.name}\n已添加${addedItems.length}项内容。`,
          showCancel: false,
          success: () => {
            this.setData({
              currentStep: 1,
              selectedProject: null,
              selectedColumn: null,
              selectedAction: '',
              addedItems: []
            });
          }
        });
      } else {
        wx.showModal({
          title: '操作结果',
          content: '上传失败，请检查网络连接后重试！',
          showCancel: false
        });
      }
    }, 2000);
  },

  // 取消操作
  cancel() {
    wx.navigateBack();
  }
});
