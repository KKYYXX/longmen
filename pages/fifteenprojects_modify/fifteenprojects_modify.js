/**
 * 项目修改页面
 * 
 * 功能说明：
 * 1. 步骤1：选择要修改的项目
 * 2. 步骤2：选择要修改的列（项目进度列有特殊功能）
 * 3. 步骤3：选择操作类型（修改、添加、删除）
 * 4. 步骤4：执行具体操作
 * 
 * 项目进度列特殊功能：
 * 当选择"项目进度"列并选择"添加内容"时，可以添加以下6种类型的内容：
 * - 图片：上传图片文件
 * - 视频：上传视频文件  
 * - 时间：选择日期和时间
 * - 地点：输入地点名称
 * - 人员：输入人员姓名和职务
 * - 新闻稿：上传文档文件
 * 
 * 数据流程：
 * 1. 用户点击6个按钮中的任意一个
 * 2. 系统调用相应的函数（uploadImage, uploadVideo, addTime等）
 * 3. 用户输入或选择相应内容
 * 4. 内容被添加到 addedItems 数组中
 * 5. 用户点击"保存添加"按钮
 * 6. 系统调用 saveProgressAddition() 函数
 * 7. 数据被发送到后端接口 POST /api/progress/add
 * 8. 后端将数据存储到 Progress 表中
 * 
 * 后端接口字段映射：
 * - project_name: 项目名称（从选择的项目中获取）
 * - practice_time: 实践时间（从添加时间获取，格式：YYYY-MM-DD）
 * - practice_location: 实践地点（从添加地点获取）
 * - practice_members: 实践人员（从添加人员获取）
 * - practice_image_url: 实践图片URL（从添加图片获取）
 * - practice_video_url: 实践视频URL（从添加视频获取）
 * - news: 新闻链接（从添加新闻链接获取，存储文件路径）
 */

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
    locationName: '',
    personName: '',
    addedItems: [],
    loading: false, // 添加加载状态
    searchKeyword: '', // 搜索关键词
    filteredProjectList: [], // 过滤后的项目列表

    // 删除内容相关
    timeFilter: 'all',
    selectedDeleteDate: '',
    progressList: [],
    filteredProgressList: [],
    selectedDeleteCount: 0,
    isAllProgressSelected: false,

    // 修改内容相关
    modifyTimeFilter: 'all',
    selectedModifyDate: '',
    modifyProgressList: [],
    filteredModifyProgressList: [],
    selectedModifyRecord: null,
    modifyRecord: {},
    currentColumnValue: '', // 当前列的值

    editMode: false, // 是否为编辑模式
    editingProjectId: null, // 正在编辑的项目ID
    projectList: [], // 项目列表，将从后端获取
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
    
    // 加载项目列表
    this.loadProjectList();
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('触发下拉刷新');
    this.loadProjectList();
    // 停止下拉刷新动画
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 加载项目列表
  loadProjectList() {
    this.setData({
      loading: true
    });
    
    wx.showLoading({
      title: '加载中...',
    });

    wx.request({
      url: 'http://127.0.0.1:5000/app/api/15projects/names',
      method: 'GET',
      success: (res) => {
        wx.hideLoading();
        this.setData({
          loading: false
        });
        
        if (res.statusCode === 200 && res.data && res.data.success && Array.isArray(res.data.data)) {
          const projectNames = res.data.data;
          console.log('获取到项目名称列表:', projectNames);
          
          // 获取所有项目的详细信息
          this.loadAllProjectDetailsForModify(projectNames);
        } else {
          console.error('获取项目列表失败:', res);
          this.setData({
            projectList: []
          });
          wx.showToast({
            title: '获取项目列表失败',
            icon: 'error'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        this.setData({
          loading: false
        });
        console.error('请求项目列表失败:', err);
        this.setData({
          projectList: []
        });
        wx.showToast({
          title: '网络请求失败',
          icon: 'error'
        });
      }
    });
  },

  // 获取所有项目的详细信息（用于修改页面）
  loadAllProjectDetailsForModify(projectNames) {
    console.log('开始加载所有项目详细信息，项目数量:', projectNames.length);
    
    if (projectNames.length === 0) {
      this.setData({
        projectList: []
      });
      return;
    }

    let completedCount = 0;
    const allProjects = [];

    projectNames.forEach((projectName, index) => {
      // 为每个项目创建基础对象
      const baseProject = {
        id: index + 1, // 临时ID，稍后会被真实ID替换
        name: projectName,
        description: '项目详情请查看具体信息',
        projectName: projectName,
        // 其他字段设置为默认值
        serialNumber: '待设置',
        cityLevel: '待设置',
        pairedCounty: '待设置',
        pairedInstitution: '待设置',
        implementationUnit: '待设置',
        isKeyProject: '待设置',
        involvedAreas: '待设置',
        projectType: '待设置',
        startDate: '待设置',
        endDate: '待设置',
        background: '待设置',
        content: '待设置',
        objectives: '待设置',
        contacts: '待设置',
        remarks: '待设置',
        progress: 0
      };

      // 获取单个项目的详细信息
      this.getProjectDetailDataForModify(projectName, baseProject, (enhancedProject) => {
        allProjects.push(enhancedProject);
        completedCount++;

        // 当所有项目都加载完成时，更新页面数据
        if (completedCount === projectNames.length) {
          console.log('所有项目详细信息加载完成:', allProjects);
          
          this.setData({
            projectList: allProjects
          });

          // 显示成功提示
          if (allProjects.length > 0) {
            wx.showToast({
              title: `成功加载 ${allProjects.length} 个项目`,
              icon: 'success',
              duration: 2000
            });
          }
        }
      });
    });
  },

  // 获取单个项目的详细数据（用于修改页面）
  getProjectDetailDataForModify(projectName, originalProject, callback) {
    console.log('获取项目详细数据，项目名称:', projectName);
    
    // 先通过项目名称查找项目ID
    this.findProjectIdByNameForModify(projectName, (projectId) => {
      if (projectId) {
        console.log('找到项目ID:', projectId, '开始获取详细信息');
        // 找到项目ID后，获取详细信息
        this.getProjectDetailDataByIdForModify(projectId, originalProject, callback);
      } else {
        console.warn('未找到项目ID，项目名称:', projectName);
        // 如果找不到ID，直接返回原项目数据
        callback(originalProject);
      }
    });
  },

  // 通过项目名称查找项目ID（用于修改页面）
  findProjectIdByNameForModify(projectName, callback) {
    console.log('开始查找项目ID，项目名称:', projectName);
    
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/15projects/search',
      method: 'GET',
      data: {
        project_name: projectName
      },
      success: (res) => {
        console.log('搜索接口响应:', res);
        
        if (res.statusCode === 200 && res.data && res.data.success && res.data.data) {
          // 找到项目，返回数据库中的真实ID
          const projectId = res.data.data.id;
          console.log('在数据库中找到项目:', projectName, '真实ID:', projectId);
          callback(projectId);
        } else if (res.statusCode === 404) {
          // 数据库中没有找到该项目名称
          console.error('数据库中没有找到项目名称:', projectName);
          callback(null);
        } else {
          // 其他错误
          console.error('查询项目信息失败:', res);
          callback(null);
        }
      },
      fail: (err) => {
        console.error('请求项目信息失败:', err);
        callback(null);
      }
    });
  },

  // 通过项目ID获取详细信息（用于修改页面）
  getProjectDetailDataByIdForModify(projectId, originalProject, callback) {
    console.log('获取项目详细数据，项目ID:', projectId);
    
    wx.request({
      url: `http://127.0.0.1:5000/app/api/15projects/detail/${projectId}`,
      method: 'GET',
      data: {
        project_id: projectId
      },
      success: (res) => {
        console.log('详情接口响应:', res);
        
        if (res.statusCode === 200 && res.data && res.data.success && res.data.data) {
          // 获取到详细信息，合并原有数据和详细信息
          const detailData = res.data.data;
          console.log('获取到的详细数据:', detailData);
          
          // 检查每个字段，如果后端返回空值或undefined，则使用"未设置"
          const enhancedProject = {
            ...originalProject,
            id: projectId, // 使用真实的数据库ID
            // 确保关键字段存在，优先使用后端返回的数据，空值时显示"未设置"
            projectName: detailData.project_name || originalProject.projectName || '未设置',
            serialNumber: detailData.serial_number || originalProject.serialNumber || '未设置',
            cityLevel: detailData.city || originalProject.cityLevel || '未设置',
            pairedCounty: detailData.county || originalProject.pairedCounty || '未设置',
            pairedInstitution: detailData.universities || originalProject.pairedInstitution || '未设置',
            implementationUnit: detailData.implementing_institutions || originalProject.implementationUnit || '未设置',
            isKeyProject: detailData.is_key_project ? '是' : '否',
            involvedAreas: detailData.involved_areas || originalProject.involvedAreas || '未设置',
            projectType: detailData.project_type || originalProject.projectType || '未设置',
            startDate: detailData.start_date || originalProject.startDate || '未设置',
            endDate: detailData.end_date || originalProject.endDate || '未设置',
            background: detailData.background || originalProject.background || '未设置',
            content: detailData.content_and_measures || originalProject.content || '待补充',
            objectives: detailData.objectives || originalProject.objectives || '待补充',
            contacts: detailData.contacts || originalProject.contacts || '待设置',
            remarks: detailData.remarks || originalProject.remarks || '待补充'
          };

          console.log('增强后的项目数据:', enhancedProject);
          callback(enhancedProject);
        } else {
          console.warn('获取项目详情失败，使用原有数据:', res);
          callback(originalProject);
        }
      },
      fail: (err) => {
        console.error('获取项目详情失败:', err);
        callback(originalProject);
      }
    });
  },

  // 搜索输入处理
  onSearchInput(e) {
    const searchKeyword = e.detail.value;
    this.setData({
      searchKeyword: searchKeyword
    });
    this.filterProjects();
  },

  // 执行搜索
  onSearch() {
    this.filterProjects();
  },

  // 清除搜索
  clearSearch() {
    this.setData({
      searchKeyword: '',
      filteredProjectList: []
    });
  },

  // 过滤项目
  filterProjects() {
    const { projectList, searchKeyword } = this.data;
    if (!searchKeyword.trim()) {
      this.setData({
        filteredProjectList: []
      });
      return;
    }

    const filtered = projectList.filter(project => 
      project.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      project.projectName.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    this.setData({
      filteredProjectList: filtered
    });
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
    const currentValue = this.getCurrentColumnValue(this.data.selectedProject, column.key);
    this.setData({
      selectedColumn: column,
      currentColumnValue: currentValue
    });
  },

  // 选择操作类型
  selectAction(e) {
    const action = e.currentTarget.dataset.action;
    let newContent = '';

    // 如果是修改操作且不是项目进度列，预填充当前值
    if (action === 'modify' && this.data.selectedColumn.key !== 'progress') {
      const currentValue = this.getCurrentColumnValue(this.data.selectedProject, this.data.selectedColumn.key);
      newContent = currentValue || '';
    }

    this.setData({
      selectedAction: action,
      newContent: newContent,
      addedItems: [],
      showLinkInput: false
    });
  },

  // 下一步
  nextStep() {
    const currentStep = this.data.currentStep;
    
    // 如果是从步骤2到步骤3，且不是项目进度列，自动设置为修改操作并跳转到步骤4
    if (currentStep === 2 && this.data.selectedColumn.key !== 'progress') {
      this.setData({
        selectedAction: 'modify',
        currentStep: 4  // 直接跳转到步骤4
      });
      
      // 预填充当前值
      const currentValue = this.getCurrentColumnValue(this.data.selectedProject, this.data.selectedColumn.key);
      this.setData({
        newContent: currentValue || ''
      });
      return;
    }
    
    this.setData({
      currentStep: currentStep + 1
    });

    // 只有项目进度列才需要加载进度数据
    if (this.data.selectedColumn.key === 'progress' && currentStep + 1 === 4) {
      // 如果选择了删除内容，加载进度数据
      if (this.data.selectedAction === 'delete') {
        this.loadProgressData();
      }
      // 如果选择了修改内容，加载进度数据
      if (this.data.selectedAction === 'modify') {
        this.loadModifyProgressData();
      }
      // 项目进度列的添加内容不需要加载数据，直接显示添加界面
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
      selectedDate: ''
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
      personName: ''
    });
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      selectedDate: e.detail.value
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



  // 确认添加时间
  confirmAddTime() {
    const { selectedDate } = this.data;

    if (!selectedDate) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      return;
    }

    this.addItem({
      type: '时间',
      name: selectedDate,
      date: selectedDate
    });

    this.setData({
      showTimeInput: false,
      selectedDate: ''
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
    const { personName } = this.data;

    if (!personName.trim()) {
      wx.showToast({
        title: '请输入人员姓名',
        icon: 'none'
      });
      return;
    }

    this.addItem({
      type: '人员',
      name: personName.trim()
    });

    this.setData({
      showPersonInput: false,
      personName: ''
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
    console.log('添加新项目到列表:', item);
    
    const addedItems = [...this.data.addedItems, item];
    this.setData({
      addedItems: addedItems
    });

    // 显示添加成功的提示
    wx.showToast({
      title: `已添加${item.type}`,
      icon: 'success',
      duration: 1500
    });

    // 在控制台显示当前已添加的所有项目
    console.log('当前已添加的所有项目:', addedItems);
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

    // 如果是项目进度列，调用专门的进度保存函数
    if (selectedColumn.key === 'progress') {
      this.saveProgressAddition();
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

  // 保存项目进度内容到后端
  saveProgressAddition() {
    const { selectedProject, addedItems } = this.data;

    if (addedItems.length === 0) {
      wx.showToast({
        title: '请先添加内容',
        icon: 'none'
      });
      return;
    }

    // 验证项目信息
    if (!selectedProject || !selectedProject.id) {
      wx.showToast({
        title: '项目信息不完整',
        icon: 'error'
      });
      return;
    }

    wx.showLoading({
      title: '保存进度信息中...'
    });

    // 构建要发送到后端的数据，按照后端接口要求调整字段
    const progressData = {
      project_name: selectedProject.projectName || selectedProject.name,
      practice_time: '',
      practice_location: '',
      practice_members: '',
      practice_image_url: '',
      video_url: '',
      news: ''
    };

    // 处理已添加的内容，按类型分类并映射到后端字段
    addedItems.forEach(item => {
      switch (item.type) {
        case '图片':
          progressData.practice_image_url = item.path || item.name;
          break;
        case '视频':
          progressData.video_url = item.path || item.name;
          break;
        case '时间':
          progressData.practice_time = item.name; // 这里存储的是日期（YYYY-MM-DD格式）
          break;
        case '地点':
          progressData.practice_location = item.name;
          break;
        case '人员':
          progressData.practice_members = item.name;
          break;
        case '新闻稿':
          progressData.news = item.path || item.name; // 存储文件路径
          break;
      }
    });

    console.log('准备发送到后端的进度数据:', progressData);
    console.log('验证各字段值:');
    console.log('- project_name:', progressData.project_name);
    console.log('- practice_time:', progressData.practice_time);
    console.log('- practice_location:', progressData.practice_location);
    console.log('- practice_members:', progressData.practice_members);
    console.log('- news:', progressData.news);
    console.log('- practice_image_url:', progressData.practice_image_url);
    console.log('- video_url:', progressData.video_url);

    // 验证必要参数
    if (!progressData.project_name || !progressData.practice_time || !progressData.practice_location || !progressData.practice_members || !progressData.news) {
      wx.hideLoading();
      wx.showModal({
        title: '参数不完整',
        content: '请确保添加了：时间、地点、人员、新闻稿等必要内容',
        showCancel: false
      });
      return;
    }

    // 调用后端接口
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/progress/add',
      method: 'POST',
      data: progressData,
      success: (res) => {
        wx.hideLoading();
        console.log('后端接口响应:', res);

        if ((res.statusCode === 200 || res.statusCode === 201) && res.data && res.data.success) {
          // 保存成功
          wx.showModal({
            title: '保存成功',
            content: `项目进度信息已成功保存！\n项目：${progressData.project_name}\n已添加${addedItems.length}项内容。`,
            showCancel: false,
            success: () => {
              // 保存成功后，重置状态
              this.setData({
                currentStep: 1,
                selectedProject: null,
                selectedColumn: null,
                selectedAction: '',
                addedItems: [],
                showTimeInput: false,
                showLocationInput: false,
                showPersonInput: false
              });

              // 显示成功提示
              wx.showToast({
                title: '进度信息保存成功',
                icon: 'success',
                duration: 2000
              });
            }
          });
        } else if (res.statusCode === 400) {
          // 请求参数错误
          wx.showModal({
            title: '保存失败',
            content: `参数错误：${res.data?.message || '请检查输入数据'}`,
            showCancel: false
          });
        } else if (res.statusCode === 500) {
          // 服务器内部错误
          wx.showModal({
            title: '保存失败',
            content: `服务器错误：${res.data?.message || '请稍后重试'}`,
            showCancel: false
          });
        } else {
          // 其他错误
          console.error('后端接口返回错误:', res);
          console.error('状态码:', res.statusCode);
          console.error('响应数据:', res.data);
          wx.showModal({
            title: '保存失败',
            content: `保存失败：状态码 ${res.statusCode}\n${res.data?.message || '未知错误，请重试'}`,
            showCancel: false
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('请求后端接口失败:', err);
        
        // 根据错误类型给出不同的提示
        let errorMessage = '网络请求失败，请检查网络连接后重试！';
        
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorMessage = '请求超时，请检查网络连接后重试！';
          } else if (err.errMsg.includes('fail')) {
            errorMessage = '网络连接失败，请检查网络设置！';
          }
        }
        
        wx.showModal({
          title: '保存失败',
          content: errorMessage,
          showCancel: false
        });
      }
    });
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
    } else if (filter === 'all') {
      // 显示全部数据
      filtered = this.data.progressList;
    }

    // 重置选择状态
    filtered = filtered.map(item => ({ ...item, selected: false }));

    console.log(`时间筛选 ${filter}：总数据 ${this.data.progressList.length} 条，筛选后 ${filtered.length} 条`);

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
    // 动态生成接近当前时间的测试数据
    const now = new Date();
    const progressTemplates = [
      {
        id: 1,
        date: this.formatDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)), // 2天前
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
        date: this.formatDate(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)), // 5天前
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
        date: this.formatDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)), // 10天前
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
        date: this.formatDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)), // 15天前
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
        date: this.formatDate(new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000)), // 25天前
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
        date: this.formatDate(new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000)), // 40天前
        time: "14:00",
        title: "用户培训计划",
        location: "市民服务中心",
        person: "培训师周八",
        description: "为市民和工作人员提供系统使用培训",
        status: "pending",
        statusText: "待开始",
        selected: false
      },
      {
        id: 7,
        date: this.formatDate(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)), // 60天前
        time: "16:30",
        title: "需求调研",
        location: "各区县政府",
        person: "调研员钱九",
        description: "深入各区县了解智慧城市建设需求",
        status: "completed",
        statusText: "已完成",
        selected: false
      },
      {
        id: 8,
        date: this.formatDate(new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)), // 90天前
        time: "10:00",
        title: "方案设计",
        location: "设计院",
        person: "设计师孙十",
        description: "完成智慧城市总体方案设计",
        status: "completed",
        statusText: "已完成",
        selected: false
      }
    ];

    // 按时间倒序排列
    return progressTemplates.sort((a, b) => {
      // 将日期格式转换为iOS兼容格式
      const dateTimeA = a.date.replace(/-/g, '/') + ' ' + a.time + ':00';
      const dateTimeB = b.date.replace(/-/g, '/') + ' ' + b.time + ':00';
      return new Date(dateTimeB) - new Date(dateTimeA);
    });
  },

  // 格式化日期为YYYY-MM-DD格式
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // ========== 修改内容相关方法 ==========

  // 加载修改进度数据
  loadModifyProgressData() {
    const progressData = this.generateProgressData();
    this.setData({
      modifyProgressList: progressData,
      filteredModifyProgressList: progressData,
      modifyTimeFilter: 'all'
    });
  },

  // 修改时间筛选
  filterModifyByTime(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      modifyTimeFilter: filter,
      selectedModifyDate: ''
    });
    this.applyModifyTimeFilter(filter);
  },

  // 应用修改时间筛选
  applyModifyTimeFilter(filter, customDate = null) {
    let filteredList = [...this.data.modifyProgressList];
    const now = new Date();

    if (customDate) {
      // 自定义日期筛选
      filteredList = filteredList.filter(item => item.date === customDate);
    } else {
      switch (filter) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filteredList = filteredList.filter(item => new Date(item.date) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filteredList = filteredList.filter(item => new Date(item.date) >= monthAgo);
          break;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          filteredList = filteredList.filter(item => new Date(item.date) >= yearAgo);
          break;
        case 'all':
        default:
          // 显示全部
          break;
      }
    }

    console.log(`修改时间筛选 ${filter}：总数据 ${this.data.modifyProgressList.length} 条，筛选后 ${filteredList.length} 条`);

    this.setData({
      filteredModifyProgressList: filteredList
    });
  },

  // 修改日期选择
  onModifyDateChange(e) {
    const selectedDate = e.detail.value;
    this.setData({
      selectedModifyDate: selectedDate,
      modifyTimeFilter: ''
    });
    this.applyModifyTimeFilter('custom', selectedDate);
  },

  // 选择要修改的记录
  selectModifyRecord(e) {
    const record = e.currentTarget.dataset.record;
    this.setData({
      selectedModifyRecord: record,
      modifyRecord: {
        ...record,
        images: record.images || [],
        videos: record.videos || [],
        news: record.news || '',
        newsFiles: record.newsFiles || []
      }
    });
  },

  // 进入修改详情页面
  nextStepToModifyDetail() {
    if (!this.data.selectedModifyRecord) {
      wx.showToast({
        title: '请选择要修改的记录',
        icon: 'none'
      });
      return;
    }

    this.setData({
      currentStep: 5
    });
  },

  // 返回修改列表
  backToModifyList() {
    this.setData({
      currentStep: 4,
      selectedModifyRecord: null,
      modifyRecord: {}
    });
  },

  // 修改详情 - 日期变更
  onModifyDetailDateChange(e) {
    this.setData({
      'modifyRecord.date': e.detail.value
    });
  },

  // 修改详情 - 人员输入
  onModifyPersonInput(e) {
    this.setData({
      'modifyRecord.person': e.detail.value
    });
  },

  // 修改详情 - 地点输入
  onModifyLocationInput(e) {
    this.setData({
      'modifyRecord.location': e.detail.value
    });
  },

  // 上传新闻稿文件
  uploadNewsFile() {
    wx.showActionSheet({
      itemList: ['选择PDF文档', '选择Word文档', '选择图片文件'],
      success: (res) => {
        const fileTypes = ['pdf', 'doc', 'image'];
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
      count: 5,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.processSelectedFiles(res.tempFiles, 'image');
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
    wx.chooseMessageFile({
      count: 3,
      type: 'file',
      extension: fileType === 'pdf' ? ['pdf'] : ['doc', 'docx'],
      success: (res) => {
        // 过滤文件类型
        const validFiles = res.tempFiles.filter(file => {
          const fileName = file.name.toLowerCase();
          if (fileType === 'pdf') return fileName.endsWith('.pdf');
          if (fileType === 'doc') return fileName.endsWith('.doc') || fileName.endsWith('.docx');
          return true;
        });

        if (validFiles.length > 0) {
          this.processSelectedFiles(validFiles, fileType);
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

  // 处理选中的文件
  processSelectedFiles(files, fileType) {
    const newsFiles = this.data.modifyRecord.newsFiles || [];

    files.forEach(file => {
      const fileInfo = {
        name: file.name || `${fileType}文件${newsFiles.length + 1}`,
        path: file.tempFilePath || file.path,
        size: file.size,
        sizeText: this.formatFileSize(file.size),
        type: fileType,
        uploadTime: new Date().toLocaleString()
      };
      newsFiles.push(fileInfo);
    });

    this.setData({
      'modifyRecord.newsFiles': newsFiles
    });

    wx.showToast({
      title: `已添加${files.length}个文件`,
      icon: 'success'
    });
  },

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // 预览文件
  previewFile(e) {
    const index = e.currentTarget.dataset.index;
    const file = this.data.modifyRecord.newsFiles[index];

    if (file.type === 'image') {
      wx.previewImage({
        urls: [file.path],
        current: file.path
      });
    } else {
      wx.openDocument({
        filePath: file.path,
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
    }
  },

  // 删除新闻稿文件
  deleteNewsFile(e) {
    const index = e.currentTarget.dataset.index;
    const newsFiles = [...this.data.modifyRecord.newsFiles];

    wx.showModal({
      title: '确认删除',
      content: `确定要删除文件"${newsFiles[index].name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          newsFiles.splice(index, 1);
          this.setData({
            'modifyRecord.newsFiles': newsFiles
          });
          wx.showToast({
            title: '文件已删除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 上传修改图片
  uploadModifyImage() {
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const currentImages = this.data.modifyRecord.images || [];
        const newImages = [...currentImages, ...res.tempFilePaths];
        this.setData({
          'modifyRecord.images': newImages
        });
      }
    });
  },

  // 移除修改图片
  removeModifyImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.modifyRecord.images];
    images.splice(index, 1);
    this.setData({
      'modifyRecord.images': images
    });
  },

  // 上传修改视频
  uploadModifyVideo() {
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: (res) => {
        const currentVideos = this.data.modifyRecord.videos || [];
        const newVideos = [...currentVideos, res.tempFilePath];
        this.setData({
          'modifyRecord.videos': newVideos
        });
      }
    });
  },

  // 移除修改视频
  removeModifyVideo(e) {
    const index = e.currentTarget.dataset.index;
    const videos = [...this.data.modifyRecord.videos];
    videos.splice(index, 1);
    this.setData({
      'modifyRecord.videos': videos
    });
  },

  // 保存修改详情
  saveModifyDetail() {
    const { selectedModifyRecord, modifyRecord } = this.data;

    wx.showLoading({
      title: '保存中...'
    });

    // TODO: 调用后端API保存修改
    setTimeout(() => {
      wx.hideLoading();

      // 更新本地数据
      const progressList = [...this.data.modifyProgressList];
      const recordIndex = progressList.findIndex(item => item.id === selectedModifyRecord.id);
      if (recordIndex !== -1) {
        progressList[recordIndex] = { ...progressList[recordIndex], ...modifyRecord };
      }

      this.setData({
        modifyProgressList: progressList
      });

      // 重新应用筛选
      this.applyModifyTimeFilter(this.data.modifyTimeFilter, this.data.selectedModifyDate);

      wx.showModal({
        title: '修改成功',
        content: '进度记录已成功修改！',
        showCancel: false,
        success: () => {
          this.backToModifyList();
        }
      });
    }, 1500);
  },

  // 获取当前列的值
  getCurrentColumnValue(project, columnKey) {
    if (!project || !columnKey) return '';
    return project[columnKey] || '';
  },

  // 新内容输入
  onNewContentInput(e) {
    this.setData({
      newContent: e.detail.value
    });
  },

  // 日期选择器变化
  onDatePickerChange(e) {
    this.setData({
      newContent: e.detail.value
    });
  },

  // 选择是否重点项目
  selectKeyProject(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      newContent: value
    });
  },

  // 确认简单修改
  confirmSimpleModify() {
    const { selectedProject, selectedColumn, newContent } = this.data;

    if (!newContent.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '修改中...'
    });

    // 构建要发送到后端的数据
    const modifyData = {
      project_id: selectedProject.id,
      field_name: selectedColumn.key,
      new_value: newContent.trim(),
      old_value: selectedProject[selectedColumn.key] || ''
    };

    console.log('准备发送到后端的修改数据:', modifyData);

    // 调用后端PUT接口
    wx.request({
      url: `http://127.0.0.1:5000/app/api/15projects/${selectedProject.id}`,
      method: 'PUT',
      data: modifyData,
      success: (res) => {
        wx.hideLoading();
        console.log('后端接口响应:', res);

        if ((res.statusCode === 200 || res.statusCode === 201) && res.data && res.data.success) {
          // 修改成功
          wx.showModal({
            title: '修改成功',
            content: `${selectedColumn.name}已成功修改！\n原值：${modifyData.old_value || '无'}\n新值：${modifyData.new_value}`,
            showCancel: false,
            success: () => {
              // 更新本地项目数据
              const projectList = [...this.data.projectList];
              const projectIndex = projectList.findIndex(p => p.id === selectedProject.id);
              if (projectIndex > -1) {
                projectList[projectIndex][selectedColumn.key] = modifyData.new_value;
              }

              this.setData({
                projectList: projectList
              });

              // 返回项目列表
              wx.navigateBack();
            }
          });
        } else if (res.statusCode === 400) {
          // 请求参数错误
          wx.showModal({
            title: '修改失败',
            content: `参数错误：${res.data?.message || '请检查输入数据'}`,
            showCancel: false
          });
        } else if (res.statusCode === 404) {
          // 项目不存在
          wx.showModal({
            title: '修改失败',
            content: '项目不存在或已被删除',
            showCancel: false
          });
        } else if (res.statusCode === 500) {
          // 服务器内部错误
          wx.showModal({
            title: '修改失败',
            content: `服务器错误：${res.data?.message || '请稍后重试'}`,
            showCancel: false
          });
        } else {
          // 其他错误
          console.error('后端接口返回错误:', res);
          wx.showModal({
            title: '修改失败',
            content: `修改失败：${res.data?.message || '未知错误，请重试'}`,
            showCancel: false
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('请求后端接口失败:', err);
        
        // 根据错误类型给出不同的提示
        let errorMessage = '网络请求失败，请检查网络连接后重试！';
        
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorMessage = '请求超时，请检查网络连接后重试！';
          } else if (err.errMsg.includes('fail')) {
            errorMessage = '网络连接失败，请检查网络设置！';
          }
        }
        
        wx.showModal({
          title: '修改失败',
          content: errorMessage,
          showCancel: false
        });
      }
    });
  },

  // 保存简单添加内容
  saveSimpleAddition() {
    const { selectedProject, selectedColumn, newContent } = this.data;

    if (!newContent.trim()) {
      wx.showToast({
        title: '请输入要添加的内容',
        icon: 'none'
      });
      return;
    }

    // 获取当前列的值
    const currentValue = this.getCurrentColumnValue(selectedProject, selectedColumn.key);
    let updatedValue = '';

    // 根据列类型处理添加逻辑
    if (selectedColumn.key === 'contacts') {
      // 联系人信息：用分号分隔多个联系人
      updatedValue = currentValue ? `${currentValue}; ${newContent}` : newContent;
    } else if (selectedColumn.key === 'involvedAreas') {
      // 涉及区域：用逗号分隔多个区域
      updatedValue = currentValue ? `${currentValue}, ${newContent}` : newContent;
    } else if (selectedColumn.type === 'textarea') {
      // 多行文本：换行添加
      updatedValue = currentValue ? `${currentValue}\n\n${newContent}` : newContent;
    } else {
      // 其他文本类型：用分号分隔
      updatedValue = currentValue ? `${currentValue}; ${newContent}` : newContent;
    }

    // 更新项目数据
    const updatedProject = { ...selectedProject };
    updatedProject[selectedColumn.key] = updatedValue;

    // 这里应该调用API保存到后端
    console.log('添加项目字段内容：', {
      projectId: selectedProject.id,
      field: selectedColumn.key,
      oldValue: currentValue,
      addedContent: newContent,
      newValue: updatedValue
    });

    wx.showModal({
      title: '添加成功',
      content: `${selectedColumn.name}内容已成功添加！`,
      showCancel: false,
      success: () => {
        // 返回项目列表
        wx.navigateBack();
      }
    });
  }
});
