Page({
  data: {
    fileName: '',
    fileTypeIndex: 0,
    fileTypes: ['PDF文档', 'Word文档', '图片文件', '其他文件'],
    fileDescription: '',
    selectedFile: null
  },

  // 文件名称输入
  onFileNameInput(e) {
    this.setData({
      fileName: e.detail.value
    });
  },

  // 文件类型选择
  onFileTypeChange(e) {
    this.setData({
      fileTypeIndex: e.detail.value
    });
  },

  // 文件描述输入
  onDescriptionInput(e) {
    this.setData({
      fileDescription: e.detail.value
    });
  },

  // 选择文件
  chooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        const file = res.tempFiles[0];
        this.setData({
          selectedFile: {
            name: file.name,
            size: file.size,
            path: file.path
          }
        });
      },
      fail: (err) => {
        wx.showToast({
          title: '选择文件失败',
          icon: 'none'
        });
      }
    });
  },

  // 提交表单
  submitForm() {
    const { fileName, fileDescription, selectedFile } = this.data;
    
    if (!fileName.trim()) {
      wx.showToast({
        title: '请输入文件名称',
        icon: 'none'
      });
      return;
    }

    if (!selectedFile) {
      wx.showToast({
        title: '请选择要上传的文件',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '上传中...'
    });

    // 模拟上传过程
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '文件上传成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    }, 2000);
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
}); 