Page({
  data: {
    searchKeyword: '',
    caseList: [
      {
        id: 1,
        title: '智慧城市建设典型案例',
        category: '基础设施建设',
        createDate: '2024-01-15',
        updateDate: '2024-07-20',
        summary: '通过物联网、大数据、人工智能等技术，构建智慧城市管理平台，实现城市治理现代化，提升市民生活质量。',
        author: '市信息化办公室',
        contact: '张主任 - 13800138000'
      },
      {
        id: 2,
        title: '绿色能源示范园区建设案例',
        category: '环保治理',
        createDate: '2024-02-10',
        updateDate: '2024-07-18',
        summary: '建设集太阳能、风能、储能于一体的绿色能源示范园区，实现清洁能源的高效利用和智能管理。',
        author: '市发改委',
        contact: '李处长 - 13900139000'
      },
      {
        id: 3,
        title: '数字化教育改革实践案例',
        category: '民生改善',
        createDate: '2024-03-05',
        updateDate: '2024-07-15',
        summary: '运用数字技术改革传统教育模式，建设智慧校园，推进教育公平和质量提升。',
        author: '市教育局',
        contact: '王局长 - 13700137000'
      }
    ]
  },

  onLoad() {
    console.log('删除典型案例页面加载');
    this.loadCaseList();
  },

  onShow() {
    // 检查是否需要刷新数据
    const needRefresh = wx.getStorageSync('caseListNeedRefresh');
    if (needRefresh) {
      wx.removeStorageSync('caseListNeedRefresh');
      this.loadCaseList();
    }
  },

  // 加载案例列表
  loadCaseList() {
    try {
      // 从本地存储获取用户添加的案例
      const storedCases = wx.getStorageSync('typicalCases') || [];

      // 合并默认示例数据和用户添加的数据
      const defaultCases = [
        {
          id: 1001,
          title: '智慧城市建设典型案例',
          category: '基础设施建设',
          createDate: '2024-01-15',
          updateDate: '2024-07-20',
          summary: '通过物联网、大数据、人工智能等技术，构建智慧城市管理平台，实现城市治理现代化，提升市民生活质量。',
          author: '市信息化办公室',
          contact: '张主任 - 13800138000'
        },
        {
          id: 1002,
          title: '绿色能源示范园区建设案例',
          category: '环保治理',
          createDate: '2024-02-10',
          updateDate: '2024-07-18',
          summary: '建设集太阳能、风能、储能于一体的绿色能源示范园区，实现清洁能源的高效利用和智能管理。',
          author: '市发改委',
          contact: '李处长 - 13900139000'
        },
        {
          id: 1003,
          title: '数字化教育改革实践案例',
          category: '民生改善',
          createDate: '2024-03-05',
          updateDate: '2024-07-15',
          summary: '运用数字技术改革传统教育模式，建设智慧校园，推进教育公平和质量提升。',
          author: '市教育局',
          contact: '王局长 - 13700137000'
        }
      ];

      // 合并数据：用户添加的案例在前，默认案例在后
      const allCases = [...storedCases, ...defaultCases];

      this.setData({
        caseList: allCases
      });

      console.log('案例列表加载完成，总数量：', allCases.length);
      console.log('用户添加的案例数量：', storedCases.length);

    } catch (error) {
      console.error('加载案例列表失败:', error);
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 搜索
  onSearch() {
    const keyword = this.data.searchKeyword.trim();

    // TODO: 调用后端API进行搜索
    // wx.request({
    //   url: 'your-api-endpoint/typical-cases/search',
    //   method: 'GET',
    //   data: {
    //     keyword: keyword
    //   },
    //   success: (res) => {
    //     this.setData({
    //       caseList: res.data.data || []
    //     });
    //   },
    //   fail: (err) => {
    //     console.error('搜索典型案例失败:', err);
    //     wx.showToast({
    //       title: '搜索失败',
    //       icon: 'none'
    //     });
    //   }
    // });

    // 临时：如果没有关键词就重新加载，否则显示空列表
    if (!keyword) {
      this.loadCaseList();
    } else {
      this.setData({
        caseList: []
      });
    }
  },

  // 删除案例
  deleteCase(e) {
    const caseItem = e.currentTarget.dataset.case;

    wx.showModal({
      title: '确认删除',
      content: `确定要删除案例"${caseItem.title}"吗？此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#e74c3c',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.performDelete(caseItem);
        }
      }
    });
  },

  // 执行删除操作
  performDelete(caseItem) {
    wx.showLoading({
      title: '删除中...'
    });

    try {
      // 检查是否是默认案例（ID < 2000的不能删除）
      if (caseItem.id < 2000) {
        wx.hideLoading();
        wx.showModal({
          title: '无法删除',
          content: '系统默认案例不能删除，只能删除用户添加的案例。',
          showCancel: false
        });
        return;
      }

      // 从本地存储中删除
      const storedCases = wx.getStorageSync('typicalCases') || [];
      const updatedCases = storedCases.filter(item => item.id !== caseItem.id);
      wx.setStorageSync('typicalCases', updatedCases);

      // 从当前列表中移除
      const caseList = this.data.caseList.filter(item => item.id !== caseItem.id);

      setTimeout(() => {
        wx.hideLoading();
        this.setData({
          caseList: caseList
        });

        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });

        // 通知其他页面数据已更新
        wx.setStorageSync('caseListNeedRefresh', true);

        console.log('案例删除成功，ID:', caseItem.id);
      }, 800);

    } catch (error) {
      wx.hideLoading();
      console.error('删除案例失败:', error);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  }
});
