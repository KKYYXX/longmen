from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime

app = Flask(__name__)

# 配置跨域
CORS(app, resources={r"/*": {"origins": "*"}})

# 数据库配置 - 请根据您的实际数据库配置修改
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:password@localhost/longmen_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'

db = SQLAlchemy(app)

# 用户模型 - 对应数据库中的users表
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, comment='用户姓名')
    phone = db.Column(db.String(20), unique=True, nullable=False, comment='手机号码')
    password = db.Column(db.String(255), nullable=False, comment='密码')
    role = db.Column(db.String(20), default='user', comment='用户角色')
    created_at = db.Column(db.DateTime, default=datetime.utcnow, comment='创建时间')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment='更新时间')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# 用户登录接口 - 连接前端personal页面的姓名输入框
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': '请求数据不能为空'}), 400
        
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        password = data.get('password', '').strip()
        
        # 验证必填字段
        if not name:
            return jsonify({'success': False, 'message': '请输入姓名'}), 400
        
        if not phone:
            return jsonify({'success': False, 'message': '请输入手机号码'}), 400
        
        if not password:
            return jsonify({'success': False, 'message': '请输入密码'}), 400
        
        # 验证手机号格式
        import re
        phone_regex = re.compile(r'^1[3-9]\d{9}$')
        if not phone_regex.match(phone):
            return jsonify({'success': False, 'message': '请输入正确的手机号码'}), 400
        
        # 验证密码格式
        if len(password) < 8:
            return jsonify({'success': False, 'message': '密码长度不能少于8位'}), 400
        
        if not re.search(r'[A-Z]', password) or not re.search(r'[a-z]', password) or not re.search(r'\d', password):
            return jsonify({'success': False, 'message': '密码必须包含大小写字母和数字'}), 400
        
        # 查找用户 - 根据手机号查找
        user = User.query.filter_by(phone=phone).first()
        
        if not user:
            return jsonify({'success': False, 'message': '用户不存在'}), 404
        
        # 验证密码
        if not check_password_hash(user.password, password):
            return jsonify({'success': False, 'message': '密码错误'}), 401
        
        # 更新用户姓名（如果不同）- 这里连接了前端的姓名输入框
        if user.name != name:
            user.name = name
            db.session.commit()
        
        # 返回用户信息
        user_data = user.to_dict()
        return jsonify({
            'success': True,
            'message': '登录成功',
            'data': user_data
        }), 200
        
    except Exception as e:
        print(f"登录错误: {str(e)}")
        return jsonify({'success': False, 'message': '服务器内部错误'}), 500

# 用户注册接口
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': '请求数据不能为空'}), 400
        
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        password = data.get('password', '').strip()
        
        # 验证必填字段
        if not name:
            return jsonify({'success': False, 'message': '请输入姓名'}), 400
        
        if not phone:
            return jsonify({'success': False, 'message': '请输入手机号码'}), 400
        
        if not password:
            return jsonify({'success': False, 'message': '请输入密码'}), 400
        
        # 验证手机号格式
        import re
        phone_regex = re.compile(r'^1[3-9]\d{9}$')
        if not phone_regex.match(phone):
            return jsonify({'success': False, 'message': '请输入正确的手机号码'}), 400
        
        # 验证密码格式
        if len(password) < 8:
            return jsonify({'success': False, 'message': '密码长度不能少于8位'}), 400
        
        if not re.search(r'[A-Z]', password) or not re.search(r'[a-z]', password) or not re.search(r'\d', password):
            return jsonify({'success': False, 'message': '密码必须包含大小写字母和数字'}), 400
        
        # 检查用户是否已存在
        existing_user = User.query.filter_by(phone=phone).first()
        if existing_user:
            return jsonify({'success': False, 'message': '该手机号码已注册'}), 409
        
        # 创建新用户
        hashed_password = generate_password_hash(password)
        new_user = User(
            name=name,
            phone=phone,
            password=hashed_password,
            role='user'  # 默认角色
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # 返回用户信息
        user_data = new_user.to_dict()
        return jsonify({
            'success': True,
            'message': '注册成功',
            'data': user_data
        }), 201
        
    except Exception as e:
        print(f"注册错误: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': '服务器内部错误'}), 500

# 获取用户信息接口
@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': '用户不存在'}), 404
        
        user_data = user.to_dict()
        return jsonify({
            'success': True,
            'data': user_data
        }), 200
        
    except Exception as e:
        print(f"获取用户信息错误: {str(e)}")
        return jsonify({'success': False, 'message': '服务器内部错误'}), 500

# 更新用户信息接口
@app.route('/api/user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'message': '用户不存在'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': '请求数据不能为空'}), 400
        
        # 更新姓名
        if 'name' in data and data['name'].strip():
            user.name = data['name'].strip()
        
        # 更新手机号
        if 'phone' in data and data['phone'].strip():
            phone = data['phone'].strip()
            import re
            phone_regex = re.compile(r'^1[3-9]\d{9}$')
            if not phone_regex.match(phone):
                return jsonify({'success': False, 'message': '请输入正确的手机号码'}), 400
            
            # 检查手机号是否已被其他用户使用
            existing_user = User.query.filter_by(phone=phone).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({'success': False, 'message': '该手机号码已被其他用户使用'}), 409
            
            user.phone = phone
        
        db.session.commit()
        
        user_data = user.to_dict()
        return jsonify({
            'success': True,
            'message': '更新成功',
            'data': user_data
        }), 200
        
    except Exception as e:
        print(f"更新用户信息错误: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': '服务器内部错误'}), 500

# 健康检查接口
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'success': True,
        'message': '服务正常运行',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

if __name__ == '__main__':
    # 创建数据库表
    with app.app_context():
        db.create_all()
    
    print("启动龙门项目后端服务...")
    print("服务地址: http://localhost:5000")
    print("API文档: http://localhost:5000/api/health")
    print("按 Ctrl+C 停止服务")
    
    app.run(debug=True, host='0.0.0.0', port=5000) 