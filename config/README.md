# API配置系统使用说明

## 概述

这个API配置系统提供了统一的接口路径管理，让你可以轻松地管理不同环境的域名配置，而无需逐个修改每个接口的URL。

## 主要特性

- 🚀 **统一域名管理** - 只需修改一处配置，所有接口自动更新
- 🔧 **多环境支持** - 支持开发、测试、生产环境配置
- 📍 **灵活的前缀管理** - 支持不同的API路径前缀（/api, /app, /user等）
- 🎯 **参数化URL** - 支持动态参数替换（如 :id）
- ⚡ **快速切换环境** - 运行时动态切换环境配置

## 配置文件结构

### 环境配置
```javascript
const config = {
  development: {
    baseUrl: 'http://127.0.0.1:80',
    mockEnabled: false,
    timeout: 10000
  },
  test: {
    baseUrl: 'http://test-server.com',
    mockEnabled: false,
    timeout: 10000
  },
  production: {
    baseUrl: 'https://your-production-server.com',
    mockEnabled: false,
    timeout: 15000
  }
};
```

### API前缀配置
```javascript
apiPrefix: {
  app: '/app',           // 应用主接口前缀
  api: '/api',           // 标准API前缀
  user: '/user',         // 用户相关接口前缀
  upload: '/upload'      // 文件上传接口前缀
}
```

### 接口端点配置
```javascript
endpoints: {
  typicalCases: {
    list: '/models',
    detail: '/models/:id',
    create: '/models',
    update: '/models/:id',
    delete: '/models/:id'
  },
  // ... 其他模块
}
```

## 使用方法

### 1. 基础用法

#### 构建标准API接口URL
```javascript
const apiConfig = require('../../config/api.js');

// 使用标准API前缀 (/api)
const url = apiConfig.buildStandardUrl('/models');
// 结果: http://127.0.0.1:80/api/models
```

#### 构建应用接口URL
```javascript
// 使用应用接口前缀 (/app)
const url = apiConfig.buildAppUrl('/models');
// 结果: http://127.0.0.1:80/app/models
```

#### 构建用户接口URL
```javascript
// 使用用户接口前缀 (/user)
const url = apiConfig.buildUserUrl('/login');
// 结果: http://127.0.0.1:80/user/login
```

### 2. 高级用法

#### 使用预定义的接口配置
```javascript
// 获取典型案例列表接口
const url = apiConfig.getFullUrl('typicalCases', 'list');
// 结果: http://127.0.0.1:80/api/models
```

#### 带参数的URL构建
```javascript
// 替换URL中的参数占位符
const url = apiConfig.buildUrlWithParams('/models/:id', { id: 123 });
// 结果: http://127.0.0.1:80/api/models/123

// 使用预定义接口配置并带参数
const url = apiConfig.buildUrlWithParams(
  apiConfig.endpoints.fifteenProjects.detail, 
  { id: 456 }
);
// 结果: http://127.0.0.1:80/api/15projects/456
```

### 3. 实际使用场景

#### 在wx.request中使用
```javascript
function fetchTypicalCases() {
  const url = apiConfig.buildAppUrl('/models');
  
  wx.request({
    url: url,
    method: 'GET',
    timeout: apiConfig.getTimeout(),
    success: (res) => {
      console.log('获取成功:', res.data);
    },
    fail: (error) => {
      console.error('获取失败:', error);
    }
  });
}
```

#### 用户权限验证
```javascript
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
    }
  });
}
```

### 4. 环境管理

#### 切换环境
```javascript
// 切换到生产环境
apiConfig.switchEnvironment('production');

// 切换回开发环境
apiConfig.switchEnvironment('development');

// 查看当前环境
console.log(apiConfig.getEnvironment());
```

#### 获取环境配置
```javascript
// 获取当前环境的完整配置
const currentConfig = apiConfig.getCurrentConfig();
console.log('当前baseUrl:', currentConfig.baseUrl);
console.log('当前超时时间:', currentConfig.timeout);
```

## 迁移指南

### 从硬编码URL迁移

#### 之前的方式
```javascript
// 旧方式 - 硬编码URL
wx.request({
  url: 'http://127.0.0.1:80/app/api/models',
  // ...
});
```

#### 新的方式
```javascript
// 新方式 - 使用配置系统
const apiConfig = require('../../config/api.js');
const url = apiConfig.buildAppUrl('/models');

wx.request({
  url: url,
  // ...
});
```

### 批量更新示例

#### 更新典型案例相关接口
```javascript
// 之前需要逐个修改
const listUrl = 'http://127.0.0.1:80/app/api/models';
const detailUrl = 'http://127.0.0.1:80/app/api/models/123';
const createUrl = 'http://127.0.0.1:80/app/api/models';

// 现在只需要修改config/api.js中的baseUrl
// 所有接口自动更新到新的域名
```

## 最佳实践

### 1. 统一导入
在每个页面文件顶部统一导入API配置：
```javascript
const apiConfig = require('../../config/api.js');
```

### 2. 使用预定义端点
尽量使用预定义的端点配置，而不是手动拼接路径：
```javascript
// 推荐
const url = apiConfig.getFullUrl('typicalCases', 'list');

// 不推荐
const url = apiConfig.buildAppUrl('/models');
```

### 3. 参数化URL
对于需要动态参数的接口，使用参数化URL：
```javascript
// 推荐
const url = apiConfig.buildUrlWithParams(
  apiConfig.endpoints.typicalCases.detail, 
  { id: projectId }
);

// 不推荐
const url = apiConfig.buildAppUrl(`/models/${projectId}`);
```

### 4. 环境切换
在应用启动时根据环境自动切换配置：
```javascript
// 在app.js中
const apiConfig = require('./config/api.js');

// 根据环境变量切换
if (process.env.NODE_ENV === 'production') {
  apiConfig.switchEnvironment('production');
}
```

## 注意事项

1. **路径前缀**：确保使用正确的路径前缀（app、api、user等）
2. **参数占位符**：参数占位符使用 `:参数名` 的格式
3. **环境切换**：环境切换会立即生效，影响后续的所有API调用
4. **错误处理**：建议在使用前检查URL构建是否成功

## 常见问题

### Q: 如何添加新的接口？
A: 在 `endpoints` 对象中添加新的模块和接口定义即可。

### Q: 如何修改域名？
A: 只需修改对应环境的 `baseUrl` 配置，所有接口自动更新。

### Q: 如何添加新的环境？
A: 在 `config` 对象中添加新的环境配置即可。

### Q: 如何自定义新的路径前缀？
A: 在 `apiPrefix` 对象中添加新的前缀配置即可。
