Page({
  data: {
    projectName: null, // 项目名称
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
    if (options.projectName) {
      const projectName = decodeURIComponent(options.projectName);
      console.log('接收到的项目名称:', projectName);
      
      this.setData({
        projectName: projectName
      });
      
      // 加载项目进度数据
      this.loadProgressData();
    } else {
      console.error('未接收到项目名称参数');
      wx.showToast({
        title: '参数错误',
        icon: 'none',
        duration: 2000
      });
    }
  },

  navigateBack: function() {
    wx.navigateBack();
  },

  // 加载进度数据
  loadProgressData: function() {
    this.setData({ loading: true });
    
    // 从后端获取真实的项目进度数据
    this.loadProgressFromBackend();
  },

  // 从后端加载项目进度数据
  loadProgressFromBackend: function() {
    // 首先需要获取项目名称，然后调用进度接口
    this.getProjectNameAndLoadProgress();
  },

  // 获取项目名称并加载进度数据
  getProjectNameAndLoadProgress: function() {
    // 这里需要从页面参数或全局状态获取项目名称
    // 暂时使用一个示例项目名称，实际应该从页面传递的参数获取
    const projectName = this.data.projectName; // 这里应该动态获取
    
    console.log('开始加载项目进度数据，项目名称:', projectName);
    
    // 调用第一个接口获取项目所有进度时间点
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/progress/times',
      method: 'GET',
      data: {
        project_name: projectName
      },
      success: (res) => {
        console.log('进度时间接口响应:', res);
        
        if (res.statusCode === 200 && res.data && res.data.success) {
          const progressTimes = res.data.data || [];
          console.log('获取到进度时间列表:', progressTimes);
          
          if (progressTimes.length === 0) {
            this.setData({
              progressList: [],
              filteredProgressList: [],
              loading: false
            });
            wx.showToast({
              title: '该项目暂无进度记录',
              icon: 'none',
              duration: 2000
            });
            return;
          }
          
          // 根据时间列表逐个获取详细进度信息
          this.loadProgressDetailsByTimeList(projectName, progressTimes);
        } else {
          console.warn('获取进度时间列表失败:', res);
          this.setData({ loading: false });
          wx.showToast({
            title: '获取进度数据失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        console.error('请求进度时间接口失败:', err);
        this.setData({ loading: false });
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 根据时间列表逐个获取项目进度详细信息
  loadProgressDetailsByTimeList: function(projectName, progressTimes) {
    console.log('开始根据时间列表获取项目进度详细信息');
    
    let allProgressDetails = [];
    let completedCount = 0;
    const totalCount = progressTimes.length;

    progressTimes.forEach((timeObj, index) => {
      // 从后端返回的时间对象中提取practice_time
      let practiceTime = timeObj;
      if (timeObj && typeof timeObj === 'object' && timeObj.practice_time) {
        practiceTime = timeObj.practice_time;
      }
      
      // 添加延迟，避免同时发送太多请求
      setTimeout(() => {
        this.getProgressDetailByTime(projectName, practiceTime, (progressDetails) => {
          if (progressDetails && progressDetails.length > 0) {
            allProgressDetails = allProgressDetails.concat(progressDetails);
            console.log(`时间点 ${practiceTime} 查询成功，获取到 ${progressDetails.length} 条记录`);
          }
          
          completedCount++;
          console.log(`进度详情查询进度: ${completedCount}/${totalCount}`);
          
          // 所有查询完成后，处理数据
          if (completedCount === totalCount) {
            this.processAndDisplayProgress(allProgressDetails);
          }
        });
      }, index * 100); // 每个请求间隔100ms
    });
  },

  // 获取单个时间点的项目进度详情
  getProgressDetailByTime: function(projectName, practiceTime, callback) {
    console.log('查询时间点进度详情:', projectName, practiceTime);
    
    // 确保时间格式正确
    let formattedTime = practiceTime;
    if (typeof practiceTime === 'string') {
      if (practiceTime.includes(' ')) {
        formattedTime = practiceTime.split(' ')[0];
      }
    }
    
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/progress/detail',
      method: 'GET',
      data: {
        project_name: projectName,
        practice_time: formattedTime
      },
      success: (res) => {
        console.log('进度详情响应:', res);
        
        if (res.statusCode === 200 && res.data && res.data.success) {
          let progressDetails = [];
          if (res.data.data) {
            if (Array.isArray(res.data.data)) {
              progressDetails = res.data.data;
            } else {
              progressDetails = [res.data.data];
            }
          }
          
          callback(progressDetails);
        } else {
          console.warn('获取时间点进度详情失败:', res);
          callback([]);
        }
      },
      fail: (err) => {
        console.error('请求时间点进度详情失败:', err);
        callback([]);
      }
    });
  },

  // 处理和显示进度数据
  processAndDisplayProgress: function(progressDetails) {
    console.log('开始处理进度数据:', progressDetails);
    
    if (!progressDetails || progressDetails.length === 0) {
      this.setData({
        progressList: [],
        filteredProgressList: [],
        loading: false
      });
      wx.showToast({
        title: '该项目暂无进度记录',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 处理进度数据格式，适配后端返回的字段
    const processedProgress = progressDetails.map((item, index) => {
      // 解析实践成员信息
      let person = '未知人员';
      if (item.practice_members) {
        try {
          if (typeof item.practice_members === 'string') {
            const members = JSON.parse(item.practice_members);
            if (Array.isArray(members) && members.length > 0) {
              person = members[0].name || members[0] || '未知人员';
            } else {
              person = item.practice_members;
            }
          } else if (Array.isArray(item.practice_members)) {
            person = item.practice_members[0]?.name || item.practice_members[0] || '未知人员';
          } else {
            person = item.practice_members.name || item.practice_members || '未知人员';
          }
        } catch (e) {
          person = item.practice_members || '未知人员';
        }
      }

      // 处理时间信息
      let date = this.formatDate(new Date());
      let time = '';
      
      if (item.practice_time) {
        try {
          const practiceTime = new Date(item.practice_time);
          if (!isNaN(practiceTime.getTime())) {
            date = this.formatDate(practiceTime);
            time = this.formatTime(practiceTime);
          }
        } catch (e) {
          console.warn('时间解析失败:', item.practice_time);
        }
      }

      return {
        id: item.id || index + 1,
        date: date,
        time: time,
        title: item.news || '项目进度记录',
        location: item.practice_location || '未知地点',
        person: person,
        description: item.news || '无详细描述',
        status: 'completed',
        statusText: '已完成',
        selected: false,
        // 保留原始数据用于删除操作
        originalData: {
          project_name: item.project_name,
          practice_time: item.practice_time
        }
      };
    });

    console.log('处理后的进度数据:', processedProgress);

    // 按时间排序（最新的在前面）
    const sortedProgress = processedProgress.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

    this.setData({
      progressList: sortedProgress,
      filteredProgressList: sortedProgress,
      loading: false
    });

    wx.showToast({
      title: `加载完成，共${sortedProgress.length}条进度记录`,
      icon: 'success',
      duration: 2000
    });
  },

  // 格式化日期
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 格式化时间
  formatTime: function(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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

    // 获取要删除的记录信息
    const recordsToDelete = this.data.filteredProgressList.filter(item => ids.includes(item.id));
    console.log('准备删除的记录:', recordsToDelete);

    // 逐个调用后端删除接口
    let completedCount = 0;
    let successCount = 0;
    let failCount = 0;
    const totalCount = recordsToDelete.length;

    recordsToDelete.forEach((record, index) => {
      setTimeout(() => {
        this.deleteProgressRecord(record, (success) => {
          if (success) {
            successCount++;
          } else {
            failCount++;
          }
          
          completedCount++;
          console.log(`删除进度: ${completedCount}/${totalCount}`);
          
          // 所有删除操作完成后，更新页面数据
          if (completedCount === totalCount) {
            this.updateProgressListAfterDelete(ids);
            wx.hideLoading();
            
            if (failCount === 0) {
              wx.showToast({
                title: `已删除${successCount}条记录`,
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: `删除完成，成功${successCount}条，失败${failCount}条`,
                icon: 'none',
                duration: 3000
              });
            }
          }
        });
      }, index * 200); // 每个删除请求间隔200ms
    });
  },

  // 删除单个进度记录
  deleteProgressRecord: function(record, callback) {
    const { project_name, practice_time } = record.originalData;
    
    console.log('删除进度记录:', { project_name, practice_time });
    
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/progress/delete',
      method: 'DELETE',
      data: {
        project_name: project_name,
        practice_time: practice_time
      },
      success: (res) => {
        console.log('删除接口响应:', res);
        
        if (res.statusCode === 200 && res.data && res.data.success) {
          console.log('删除成功:', record.id);
          callback(true);
        } else {
          console.warn('删除失败:', res);
          callback(false);
        }
      },
      fail: (err) => {
        console.error('删除请求失败:', err);
        callback(false);
      }
    });
  },

  // 删除完成后更新进度列表
  updateProgressListAfterDelete: function(deletedIds) {
    // 从原始列表中删除
    const updatedProgressList = this.data.progressList.filter(item => !deletedIds.includes(item.id));
    
    // 从筛选列表中删除
    const updatedFilteredList = this.data.filteredProgressList.filter(item => !deletedIds.includes(item.id));

    this.setData({
      progressList: updatedProgressList,
      filteredProgressList: updatedFilteredList,
      selectedCount: 0,
      isAllSelected: false
    });
  }
});
