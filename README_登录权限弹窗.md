# 登录权限弹窗功能说明

## 功能概述

在个人页面中添加了登录权限检查功能，当用户尝试访问需要登录权限的功能时，会显示一个系统标准的登录提示弹窗，提示用户需要登录，并提供"去登录"按钮。点击"去登录"后会自动跳转到登录页面。

## 主要特性

1. **系统标准弹窗**：使用微信原生的 `wx.showModal` 显示登录提示
2. **权限检查机制**：自动检查用户登录状态
3. **智能跳转**：点击"去登录"后自动跳转到登录页面
4. **与典型案例和政策文件页面保持一致**：使用相同的权限检查逻辑

## 使用方法

### 1. 基本权限检查

```javascript
// 在需要权限检查的地方调用
if (!this.checkLoginPermission()) {
  return; // 弹窗会自动显示
}

// 继续执行需要权限的操作
```

### 2. 示例方法

```javascript
// 使用提供的示例方法
this.performPrivilegedAction();
```

### 3. 测试权限检查

```javascript
// 使用测试按钮触发权限检查
this.testPermissionCheck();
```

### 4. 自定义权限检查

```javascript
// 在具体业务逻辑中添加权限检查
onSomeAction() {
  // 检查登录权限
  if (!this.checkLoginPermission()) {
    return;
  }
  
  // 执行具体业务逻辑
  this.doSomething();
}
```

## 弹窗功能

### 弹窗内容
- **标题**：提示
- **内容**：请先进行登录
- **按钮**：取消、去登录

### 弹窗行为
- **取消按钮**：关闭弹窗，不进行任何操作
- **去登录按钮**：
  - 关闭弹窗
  - 使用 `wx.switchTab` 跳转到个人页面
  - 自动切换到登录模式
  - 滚动到页面顶部
  - 显示"请完成登录"提示

## 技术实现

### 核心方法
- `showLoginPermissionModal()` - 显示登录权限弹窗（使用 `wx.showModal`）
- `closeLoginModal()` - 关闭权限弹窗
- `goToLogin()` - 跳转到登录页面
- `checkLoginPermission()` - 检查登录权限
- `testPermissionCheck()` - 测试权限检查功能

### 权限检查逻辑
```javascript
checkLoginPermission() {
  const app = getApp();
  const loginStatus = app.getLoginStatus();
  
  if (!loginStatus.isLoggedIn) {
    this.showLoginPermissionModal();
    return false;
  }
  
  return true;
}
```

### 跳转逻辑
```javascript
// 使用 wx.switchTab 跳转到个人页面（因为personal是tabBar页面）
wx.switchTab({
  url: '/pages/personal/personal',
  success: () => {
    // 跳转成功后的处理
    this.setData({
      currentMode: 'login',
      errorMessage: ''
    });
  }
});
```

## 测试功能

页面底部添加了一个红色的"测试权限检查"按钮，点击后会：
1. 触发权限检查
2. 如果未登录，显示登录提示弹窗
3. 点击"去登录"后跳转到登录页面

## 与典型案例和政策文件页面的对比

| 功能 | 典型案例页面 | 政策文件页面 | 个人页面 |
|------|-------------|-------------|----------|
| 权限检查 | `wx.showModal` | `wx.showModal` | `wx.showModal` |
| 跳转方式 | `wx.switchTab` | `wx.switchTab` | `wx.switchTab` |
| 目标页面 | `/pages/personal/personal` | `/pages/personal/personal` | `/pages/personal/personal` |
| 提示内容 | "请先进行登录" | "请先进行登录" | "请先进行登录" |

## 集成建议

1. **在页面加载时检查**：可以在 `onShow()` 方法中调用权限检查
2. **在具体操作前检查**：在需要权限的功能执行前调用权限检查
3. **自定义触发条件**：可以根据业务需求调整权限检查的触发时机

## 注意事项

1. 使用 `wx.showModal` 而不是自定义弹窗，确保与系统风格一致
2. 使用 `wx.switchTab` 跳转，因为个人页面是 tabBar 页面
3. 权限检查失败时会自动显示弹窗，无需手动处理
4. 与典型案例和政策文件页面使用完全相同的权限检查逻辑

## 扩展功能

可以根据需要扩展以下功能：
- 添加更多的权限级别
- 自定义弹窗内容
- 添加权限申请流程
- 集成第三方登录服务
