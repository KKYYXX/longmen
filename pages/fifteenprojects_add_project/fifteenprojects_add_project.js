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
    editingContactIndex: -1
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

    // 构建提交数据
    const submitData = {
      ...projectData,
      createDate: new Date().toISOString().split('T')[0],
      // 确保联系人数据被包含
      contacts: this.data.contacts || []
    };

    // 为了兼容性，如果有联系人，设置第一个联系人为主要联系人
    if (this.data.contacts && this.data.contacts.length > 0) {
      const primaryContact = this.data.contacts[0];
      submitData.contactName = primaryContact.name;
      submitData.contactPhone = primaryContact.phone;
      submitData.contactPosition = ''; // 职务字段已移除，设为空
    }

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
        // 生成新项目的完整数据
        const newProject = {
          id: Date.now(), // 临时使用时间戳作为ID，实际应该由后端生成
          ...submitData,
          name: submitData.projectName, // 兼容性字段
          description: submitData.objectives || submitData.content || '暂无描述'
        };

        // 将新项目数据存储到全局，供查询页面使用
        const app = getApp();
        if (app && app.globalData) {
          app.globalData.newProject = newProject;
        }

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
  }
});
