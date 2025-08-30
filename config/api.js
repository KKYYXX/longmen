// API配置文件
const config = {
  // 开发环境配置
  development: {
    baseUrl: 'http://175.178.197.202:80',
    timeout: 10000
  },
  
  // 测试环境配置
  test: {
    baseUrl: 'http://test-server.com',
    timeout: 10000
  },
  
  // 生产环境配置
  production: {
    baseUrl: 'https://your-production-server.com',
    timeout: 15000
  }
};

// 当前环境（开发模式）
const currentEnv = 'development';

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
  }
};

// 导出配置
module.exports = apiConfig;
