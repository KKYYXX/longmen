// API配置文件
const config = {
  // 开发环境配置
  development: {
    baseUrl: 'http://127.0.0.1:5000',
    mockEnabled: false  // 关闭模拟模式，使用真实后端接口
  },
  
  // 生产环境配置
  production: {
    baseUrl: 'https://your-production-server.com',
    mockEnabled: false
  }
};

// 当前环境（开发模式）
const currentEnv = 'development';

// API接口配置
const apiConfig = {
  // 基础配置
  baseUrl: config[currentEnv].baseUrl,
  mockEnabled: config[currentEnv].mockEnabled,
  
  // API接口列表
  api: {
    // 典型案例相关接口
    typicalCases: {
      list: '/api/models',
      detail: '/api/models/:id',
      create: '/api/models',
      update: '/api/models/:id',
      delete: '/api/models/:id',
      uploadFiles: '/api/upload'
    },
    
    // 视频相关接口
    video: {
      query: '/api/video',
      add: '/api/video',
      delete: '/api/video'
    },
    
    // 新闻相关接口
    news: {
      query: '/api/news',
      add: '/api/news',
      delete: '/api/news'
    },
    
    // 十五个项目相关接口
    fifteenProjects: {
      list: '/api/15projects',
      detail: '/api/15projects/:id',
      create: '/api/15projects',
      update: '/api/15projects/:id',
      delete: '/api/15projects/:id'
    },
    
    // 用户相关接口
    user: {
      login: '/api/user/login',
      profile: '/api/user/profile',
      permissions: '/api/user/permissions'
    },
    
    // 文件上传接口
    upload: '/api/upload'
  },
  
  // 构建完整的API URL
  buildApiUrl: function(endpoint) {
    return this.baseUrl + endpoint;
  },
  
  // 检查是否启用模拟模式
  isMockEnabled: function() {
    return this.mockEnabled;
  },
  
  // 获取当前环境
  getEnvironment: function() {
    return currentEnv;
  }
};

// 导出配置
module.exports = apiConfig;
