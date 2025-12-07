// API配置文件
const config = {
  // 开发环境配置
  development: {
    //连接服务器
    //baseUrl: 'http://159.75.178.46:80',

    //本地连接
    baseUrl: 'http://127.0.0.1:5000',
    
    timeout: 10000
  },
  
  // 测试环境配置
  test: {
    baseUrl: 'http://test-server.com',
    timeout: 10000
  },
  
  // 生产环境配置
  production: {
    baseUrl: 'https://zhihuilongmenzhen.cn',
    timeout: 15000
  }
};

// 当前环境（生产模式）
const currentEnv = 'production';
// 当前环境（开发模式）
//const currentEnv = 'development';
// API接口配置
const apiConfig = {
  // 基础配置
  baseUrl: config[currentEnv].baseUrl,
  timeout: config[currentEnv].timeout,
  
  // 构建完整的API URL - 简单拼接域名和路径
  buildUrl: function(path) {
    if (!path) return this.baseUrl;
    
    // 如果path已经是完整URL，直接返回
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // 确保path以/开头
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return this.baseUrl + cleanPath;
  },

  // 构建标准API接口URL（使用/api前缀）
  buildStandardUrl: function(path) {
    if (!path) return this.baseUrl + '/api';
    
    // 如果path已经是完整URL，直接返回
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // 确保path以/开头
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return this.baseUrl + '/api' + cleanPath;
  },

  // 构建应用接口URL（使用/app前缀）
  buildAppUrl: function(path) {
    if (!path) return this.baseUrl + '/app';
    
    // 如果path已经是完整URL，直接返回
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // 确保path以/开头
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return this.baseUrl + '/app' + cleanPath;
  },

  // 构建用户接口URL（使用/user前缀）
  buildUserUrl: function(path) {
    if (!path) return this.baseUrl + '/user';
    
    // 如果path已经是完整URL，直接返回
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // 确保path以/开头
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return this.baseUrl + '/user' + cleanPath;
  },

  // 构建文件访问URL
  buildFileUrl: function(filename) {
    if (!filename) return this.baseUrl;
    
    // 如果filename已经是完整URL，直接返回
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    
    // 确保filename不以/开头
    const cleanFilename = filename.startsWith('/') ? filename.substring(1) : filename;
    return this.baseUrl + '/uploads/' + cleanFilename;
  },
  
  // 获取当前环境
  getEnvironment: function() {
    return currentEnv;
  },
  
  // 获取当前配置
  getCurrentConfig: function() {
    return config[currentEnv];
  },
  
  // 切换环境
  switchEnvironment: function(env) {
    if (config[env]) {
      currentEnv = env;
      this.baseUrl = config[env].baseUrl;
      this.timeout = config[env].timeout;
      console.log(`已切换到${env}环境，baseUrl: ${this.baseUrl}`);
    } else {
      console.error(`环境${env}不存在`);
    }
  },
  
  // 获取请求超时时间
  getTimeout: function() {
    return this.timeout;
  },
  
  // 检查是否启用模拟数据
  isMockEnabled: function() {
    // 开发环境默认启用模拟数据
    return this.getEnvironment() === 'development';
  }
};

// 导出配置
module.exports = apiConfig;
