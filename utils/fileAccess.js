/**
 * 文件访问工具
 * 用于处理通过 /uploads/<filename> 接口访问的文件
 */

const apiConfig = require('../config/api.js');

/**
 * 构建文件访问URL
 * @param {string} filename - 文件名
 * @returns {string} 完整的文件访问URL
 */
function buildFileUrl(filename) {
  if (!filename) return '';
  
  // 如果已经是完整URL，直接返回
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  // 使用apiConfig的统一方法构建文件访问URL
  return apiConfig.buildFileUrl(filename);
}

/**
 * 从完整URL中提取文件名
 * @param {string} url - 完整的文件URL
 * @returns {string} 文件名
 */
function extractFilenameFromUrl(url) {
  if (!url) return '';
  
  // 如果URL包含uploads路径，提取文件名
  if (url.includes('/uploads/')) {
    return url.split('/uploads/').pop();
  }
  
  // 否则返回原URL
  return url;
}

/**
 * 检查文件是否为服务器文件
 * @param {string} filePath - 文件路径或URL
 * @returns {boolean} 是否为服务器文件
 */
function isServerFile(filePath) {
  if (!filePath) return false;
  return filePath.startsWith('http://') || filePath.startsWith('https://');
}

/**
 * 获取文件的最佳访问路径
 * @param {Object} file - 文件对象，包含path和serverUrl属性
 * @returns {string} 最佳的文件访问路径
 */
function getBestFileUrl(file) {
  if (!file) return '';
  
  // 优先使用服务器URL
  if (file.serverUrl) {
    return file.serverUrl;
  }
  
  // 其次使用path
  if (file.path) {
    return file.path;
  }
  
  return '';
}

/**
 * 预览图片文件
 * @param {string} imageUrl - 图片URL
 * @param {Array} allImageUrls - 所有图片URL数组（用于预览时的轮播）
 * @param {string} currentUrl - 当前图片URL
 */
function previewImage(imageUrl, allImageUrls = [], currentUrl = null) {
  const urls = allImageUrls.length > 0 ? allImageUrls : [imageUrl];
  const current = currentUrl || imageUrl;
  
  wx.previewImage({
    urls: urls,
    current: current
  });
}

/**
 * 预览视频文件
 * @param {string} videoUrl - 视频URL
 * @param {string} title - 视频标题
 */
function previewVideo(videoUrl, title = '视频预览') {
  wx.navigateTo({
    url: `/pages/video-player/video-player?videoUrl=${encodeURIComponent(videoUrl)}&title=${encodeURIComponent(title)}`
  });
}

/**
 * 预览文档文件
 * @param {string} documentUrl - 文档URL
 * @param {string} title - 文档标题
 */
function previewDocument(documentUrl, title = '文档预览') {
  // 如果是服务器URL，需要先下载到本地
  if (isServerFile(documentUrl)) {
    wx.showLoading({
      title: '正在下载文件...'
    });
    
    wx.downloadFile({
      url: documentUrl,
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          wx.openDocument({
            filePath: res.tempFilePath,
            success: () => {
              console.log('打开文档成功');
            },
            fail: (err) => {
              console.error('打开文档失败:', err);
              wx.showToast({
                title: '无法预览此文件',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: '文件下载失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('下载文件失败:', err);
        wx.showToast({
          title: '文件下载失败',
          icon: 'none'
        });
      }
    });
  } else {
    // 本地文件直接打开
    wx.openDocument({
      filePath: documentUrl,
      success: () => {
        console.log('打开文档成功');
      },
      fail: (err) => {
        console.error('打开文档失败:', err);
        wx.showToast({
          title: '无法预览此文件',
          icon: 'none'
        });
      }
    });
  }
}

/**
 * 获取文件类型
 * @param {string} filename - 文件名
 * @returns {string} 文件类型（image, video, document）
 */
function getFileType(filename) {
  if (!filename) return 'unknown';
  
  const extension = filename.split('.').pop().toLowerCase();
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
  
  if (imageExtensions.includes(extension)) {
    return 'image';
  } else if (videoExtensions.includes(extension)) {
    return 'video';
  } else if (documentExtensions.includes(extension)) {
    return 'document';
  }
  
  return 'unknown';
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
  buildFileUrl,
  extractFilenameFromUrl,
  isServerFile,
  getBestFileUrl,
  previewImage,
  previewVideo,
  previewDocument,
  getFileType,
  formatFileSize
};
