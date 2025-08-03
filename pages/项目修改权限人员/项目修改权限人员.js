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
    // 连接你的 /user/query_15 接口
    wx.request({
      url: 'http://127.0.0.1:5000/app/user/alter_15', // 👈 替换成你的接口
      method: 'GET',
      success: res => {
        if (res.data.success) {
          const records = res.data.data || []
          this.setData({
            allRecords: records,
            filteredRecords: records
          })
        } else {
          this.showToast('加载失败')
        }
      },
      fail: () => {
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

    // 模拟后端保存逻辑
    wx.request({
      url: 'http://127.0.0.1:5000/app/user/alter_15_add', // 👈 替换成你的新增接口
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: {
        name: newName,
        phone: newPhone
      },
      success: res => {
        if (res.data.success) {
          this.fetchRecords()
          this.setData({ showModal: false })
          this.showToast('添加成功')
        } else {
          this.showToast(res.data.message || '添加失败')
        }
      },
      fail: () => {
        this.showToast('服务器错误')
      }
    })
  },

  onDeleteRecord(e) {
    const index = e.currentTarget.dataset.index
    const record = this.data.filteredRecords[index]
    if (!record || !record.phone) return

    wx.showModal({
      title: '确认删除',
      content: `是否删除 ${record.name}？`,
      confirmText: '删除',
      success: res => {
        if (res.confirm) {
          wx.request({
            url: 'http://127.0.0.1:5000/app/user/alter_15_delete', // 👈 替换成你的删除接口
            method: 'POST',
            header: { 'content-type': 'application/json' },
            data: { phone: record.phone },
            success: res => {
              if (res.data.success) {
                this.fetchRecords()
                this.showToast('删除成功')
              } else {
                this.showToast('删除失败')
              }
            },
            fail: () => {
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
