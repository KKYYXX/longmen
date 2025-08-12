# typicalcases_add页面前后端接口对接修改说明

## 修改概述

本次修改将 `typicalcases_add` 页面从开发环境的模拟模式改为前后端联调模式，使其能够与后端Flask接口进行实际对接。

## 主要修改内容

### 1. 注释掉开发环境跳过测试功能

- 注释掉了 `checkUserPermission()` 方法中的开发环境权限检查跳过逻辑
- 注释掉了文件选择、上传、新闻链接添加、视频上传等功能的模拟模式
- 注释掉了提交功能的本地存储模拟模式

### 2. 文件上传功能对接后端接口

#### 修改前：
- 使用模拟的文件选择和上传
- 数据保存在前端本地

#### 修改后：
- 使用真实的文件选择API (`wx.chooseMessageFile`)
- 先调用后端的文件上传接口 `/api/upload` 获取文件URL
- 然后调用后端的 `/api/models` 接口保存文件信息

#### 后端接口调用：
```javascript
// 保存文件信息到后端
saveFileInfoToBackend(file, fileType, fileUrl) {
  wx.request({
    url: 'http://127.0.0.1:5000/api/models',
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      model_name: this.data.caseName, // 典型案例名称
      file_name: file.name, // 文件名
      file_size: file.size, // 文件大小
      file_url: fileUrl, // 文件URL
      file_type: fileType // 文件类型
    },
    // ... 处理响应
  });
}
```

### 3. 新闻链接添加功能对接后端接口

#### 修改前：
- 使用模拟的新闻链接添加
- 数据保存在前端本地

#### 修改后：
- 直接调用后端的 `/api/news` 接口保存新闻链接信息

#### 后端接口调用：
```javascript
// 调用后端接口保存新闻链接
wx.request({
  url: 'http://127.0.0.1:5000/api/news',
  method: 'POST',
  header: {
    'Content-Type': 'application/json'
  },
  data: {
    model_name: this.data.caseName, // 典型案例名称
    news_title: title, // 新闻标题
    news_url: url // 新闻链接
  },
  // ... 处理响应
});
```

### 4. 视频上传功能对接后端接口

#### 修改前：
- 使用模拟的视频选择和上传
- 数据保存在前端本地

#### 修改后：
- 使用真实的视频选择API (`wx.chooseMedia`)
- 先调用后端的文件上传接口 `/api/upload` 获取视频URL
- 然后调用后端的 `/api/video` 接口保存视频信息

#### 后端接口调用：
```javascript
// 保存视频信息到后端
saveVideoInfoToBackend(video, videoUrl) {
  wx.request({
    url: 'http://127.0.0.1:5000/api/video',
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      model_name: this.data.caseName, // 典型案例名称
      video_url: videoUrl // 视频URL
    },
    // ... 处理响应
  });
}
```

### 5. 删除功能对接后端接口

修改了删除功能的接口调用，使其与后端接口对应：
- 文件删除：`/api/models/{id}`
- 新闻链接删除：`/api/news/{id}`
- 视频删除：`/api/video/{id}`

### 6. 提交功能修改

#### 修改前：
- 开发环境下保存到本地存储
- 生产环境下调用不存在的接口

#### 修改后：
- 前后端联调阶段显示提交成功提示
- 所有数据已通过各个接口保存到后端数据库

## 数据流程

### 文件上传流程：
1. 用户选择文件 → `wx.chooseMessageFile`
2. 上传文件到文件服务器 → `/api/upload`
3. 获取文件URL后，保存文件信息 → `/api/models`

### 新闻链接添加流程：
1. 用户输入新闻标题和链接
2. 直接保存到后端 → `/api/news`

### 视频上传流程：
1. 用户选择视频 → `wx.chooseMedia`
2. 上传视频到文件服务器 → `/api/upload`
3. 获取视频URL后，保存视频信息 → `/api/video`

## 注意事项

1. **后端服务地址**：所有接口都指向 `http://127.0.0.1:5000`
2. **文件上传**：先上传文件获取URL，再保存文件信息
3. **错误处理**：保留了原有的错误提示和用户反馈
4. **权限检查**：前后端联调阶段允许继续操作，便于测试

## 测试建议

1. 确保后端Flask服务正在运行在 `127.0.0.1:5000`
2. 测试文件上传功能（PDF、DOC、DOCX）
3. 测试新闻链接添加功能
4. 测试视频上传功能
5. 验证数据是否正确保存到后端数据库

## 后续优化建议

1. 添加真实的用户权限验证
2. 完善错误处理和重试机制
3. 添加文件上传进度显示
4. 优化用户界面和交互体验

