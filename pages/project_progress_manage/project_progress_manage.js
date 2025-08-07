Page({
  data: {
    projectList: [],
    selectedProject: null,
    progressList: [],
    loading: false,
    showAddForm: false,
    formData: {
      date: '',
      time: '',
      title: '',
      location: '',
      person: '',
      description: '',
      status: 'ongoing',
      completion: 0
    },
    editingProgress: null
  },

  onLoad: function() {
    console.log('项目进度管理页面加载');
    this.loadProjectList();
  },

  // 加载项目列表
  loadProjectList: function() {
    this.setData({ loading: true });
    
    const apiConfig = require('../../config/api.js');
    
    if (apiConfig.isMockEnabled()) {
      // 开发模式：使用默认数据
      setTimeout(() => {
        const defaultProjects = this.getDefaultProjects();
        this.setData({
          projectList: defaultProjects,
          loading: false
        });
      }, 500);
      return;
    }

    // 生产模式：调用数据库服务
    try {
      const dbService = require('../../utils/databaseService.js');
      const db = new dbService();
      
      db.getFifteenProjectsList().then(result => {
        if (result.success) {
          this.setData({
            projectList: result.projects,
            loading: false
          });
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      }).catch(error => {
        console.error('加载项目列表失败:', error);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      });
    } catch (error) {
      console.error('加载项目列表失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 获取默认项目数据
  getDefaultProjects: function() {
    return [
      {
        id: 1,
        projectName: "智慧城市基础设施建设项目",
        projectType: "基础设施建设"
      },
      {
        id: 2,
        projectName: "绿色能源产业园区建设",
        projectType: "产业发展"
      },
      {
        id: 3,
        projectName: "数字化教育改革试点",
        projectType: "民生改善"
      },
      {
        id: 4,
        projectName: "城市轨道交通建设工程",
        projectType: "交通建设"
      },
      {
        id: 5,
        projectName: "现代农业科技示范园",
        projectType: "农业发展"
      }
    ];
  },

  // 选择项目
  selectProject: function(e) {
    const project = e.currentTarget.dataset.project;
    this.setData({
      selectedProject: project
    });
    this.loadProgressList(project.id);
  },

  // 加载项目进度列表
  loadProgressList: function(projectId) {
    this.setData({ loading: true });
    
    // 从本地存储获取进度数据
    const progressKey = `project_progress_${projectId}`;
    const storedProgress = wx.getStorageSync(progressKey) || [];
    
    this.setData({
      progressList: storedProgress,
      loading: false
    });
  },

  // 显示添加表单
  showAddForm: function() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toTimeString().split(' ')[0].substring(0, 5);
    
    this.setData({
      showAddForm: true,
      editingProgress: null,
      formData: {
        date: dateStr,
        time: timeStr,
        title: '',
        location: '',
        person: '',
        description: '',
        status: 'ongoing',
        completion: 0
      }
    });
  },

  // 隐藏表单
  hideForm: function() {
    this.setData({
      showAddForm: false,
      editingProgress: null
    });
  },

  // 表单输入处理
  onFormInput: function(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 日期选择
  onDateChange: function(e) {
    this.setData({
      'formData.date': e.detail.value
    });
  },

  // 时间选择
  onTimeChange: function(e) {
    this.setData({
      'formData.time': e.detail.value
    });
  },

  // 状态选择
  onStatusChange: function(e) {
    const statusOptions = ['pending', 'ongoing', 'completed'];
    this.setData({
      'formData.status': statusOptions[e.detail.value]
    });
  },

  // 完成度滑动
  onCompletionChange: function(e) {
    this.setData({
      'formData.completion': e.detail.value
    });
  },

  // 保存进度
  saveProgress: function() {
    const formData = this.data.formData;
    
    // 验证必填字段
    if (!formData.title || !formData.location || !formData.person || !formData.description) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    const progressKey = `project_progress_${this.data.selectedProject.id}`;
    let progressList = wx.getStorageSync(progressKey) || [];
    
    const statusTextMap = {
      'pending': '待开始',
      'ongoing': '进行中',
      'completed': '已完成'
    };

    if (this.data.editingProgress) {
      // 编辑模式
      const index = progressList.findIndex(item => item.id === this.data.editingProgress.id);
      if (index !== -1) {
        progressList[index] = {
          ...progressList[index],
          ...formData,
          statusText: statusTextMap[formData.status],
          updateTime: new Date().toISOString()
        };
      }
    } else {
      // 新增模式
      const newProgress = {
        id: Date.now(),
        ...formData,
        statusText: statusTextMap[formData.status],
        images: [],
        createTime: new Date().toISOString()
      };
      progressList.unshift(newProgress);
    }

    // 保存到本地存储
    wx.setStorageSync(progressKey, progressList);
    
    this.setData({
      progressList: progressList,
      showAddForm: false,
      editingProgress: null
    });

    wx.showToast({
      title: this.data.editingProgress ? '修改成功' : '添加成功',
      icon: 'success'
    });
  },

  // 编辑进度
  editProgress: function(e) {
    const progress = e.currentTarget.dataset.progress;
    this.setData({
      showAddForm: true,
      editingProgress: progress,
      formData: {
        date: progress.date,
        time: progress.time,
        title: progress.title,
        location: progress.location,
        person: progress.person,
        description: progress.description,
        status: progress.status,
        completion: progress.completion || 0
      }
    });
  },

  // 删除进度
  deleteProgress: function(e) {
    const progress = e.currentTarget.dataset.progress;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除进度记录"${progress.title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          const progressKey = `project_progress_${this.data.selectedProject.id}`;
          let progressList = wx.getStorageSync(progressKey) || [];
          
          progressList = progressList.filter(item => item.id !== progress.id);
          wx.setStorageSync(progressKey, progressList);
          
          this.setData({
            progressList: progressList
          });

          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 返回项目列表
  backToProjectList: function() {
    this.setData({
      selectedProject: null,
      progressList: []
    });
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  }
});
