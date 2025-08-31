// 文件上传工具函数
// 使用后端接口：POST /api/upload 和 GET /uploads/<filename>

const apiConfig = require('../config/api.js');

// 文件类型和大小限制配置
const FILE_CONFIG = {
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  },
  video: {
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['mp4', 'avi', 'mov', 'wmv', 'flv']
  },
  document: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']
  }
};

/**
 * 验证文件类型和大小
 * @param {Object} file - 文件对象
 * @param {string} fileType - 文件类型（image, video, document）
 * @returns {Object} 验证结果 {valid: boolean, message: string}
 */
function validateFile(file, fileType) {
  const config = FILE_CONFIG[fileType];
  if (!config) {
    return { valid: false, message: '不支持的文件类型' };
  }

  // 检查文件大小
  if (file.size > config.maxSize) {
    const maxSizeMB = (config.maxSize / 1024 / 1024).toFixed(0);
    return { valid: false, message: `文件大小不能超过${maxSizeMB}MB` };
  }

  // 检查文件扩展名
  const fileExtension = file.name ? file.name.split('.').pop().toLowerCase() : '';
  if (!config.allowedTypes.includes(fileExtension)) {
    return { valid: false, message: `只支持 ${config.allowedTypes.join(', ')} 格式` };
  }

  return { valid: true, message: '文件验证通过' };
}

/**
 * 上传文件到后端服务器
 * @param {string} filePath - 文件临时路径
 * @param {string} fileName - 文件名
 * @param {string} fileType - 文件类型（image, video, document）
 * @returns {Promise} 返回上传结果
 */
function uploadFileToServer(filePath, fileName, fileType = 'file') {
  return new Promise((resolve, reject) => {
    console.log('开始上传文件:', {
      filePath,
      fileName,
      fileType
    });

    // 获取文件信息进行验证
    wx.getFileInfo({
      filePath: filePath,
      success: (fileInfo) => {
        const file = {
          name: fileName,
          size: fileInfo.size
        };

        // 验证文件
        const validation = validateFile(file, fileType);
        if (!validation.valid) {
          reject(new Error(validation.message));
          return;
        }

        wx.showLoading({
          title: '正在上传文件...',
          mask: true
        });

        // 使用后端的上传接口
        wx.uploadFile({
          url: apiConfig.buildUrl('/app/api/upload'),
          filePath: filePath,
          name: 'file',
          header: {
            'Content-Type': 'multipart/form-data'
          },
          formData: {
            fileType: fileType
          },
          success: (res) => {
            wx.hideLoading();
            console.log('文件上传响应:', res);

            try {
              const result = JSON.parse(res.data);
              
              if (result.success && result.file_url) {
                console.log('文件上传成功:', result.file_url);
                resolve({
                  success: true,
                  fileUrl: result.file_url,
                  fileName: fileName,
                  fileType: fileType,
                  fileSize: fileInfo.size
                });
              } else {
                console.error('文件上传失败:', result.message);
                reject(new Error(result.message || '文件上传失败'));
              }
            } catch (error) {
              console.error('解析上传响应失败:', error);
              reject(new Error('解析上传响应失败'));
            }
          },
          fail: (error) => {
            wx.hideLoading();
            console.error('文件上传请求失败:', error);
            reject(new Error('文件上传请求失败'));
          }
        });
      },
      fail: (error) => {
        console.error('获取文件信息失败:', error);
        reject(new Error('获取文件信息失败'));
      }
    });
  });
}

/**
 * 批量上传文件
 * @param {Array} files - 文件数组，每个文件包含 {filePath, fileName, fileType}
 * @returns {Promise} 返回所有文件的上传结果
 */
function uploadMultipleFiles(files) {
  return new Promise((resolve, reject) => {
    const results = [];
    let completedCount = 0;
    const totalCount = files.length;

    if (totalCount === 0) {
      resolve(results);
      return;
    }

    wx.showLoading({
      title: `正在上传文件 (0/${totalCount})`,
      mask: true
    });

    files.forEach((file, index) => {
      uploadFileToServer(file.filePath, file.fileName, file.fileType)
        .then(result => {
          results[index] = result;
          completedCount++;
          
          // 更新进度
          wx.showLoading({
            title: `正在上传文件 (${completedCount}/${totalCount})`,
            mask: true
          });

          if (completedCount === totalCount) {
            wx.hideLoading();
            resolve(results);
          }
        })
        .catch(error => {
          console.error(`文件 ${file.fileName} 上传失败:`, error);
          results[index] = {
            success: false,
            error: error.message,
            fileName: file.fileName
          };
          completedCount++;

          if (completedCount === totalCount) {
            wx.hideLoading();
            // 即使有文件上传失败，也返回结果
            resolve(results);
          }
        });
    });
  });
}

/**
 * 上传图片文件
 * @param {string} filePath - 图片临时路径
 * @param {string} fileName - 图片文件名
 * @returns {Promise} 返回上传结果
 */
function uploadImage(filePath, fileName) {
  return uploadFileToServer(filePath, fileName, 'image');
}

/**
 * 上传视频文件
 * @param {string} filePath - 视频临时路径
 * @param {string} fileName - 视频文件名
 * @returns {Promise} 返回上传结果
 */
function uploadVideo(filePath, fileName) {
  return uploadFileToServer(filePath, fileName, 'video');
}

/**
 * 上传文档文件
 * @param {string} filePath - 文档临时路径
 * @param {string} fileName - 文档文件名
 * @returns {Promise} 返回上传结果
 */
function uploadDocument(filePath, fileName) {
  return uploadFileToServer(filePath, fileName, 'document');
}

/**
 * 获取文件访问URL
 * @param {string} fileName - 文件名
 * @returns {string} 文件访问URL
 */
function getFileUrl(fileName) {
  return apiConfig.buildFileUrl(fileName);
}

/**
 * 格式化文件大小
 * @param {number} bytes - 文件大小（字节）
 * @returns {string} 格式化后的文件大小
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = {
  uploadFileToServer,
  uploadMultipleFiles,
  uploadImage,
  uploadVideo,
  uploadDocument,
  getFileUrl,
  validateFile,
  formatFileSize,
  FILE_CONFIG
};
