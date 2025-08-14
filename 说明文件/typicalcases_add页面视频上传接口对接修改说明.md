# typicalcases_add页面视频上传接口对接修改说明

## 修改概述

根据后端接口 `@blue.route('/api/video', methods=['POST'])` 的要求，修改了视频上传功能，简化了参数传递，只传递必要的两个参数：`model_name` 和 `video_url`。

## 后端接口要求

```python
@blue.route('/api/video', methods=['POST'])
def add_video_record():
    # 只需要两个参数：
    # 1. model_name: 典型案例名称
    # 2. video_url: 视频URL
```

## 主要修改内容

### 1. 视频上传参数验证简化

**修改前：**
```javascript
// 检查视频的必要属性
if (!video.tempFilePath) {
  console.error('视频tempFilePath为空:', video);
  // ... 错误处理
}

if (!video.name) {  // 移除了视频名称检查
  console.error('视频名为空:', video);
  // ... 错误处理
}

if (!video.size || video.size <= 0) {
  console.error('视频大小无效:', video);
  // ... 错误处理
}
```

**修改后：**
```javascript
// 检查视频的必要属性 - 兼容不同的视频路径属性
let videoPath = video.tempFilePath || video.path;
if (!videoPath) {
  console.error('视频路径为空，视频对象:', video);
  // ... 错误处理
}

// 检查视频大小
if (!video.size || video.size <= 0) {
  console.error('视频大小无效:', video);
  // ... 错误处理
}
```

### 2. 视频信息保存接口简化

**修改前：**
```javascript
saveVideoInfoToBackend(video, videoUrl) {
  // 传递完整的video对象
  data: {
    model_name: this.data.caseName,
    video_url: videoUrl
  }
}
```

**修改后：**
```javascript
saveVideoInfoToBackend(videoUrl) {
  // 只传递必要的两个参数
  data: {
    model_name: this.data.caseName, // 典型案例名称
    video_url: videoUrl // 视频URL
  }
}
```

### 3. 上传成功后的视频对象处理

**修改前：**
```javascript
const uploadedVideo = {
  id: res.data.data.id,
  name: video.name || `视频_${Date.now()}.mp4`, // 使用原始视频名称
  url: videoUrl,
  size: video.size, // 使用原始视频大小
  sizeFormatted: this.formatFileSize(video.size),
  duration: video.duration, // 使用原始视频时长
  uploadTime: new Date().toISOString()
};
```

**修改后：**
```javascript
const uploadedVideo = {
  id: res.data.data.id,
  name: `视频_${Date.now()}`, // 生成默认视频名称
  url: videoUrl,
  size: 0, // 后端接口不返回视频大小
  sizeFormatted: '未知大小',
  duration: 0, // 后端接口不返回视频时长
  uploadTime: new Date().toISOString()
};
```

### 4. 成功提示信息简化

**修改前：**
```javascript
content: `视频"${uploadedVideo.name}"已成功上传并保存到后端！\n\n视频大小：${uploadedVideo.sizeFormatted}\n视频时长：${uploadedVideo.duration}秒`
```

**修改后：**
```javascript
content: `视频已成功上传并保存到后端！\n\n视频URL：${videoUrl}\n上传时间：${new Date().toLocaleString()}`
```

## 修复的路径兼容性问题

### 问题描述
之前控制台报错显示视频路径为空，原因是代码只检查 `tempFilePath` 属性，但实际文件对象使用的是 `path` 属性。

### 解决方案
使用兼容的方式获取视频路径：
```javascript
let videoPath = video.tempFilePath || video.path;
```

### 支持的环境
- `tempFilePath`：标准微信小程序环境
- `path`：某些特定环境下的替代属性

## 修改后的数据流程

### 视频上传流程：
1. 用户选择视频 → `wx.chooseMedia`
2. **兼容性路径获取** → `video.tempFilePath || video.path`
3. 参数验证 → 检查视频路径和大小
4. 上传视频到文件服务器 → `/app/api/upload`
5. 获取视频URL后，调用后端接口保存视频信息 → `/app/api/video`
6. 后端接口只接收 `model_name` 和 `video_url` 两个参数

## 接口调用示例

### 前端调用：
```javascript
wx.request({
  url: 'http://127.0.0.1:5000/app/api/video',
  method: 'POST',
  header: {
    'Content-Type': 'application/json'
  },
  data: {
    model_name: '典型案例名称', // 用户输入的典型案例名称
    video_url: 'http://example.com/video.mp4' // 上传后的视频URL
  }
});
```

### 后端接收：
```python
# 后端只需要处理两个参数
model_name = request.json.get('model_name')
video_url = request.json.get('video_url')
```

## 测试建议

### 1. 视频选择测试：
- 从相册选择视频
- 从聊天记录选择视频
- 拍摄新视频

### 2. 路径兼容性测试：
- 检查控制台日志中的视频路径信息
- 确认 `tempFilePath` 或 `path` 属性正确获取

### 3. 接口调用测试：
- 检查后端是否正确接收到 `model_name` 和 `video_url` 参数
- 确认视频信息成功保存到数据库

### 4. 错误处理测试：
- 网络异常情况
- 服务器错误情况
- 参数验证失败情况

## 注意事项

1. **参数简化**：后端接口只需要两个参数，不需要视频名称、大小、时长等信息
2. **路径兼容**：使用兼容的方式获取视频路径，避免环境差异导致的问题
3. **默认值处理**：对于后端不返回的信息，使用合理的默认值
4. **错误处理**：保持完整的错误处理和用户提示机制

## 修改总结

通过这次修改，`typicalcases_add` 页面的视频上传功能：

1. **符合后端接口要求**：只传递必要的两个参数
2. **修复路径兼容性问题**：支持不同环境下的视频路径属性
3. **简化参数验证**：移除不必要的视频名称检查
4. **优化用户体验**：提供清晰的成功提示和错误处理

现在视频上传功能应该能够正常与后端接口对接，并且解决了之前控制台报错的问题。


