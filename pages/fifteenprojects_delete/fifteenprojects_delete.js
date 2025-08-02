Page({
  data: {
    searchKeyword: '',
    projectList: []
  },

  onLoad() {
    this.loadProjectList();
  },

  // 加载项目列表
  loadProjectList() {
    // TODO: 调用后端API获取十五项项目列表
    // wx.request({
    //   url: 'your-api-endpoint/fifteen-projects',
    //   method: 'GET',
    //   success: (res) => {
    //     this.setData({
    //       projectList: res.data.data || []
    //     });
    //   },
    //   fail: (err) => {
    //     console.error('获取十五项项目列表失败:', err);
    //     wx.showToast({
    //       title: '获取数据失败',
    //       icon: 'none'
    //     });
    //   }
    // });

    // 临时：设置空数据，等待后端接口
    this.setData({
      projectList: []
    });
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
    //   url: 'your-api-endpoint/fifteen-projects/search',
    //   method: 'GET',
    //   data: {
    //     keyword: keyword
    //   },
    //   success: (res) => {
    //     this.setData({
    //       projectList: res.data.data || []
    //     });
    //   },
    //   fail: (err) => {
    //     console.error('搜索十五项项目失败:', err);
    //     wx.showToast({
    //       title: '搜索失败',
    //       icon: 'none'
    //     });
    //   }
    // });

    // 临时：如果没有关键词就重新加载，否则显示空列表
    if (!keyword) {
      this.loadProjectList();
    } else {
      this.setData({
        projectList: []
      });
    }
  },

  // 删除项目
  deleteProject(e) {
    const projectItem = e.currentTarget.dataset.project;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除项目"${projectItem.projectName}"吗？此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#e74c3c',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.performDelete(projectItem);
        }
      }
    });
  },

  // 执行删除操作
  performDelete(projectItem) {
    wx.showLoading({
      title: '删除中...'
    });

    // TODO: 调用后端API删除十五项项目
    // wx.request({
    //   url: 'your-api-endpoint/fifteen-projects/' + projectItem.id,
    //   method: 'DELETE',
    //   success: (res) => {
    //     wx.hideLoading();
    //     // 从列表中移除项目
    //     const projectList = this.data.projectList.filter(item => item.id !== projectItem.id);
    //     this.setData({
    //       projectList: projectList
    //     });
    //     wx.showToast({
    //       title: '删除成功',
    //       icon: 'success'
    //     });
    //   },
    //   fail: (err) => {
    //     wx.hideLoading();
    //     console.error('删除十五项项目失败:', err);
    //     wx.showToast({
    //       title: '删除失败',
    //       icon: 'none'
    //     });
    //   }
    // });

    // 临时：模拟删除成功
    setTimeout(() => {
      wx.hideLoading();
      const projectList = this.data.projectList.filter(item => item.id !== projectItem.id);
      this.setData({
        projectList: projectList
      });
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    }, 1000);
  }
});
