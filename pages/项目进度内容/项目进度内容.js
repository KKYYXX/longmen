// pages/项目进度内容/项目进度内容.js
Page({
  data: {
    // 项目信息
    projectInfo: null,
    
    // 时间查询相关
    selectedTimeRange: '',
    customStartDate: '',
    customEndDate: '',
    timeRangeOptions: [
      { label: '最近一周', value: 'week' },
      { label: '最近一月', value: 'month' },
      { label: '最近三月', value: 'quarter' },
      { label: '最近半年', value: 'halfYear' },
      { label: '最近一年', value: 'year' }
    ],

    // 进度记录相关
    progressList: [],
    allProgressList: [], // 存储所有进度记录，用于筛选
    showNoProgress: false,
    progressLoading: false
  },

  onLoad: function(options) {
    console.log('项目进度内容页面加载');
    
    // 监听页面间传递的数据
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('acceptDataFromOpenerPage', (data) => {
      console.log('接收到传递的数据:', data);
      this.setData({
        projectInfo: data
      });
      
      // 页面加载后自动查询该项目的所有进度记录
      this.loadAllProjectProgress();
    });
  },

  onShow: function() {
    console.log('项目进度内容页面显示');
  },

  // 加载项目的所有进度记录
  loadAllProjectProgress: function() {
    console.log('=== 开始加载项目所有进度记录 ===');
    
    if (!this.data.projectInfo) {
      console.error('❌ 项目信息为空，无法加载进度记录');
      return;
    }

    this.setData({
      progressLoading: true,
      showNoProgress: false
    });

    const projectName = this.data.projectInfo.projectName;
    console.log('项目名称:', projectName);
    console.log('项目信息:', this.data.projectInfo);
    console.log('====================================');

    // 第一步：调用 /api/progress/times 接口获取项目所有进度时间点
    console.log('🚀 开始调用第一个接口: /api/progress/times');
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/progress/times',
      method: 'GET',
      data: {
        project_name: projectName
      },
      success: (res) => {
        console.log('=== 第一个接口响应 ===');
        console.log('响应状态码:', res.statusCode);
        console.log('响应数据:', res.data);
        console.log('响应成功标志:', res.data?.success);
        console.log('响应消息:', res.data?.message);
        console.log('时间点数据:', res.data?.data);
        console.log('时间点数量:', res.data?.data?.length || 0);
        console.log('====================');
        
        if (res.statusCode === 200 && res.data && res.data.success) {
          // 获取到进度时间列表
          const progressTimes = res.data.data || [];
          console.log('✅ 获取到项目所有进度时间点:', progressTimes);
          console.log('时间点类型:', typeof progressTimes[0]);
          console.log('时间点示例:', progressTimes[0]);
          
          if (progressTimes.length === 0) {
            console.warn('⚠️ 没有进度记录');
            // 没有进度记录
            this.setData({
              progressList: [],
              showNoProgress: true,
              progressLoading: false
            });
            wx.showToast({
              title: '该项目暂无进度记录',
              icon: 'none',
              duration: 2000
            });
            return;
          }

          console.log('🎯 开始调用第二个接口获取详细进度记录');
          // 第二步：根据时间列表逐个调用详情接口获取所有进度记录
          this.getAllProgressDetails(projectName, progressTimes);
        } else {
          console.warn('❌ 获取进度时间列表失败:', res);
          if (res.statusCode === 400) {
            console.warn('400错误：参数错误');
          } else if (res.statusCode === 500) {
            console.error('500错误：服务器内部错误');
          }
          this.handleProgressQueryError('获取进度时间列表失败');
        }
      },
      fail: (err) => {
        console.error('=== 第一个接口请求失败 ===');
        console.error('错误对象:', err);
        console.error('错误消息:', err.errMsg);
        console.error('错误类型:', err.errType);
        console.error('========================');
        this.handleProgressQueryError('网络请求失败');
      }
    });
  },

  // 获取所有时间点的项目进度详情
  getAllProgressDetails: function(projectName, progressTimes) {
    console.log('=== 开始获取所有时间点的项目进度详情 ===');
    console.log('项目名称:', projectName);
    console.log('时间点列表:', progressTimes);
    console.log('时间点数量:', progressTimes.length);
    console.log('时间点类型:', typeof progressTimes[0]);
    console.log('========================================');
    
    if (!progressTimes || progressTimes.length === 0) {
      console.warn('没有时间点数据');
      this.setData({
        progressList: [],
        showNoProgress: true,
        progressLoading: false
      });
      return;
    }
    
    // 逐个查询每个时间点的进度详情
    let allProgressDetails = [];
    let completedCount = 0;
    let errorCount = 0;
    const totalCount = progressTimes.length;

    progressTimes.forEach((time, index) => {
      console.log(`=== 处理第${index + 1}个时间点 ===`);
      console.log('时间点值:', time);
      console.log('时间点类型:', typeof time);
      console.log('时间点长度:', time ? time.length : 'undefined');
      console.log('==============================');
      
      // 添加延迟，避免同时发送太多请求
      setTimeout(() => {
        this.getProgressDetailByTime(projectName, time, (progressDetails) => {
          if (progressDetails && progressDetails.length > 0) {
            allProgressDetails = allProgressDetails.concat(progressDetails);
            console.log(`✅ 时间点 ${time} 查询成功，获取到 ${progressDetails.length} 条记录`);
          } else {
            console.warn(`⚠️ 时间点 ${time} 查询无数据`);
          }
          
          completedCount++;
          console.log(`📊 进度详情查询进度: ${completedCount}/${totalCount}`);
          
          // 所有查询完成后，处理数据
          if (completedCount === totalCount) {
            console.log('🎉 所有时间点查询完成，开始处理数据');
            console.log('总进度记录数:', allProgressDetails.length);
            this.processAndDisplayAllProgress(allProgressDetails);
          }
        });
      }, index * 100); // 每个请求间隔100ms
    });
  },

  // 时间范围选择
  onTimeRangeSelect: function(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      selectedTimeRange: value,
      customStartDate: '',
      customEndDate: ''
    });
    
    // 根据选择的时间范围筛选进度记录
    this.filterProgressByTimeRange(value);
  },

  // 自定义开始时间选择
  onCustomStartDateChange: function(e) {
    this.setData({
      customStartDate: e.detail.value,
      selectedTimeRange: ''
    });
  },

  // 自定义结束时间选择
  onCustomEndDateChange: function(e) {
    this.setData({
      customEndDate: e.detail.value,
      selectedTimeRange: ''
    });
  },

  // 自定义时间查询
  onCustomTimeQuery: function() {
    if (!this.data.customStartDate || !this.data.customStartDate) {
      wx.showToast({
        title: '请选择完整的时间范围',
        icon: 'none'
      });
      return;
    }

    if (this.data.customStartDate > this.data.customEndDate) {
      wx.showToast({
        title: '开始时间不能晚于结束时间',
        icon: 'none'
      });
      return;
    }

    // 根据自定义时间范围筛选进度记录
    this.filterProgressByCustomTime(this.data.customStartDate, this.data.customEndDate);
  },

  // 根据时间范围查询进度
  queryProgressByTimeRange: function(timeRange) {
    if (!this.data.projectInfo) return;

    this.setData({
      progressLoading: true,
      showNoProgress: false
    });

    // 计算时间范围
    const endDate = new Date();
    const startDate = new Date();

    switch(timeRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'halfYear':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const startDateStr = this.formatDate(startDate);
    const endDateStr = this.formatDate(endDate);

    this.queryProgressByCustomTime(startDateStr, endDateStr);
  },

  // 根据自定义时间查询进度
  queryProgressByCustomTime: function(startDate, endDate) {
    if (!this.data.projectInfo) return;

    this.setData({
      progressLoading: true,
      showNoProgress: false
    });

    // 调用后端进度查询接口
    this.queryProgressFromBackend(startDate, endDate);
  },

  // 从后端查询项目进度
  queryProgressFromBackend: function(startDate, endDate) {
    const projectName = this.data.projectInfo.projectName;
    console.log('开始查询项目进度，项目名称:', projectName, '时间范围:', startDate, '至', endDate);

    // 第一步：调用 /api/progress/times 接口获取项目进度时间列表
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/progress/times',
      method: 'GET',
      data: {
        project_name: projectName
      },
      success: (res) => {
        console.log('进度时间接口响应:', res);
        
        if (res.statusCode === 200 && res.data && res.data.success) {
          // 获取到进度时间列表，继续调用详情接口
          const progressTimes = res.data.data || [];
          console.log('获取到进度时间列表:', progressTimes);
          
          // 第二步：根据时间列表逐个调用详情接口
          this.getProgressDetailsByTimeList(projectName, progressTimes, startDate, endDate);
        } else {
          console.warn('获取进度时间列表失败:', res);
          this.handleProgressQueryError('获取进度时间列表失败');
        }
      },
      fail: (err) => {
        console.error('请求进度时间接口失败:', err);
        this.handleProgressQueryError('网络请求失败');
      }
    });
  },

  // 根据时间列表逐个获取项目进度详细信息
  getProgressDetailsByTimeList: function(projectName, progressTimes, startDate, endDate) {
    console.log('开始根据时间列表获取项目进度详细信息');
    
    if (!progressTimes || progressTimes.length === 0) {
      this.setData({
        progressList: [],
        showNoProgress: true,
        progressLoading: false
      });
      return;
    }

    // 过滤时间范围
    const filteredTimes = progressTimes.filter(time => {
      const timeDate = new Date(time);
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      return timeDate >= startDateObj && timeDate <= endDateObj;
    });

    if (filteredTimes.length === 0) {
      this.setData({
        progressList: [],
        showNoProgress: true,
        progressLoading: false
      });
      return;
    }

    // 逐个查询每个时间点的进度详情
    let allProgressDetails = [];
    let completedCount = 0;
    const totalCount = filteredTimes.length;

    filteredTimes.forEach((time, index) => {
      this.getProgressDetailByTime(projectName, time, (progressDetails) => {
        if (progressDetails && progressDetails.length > 0) {
          allProgressDetails = allProgressDetails.concat(progressDetails);
        }
        
        completedCount++;
        console.log(`进度详情查询进度: ${completedCount}/${totalCount}`);
        
        // 所有查询完成后，处理数据
        if (completedCount === totalCount) {
          this.processAndDisplayProgress(allProgressDetails, startDate, endDate);
        }
      });
    });
  },

  // 获取单个时间点的项目进度详情
  getProgressDetailByTime: function(projectName, practiceTime, callback) {
    console.log('=== 查询时间点进度详情 ===');
    console.log('项目名称:', projectName);
    console.log('时间参数:', practiceTime);
    console.log('时间类型:', typeof practiceTime);
    console.log('时间长度:', practiceTime ? practiceTime.length : 'undefined');
    console.log('==========================');
    
    // 确保时间格式正确
    let formattedTime = practiceTime;
    if (typeof practiceTime === 'string') {
      // 如果是字符串，确保格式为 YYYY-MM-DD
      if (practiceTime.includes('T')) {
        formattedTime = practiceTime.split('T')[0];
        console.log('检测到T分隔符，格式化后时间:', formattedTime);
      }
      // 检查长度是否为10（YYYY-MM-DD格式）
      if (practiceTime.length !== 10) {
        console.warn('⚠️ 时间格式可能不正确，长度:', practiceTime.length);
      }
    }
    
    console.log('最终发送的时间参数:', formattedTime);
    
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/progress/detail',
      method: 'GET',
  data: {
        project_name: projectName,
        practice_time: formattedTime
      },
      success: (res) => {
        console.log('=== 单个时间点进度详情响应 ===');
        console.log('响应状态码:', res.statusCode);
        console.log('响应数据:', res.data);
        console.log('响应消息:', res.data?.message);
        console.log('响应成功标志:', res.data?.success);
        console.log('响应数据条数:', res.data?.data?.length || 0);
        console.log('================================');
        
        if (res.statusCode === 200 && res.data && res.data.success) {
          const progressDetails = res.data.data || [];
          console.log('✅ 获取到时间点进度详情:', progressDetails);
          callback(progressDetails);
        } else {
          console.warn('❌ 获取时间点进度详情失败:', res);
          if (res.statusCode === 404) {
            console.warn('404错误：该时间点未找到记录');
          } else if (res.statusCode === 400) {
            console.warn('400错误：参数错误');
          } else if (res.statusCode === 500) {
            console.error('500错误：服务器内部错误');
          }
          callback([]);
        }
      },
      fail: (err) => {
        console.error('=== 请求时间点进度详情失败 ===');
        console.error('错误对象:', err);
        console.error('错误消息:', err.errMsg);
        console.error('错误类型:', err.errType);
        console.error('============================');
        callback([]);
      }
    });
  },

  // 处理和显示进度数据
  processAndDisplayProgress: function(progressDetails, startDate, endDate) {
    console.log('开始处理进度数据');
    
    if (!progressDetails || progressDetails.length === 0) {
      // 没有进度数据
      this.setData({
        progressList: [],
        showNoProgress: true,
        progressLoading: false
      });
      
      wx.showToast({
        title: '该时间段暂无进度记录',
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
          // 尝试解析JSON格式的成员信息
          if (typeof item.practice_members === 'string') {
            const members = JSON.parse(item.practice_members);
            if (Array.isArray(members) && members.length > 0) {
              person = members[0].name || members[0] || '未知人员';
            } else {
              person = item.practice_members;
            }
          } else if (Array.isArray(item.practice_members)) {
            person = members[0]?.name || members[0] || '未知人员';
          } else {
            person = item.practice_members.name || item.practice_members || '未知人员';
          }
        } catch (e) {
          // 如果解析失败，直接使用原始值
          person = item.practice_members || '未知人员';
        }
      }

      // 处理时间信息
      let date = this.formatDate(new Date());
      
      if (item.practice_time) {
        try {
          const practiceTime = new Date(item.practice_time);
          if (!isNaN(practiceTime.getTime())) {
            date = this.formatDate(practiceTime);
          }
        } catch (e) {
          console.warn('时间解析失败:', item.practice_time);
        }
      }

      return {
        id: item.id || index + 1,
        person: person,
        time: '', // 不显示时分，只显示日期
        location: item.practice_location || '未知地点',
        content: item.news || '无详细描述',
        date: date,
        // 保留原始数据，用于后续扩展
        originalData: item
      };
    });

    console.log('处理后的进度数据:', processedProgress);

    // 根据时间范围过滤数据（后端已经过滤，这里作为二次确认）
    const filteredProgress = processedProgress.filter(item => {
      const itemDate = item.date;
      return itemDate >= startDate && itemDate <= endDate;
    });

    console.log('时间过滤后的进度数据:', filteredProgress);

    // 更新页面数据
    this.setData({
      progressList: filteredProgress,
      showNoProgress: filteredProgress.length === 0,
      progressLoading: false
    });

    // 显示查询结果提示
    if (filteredProgress.length > 0) {
      wx.showToast({
        title: `查询到${filteredProgress.length}条进度记录`,
        icon: 'success',
        duration: 2000
      });
    } else {
      wx.showToast({
        title: '该时间段暂无进度记录',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 处理和显示所有进度数据（按时间排序）
  processAndDisplayAllProgress: function(progressDetails) {
    console.log('开始处理所有进度数据');
    
    if (!progressDetails || progressDetails.length === 0) {
      // 没有进度数据
      this.setData({
        progressList: [],
        showNoProgress: true,
        progressLoading: false
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
      // 调试：打印每个进度记录的原始数据
      console.log(`=== 处理第${index + 1}条进度记录 ===`);
      console.log('原始数据:', item);
      console.log('图片URL字段:', item.practice_image_url);
      console.log('视频URL字段:', item.video_url);
      console.log('新闻字段:', item.news);
      console.log('==============================');
      
      // 解析实践成员信息
      let person = '未知人员';
      if (item.practice_members) {
        try {
          // 尝试解析JSON格式的成员信息
          if (typeof item.practice_members === 'string') {
            const members = JSON.parse(item.practice_members);
            if (Array.isArray(members) && members.length > 0) {
              person = members[0].name || members[0] || '未知人员';
            } else {
              person = item.practice_members;
            }
          } else if (Array.isArray(item.practice_members)) {
            person = members[0]?.name || members[0] || '未知人员';
          } else {
            person = item.practice_members.name || item.practice_members || '未知人员';
          }
        } catch (e) {
          // 如果解析失败，直接使用原始值
          person = item.practice_members || '未知人员';
        }
      }

      // 处理时间信息
      let date = this.formatDate(new Date());
      
      if (item.practice_time) {
        try {
          const practiceTime = new Date(item.practice_time);
          if (!isNaN(practiceTime.getTime())) {
            date = this.formatDate(practiceTime);
          }
        } catch (e) {
          console.warn('时间解析失败:', item.practice_time);
        }
      }

      return {
        id: item.id || index + 1,
        person: person,
        time: '', // 不显示时分，只显示日期
        location: item.practice_location || '未知地点',
        content: item.news || '无详细描述',
        date: date,
        // 保留原始数据，用于后续扩展
        originalData: item
      };
    });

    console.log('处理后的进度数据:', processedProgress);

    // 按时间排序（最新的在前面）
    const sortedProgress = processedProgress.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA; // 降序排列，最新的在前面
    });

    console.log('排序后的进度数据:', sortedProgress);

    // 更新页面数据
    this.setData({
      progressList: sortedProgress,
      allProgressList: sortedProgress, // 保存所有数据用于筛选
      showNoProgress: false,
      progressLoading: false
    });

    // 显示查询结果提示
    wx.showToast({
      title: `加载完成，共${sortedProgress.length}条进度记录`,
      icon: 'success',
      duration: 2000
    });
  },

  // 处理进度查询错误
  handleProgressQueryError: function(errorMessage) {
    console.error('进度查询错误:', errorMessage);
    
    this.setData({
      progressList: [],
      showNoProgress: false,
      progressLoading: false
    });

    wx.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    });
  },

  // 打开URL链接
  openUrl: function(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) {
      wx.showToast({
        title: '链接无效',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    console.log('准备打开链接:', url);
    
    // 使用微信小程序的复制功能，让用户手动在浏览器中打开
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showModal({
          title: '链接已复制',
          content: '链接已复制到剪贴板，请在浏览器中粘贴打开',
          showCancel: false,
          confirmText: '知道了'
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 下载文件
  downloadFile: function(e) {
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.showToast({
        title: '文件下载功能开发中',
        icon: 'none'
      });
    }
  },

  // 分享记录
  shareRecord: function(e) {
    const record = e.currentTarget.dataset.record;
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  // 导出记录
  exportRecord: function(e) {
    const record = e.currentTarget.dataset.record;
    wx.showToast({
      title: '导出功能开发中',
      icon: 'none'
    });
  },

  // 格式化日期
  formatDate: function(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 测试进度查询功能（调试用）
  testProgressQuery: function() {
    console.log('=== 开始测试进度查询功能 ===');
    
    const projectName = this.data.projectInfo?.projectName;
    if (!projectName) {
      console.error('❌ 项目信息为空，无法测试');
      wx.showToast({
        title: '请先选择项目',
        icon: 'none'
      });
      return;
    }
    
    console.log('测试项目名称:', projectName);
    console.log('============================');
    
    // 测试第一个接口
    console.log('🧪 测试第一个接口: /api/progress/times');
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/progress/times',
      method: 'GET',
      data: { project_name: projectName },
      success: (res) => {
        console.log('=== 测试接口1响应 ===');
        console.log('响应状态码:', res.statusCode);
        console.log('响应数据:', res.data);
        console.log('========================');
        
        if (res.statusCode === 200 && res.data && res.data.success) {
          const times = res.data.data || [];
          console.log('✅ 第一个接口测试成功，获取到时间点:', times);
          
          if (times.length > 0) {
            console.log('🧪 开始测试第二个接口: /api/progress/detail');
            // 测试第二个接口
            this.testDetailInterface(projectName, times[0]);
          } else {
            console.warn('⚠️ 没有时间点数据，无法测试第二个接口');
          }
        } else {
          console.error('❌ 第一个接口测试失败');
        }
      },
      fail: (err) => {
        console.error('❌ 第一个接口测试失败:', err);
      }
    });
  },

  // 测试第二个接口（调试用）
  testDetailInterface: function(projectName, testTime) {
    console.log('=== 测试第二个接口 ===');
    console.log('项目名称:', projectName);
    console.log('测试时间:', testTime);
    console.log('时间类型:', typeof testTime);
    console.log('====================');
    
    wx.request({
      url: 'http://127.0.0.1:5000/app/api/progress/detail',
      method: 'GET',
      data: {
        project_name: projectName,
        practice_time: testTime
      },
      success: (res) => {
        console.log('=== 测试接口2响应 ===');
        console.log('响应状态码:', res.statusCode);
        console.log('响应数据:', res.data);
        console.log('响应消息:', res.data?.message);
        console.log('========================');
        
        if (res.statusCode === 200 && res.data && res.data.success) {
          console.log('✅ 第二个接口测试成功');
          console.log('获取到记录数:', res.data.data?.length || 0);
        } else {
          console.error('❌ 第二个接口测试失败');
          if (res.statusCode === 500) {
            console.error('500错误：服务器内部错误');
          }
        }
      },
      fail: (err) => {
        console.error('❌ 第二个接口测试失败:', err);
      }
    });
  },

  // 根据时间范围筛选进度记录
  filterProgressByTimeRange: function(timeRange) {
    console.log('=== 开始时间范围筛选 ===');
    console.log('选择的时间范围:', timeRange);
    
    if (!this.data.allProgressList || this.data.allProgressList.length === 0) {
      console.warn('⚠️ 没有可筛选的数据');
      wx.showToast({
        title: '暂无数据可筛选',
        icon: 'none'
      });
      return;
    }

    // 计算时间范围
    const endDate = new Date();
    const startDate = new Date();

    switch(timeRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'halfYear':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        // 默认显示所有数据
        this.setData({
          progressList: this.data.allProgressList,
          showNoProgress: false
        });
        return;
    }

    const startDateStr = this.formatDate(startDate);
    const endDateStr = this.formatDate(endDate);
    
    console.log('筛选时间范围:', startDateStr, '至', endDateStr);

    // 筛选数据
    const filteredProgress = this.data.allProgressList.filter(item => {
      const itemDate = new Date(item.originalData.practice_time);
      return itemDate >= startDate && itemDate <= endDate;
    });

    console.log('筛选结果:', filteredProgress);
    console.log('筛选前记录数:', this.data.allProgressList.length);
    console.log('筛选后记录数:', filteredProgress.length);

    // 更新显示数据
    this.setData({
      progressList: filteredProgress,
      showNoProgress: filteredProgress.length === 0
    });

    // 显示筛选结果提示
    if (filteredProgress.length === 0) {
      wx.showToast({
        title: '该时间段暂无进度记录',
        icon: 'none',
        duration: 2000
      });
    } else {
      wx.showToast({
        title: `筛选到${filteredProgress.length}条记录`,
        icon: 'success',
        duration: 2000
      });
    }
  },

  // 根据自定义时间范围筛选进度记录
  filterProgressByCustomTime: function(startDateStr, endDateStr) {
    console.log('=== 开始自定义时间筛选 ===');
    console.log('开始日期:', startDateStr);
    console.log('结束日期:', endDateStr);
    
    if (!this.data.allProgressList || this.data.allProgressList.length === 0) {
      console.warn('⚠️ 没有可筛选的数据');
      wx.showToast({
        title: '暂无数据可筛选',
        icon: 'none'
      });
      return;
    }

    // 转换日期字符串为Date对象
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // 设置结束日期为当天的23:59:59
    endDate.setHours(23, 59, 59, 999);

    console.log('筛选时间范围:', startDate, '至', endDate);

    // 筛选数据
    const filteredProgress = this.data.allProgressList.filter(item => {
      const itemDate = new Date(item.originalData.practice_time);
      return itemDate >= startDate && itemDate <= endDate;
    });

    console.log('筛选结果:', filteredProgress);
    console.log('筛选前记录数:', this.data.allProgressList.length);
    console.log('筛选后记录数:', filteredProgress.length);

    // 更新显示数据
    this.setData({
      progressList: filteredProgress,
      showNoProgress: filteredProgress.length === 0
    });

    // 显示筛选结果提示
    if (filteredProgress.length === 0) {
      wx.showToast({
        title: '该时间段暂无进度记录',
        icon: 'none',
        duration: 2000
      });
    } else {
      wx.showToast({
        title: `筛选到${filteredProgress.length}条记录`,
        icon: 'success',
        duration: 2000
      });
    }
  },

  // 重置筛选，显示所有记录
  resetFilter: function() {
    console.log('=== 重置筛选 ===');
    
    this.setData({
      selectedTimeRange: '',
      customStartDate: '',
      customEndDate: '',
      progressList: this.data.allProgressList,
      showNoProgress: false
    });

    wx.showToast({
      title: '已重置筛选',
      icon: 'success',
      duration: 1500
    });
  }
});