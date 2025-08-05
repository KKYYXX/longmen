// API配置文件
const config = {
  // 开发环境配置
  development: {
    baseUrl: 'http://127.0.0.1:5000',
    enableMock: true, // 启用模拟数据
    timeout: 10000
  },
  
  // 生产环境配置
  production: {
    baseUrl: 'https://your-server-domain.com',
    enableMock: false,
    timeout: 30000
  }
};

// 获取当前环境
function getCurrentEnv() {
  try {
    const accountInfo = wx.getAccountInfoSync();
    return accountInfo.miniProgram.envVersion === 'develop' ? 'development' : 'production';
  } catch (e) {
    console.error('获取环境信息失败:', e);
    return 'development'; // 默认开发环境
  }
}

// 获取当前配置
function getConfig() {
  const env = getCurrentEnv();
  return config[env];
}

// API接口地址
const api = {
  // 典型案例相关
  typicalCases: {
    uploadFiles: '/api/typical-cases/upload-files',
    uploadVideos: '/api/typical-cases/upload-videos',
    addNewsLink: '/api/typical-cases/add-news-link',
    deleteFile: '/api/typical-cases/delete-file',
    deleteVideo: '/api/typical-cases/delete-video',
    deleteNewsLink: '/api/typical-cases/delete-news-link',
    submitContent: '/api/typical-cases/submit-content'
  },
  
  // 十五项项目相关
  fifteenProjects: {
    uploadFiles: '/api/fifteen-projects/upload-files',
    uploadVideos: '/api/fifteen-projects/upload-videos',
    addNewsLink: '/api/fifteen-projects/add-news-link',
    deleteFile: '/api/fifteen-projects/delete-file',
    deleteVideo: '/api/fifteen-projects/delete-video',
    deleteNewsLink: '/api/fifteen-projects/delete-news-link',
    submitContent: '/api/fifteen-projects/submit-content'
  },
  
  // 用户权限相关
  user: {
    permissions: '/api/user/permissions'
  }
};

// 构建完整的API URL
function buildApiUrl(path) {
  const currentConfig = getConfig();
  return `${currentConfig.baseUrl}${path}`;
}

// 检查是否启用模拟数据
function isMockEnabled() {
  return getConfig().enableMock;
}

module.exports = {
  config: getConfig(),
  api,
  buildApiUrl,
  isMockEnabled,
  getCurrentEnv
}; 