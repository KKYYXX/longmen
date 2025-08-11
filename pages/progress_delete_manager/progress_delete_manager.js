Page({
  data: {
    projectId: null,
    loading: true,
    timeFilter: 'all', // 时间筛选：week, month, year, all
    selectedDate: '',
    progressList: [],
    filteredProgressList: [],
    selectedCount: 0,
    isAllSelected: false
  },

  onLoad: function(options) {
    console.log('删除管理页面加载', options);
    if (options.projectId) {
      this.setData({
        projectId: parseInt(options.projectId)
      });
      this.loadProgressData();
    }
  },

  navigateBack: function() {
    wx.navigateBack();
  },

  // 加载进度数据
  loadProgressData: function() {
    this.setData({ loading: true });
    
    // 模拟加载数据
    setTimeout(() => {
      const progressData = this.generateProgressData();
      this.setData({
        progressList: progressData,
        filteredProgressList: progressData,
        loading: false
      });
    }, 500);
  },

  // 按时间段筛选
  filterByTime: function(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ 
      timeFilter: filter,
      selectedDate: '' // 清除具体日期选择
    });
    this.applyTimeFilter(filter);
  },

  // 应用时间筛选
  applyTimeFilter: function(filter) {
    const now = new Date();
    let filtered = this.data.progressList;

    if (filter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = this.data.progressList.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= weekAgo;
      });
    } else if (filter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = this.data.progressList.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= monthAgo;
      });
    } else if (filter === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filtered = this.data.progressList.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= yearAgo;
      });
    }

    // 重置选择状态
    filtered = filtered.map(item => ({ ...item, selected: false }));

    this.setData({
      filteredProgressList: filtered,
      selectedCount: 0,
      isAllSelected: false
    });
  },

  // 日期选择
  onDateChange: function(e) {
    const selectedDate = e.detail.value;
    this.setData({ 
      selectedDate,
      timeFilter: '' // 清除时间段筛选
    });
    this.filterProgressByDate(selectedDate);
  },

  // 按日期筛选进度
  filterProgressByDate: function(date) {
    if (!date) {
      this.setData({
        filteredProgressList: this.data.progressList.map(item => ({ ...item, selected: false })),
        selectedCount: 0,
        isAllSelected: false
      });
      return;
    }

    const filtered = this.data.progressList
      .filter(item => item.date === date)
      .map(item => ({ ...item, selected: false }));
    
    this.setData({
      filteredProgressList: filtered,
      selectedCount: 0,
      isAllSelected: false
    });
  },

  // 切换选择状态
  toggleSelect: function(e) {
    const id = e.currentTarget.dataset.id;
    const filteredList = this.data.filteredProgressList.map(item => {
      if (item.id === id) {
        return { ...item, selected: !item.selected };
      }
      return item;
    });

    const selectedCount = filteredList.filter(item => item.selected).length;
    const isAllSelected = selectedCount === filteredList.length && filteredList.length > 0;

    this.setData({
      filteredProgressList: filteredList,
      selectedCount,
      isAllSelected
    });
  },

  // 全选/取消全选
  selectAll: function() {
    const isAllSelected = !this.data.isAllSelected;
    const filteredList = this.data.filteredProgressList.map(item => ({
      ...item,
      selected: isAllSelected
    }));

    this.setData({
      filteredProgressList: filteredList,
      selectedCount: isAllSelected ? filteredList.length : 0,
      isAllSelected
    });
  },

  // 单个删除
  singleDelete: function(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    this.confirmDelete([id]);
  },

  // 批量删除
  batchDelete: function() {
    const selectedIds = this.data.filteredProgressList
      .filter(item => item.selected)
      .map(item => item.id);
    
    if (selectedIds.length === 0) {
      wx.showToast({
        title: '请先选择要删除的记录',
        icon: 'none'
      });
      return;
    }

    this.confirmDelete(selectedIds);
  },

  // 确认删除
  confirmDelete: function(ids) {
    const count = ids.length;
    wx.showModal({
      title: '确认删除',
      content: `确定要删除${count}条进度记录吗？删除后无法恢复。`,
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          this.performDelete(ids);
        }
      }
    });
  },

  // 执行删除
  performDelete: function(ids) {
    wx.showLoading({
      title: '删除中...'
    });

    // 模拟删除操作
    setTimeout(() => {
      // 从原始列表中删除
      const updatedProgressList = this.data.progressList.filter(item => !ids.includes(item.id));
      
      // 从筛选列表中删除
      const updatedFilteredList = this.data.filteredProgressList.filter(item => !ids.includes(item.id));

      this.setData({
        progressList: updatedProgressList,
        filteredProgressList: updatedFilteredList,
        selectedCount: 0,
        isAllSelected: false
      });

      wx.hideLoading();
      wx.showToast({
        title: `已删除${ids.length}条记录`,
        icon: 'success'
      });

      // TODO: 调用后端API删除数据
      console.log('删除进度记录:', ids);
    }, 1000);
  },

  // 生成进度数据
  generateProgressData: function() {
    const progressTemplates = [
      {
        id: 1,
        date: "2024-01-15",
        time: "09:00",
        title: "项目启动会议",
        location: "市政府会议室",
        person: "项目经理张三",
        description: "召开项目启动会议，确定项目目标和时间节点",
        status: "completed",
        statusText: "已完成",
        selected: false
      },
      {
        id: 2,
        date: "2024-02-20",
        time: "14:30",
        title: "设备采购招标",
        location: "市采购中心",
        person: "采购专员李四",
        description: "完成物联网设备和服务器设备的招标采购工作",
        status: "completed",
        statusText: "已完成",
        selected: false
      },
      {
        id: 3,
        date: "2024-03-10",
        time: "10:15",
        title: "数据中心建设开工",
        location: "高新区数据中心基地",
        person: "工程师王五",
        description: "数据中心基础设施建设正式开工",
        status: "completed",
        statusText: "已完成",
        selected: false
      },
      {
        id: 4,
        date: "2024-06-15",
        time: "16:20",
        title: "传感器网络部署",
        location: "市区各主要路口",
        person: "技术员赵六",
        description: "在全市主要路口部署物联网传感器设备",
        status: "ongoing",
        statusText: "进行中",
        selected: false
      },
      {
        id: 5,
        date: "2024-08-01",
        time: "11:30",
        title: "系统集成测试",
        location: "数据中心机房",
        person: "系统工程师孙七",
        description: "进行智慧城市系统的集成测试和调试",
        status: "ongoing",
        statusText: "进行中",
        selected: false
      },
      {
        id: 6,
        date: "2024-09-10",
        time: "14:00",
        title: "用户培训计划",
        location: "市民服务中心",
        person: "培训师周八",
        description: "为市民和工作人员提供系统使用培训",
        status: "pending",
        statusText: "待开始",
        selected: false
      }
    ];

    // 按时间倒序排列
    return progressTemplates.sort((a, b) =>
      new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)
    );
  }
});
