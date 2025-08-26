// API使用示例文件
// 这个文件展示了如何使用config/api.js中的各种方法

const apiConfig = require('./api.js');

// ===== 基础用法示例 =====

// 1. 构建标准API接口URL（使用/api前缀）
const standardUrl = apiConfig.buildStandardUrl('/models');
console.log('标准API URL:', standardUrl);
// 输出: http://127.0.0.1:80/api/models

// 2. 构建应用接口URL（使用/app前缀）
const appUrl = apiConfig.buildAppUrl('/models');
console.log('应用接口 URL:', appUrl);
// 输出: http://127.0.0.1:80/app/models

// 3. 构建用户接口URL（使用/user前缀）
const userUrl = apiConfig.buildUserUrl('/login');
console.log('用户接口 URL:', userUrl);
// 输出: http://127.0.0.1:80/user/login

// ===== 高级用法示例 =====

// 4. 使用预定义的接口配置
const typicalCasesListUrl = apiConfig.getFullUrl('typicalCases', 'list');
console.log('典型案例列表接口:', typicalCasesListUrl);
// 输出: http://127.0.0.1:80/api/models

// 5. 带参数的URL构建
const detailUrl = apiConfig.buildUrlWithParams('/models/:id', { id: 123 });
console.log('带参数的详情接口:', detailUrl);
// 输出: http://127.0.0.1:80/api/models/123

// 6. 使用预定义接口配置并带参数
const projectDetailUrl = apiConfig.buildUrlWithParams(
  apiConfig.endpoints.fifteenProjects.detail, 
  { id: 456 }, 
  'api'
);
console.log('项目详情接口:', projectDetailUrl);
// 输出: http://127.0.0.1:80/api/15projects/456

// ===== 实际使用场景示例 =====

// 7. 在wx.request中使用
function fetchTypicalCases() {
  const url = apiConfig.buildAppUrl('/models');
  
  wx.request({
    url: url,
    method: 'GET',
    timeout: apiConfig.getTimeout(),
    success: (res) => {
      console.log('获取典型案例成功:', res.data);
    },
    fail: (error) => {
      console.error('获取典型案例失败:', error);
    }
  });
}

// 8. 获取项目进度信息
function fetchProjectProgress(projectId) {
  const url = apiConfig.buildUrlWithParams(
    apiConfig.endpoints.progress.detail, 
    { id: projectId }
  );
  
  wx.request({
    url: url,
    method: 'GET',
    timeout: apiConfig.getTimeout(),
    success: (res) => {
      console.log('获取项目进度成功:', res.data);
    },
    fail: (error) => {
      console.error('获取项目进度失败:', error);
    }
  });
}

// 9. 用户权限验证
function checkUserPermission(permissionType) {
  let endpoint;
  if (permissionType === 'query') {
    endpoint = apiConfig.endpoints.user.query15;
  } else if (permissionType === 'alter') {
    endpoint = apiConfig.endpoints.user.alter15;
  }
  
  const url = apiConfig.buildAppUrl(endpoint);
  
  wx.request({
    url: url,
    method: 'GET',
    timeout: apiConfig.getTimeout(),
    success: (res) => {
      console.log('权限验证成功:', res.data);
    },
    fail: (error) => {
      console.error('权限验证失败:', error);
    }
  });
}

// ===== 环境切换示例 =====

// 10. 切换到生产环境
function switchToProduction() {
  apiConfig.switchEnvironment('production');
  console.log('当前环境:', apiConfig.getEnvironment());
  console.log('当前baseUrl:', apiConfig.baseUrl);
}

// 11. 切换回开发环境
function switchToDevelopment() {
  apiConfig.switchEnvironment('development');
  console.log('当前环境:', apiConfig.getEnvironment());
  console.log('当前baseUrl:', apiConfig.baseUrl);
}

// ===== 批量更新接口示例 =====

// 12. 批量构建多个接口URL
function buildBatchUrls() {
  const urls = {
    typicalCases: apiConfig.buildAppUrl(apiConfig.endpoints.typicalCases.list),
    video: apiConfig.buildAppUrl(apiConfig.endpoints.video.query),
    news: apiConfig.buildAppUrl(apiConfig.endpoints.news.query),
    projects: apiConfig.buildStandardUrl(apiConfig.endpoints.fifteenProjects.list)
  };
  
  console.log('批量构建的URLs:', urls);
  return urls;
}

// ===== 错误处理示例 =====

// 13. 安全的URL构建
function safeBuildUrl(endpoint, prefix = 'api') {
  try {
    if (!endpoint) {
      throw new Error('endpoint不能为空');
    }
    
    const url = apiConfig.buildApiUrl(endpoint, prefix);
    console.log('构建的URL:', url);
    return url;
  } catch (error) {
    console.error('URL构建失败:', error.message);
    return null;
  }
}

// 导出示例函数供其他文件使用
module.exports = {
  fetchTypicalCases,
  fetchProjectProgress,
  checkUserPermission,
  switchToProduction,
  switchToDevelopment,
  buildBatchUrls,
  safeBuildUrl
};
