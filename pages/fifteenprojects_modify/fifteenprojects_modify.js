Page({
  data: {
    currentStep: 1,
    selectedProject: null,
    selectedColumn: null,
    selectedAction: '',
    newContent: '',
    showTimeInput: false,
    showLocationInput: false,
    showPersonInput: false,
    selectedDate: '',
    selectedTime: '',
    locationName: '',
    personName: '',
    personTitle: '',
    addedItems: [],

    // 删除内容相关
    timeFilter: 'all',
    selectedDeleteDate: '',
    progressList: [],
    filteredProgressList: [],
    selectedDeleteCount: 0,
    isAllProgressSelected: false,
    editMode: false, // 是否为编辑模式
    editingProjectId: null, // 正在编辑的项目ID
    projectList: [
      {
        id: 1,
        name: '智慧城市建设项目',
        description: '利用物联网技术建设智慧城市管理平台',
        serialNumber: '001',
        cityLevel: '杭州市',
        pairedCounty: '临安区',
        pairedInstitution: '浙江大学',
        projectName: '智慧城市建设项目',
        implementationUnit: '浙江大学计算机学院',
        isKeyProject: '是',
        involvedAreas: '临安区青山湖街道',
        projectType: '基础设施建设',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        background: '随着城市化进程加快，传统城市管理模式面临挑战...',
        content: '建设智慧城市管理平台，整合各类城市数据...',
        objectives: '提升城市治理效率，改善市民生活质量...',
        contacts: '张三:13800138000',
        remarks: '重点项目，优先推进',
        progress: 75
      },
      {
        id: 2,
        name: '绿色能源发展项目',
        description: '推广太阳能和风能等清洁能源技术',
        serialNumber: '002',
        cityLevel: '宁波市',
        pairedCounty: '象山县',
        pairedInstitution: '浙江工业大学',
        projectName: '绿色能源发展项目',
        implementationUnit: '浙江工业大学环境学院',
        isKeyProject: '是',
        involvedAreas: '象山县丹西街道',
        projectType: '环保治理',
        startDate: '2024-02-01',
        endDate: '2024-11-30',
        background: '为响应国家碳中和目标，推进清洁能源发展...',
        content: '建设太阳能发电站，推广风能利用技术...',
        objectives: '减少碳排放，提高清洁能源使用比例...',
        contacts: '王五:13900139000',
        remarks: '环保重点项目',
        progress: 60
      }
    ],
    projectColumns: [
      { name: '序号', key: 'serialNumber', type: 'text' },
      { name: '地级市', key: 'cityLevel', type: 'text' },
      { name: '结对县（市、区）', key: 'pairedCounty', type: 'text' },
      { name: '组团结对高校院所', key: 'pairedInstitution', type: 'text' },
      { name: '项目名称', key: 'projectName', type: 'text' },
      { name: '项目实施单位（高校院所）', key: 'implementationUnit', type: 'text' },
      { name: '是否重点项目', key: 'isKeyProject', type: 'text' },
      { name: '涉及典型县镇村', key: 'involvedAreas', type: 'text' },
      { name: '项目类型', key: 'projectType', type: 'text' },
      { name: '项目开始时间', key: 'startDate', type: 'text' },
      { name: '项目结束时间', key: 'endDate', type: 'text' },
      { name: '项目背景', key: 'background', type: 'textarea' },
      { name: '项目内容和落实举措', key: 'content', type: 'textarea' },
      { name: '主要任务目标', key: 'objectives', type: 'textarea' },
      { name: '联系人信息', key: 'contacts', type: 'text' },
      { name: '备注', key: 'remarks', type: 'textarea' },
      { name: '项目进度', key: 'progress', type: 'text' }
    ]
  },

  onLoad() {
    console.log('修改页面加载，当前列配置：', this.data.projectColumns);
    // 强制刷新页面数据
    const newColumns = [
      { name: '序号', key: 'serialNumber', type: 'text' },
      { name: '地级市', key: 'cityLevel', type: 'text' },
      { name: '结对县（市、区）', key: 'pairedCounty', type: 'text' },
      { name: '组团结对高校院所', key: 'pairedInstitution', type: 'text' },
      { name: '项目名称', key: 'projectName', type: 'text' },
      { name: '项目实施单位（高校院所）', key: 'implementationUnit', type: 'text' },
      { name: '是否重点项目', key: 'isKeyProject', type: 'text' },
      { name: '涉及典型县镇村', key: 'involvedAreas', type: 'text' },
      { name: '项目类型', key: 'projectType', type: 'text' },
      { name: '项目开始时间', key: 'startDate', type: 'text' },
      { name: '项目结束时间', key: 'endDate', type: 'text' },
      { name: '项目背景', key: 'background', type: 'textarea' },
      { name: '项目内容和落实举措', key: 'content', type: 'textarea' },
      { name: '主要任务目标', key: 'objectives', type: 'textarea' },
      { name: '联系人信息', key: 'contacts', type: 'text' },
      { name: '备注', key: 'remarks', type: 'textarea' },
      { name: '项目进度', key: 'progress', type: 'text' }
    ];
    this.setData({
      projectColumns: newColumns
    });
    console.log('修改页面加载完成，新列配置：', newColumns);
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

    // 如果选择了删除内容，加载进度数据
    if (this.data.selectedAction === 'delete' && currentStep + 1 === 4) {
      this.loadProgressData();
    }
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

        // 将更新后的项目数据传递给查询页面
        const app = getApp();
        if (app && app.globalData) {
          app.globalData.updatedProject = projectList[projectIndex];
        }

        wx.showModal({
          title: '操作结果',
          content: `修改成功！\n项目：${selectedProject.name}\n列：${selectedColumn.name}\n已更新为新内容。`,
          showCancel: false,
          success: () => {
            if (this.data.editMode) {
              // 编辑模式，返回查询页面
              wx.navigateBack();
            } else {
              // 新增模式，重置状态
              this.setData({
                currentStep: 1,
                selectedProject: null,
                selectedColumn: null,
                selectedAction: '',
                newContent: ''
              });
            }
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
        
        wx.chooseVideo({
          sourceType: sourceType,
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

  // 添加时间
  addTime() {
    this.setData({
      showTimeInput: true,
      showLocationInput: false,
      showPersonInput: false,
      selectedDate: '',
      selectedTime: ''
    });
  },

  // 添加地点
  addLocation() {
    this.setData({
      showTimeInput: false,
      showLocationInput: true,
      showPersonInput: false,
      locationName: ''
    });
  },

  // 添加人员
  addPerson() {
    this.setData({
      showTimeInput: false,
      showLocationInput: false,
      showPersonInput: true,
      personName: '',
      personTitle: ''
    });
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      selectedDate: e.detail.value
    });
  },

  // 时间选择
  onTimeChange(e) {
    this.setData({
      selectedTime: e.detail.value
    });
  },

  // 地点输入
  onLocationInput(e) {
    this.setData({
      locationName: e.detail.value
    });
  },

  // 人员姓名输入
  onPersonNameInput(e) {
    this.setData({
      personName: e.detail.value
    });
  },

  // 人员职务输入
  onPersonTitleInput(e) {
    this.setData({
      personTitle: e.detail.value
    });
  },

  // 确认添加时间
  confirmAddTime() {
    const { selectedDate, selectedTime } = this.data;

    if (!selectedDate || !selectedTime) {
      wx.showToast({
        title: '请选择完整的日期和时间',
        icon: 'none'
      });
      return;
    }

    this.addItem({
      type: '时间',
      name: `${selectedDate} ${selectedTime}`,
      date: selectedDate,
      time: selectedTime
    });

    this.setData({
      showTimeInput: false,
      selectedDate: '',
      selectedTime: ''
    });

    wx.showToast({
      title: '已添加时间',
      icon: 'success'
    });
  },

  // 确认添加地点
  confirmAddLocation() {
    const { locationName } = this.data;

    if (!locationName.trim()) {
      wx.showToast({
        title: '请输入地点名称',
        icon: 'none'
      });
      return;
    }

    this.addItem({
      type: '地点',
      name: locationName.trim()
    });

    this.setData({
      showLocationInput: false,
      locationName: ''
    });

    wx.showToast({
      title: '已添加地点',
      icon: 'success'
    });
  },

  // 确认添加人员
  confirmAddPerson() {
    const { personName, personTitle } = this.data;

    if (!personName.trim()) {
      wx.showToast({
        title: '请输入人员姓名',
        icon: 'none'
      });
      return;
    }

    this.addItem({
      type: '人员',
      name: personName.trim(),
      title: personTitle.trim() || '工作人员'
    });

    this.setData({
      showPersonInput: false,
      personName: '',
      personTitle: ''
    });

    wx.showToast({
      title: '已添加人员',
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
        // 将更新后的项目数据传递给查询页面
        const app = getApp();
        if (app && app.globalData) {
          app.globalData.updatedProject = selectedProject;
        }

        wx.showModal({
          title: '操作结果',
          content: `上传成功！\n项目：${selectedProject.name}\n列：${selectedColumn.name}\n已添加${addedItems.length}项内容。`,
          showCancel: false,
          success: () => {
            if (this.data.editMode) {
              // 编辑模式，返回查询页面
              wx.navigateBack();
            } else {
              // 新增模式，重置状态
              this.setData({
                currentStep: 1,
                selectedProject: null,
                selectedColumn: null,
                selectedAction: '',
                addedItems: []
              });
            }
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
  },

  // 页面加载
  onLoad: function(options) {
    console.log('修改页面加载，参数:', options);

    // 检查是否为编辑模式
    if (options.projectId) {
      this.setData({
        editMode: true,
        editingProjectId: parseInt(options.projectId)
      });

      // 从全局数据或本地数据中获取项目信息
      const app = getApp();
      if (app && app.globalData && app.globalData.editingProject) {
        this.setData({
          selectedProject: app.globalData.editingProject,
          currentStep: 2 // 直接跳到第二步，因为项目已选择
        });
        console.log('编辑模式，项目数据:', app.globalData.editingProject);
      } else {
        // 如果全局数据中没有，从本地项目列表中查找
        const project = this.data.projectList.find(p => p.id === parseInt(options.projectId));
        if (project) {
          this.setData({
            selectedProject: project,
            currentStep: 2
          });
        }
      }
    }
  },

  // 页面显示
  onShow: function() {
    console.log('修改页面显示');
    // 强制刷新列配置，确保显示最新的字段
    this.setData({
      projectColumns: [
        { name: '序号', key: 'serialNumber', type: 'text' },
        { name: '地级市', key: 'cityLevel', type: 'text' },
        { name: '结对县（市、区）', key: 'pairedCounty', type: 'text' },
        { name: '组团结对高校院所', key: 'pairedInstitution', type: 'text' },
        { name: '项目名称', key: 'projectName', type: 'text' },
        { name: '项目实施单位（高校院所）', key: 'implementationUnit', type: 'text' },
        { name: '是否重点项目', key: 'isKeyProject', type: 'text' },
        { name: '涉及典型县镇村', key: 'involvedAreas', type: 'text' },
        { name: '项目类型', key: 'projectType', type: 'text' },
        { name: '项目开始时间', key: 'startDate', type: 'text' },
        { name: '项目结束时间', key: 'endDate', type: 'text' },
        { name: '项目背景', key: 'background', type: 'textarea' },
        { name: '项目内容和落实举措', key: 'content', type: 'textarea' },
        { name: '主要任务目标', key: 'objectives', type: 'textarea' },
        { name: '联系人信息', key: 'contacts', type: 'text' },
        { name: '备注', key: 'remarks', type: 'textarea' },
        { name: '项目进度', key: 'progress', type: 'text' }
      ]
    });
  },

  // 页面卸载
  onUnload: function() {
    // 清理全局数据
    const app = getApp();
    if (app && app.globalData && app.globalData.editingProject) {
      app.globalData.editingProject = null;
    }
  },

  // ========== 删除内容功能 ==========

  // 加载进度数据
  loadProgressData: function() {
    wx.showLoading({
      title: '加载中...'
    });

    // 模拟加载数据
    setTimeout(() => {
      const progressData = this.generateProgressData();
      this.setData({
        progressList: progressData,
        filteredProgressList: progressData,
        timeFilter: 'all'
      });
      wx.hideLoading();
    }, 500);
  },

  // 按时间段筛选
  filterByTime: function(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      timeFilter: filter,
      selectedDeleteDate: '' // 清除具体日期选择
    });
    this.applyTimeFilter(filter);
  },

  // 应用时间筛选
  applyTimeFilter: function(filter) {
    const now = new Date();
    let filtered = this.data.progressList;

    if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = this.data.progressList.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= weekAgo;
      });
    } else if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = this.data.progressList.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= monthAgo;
      });
    } else if (filter === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filtered = this.data.progressList.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= yearAgo;
      });
    }

    // 重置选择状态
    filtered = filtered.map(item => ({ ...item, selected: false }));

    this.setData({
      filteredProgressList: filtered,
      selectedDeleteCount: 0,
      isAllProgressSelected: false
    });
  },

  // 日期选择
  onDeleteDateChange: function(e) {
    const selectedDate = e.detail.value;
    this.setData({
      selectedDeleteDate: selectedDate,
      timeFilter: '' // 清除时间段筛选
    });
    this.filterProgressByDate(selectedDate);
  },

  // 按日期筛选进度
  filterProgressByDate: function(date) {
    if (!date) {
      this.setData({
        filteredProgressList: this.data.progressList.map(item => ({ ...item, selected: false })),
        selectedDeleteCount: 0,
        isAllProgressSelected: false
      });
      return;
    }

    const filtered = this.data.progressList
      .filter(item => item.date === date)
      .map(item => ({ ...item, selected: false }));

    this.setData({
      filteredProgressList: filtered,
      selectedDeleteCount: 0,
      isAllProgressSelected: false
    });
  },

  // 切换选择状态
  toggleProgressSelect: function(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    const filteredList = this.data.filteredProgressList.map(item => {
      if (item.id === id) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });

    const selectedCount = filteredList.filter(item => item.selected).length;
    const isAllSelected = selectedCount === filteredList.length && filteredList.length > 0;

    this.setData({
      filteredProgressList: filteredList,
      selectedDeleteCount: selectedCount,
      isAllProgressSelected: isAllSelected
    });
  },

  // 全选/取消全选
  selectAllProgress: function() {
    const isAllSelected = !this.data.isAllProgressSelected;
    const filteredList = this.data.filteredProgressList.map(item => ({
      ...item,
      selected: isAllSelected
    }));

    this.setData({
      filteredProgressList: filteredList,
      selectedDeleteCount: isAllSelected ? filteredList.length : 0,
      isAllProgressSelected: isAllSelected
    });
  },

  // 单个删除
  singleDeleteProgress: function(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    this.confirmDeleteProgress([id]);
  },

  // 批量删除
  batchDeleteProgress: function() {
    const selectedIds = this.data.filteredProgressList
      .filter(item => item.selected)
      .map(item => item.id);

    if (selectedIds.length === 0) {
      wx.showToast({
        title: '请先选择要删除的记录',
        icon: 'none'
      });
      return;
    }

    this.confirmDeleteProgress(selectedIds);
  },

  // 确认删除
  confirmDeleteProgress: function(ids) {
    const count = ids.length;
    wx.showModal({
      title: '确认删除',
      content: `确定要删除${count}条进度记录吗？删除后无法恢复。`,
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          this.performDeleteProgress(ids);
        }
      }
    });
  },

  // 执行删除
  performDeleteProgress: function(ids) {
    wx.showLoading({
      title: '删除中...'
    });

    // 模拟删除操作
    setTimeout(() => {
      // 从原始列表中删除
      const updatedProgressList = this.data.progressList.filter(item => !ids.includes(item.id));

      // 从筛选列表中删除
      const updatedFilteredList = this.data.filteredProgressList.filter(item => !ids.includes(item.id));

      this.setData({
        progressList: updatedProgressList,
        filteredProgressList: updatedFilteredList,
        selectedDeleteCount: 0,
        isAllProgressSelected: false
      });

      wx.hideLoading();
      wx.showToast({
        title: `已删除${ids.length}条记录`,
        icon: 'success'
      });

      // TODO: 调用后端API删除数据
      console.log('删除进度记录:', ids);
    }, 1000);
  },

  // 生成进度数据
  generateProgressData: function() {
    const progressTemplates = [
      {
        id: 1,
        date: "2024-01-15",
        time: "09:00",
        title: "项目启动会议",
        location: "市政府会议室",
        person: "项目经理张三",
        description: "召开项目启动会议，确定项目目标和时间节点",
        status: "completed",
        statusText: "已完成",
        selected: false
      },
      {
        id: 2,
        date: "2024-02-20",
        time: "14:30",
        title: "设备采购招标",
        location: "市采购中心",
        person: "采购专员李四",
        description: "完成物联网设备和服务器设备的招标采购工作",
        status: "completed",
        statusText: "已完成",
        selected: false
      },
      {
        id: 3,
        date: "2024-03-10",
        time: "10:15",
        title: "数据中心建设开工",
        location: "高新区数据中心基地",
        person: "工程师王五",
        description: "数据中心基础设施建设正式开工",
        status: "completed",
        statusText: "已完成",
        selected: false
      },
      {
        id: 4,
        date: "2024-06-15",
        time: "16:20",
        title: "传感器网络部署",
        location: "市区各主要路口",
        person: "技术员赵六",
        description: "在全市主要路口部署物联网传感器设备",
        status: "ongoing",
        statusText: "进行中",
        selected: false
      },
      {
        id: 5,
        date: "2024-08-01",
        time: "11:30",
        title: "系统集成测试",
        location: "数据中心机房",
        person: "系统工程师孙七",
        description: "进行智慧城市系统的集成测试和调试",
        status: "ongoing",
        statusText: "进行中",
        selected: false
      },
      {
        id: 6,
        date: "2024-09-10",
        time: "14:00",
        title: "用户培训计划",
        location: "市民服务中心",
        person: "培训师周八",
        description: "为市民和工作人员提供系统使用培训",
        status: "pending",
        statusText: "待开始",
        selected: false
      }
    ];

    // 按时间倒序排列
    return progressTemplates.sort((a, b) =>
      new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)
    );
  }
});
