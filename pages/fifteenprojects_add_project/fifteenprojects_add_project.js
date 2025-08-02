Page({
  data: {
    projectData: {},
    projectColumns: [
      { name: '项目名称', key: 'projectName', type: 'text', required: true, placeholder: '请输入项目名称' },
      { name: '项目类型', key: 'projectType', type: 'select', required: true, options: ['基础设施建设', '科技创新', '环保治理', '民生改善', '产业发展', '其他'] },
      { name: '开始时间', key: 'startDate', type: 'date', required: true, placeholder: '请选择开始时间' },
      { name: '结束时间', key: 'endDate', type: 'date', required: false, placeholder: '请选择结束时间' },
      { name: '项目背景', key: 'background', type: 'textarea', required: false, placeholder: '请输入项目背景' },
      { name: '项目内容和落实举措', key: 'content', type: 'textarea', required: false, placeholder: '请输入项目内容和落实举措' },
      { name: '主要任务目标', key: 'objectives', type: 'textarea', required: false, placeholder: '请输入主要任务目标' },
      { name: '联系人姓名', key: 'contactName', type: 'text', required: false, placeholder: '请输入联系人姓名' },
      { name: '联系人职务', key: 'contactPosition', type: 'text', required: false, placeholder: '请输入联系人职务' },
      { name: '联系方式', key: 'contactPhone', type: 'text', required: false, placeholder: '请输入联系方式' },
      { name: '备注', key: 'remarks', type: 'textarea', required: false, placeholder: '请输入备注信息' },
      { name: '项目进度', key: 'progress', type: 'slider', required: false, min: 0, max: 100, unit: '%' },
      // 示例：动态添加的列
      { name: '项目负责人', key: 'projectManager', type: 'text', required: false, placeholder: '请输入项目负责人' },
      { name: '预算金额', key: 'budget', type: 'text', required: false, placeholder: '请输入预算金额（万元）' },
      { name: '完成状态', key: 'status', type: 'select', required: false, options: ['未开始', '进行中', '已完成', '已暂停'] }
    ]
  },

  onLoad() {
    // 初始化项目数据
    const projectData = {};
    this.data.projectColumns.forEach(column => {
      if (column.type === 'slider') {
        projectData[column.key] = 0;
      } else {
        projectData[column.key] = '';
      }
    });
    this.setData({ projectData });
  },

  // 通用输入处理
  onFieldInput(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`projectData.${field}`]: value
    });
  },

  // 选择器变化处理
  onPickerChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    const column = this.data.projectColumns.find(col => col.key === field);

    if (column && column.options) {
      this.setData({
        [`projectData.${field}`]: column.options[value]
      });
    } else {
      this.setData({
        [`projectData.${field}`]: value
      });
    }
  },

  // 滑块变化处理
  onSliderChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({
      [`projectData.${field}`]: value
    });
  },

  // 上传项目报告
  uploadReport() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        // TODO: 上传文件到服务器
        wx.showToast({
          title: '文件上传功能待实现',
          icon: 'none'
        });
      }
    });
  },

  // 上传相关文件
  uploadFiles() {
    wx.chooseMessageFile({
      count: 5,
      type: 'file',
      success: (res) => {
        // TODO: 上传文件到服务器
        wx.showToast({
          title: '文件上传功能待实现',
          icon: 'none'
        });
      }
    });
  },

  // 保存项目
  saveProject() {
    const { projectData, projectColumns } = this.data;

    // 验证必填字段
    const requiredColumns = projectColumns.filter(col => col.required);
    for (let column of requiredColumns) {
      const value = projectData[column.key];
      if (!value || (typeof value === 'string' && !value.trim())) {
        wx.showToast({
          title: `请填写${column.name}`,
          icon: 'none'
        });
        return;
      }
    }

    // 构建提交数据
    const submitData = {
      ...projectData,
      createDate: new Date().toISOString().split('T')[0]
    };

    wx.showLoading({
      title: '保存中...'
    });

    // TODO: 调用后端API保存项目
    // wx.request({
    //   url: 'your-api-endpoint/fifteen-projects',
    //   method: 'POST',
    //   data: submitData,
    //   success: (res) => {
    //     wx.hideLoading();
    //     wx.showModal({
    //       title: '操作结果',
    //       content: '项目保存成功！',
    //       showCancel: false,
    //       success: () => {
    //         wx.navigateBack();
    //       }
    //     });
    //   },
    //   fail: (err) => {
    //     wx.hideLoading();
    //     console.error('保存项目失败:', err);
    //     wx.showModal({
    //       title: '操作结果',
    //       content: '项目保存失败，请重试！',
    //       showCancel: false
    //     });
    //   }
    // });

    // 临时：模拟随机成功/失败
    const isSuccess = Math.random() > 0.2; // 80%成功率

    setTimeout(() => {
      wx.hideLoading();

      if (isSuccess) {
        wx.showModal({
          title: '操作结果',
          content: `项目"${projectData.projectName}"保存成功！\n已保存${Object.keys(projectData).length}个字段的数据。`,
          showCancel: false,
          success: () => {
            wx.navigateBack();
          }
        });
      } else {
        wx.showModal({
          title: '操作结果',
          content: '项目保存失败，请检查网络连接后重试！',
          showCancel: false
        });
      }
    }, 1500);
  },

  // 取消
  cancel() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消新增项目吗？未保存的数据将丢失。',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
});
