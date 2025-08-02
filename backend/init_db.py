#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
数据库初始化脚本
用于创建数据库表和插入初始数据
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app, db, User
from werkzeug.security import generate_password_hash

def init_database():
    """初始化数据库"""
    with app.app_context():
        # 创建所有表
        db.create_all()
        print("数据库表创建成功")
        
        # 检查是否已有用户数据
        existing_users = User.query.count()
        if existing_users == 0:
            # 插入测试用户数据
            test_users = [
                {
                    'name': '管理员',
                    'phone': '13800000000',
                    'password': 'Admin123',
                    'role': 'admin'
                },
                {
                    'name': '编辑员',
                    'phone': '13800000001',
                    'password': 'Editor123',
                    'role': 'editor'
                },
                {
                    'name': '普通用户',
                    'phone': '13800000002',
                    'password': 'User123',
                    'role': 'user'
                }
            ]
            
            for user_data in test_users:
                hashed_password = generate_password_hash(user_data['password'])
                user = User(
                    name=user_data['name'],
                    phone=user_data['phone'],
                    password=hashed_password,
                    role=user_data['role']
                )
                db.session.add(user)
            
            db.session.commit()
            print("测试用户数据插入成功")
            print("\n测试用户信息：")
            print("1. 管理员 - 手机号: 13800000000, 密码: Admin123")
            print("2. 编辑员 - 手机号: 13800000001, 密码: Editor123")
            print("3. 普通用户 - 手机号: 13800000002, 密码: User123")
        else:
            print(f"数据库中已有 {existing_users} 个用户，跳过初始数据插入")

if __name__ == '__main__':
    init_database() 