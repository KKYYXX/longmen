Page({
  data: {
    allRecords: [],           // 原始数据
    filteredRecords: [],      // 过滤后显示的数据
    searchQuery: '',          // 搜索关键词
    showModal: false,         // 控制新增记录模态框
    showNotification: false,  // 顶部通知显示
    newName: '',
    newPhone: ''
  },

  onLoad() {
    this.fetchRecords()
  },

  fetchRecords() {
    // 调用后端 /user/alter_zc 接口获取政策文件修改权限人员列表
    wx.request({
      url: 'http://127.0.0.1:5000/app/user/alter_zc', // 直接调用后端接口
      method: 'GET',
      success: res => {
        console.log('接口完整响应:', res);
        if (res.statusCode === 200) {
          // 后端返回的是数组格式，包含name和phone字段
          const records = res.data || [];
          console.log('获取到的人员数据:', records);
          this.setData({
            allRecords: records,
            filteredRecords: records
          })
        } else {
          this.showToast('加载失败')
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        this.showToast('服务器连接失败')
      }
    })
  },

  onSearchInput(e) {
    const query = e.detail.value.toLowerCase()
    const filtered = this.data.allRecords.filter(item =>
      item.name.toLowerCase().includes(query) || item.phone.includes(query)
    )
    this.setData({
      searchQuery: query,
      filteredRecords: filtered
    })
  },

  toggleAddModal() {
    this.setData({
      showModal: true,
      newName: '',
      newPhone: ''
    })
  },

  cancelAdd() {
    this.setData({ showModal: false })
  },

  onNameInput(e) {
    this.setData({ newName: e.detail.value })
  },

  onPhoneInput(e) {
    this.setData({ newPhone: e.detail.value })
  },

  confirmAdd() {
    const { newName, newPhone } = this.data
    if (!newName || !newPhone) {
      this.showToast('请填写完整信息')
      return
    }

    // 调用后端添加接口
    wx.request({
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        name: newName,
        phone: newPhone
      },
      url: 'http://127.0.0.1:5000/app/user/alter_zc_add',
      method: 'POST',
      success: res => {
        if (res.statusCode === 200) {
          this.fetchRecords() // 重新获取数据
          this.setData({ showModal: false })
          this.showToast('添加成功')
        } else {
          this.showToast(res.data.message || '添加失败')
        }
      },
      fail: (err) => {
        console.error('请求失败详情：', err)
        this.showToast('服务器错误')
      }
    })
  },

  onDeleteRecord(e) {
    const index = e.currentTarget.dataset.index
    const record = this.data.filteredRecords[index]
    if (!record || !record.name || !record.phone) {
      this.showToast('记录信息不完整')
      return
    }

    wx.showModal({
      title: '确认删除',
      content: `是否删除 ${record.name}？`,
      confirmText: '删除',
      success: res => {
        if (res.confirm) {
          // 调用后端删除接口，传递name和phone
          wx.request({
            url: 'http://127.0.0.1:5000/app/user/alter_zc_delete',
            method: 'POST',
            header: { 
              'content-type': 'application/x-www-form-urlencoded' 
            },
            data: { 
              name: record.name,
              phone: record.phone 
            },
            success: res => {
              if (res.statusCode === 200) {
                this.fetchRecords() // 重新获取数据
                this.showToast('删除成功')
              } else {
                this.showToast(res.data.message || '删除失败')
              }
            },
            fail: (err) => {
              console.error('删除请求失败:', err)
              this.showToast('服务器错误')
            }
          })
        }
      }
    })
  },

  showToast(message) {
    this.setData({ showNotification: true })
    setTimeout(() => {
      this.setData({ showNotification: false })
    }, 2000)
  }
}) 