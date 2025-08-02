# 龙门项目后端API

这是龙门项目的Flask后端服务，实现了数据库中的users表与前端personal页面姓名输入框的连接。

## 项目结构

```
backend/
├── app.py                 # Flask主应用
├── requirements.txt       # Python依赖
├── init_db.py            # 数据库初始化脚本
└── README.md             # 说明文档
```

## 功能特性

- ✅ 前端personal页面的姓名输入框与数据库users表的name字段连接
- ✅ 用户登录验证
- ✅ 密码加密存储
- ✅ 跨域支持
- ✅ 完整的错误处理

## 安装和运行

### 1. 环境要求

- Python 3.7+
- MySQL 5.7+

### 2. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 3. 数据库配置

1. 创建MySQL数据库：
```sql
CREATE DATABASE longmen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 修改数据库连接配置（在app.py中）：
```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://用户名:密码@localhost/longmen_db'
```

### 4. 初始化数据库

```bash
python init_db.py
```

这将创建数据库表并插入测试用户数据。

### 5. 启动服务

```bash
python app.py
```

服务将在 http://localhost:5000 启动。

## API接口

### 用户登录
- **URL**: `POST /api/login`
- **参数**: 
  ```json
  {
    "name": "用户姓名",
    "phone": "手机号码", 
    "password": "密码"
  }
  ```
- **功能**: 验证用户信息，更新数据库中的姓名字段

### 用户注册
- **URL**: `POST /api/register`
- **参数**: 同登录接口
- **功能**: 创建新用户

### 获取用户信息
- **URL**: `GET /api/user/<user_id>`
- **功能**: 获取指定用户信息

### 更新用户信息
- **URL**: `PUT /api/user/<user_id>`
- **功能**: 更新用户信息

### 健康检查
- **URL**: `GET /api/health`
- **功能**: 检查服务状态

## 测试用户

初始化脚本会创建以下测试用户：

1. **管理员**
   - 手机号: 13800000000
   - 密码: Admin123
   - 角色: admin

2. **编辑员**
   - 手机号: 13800000001
   - 密码: Editor123
   - 角色: editor

3. **普通用户**
   - 手机号: 13800000002
   - 密码: User123
   - 角色: user

## 连接说明

### 前端到后端
- 前端personal页面的姓名输入框通过`onNameInput`函数收集用户输入的姓名
- 登录时通过`wx.request`发送到后端`/api/login`接口
- 后端验证用户信息并更新数据库中的name字段

### 后端到数据库
- Flask应用使用SQLAlchemy连接MySQL数据库
- User模型对应数据库中的users表
- 登录时根据手机号查找用户，验证密码后更新姓名

## 数据库结构

### users表
- `id`: 主键，自增
- `name`: 用户姓名，VARCHAR(100) - **与前端姓名输入框连接**
- `phone`: 手机号码，VARCHAR(20)，唯一
- `password`: 密码哈希，VARCHAR(255)
- `role`: 用户角色，VARCHAR(20)
- `created_at`: 创建时间，DATETIME
- `updated_at`: 更新时间，DATETIME

## 注意事项

1. 确保MySQL服务正在运行
2. 检查数据库连接配置是否正确
3. 前端需要配置允许HTTP请求（开发环境）
4. 生产环境建议使用HTTPS

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MySQL服务是否启动
   - 验证数据库连接字符串
   - 确认数据库用户权限

2. **前端请求失败**
   - 检查后端服务是否启动
   - 确认请求地址正确
   - 检查网络连接

3. **跨域问题**
   - 确认CORS配置正确
   - 检查请求头设置 