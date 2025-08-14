Page({
  data: {
    searchKeyword: '',
    allCases: [],
    filteredCases: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad: function() {
    console.log('典型案例查询页面加载');
    this.loadCases();
  },

  onShow: function() {
    // 页面显示时重新加载数据，以防其他页面有更新
    this.loadCases();
  },

  loadCases: function() {
    this.setData({ loading: true });

    // 调用后端接口获取典型案例数据
    this.fetchCasesFromBackend();
  },

  // 从后端获取典型案例数据
  fetchCasesFromBackend: function() {
    const apiConfig = require('../../config/api.js');
    const url = apiConfig.buildApiUrl('/app/api/models');
    
    wx.request({
      url: url,
      method: 'GET',
      success: (res) => {
        console.log('后端接口返回数据:', res.data);
        if (res.data && res.data.success) {
          // 处理后端返回的数据
          const casesData = this.processBackendData(res.data.data);
          this.setData({
            allCases: casesData,
            filteredCases: casesData,
            loading: false
          });
          
          // 获取案例数据后，更新视频和新闻数量
          this.updateCaseCounts();
        } else {
          wx.showToast({
            title: res.data.message || '加载失败',
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      },
      fail: (error) => {
        console.error('请求后端接口失败:', error);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    });
  },

  // 处理后端返回的数据
  processBackendData: function(backendData) {
    if (!Array.isArray(backendData)) {
      return [];
    }

    return backendData.map(item => ({
      id: item.id,
      title: item.model_name || '未命名案例',
      type: '典型案例',
      description: item.file_name || '暂无描述',
      uploadTime: item.upload_time || '未知时间',
      fileCount: 1, // 每个案例对应一个文件
      videoCount: 0, // 暂时设为0，后续通过video接口获取
      linkCount: 0,  // 暂时设为0，后续通过news接口获取
      files: [{
        name: item.file_name,
        size: this.formatFileSize(item.file_size),
        url: item.file_url,
        type: item.file_type
      }],
      videos: [], // 后续通过video接口填充
      links: [],  // 后续通过news接口填充
      // 保存原始数据用于后续接口调用
      model_name: item.model_name,
      file_url: item.file_url
    }));
  },

  // 格式化文件大小
  formatFileSize: function(size) {
    if (!size) return '0B';
    const sizeNum = parseInt(size);
    if (sizeNum < 1024) return sizeNum + 'B';
    if (sizeNum < 1024 * 1024) return (sizeNum / 1024).toFixed(1) + 'KB';
    return (sizeNum / (1024 * 1024)).toFixed(1) + 'MB';
  },

  // 获取案例的视频信息
  fetchVideoInfo: function(modelName, callback) {
    const apiConfig = require('../../config/api.js');
    const url = apiConfig.buildApiUrl('/app/api/video');
    
    wx.request({
      url: url,
      method: 'GET',
      data: {
        model_name: modelName
      },
      success: (res) => {
        console.log('视频接口返回数据:', res.data);
        if (res.data && res.data.success) {
          callback(res.data.data);
        } else {
          callback([]);
        }
      },
      fail: (error) => {
        console.error('获取视频信息失败:', error);
        callback([]);
      }
    });
  },

  // 获取案例的新闻链接信息
  fetchNewsInfo: function(modelName, callback) {
    const apiConfig = require('../../config/api.js');
    const url = apiConfig.buildApiUrl('/app/api/news');
    
    wx.request({
      url: url,
      method: 'GET',
      data: {
        model_name: modelName
      },
      success: (res) => {
        console.log('新闻接口返回数据:', res.data);
        if (res.data && res.data.success) {
          callback(res.data.data);
        } else {
          callback([]);
        }
      },
      fail: (error) => {
        console.error('获取新闻信息失败:', error);
        callback([]);
      }
    });
  },

  // 更新案例的视频和新闻数量
  updateCaseCounts: function() {
    const cases = this.data.allCases;
    let updated = false;
    
    cases.forEach((caseItem, index) => {
      // 获取视频数量
      this.fetchVideoInfo(caseItem.model_name, (videos) => {
        const videoCount = videos ? videos.length : 0;
        
        // 获取新闻数量
        this.fetchNewsInfo(caseItem.model_name, (news) => {
          const linkCount = news ? news.length : 0;
          
          // 更新数据
          const newCases = [...this.data.allCases];
          newCases[index] = {
            ...newCases[index],
            videoCount: videoCount,
            linkCount: linkCount,
            videos: videos || [],
            links: news || []
          };
          
          this.setData({
            allCases: newCases,
            filteredCases: newCases
          });
          
          updated = true;
        });
      });
    });
  },

  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  onSearch: function() {
    this.filterCases();
  },

  filterCases: function() {
    let filtered = this.data.allCases;

    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(case_item =>
        case_item.title.toLowerCase().includes(keyword) ||
        case_item.description.toLowerCase().includes(keyword)
      );
    }

    this.setData({
      filteredCases: filtered
    });
  },

  viewCaseDetail: function(e) {
    const caseData = e.currentTarget.dataset.case;
    wx.showModal({
      title: caseData.title,
      content: caseData.description,
      showCancel: false
    });
  },

  previewCase: function(e) {
    const caseData = e.currentTarget.dataset.case;
    // 跳转到文档展示页面，显示完整的案例内容
    wx.navigateTo({
      url: `/pages/case_document/case_document?id=${caseData.id}&model_name=${encodeURIComponent(caseData.model_name)}&file_url=${encodeURIComponent(caseData.file_url)}`
    });
  },

  // 播放视频
  playVideo: function(e) {
    if (e && e.stopPropagation) {
      e.stopPropagation(); // 阻止事件冒泡
    }
    const caseData = e.currentTarget.dataset.case;
    
    // 获取视频信息
    this.fetchVideoInfo(caseData.model_name, (videos) => {
      if (videos && videos.length > 0) {
        // 跳转到视频播放页面
        const videoUrl = videos[0].video_url;
        wx.navigateTo({
          url: `/pages/video-player/video-player?video_url=${encodeURIComponent(videoUrl)}&title=${encodeURIComponent(caseData.title)}`
        });
      } else {
        wx.showToast({
          title: '暂无视频',
          icon: 'none'
        });
      }
    });
  },

  // 查看新闻链接
  viewNews: function(e) {
    if (e && e.stopPropagation) {
      e.stopPropagation(); // 阻止事件冒泡
    }
    const caseData = e.currentTarget.dataset.case;
    
    // 获取新闻链接信息
    this.fetchNewsInfo(caseData.model_name, (news) => {
      if (news && news.length > 0) {
        // 跳转到webview页面显示新闻
        const newsUrl = news[0].news_url;
        wx.navigateTo({
          url: `/pages/webview/webview?url=${encodeURIComponent(newsUrl)}&title=${encodeURIComponent(news[0].news_title || '新闻详情')}`
        });
      } else {
        wx.showToast({
          title: '暂无新闻链接',
          icon: 'none'
        });
      }
    });
  },

  downloadCase: function(e) {
    if (e && e.stopPropagation) {
      e.stopPropagation(); // 阻止事件冒泡
    }
    const caseData = e.currentTarget.dataset.case;
    
    if (caseData.files && caseData.files.length > 0) {
      const fileUrl = caseData.files[0].url;
      // 下载文件
      wx.downloadFile({
        url: fileUrl,
        success: (res) => {
          if (res.statusCode === 200) {
            wx.showToast({
              title: '下载成功',
              icon: 'success'
            });
          }
        },
        fail: (error) => {
          console.error('下载失败:', error);
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '暂无文件可下载',
        icon: 'none'
      });
    }
  },

  shareCase: function(e) {
    if (e && e.stopPropagation) {
      e.stopPropagation(); // 阻止事件冒泡
    }
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  loadMore: function() {
    wx.showToast({
      title: '没有更多数据',
      icon: 'none'
    });
  }
});
