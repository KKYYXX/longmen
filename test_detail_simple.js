// 简化的案例详情测试页面
Page({
  data: {
    caseId: null,
    caseData: null,
    fileContent: '',
    loading: true
  },

  onLoad: function(options) {
    console.log('测试详情页面加载', options);
    if (options.id) {
      this.setData({
        caseId: parseInt(options.id)
      });
      this.loadTestCase();
    }
  },

  loadTestCase: function() {
    var self = this;
    console.log('开始加载测试案例，ID:', this.data.caseId);
    
    // 模拟案例数据
    var testCase = {
      id: 1,
      caseName: '测试案例',
      uploadTime: '2024-01-15 10:30:00',
      files: [
        { 
          name: '测试文档.pdf', 
          fileName: '测试文档.pdf',
          fileSize: '2.5MB',
          fileType: 'pdf'
        }
      ],
      videos: [
        { 
          name: '测试视频.mp4', 
          videoName: '测试视频.mp4',
          videoDuration: '5:30' 
        }
      ],
      links: [
        { 
          title: '测试链接', 
          linkTitle: '测试链接',
          url: 'https://example.com',
          linkUrl: 'https://example.com'
        }
      ]
    };

    setTimeout(function() {
      self.setData({
        caseData: testCase,
        loading: false
      });
      
      console.log('案例数据已设置:', testCase);
      
      // 加载文件内容
      if (testCase.files && testCase.files.length > 0) {
        self.loadFileContent(testCase.files[0]);
      }
    }, 500);
  },

  loadFileContent: function(file) {
    var self = this;
    console.log('开始加载文件内容:', file.fileName);
    
    var mockContent = '【' + file.fileName + '】\n\n';
    mockContent += '这是一个测试文档的内容。\n\n';
    mockContent += '一、项目背景\n';
    mockContent += '这是项目背景的详细描述...\n\n';
    mockContent += '二、实施方案\n';
    mockContent += '这是实施方案的详细内容...\n\n';
    mockContent += '三、预期效果\n';
    mockContent += '这是预期效果的说明...';
    
    setTimeout(function() {
      self.setData({
        fileContent: mockContent
      });
      console.log('文件内容已设置');
      
      wx.showToast({
        title: '文件内容已加载',
        icon: 'success'
      });
    }, 1000);
  },

  navigateBack: function() {
    wx.navigateBack();
  }
});
