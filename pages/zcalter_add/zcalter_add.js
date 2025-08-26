// 导入API配置
const apiConfig = require('../../config/api.js');

Page({
  data: {
    fileName: '',
    fileNameTrimmed: '', // 添加一个去除空格的文件名
    fileTypeIndex: 0,
    fileTypes: ['PDF文件', 'Word文档'],
    fileTypeValues: ['pdf', 'doc'], // 对应的后端值
    selectedFile: null,
    uploading: false
  },

  // 文件名称输入
  onFileNameInput(e) {
    const value = e.detail.value;
    this.setData({
      fileName: value,
      fileNameTrimmed: value.trim()
    });
    console.log('文件名输入:', value, '去除空格后:', value.trim());
    this.checkButtonStatus();
  },

  // 文件类型选择
  onFileTypeChange(e) {
    this.setData({
      fileTypeIndex: e.detail.value
    });
  },

  // 选择文件
  chooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: (res) => {
        const file = res.tempFiles[0];
        
        // 检查文件类型
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const allowedTypes = ['pdf', 'doc', 'docx'];
        
        if (!allowedTypes.includes(fileExtension)) {
          wx.showToast({
            title: '只支持PDF、DOC、DOCX格式',
            icon: 'none'
          });
          return;
        }

        this.setData({
          selectedFile: {
            name: file.name,
            size: file.size,
            path: file.path,
            extension: fileExtension,
            sizeMB: (file.size / 1024 / 1024).toFixed(2),
            extensionUpper: fileExtension.toUpperCase()
          }
        });
        console.log('文件选择成功:', file.name, '大小:', file.size, '路径:', file.path);
        this.checkButtonStatus();
      },
      fail: (err) => {
        console.error('选择文件失败:', err);
        wx.showToast({
          title: '选择文件失败',
          icon: 'none'
        });
      }
    });
  },

  // 上传文件到后端获取URL
  uploadFileToServer() {
    return new Promise((resolve, reject) => {
      const { selectedFile } = this.data;
      
      console.log('开始上传文件:', selectedFile.name, '大小:', selectedFile.size);
      
      wx.uploadFile({
        url: apiConfig.buildUrl('/app/api/upload'),
        filePath: selectedFile.path,
        name: 'file',
        success: (res) => {
          console.log('文件上传响应:', res.data);
          try {
            const data = JSON.parse(res.data);
            if (data.success) {
              console.log('文件上传成功，URL:', data.file_url);
              resolve(data.file_url);
            } else {
              reject(new Error(data.message || '文件上传失败'));
            }
          } catch (e) {
            console.error('解析上传响应失败:', e);
            reject(new Error('解析响应失败'));
          }
        },
        fail: (err) => {
          console.error('上传文件失败:', err);
          reject(new Error('网络错误'));
        }
      });
    });
  },

  // 提交数据到后端接口
  submitDataToBackend(fileUrl) {
    return new Promise((resolve, reject) => {
      const { fileName, fileTypeIndex, fileTypeValues, selectedFile } = this.data;
      
      const requestData = {
        file_url: fileUrl,
        file_type: fileTypeValues[fileTypeIndex],
        original_name: fileName,
        file_size: selectedFile.size  // 直接传递整数，后端会处理
      };

      console.log('提交到后端的数据:', requestData);
      console.log('数据类型检查:');
      console.log('- file_url 类型:', typeof requestData.file_url);
      console.log('- file_type 类型:', typeof requestData.file_type);
      console.log('- original_name 类型:', typeof requestData.original_name);
      console.log('- file_size 类型:', typeof requestData.file_size, '值:', requestData.file_size);

      wx.request({
        url: apiConfig.buildUrl('/app/api/zcdocuments'),
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        data: requestData,
        success: (res) => {
          console.log('后端响应状态码:', res.statusCode);
          console.log('后端响应:', res.data);
          if (res.data.success) {
            resolve(res.data);
          } else {
            reject(new Error(res.data.message || '提交失败'));
          }
        },
        fail: (err) => {
          console.error('提交数据失败:', err);
          console.error('错误详情:', err.errMsg);
          reject(new Error('网络错误'));
        }
      });
    });
  },

  // 提交表单
  async submitForm() {
    const { fileName, selectedFile } = this.data;
    
    // 表单验证
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

    // 检查文件大小（限制为50MB）
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      wx.showToast({
        title: '文件大小不能超过50MB',
        icon: 'none'
      });
      return;
    }

    this.setData({ uploading: true });
    wx.showLoading({
      title: '上传中...'
    });

    try {
      // 第一步：上传文件获取URL
      const fileUrl = await this.uploadFileToServer();
      
      // 第二步：提交数据到后端接口
      const result = await this.submitDataToBackend(fileUrl);
      
      wx.hideLoading();
      this.setData({ uploading: false });
      
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
      
    } catch (error) {
      wx.hideLoading();
      this.setData({ uploading: false });
      
      console.error('上传失败:', error);
      wx.showToast({
        title: error.message || '上传失败',
        icon: 'none'
      });
    }
  },

  // 返回上一页
  goBack() {
    if (this.data.uploading) {
      wx.showModal({
        title: '提示',
        content: '文件正在上传中，确定要离开吗？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  // 调试函数：检查按钮状态
  checkButtonStatus() {
    const { uploading, fileNameTrimmed, selectedFile } = this.data;
    console.log('按钮状态检查:');
    console.log('- uploading:', uploading);
    console.log('- fileNameTrimmed:', fileNameTrimmed);
    console.log('- selectedFile:', selectedFile);
    console.log('- 按钮是否禁用:', uploading || !fileNameTrimmed || !selectedFile);
  }
}); 