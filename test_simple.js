// 简单测试页面 - 验证基本功能
Page({
  data: {
    caseName: '',
    uploadedFiles: [],
    testCases: [
      {
        id: 1,
        caseName: '测试案例1',
        files: [{ name: '测试文件.pdf', size: '2MB' }],
        videos: [{ name: '测试视频.mp4' }],
        links: [{ title: '测试链接', url: 'https://example.com' }]
      }
    ]
  },

  onLoad: function() {
    console.log('测试页面加载成功');
  },

  // 测试文件上传
  testUpload: function() {
    console.log('测试上传功能');
    
    if (this.data.uploadedFiles.length > 0) {
      wx.showModal({
        title: '提示',
        content: '已有文件，是否替换？',
        success: function(res) {
          if (res.confirm) {
            console.log('用户确认替换文件');
          }
        }
      });
      return;
    }
    
    // 模拟文件上传
    var mockFile = {
      name: '测试文档.pdf',
      size: '2MB'
    };
    
    this.setData({
      uploadedFiles: [mockFile]
    });
    
    wx.showToast({
      title: '上传成功',
      icon: 'success'
    });
  },

  // 测试案例查看
  testViewCase: function() {
    console.log('测试查看案例');
    
    var testCase = this.data.testCases[0];
    var content = '文件：' + testCase.files[0].name + '\n';
    content += '视频：' + testCase.videos[0].name + '\n';
    content += '链接：' + testCase.links[0].title;
    
    wx.showModal({
      title: '案例详情',
      content: content,
      showCancel: false
    });
  },

  // 输入案例名称
  onCaseNameInput: function(e) {
    this.setData({
      caseName: e.detail.value
    });
  }
});
