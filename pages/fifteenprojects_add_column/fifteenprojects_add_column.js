Page({
  data: {
    currentStep: 1,
    columnName: '',
    selectedProjects: [],
    selectedProjectsData: [],
    projectList: [
      {
        id: 1,
        name: '智慧城市建设项目',
        description: '利用物联网技术建设智慧城市管理平台'
      },
      {
        id: 2,
        name: '绿色能源发展项目',
        description: '推广太阳能和风能等清洁能源技术'
      },
      {
        id: 3,
        name: '数字化教育改革项目',
        description: '建设在线教育平台，推进教育数字化'
      },
      {
        id: 4,
        name: '农业现代化示范项目',
        description: '推广现代农业技术，提高农业生产效率'
      },
      {
        id: 5,
        name: '文化旅游融合项目',
        description: '整合文化资源，发展特色旅游产业'
      }
    ]
  },

  onLoad() {
    console.log('新增列页面加载，项目列表：', this.data.projectList);
  },

  // 列名称输入
  onColumnNameInput(e) {
    this.setData({
      columnName: e.detail.value
    });
  },

  // 下一步
  nextStep() {
    const { currentStep, columnName, selectedProjects } = this.data;

    if (currentStep === 1) {
      if (!columnName.trim()) {
        wx.showToast({
          title: '请输入列名称',
          icon: 'none'
        });
        return;
      }
      this.setData({ currentStep: 2 });
    } else if (currentStep === 2) {
      if (selectedProjects.length === 0) {
        wx.showToast({
          title: '请选择至少一个项目',
          icon: 'none'
        });
        return;
      }
      // 初始化选中项目的内容数据
      const selectedProjectsData = this.data.projectList
        .filter(project => selectedProjects.includes(project.id))
        .map(project => ({
          id: project.id,
          name: project.name,
          content: ''
        }));

      this.setData({
        currentStep: 3,
        selectedProjectsData: selectedProjectsData
      });
    }
  },

  // 上一步
  prevStep() {
    const currentStep = this.data.currentStep;
    if (currentStep > 1) {
      this.setData({ currentStep: currentStep - 1 });
    }
  },

  // 切换项目选择
  toggleProject(e) {
    const projectId = e.currentTarget.dataset.id;
    const selectedProjects = [...this.data.selectedProjects];

    const index = selectedProjects.indexOf(projectId);
    if (index > -1) {
      selectedProjects.splice(index, 1);
    } else {
      selectedProjects.push(projectId);
    }

    this.setData({ selectedProjects });
  },

  // 内容输入
  onContentInput(e) {
    const projectId = e.currentTarget.dataset.id;
    const content = e.detail.value;
    const selectedProjectsData = [...this.data.selectedProjectsData];

    const project = selectedProjectsData.find(p => p.id === projectId);
    if (project) {
      project.content = content;
      this.setData({ selectedProjectsData });
    }
  },

  // 保存列
  saveColumn() {
    const { columnName, selectedProjectsData } = this.data;

    // 验证所有项目都有内容
    const emptyProjects = selectedProjectsData.filter(project => !project.content.trim());
    if (emptyProjects.length > 0) {
      wx.showToast({
        title: `请为"${emptyProjects[0].name}"填写内容`,
        icon: 'none'
      });
      return;
    }

    const submitData = {
      columnName: columnName.trim(),
      projectData: selectedProjectsData.map(project => ({
        projectId: project.id,
        projectName: project.name,
        content: project.content.trim()
      }))
    };

    wx.showLoading({
      title: '保存中...'
    });

    // TODO: 调用后端API保存新列数据
    // wx.request({
    //   url: 'your-api-endpoint/fifteen-projects/add-column',
    //   method: 'POST',
    //   data: submitData,
    //   success: (res) => {
    //     wx.hideLoading();
    //     wx.showModal({
    //       title: '操作结果',
    //       content: '新增列保存成功！',
    //       showCancel: false,
    //       success: () => {
    //         wx.navigateBack();
    //       }
    //     });
    //   },
    //   fail: (err) => {
    //     wx.hideLoading();
    //     console.error('保存新列失败:', err);
    //     wx.showModal({
    //       title: '操作结果',
    //       content: '新增列保存失败，请重试！',
    //       showCancel: false
    //     });
    //   }
    // });

    // 临时：模拟随机成功/失败
    const isSuccess = Math.random() > 0.3; // 70%成功率

    setTimeout(() => {
      wx.hideLoading();

      if (isSuccess) {
        wx.showModal({
          title: '操作结果',
          content: `新增列"${columnName}"保存成功！\n已为${selectedProjectsData.length}个项目添加了该列的内容。`,
          showCancel: false,
          success: () => {
            wx.navigateBack();
          }
        });
      } else {
        wx.showModal({
          title: '操作结果',
          content: '新增列保存失败，请检查网络连接后重试！',
          showCancel: false
        });
      }
    }, 1500);
  },

  // 取消
  cancel() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消新增列吗？未保存的数据将丢失。',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
});
