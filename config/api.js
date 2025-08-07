// API配置文件
const config = {
  // 开发环境配置
  development: {
    baseUrl: 'http://127.0.0.1:5000',
    mockEnabled: true
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
      list: '/api/typical-cases',
      detail: '/api/typical-cases/:id',
      create: '/api/typical-cases',
      update: '/api/typical-cases/:id',
      delete: '/api/typical-cases/:id',
      uploadFiles: '/api/typical-cases/upload'
    },
    
    // 十五个项目相关接口
    fifteenProjects: {
      list: '/api/fifteen-projects',
      detail: '/api/fifteen-projects/:id',
      create: '/api/fifteen-projects',
      update: '/api/fifteen-projects/:id',
      delete: '/api/fifteen-projects/:id'
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
