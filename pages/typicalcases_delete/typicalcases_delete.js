Page({
  data: {
    searchKeyword: '',
    caseList: []
  },

  onLoad() {
    console.log('删除典型案例页面加载');
    this.loadCaseList();
  },

  onShow() {
    // 每次显示页面时都重新加载数据，确保显示最新的案例列表
    console.log('删除页面显示，重新加载案例列表');
    this.loadCaseList();
  },

  // 加载案例列表
  loadCaseList() {
    try {
      // 从本地存储获取用户添加的案例
      const storedCases = wx.getStorageSync('typicalCases') || [];

      // 获取所有默认示例数据
      const allDefaultCases = [
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
      ];

      // 过滤掉已删除的默认案例
      const deletedDefaultCases = wx.getStorageSync('deletedDefaultCases') || [];
      const defaultCases = allDefaultCases.filter(caseItem => !deletedDefaultCases.includes(caseItem.id));

      // 合并数据：用户添加的案例在前，默认案例在后
      const allCases = [...storedCases, ...defaultCases];

      this.setData({
        caseList: allCases
      });

      console.log('案例列表加载完成，总数量：', allCases.length);
      console.log('用户添加的案例数量：', storedCases.length);
      console.log('用户添加的案例详情：', storedCases);
      console.log('所有案例列表：', allCases);

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
    console.log('准备删除案例：', caseItem);

    wx.showModal({
      title: '确认删除',
      content: `确定要删除案例"${caseItem.title}"吗？此操作不可恢复。\n\n案例ID: ${caseItem.id}`,
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
    console.log('开始执行删除操作，案例标题：', caseItem.title);
    wx.showLoading({
      title: '删除中...'
    });

    // 新逻辑：根据案例名称到数据库查询对应ID，未找到则删除失败
    this.findModelIdByName(caseItem.title, (modelId) => {
      if (modelId) {
        this.callDeleteAPI(modelId, caseItem);
      } else {
        wx.hideLoading();
        wx.showToast({
          title: '未找到对应案例，删除失败',
          icon: 'none'
        });
      }
    });

    /* 原本地删除逻辑（保留为注释）
    try {
      console.log('删除案例，ID：', caseItem.id);

      // 如果是系统默认案例（ID <= 10），从删除的默认案例列表中记录
      if (caseItem.id <= 10) {
        const deletedDefaultCases = wx.getStorageSync('deletedDefaultCases') || [];
        if (!deletedDefaultCases.includes(caseItem.id)) {
          deletedDefaultCases.push(caseItem.id);
          wx.setStorageSync('deletedDefaultCases', deletedDefaultCases);
        }
      } else {
        // 如果是用户添加的案例，从本地存储中删除
        const storedCases = wx.getStorageSync('typicalCases') || [];
        const updatedCases = storedCases.filter(item => item.id !== caseItem.id);
        wx.setStorageSync('typicalCases', updatedCases);
      }

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
    */
  },

  // 通过案例名称在数据库中查找模型ID
  findModelIdByName(caseTitle, callback) {
    const normalizedTitle = (caseTitle || '').trim();
    if (!normalizedTitle) {
      console.warn('案例标题为空，无法查询ID');
      callback(null);
      return;
    }

    wx.request({
      url: 'http://127.0.0.1:5000/app/api/models',
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.success && Array.isArray(res.data.data)) {
          const list = res.data.data;
          // 严格匹配：去除首尾空格后全等比较
          const found = list.find(item => ((item && item.model_name) ? String(item.model_name).trim() : '') === normalizedTitle);
          if (found && found.id) {
            console.log('根据案例名称找到模型：', normalizedTitle, 'ID：', found.id);
            callback(found.id);
            return;
          }
        }
        console.warn('未在数据库中找到案例（严格匹配）：', normalizedTitle);
        callback(null);
      },
      fail: (err) => {
        console.error('请求模型列表失败:', err);
        callback(null);
      }
    });
  },

  // 调用后端删除接口
  callDeleteAPI(modelId, caseItem) {
    wx.request({
      url: `http://127.0.0.1:5000/app/api/models/${modelId}`,
      method: 'DELETE',
      success: (res) => {
        wx.hideLoading();
        console.log('删除接口响应:', res);

        if (res.statusCode === 200 && res.data && res.data.success) {
          // 删除成功：从当前列表中移除（按标题移除，避免前端ID与后端ID不一致）
          const caseList = this.data.caseList.filter(item => item.title !== caseItem.title);
          this.setData({ caseList });

          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });

          // 通知其他页面数据已更新
          wx.setStorageSync('caseListNeedRefresh', true);
        } else {
          wx.showToast({
            title: (res.data && res.data.message) ? res.data.message : '删除失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('删除请求失败:', err);
        wx.showToast({
          title: '删除失败',
          icon: 'none'
        });
      }
    });
  }
});
