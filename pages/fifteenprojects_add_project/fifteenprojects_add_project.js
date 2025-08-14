Page({
  data: {
    projectData: {},
    projectColumns: [
      { name: '序号', key: 'serialNumber', type: 'text', required: true, placeholder: '请输入序号' },
      { name: '地级市', key: 'cityLevel', type: 'text', required: true, placeholder: '请输入地级市' },
      { name: '结对县（市、区）', key: 'pairedCounty', type: 'text', required: false, placeholder: '请输入结对县（市、区）' },
      { name: '组团结对高校院所', key: 'pairedInstitution', type: 'text', required: false, placeholder: '请输入组团结对高校院所' },
      { name: '项目名称', key: 'projectName', type: 'text', required: true, placeholder: '请输入项目名称' },
      { name: '项目实施单位（高校院所）', key: 'implementationUnit', type: 'text', required: false, placeholder: '请输入项目实施单位（高校院所）' },
      { name: '是否重点项目', key: 'isKeyProject', type: 'select', required: false, options: ['是', '否'] },
      { name: '涉及典型县镇村', key: 'involvedAreas', type: 'text', required: false, placeholder: '请输入涉及典型县镇村' },
      { name: '项目类型', key: 'projectType', type: 'select', required: true, options: ['基础设施建设', '科技创新', '环保治理', '民生改善', '产业发展', '其他'] },
      { name: '项目开始时间', key: 'startDate', type: 'date', required: true, placeholder: '请选择项目开始时间' },
      { name: '项目结束时间', key: 'endDate', type: 'date', required: false, placeholder: '请选择项目结束时间' },
      { name: '项目背景', key: 'background', type: 'textarea', required: false, placeholder: '请输入项目背景' },
      { name: '项目内容和落实举措', key: 'content', type: 'textarea', required: false, placeholder: '请输入项目内容和落实举措' },
      { name: '主要任务目标', key: 'objectives', type: 'textarea', required: false, placeholder: '请输入主要任务目标' },
      { name: '联系人信息', key: 'contacts', type: 'contacts', required: false, placeholder: '添加联系人' },
      { name: '备注', key: 'remarks', type: 'textarea', required: false, placeholder: '请输入备注信息' },
      { name: '项目进度', key: 'progress', type: 'slider', required: false, min: 0, max: 100, unit: '%' }
    ],
    // 联系人相关数据
    contacts: [],
    showContactModal: false,
    currentContact: {
      name: '',
      phone: ''
    },
    editingContactIndex: -1,
    // 加载状态
    isSaving: false
  },

  onLoad() {
    // 初始化项目数据
    const projectData = {};
    this.data.projectColumns.forEach(column => {
      if (column.type === 'slider') {
        projectData[column.key] = 0;
      } else if (column.type === 'contacts') {
        projectData[column.key] = [];
      } else {
        projectData[column.key] = '';
      }
    });
    this.setData({ projectData });

    // 测试后端接口连接
    this.testBackendConnection();
  },

  // 测试后端接口连接
  testBackendConnection() {
    console.log('测试后端接口连接...');
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/15projects/names',
      method: 'GET',
      success: (res) => {
        console.log('后端接口连接测试成功:', res);
        if (res.statusCode === 200) {
          wx.showToast({
            title: '成功进入',
            icon: 'success',
            duration: 1500
          });
        }
      },
      fail: (err) => {
        console.warn('后端接口连接测试失败:', err);
        wx.showToast({
          title: '后端接口连接失败，请检查服务器状态',
          icon: 'none',
          duration: 3000
        });
      }
    });
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

    // 验证日期格式
    if (projectData.startDate) {
      const startDate = new Date(projectData.startDate);
      if (isNaN(startDate.getTime())) {
        wx.showToast({
          title: '项目开始时间格式不正确',
          icon: 'none'
        });
        return;
      }
    }

    if (projectData.endDate) {
      const endDate = new Date(projectData.endDate);
      if (isNaN(endDate.getTime())) {
        wx.showToast({
          title: '项目结束时间格式不正确',
          icon: 'none'
        });
        return;
      }

      // 验证结束时间不能早于开始时间
      if (projectData.startDate && endDate < new Date(projectData.startDate)) {
        wx.showToast({
          title: '项目结束时间不能早于开始时间',
          icon: 'none'
        });
        return;
      }
    }

    // 验证联系人数据
    if (this.data.contacts && this.data.contacts.length > 0) {
      for (let i = 0; i < this.data.contacts.length; i++) {
        const contact = this.data.contacts[i];
        if (!contact.name || !contact.name.trim()) {
          wx.showToast({
            title: `第${i + 1}个联系人姓名不能为空`,
            icon: 'none'
          });
          return;
        }
        if (!contact.phone || !contact.phone.trim()) {
          wx.showToast({
            title: `第${i + 1}个联系人联系方式不能为空`,
            icon: 'none'
          });
          return;
        }
      }
    }

    // 构建提交数据，按照后端数据库字段进行映射
    const submitData = {
      serial_number: projectData.serialNumber,
      city: projectData.cityLevel,
      county: projectData.pairedCounty,
      universities: projectData.pairedInstitution,
      project_name: projectData.projectName,
      implementing_institutions: projectData.implementationUnit,
      is_key_project: projectData.isKeyProject, // 直接发送字符串："是" 或 "否"
      involved_areas: projectData.involvedAreas,
      project_type: projectData.projectType,
      start_date: projectData.startDate,
      end_date: projectData.endDate,
      background: projectData.background,
      content_and_measures: projectData.content,
      objectives: projectData.objectives,
      contacts: this.formatContactsForDatabase(this.data.contacts),
      remarks: projectData.remarks,
      progress: projectData.progress || 0
    };

    console.log('准备提交的项目数据:', submitData);
    console.log('联系人数据格式化结果:', submitData.contacts);
    console.log('联系人数据类型:', typeof submitData.contacts);
    console.log('原始联系人数据:', this.data.contacts);

    // 设置保存状态
    this.setData({
      isSaving: true
    });

    wx.showLoading({
      title: '保存中...'
    });

    // 调用后端API保存项目
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/15projects',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: submitData,
      success: (res) => {
        wx.hideLoading();
        // 清除保存状态
        this.setData({
          isSaving: false
        });
        console.log('保存项目API响应:', res);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          // 保存成功
          if (res.data && res.data.success) {
            // 生成新项目的完整数据，用于传递给查询页面
            const newProject = {
              id: res.data.data ? res.data.data.id : Date.now(), // 优先使用后端返回的ID
              serialNumber: projectData.serialNumber,
              cityLevel: projectData.cityLevel,
              pairedCounty: projectData.pairedCounty,
              pairedInstitution: projectData.pairedInstitution,
              projectName: projectData.projectName,
              implementationUnit: projectData.implementationUnit,
              isKeyProject: projectData.isKeyProject,
              involvedAreas: projectData.involvedAreas,
              projectType: projectData.projectType,
              startDate: projectData.startDate,
              endDate: projectData.endDate,
              background: projectData.background,
              content: projectData.content,
              objectives: projectData.objectives,
              contacts: this.data.contacts || [],
              remarks: projectData.remarks,
              progress: projectData.progress || 0,
              status: '进行中',
              createDate: new Date().toISOString().split('T')[0]
            };

            // 将新项目数据存储到全局，供查询页面使用
            const app = getApp();
            if (app && app.globalData) {
              app.globalData.newProject = newProject;
            }

            wx.showModal({
              title: '保存成功',
              content: `项目"${projectData.projectName}"已成功添加到数据库！`,
              showCancel: false,
              success: () => {
                wx.navigateBack();
              }
            });
          } else {
            // 后端返回失败
            wx.showModal({
              title: '保存失败',
              content: res.data.message || '项目保存失败，请重试！',
              showCancel: false
            });
          }
        } else {
          // HTTP状态码错误
          wx.showModal({
            title: '保存失败',
            content: `服务器错误 (${res.statusCode})，请重试！`,
            showCancel: false
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        // 清除保存状态
        this.setData({
          isSaving: false
        });
        console.error('保存项目失败:', err);
        wx.showModal({
          title: '网络错误',
          content: '网络连接失败，请检查网络后重试！',
          showCancel: false
        });
      }
    });
  },

  // 联系人管理相关方法
  // 显示添加联系人弹窗
  showAddContactModal() {
    this.setData({
      showContactModal: true,
      currentContact: {
        name: '',
        phone: ''
      },
      editingContactIndex: -1
    });
  },

  // 显示编辑联系人弹窗
  showEditContactModal(e) {
    const index = e.currentTarget.dataset.index;
    const contact = this.data.contacts[index];
    this.setData({
      showContactModal: true,
      currentContact: {
        name: contact.name,
        phone: contact.phone
      },
      editingContactIndex: index
    });
  },

  // 关闭联系人弹窗
  closeContactModal() {
    this.setData({
      showContactModal: false,
      currentContact: {
        name: '',
        phone: ''
      },
      editingContactIndex: -1
    });
  },

  // 联系人姓名输入
  onContactNameInput(e) {
    this.setData({
      'currentContact.name': e.detail.value
    });
  },

  // 联系人电话输入
  onContactPhoneInput(e) {
    this.setData({
      'currentContact.phone': e.detail.value
    });
  },

  // 保存联系人
  saveContact() {
    const { name, phone } = this.data.currentContact;

    if (!name.trim()) {
      wx.showToast({
        title: '请输入联系人姓名',
        icon: 'none'
      });
      return;
    }

    if (!phone.trim()) {
      wx.showToast({
        title: '请输入联系方式',
        icon: 'none'
      });
      return;
    }

    const contact = {
      name: name.trim(),
      phone: phone.trim()
    };

    let contacts = [...this.data.contacts];

    if (this.data.editingContactIndex >= 0) {
      // 编辑现有联系人
      contacts[this.data.editingContactIndex] = contact;
    } else {
      // 添加新联系人
      contacts.push(contact);
    }

    this.setData({
      contacts: contacts,
      'projectData.contacts': contacts
    });

    this.closeContactModal();

    wx.showToast({
      title: this.data.editingContactIndex >= 0 ? '联系人已更新' : '联系人已添加',
      icon: 'success'
    });
  },

  // 删除联系人
  deleteContact(e) {
    const index = e.currentTarget.dataset.index;
    const contact = this.data.contacts[index];

    wx.showModal({
      title: '确认删除',
      content: `确定要删除联系人"${contact.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          const contacts = this.data.contacts.filter((_, i) => i !== index);
          this.setData({
            contacts: contacts,
            'projectData.contacts': contacts
          });

          wx.showToast({
            title: '联系人已删除',
            icon: 'success'
          });
        }
      }
    });
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
  },

  // 格式化联系人数据，使其符合后端数据库contacts列的期望格式
  formatContactsForDatabase(contacts) {
    if (!contacts || contacts.length === 0) {
      return '';
    }

    // 根据数据库实际存储格式：直接拼接姓名和电话，无分隔符
    // 例如：桂拉旦13423689892黄世仿13392616563何旭恒1
    const concatenatedContacts = contacts.map(contact => 
      `${contact.name}${contact.phone}`
    ).join('');
    
    console.log('联系人直接拼接格式:', concatenatedContacts);
    return concatenatedContacts;
  }
});
