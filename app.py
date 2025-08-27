#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
手机号码管理系统 - Flask后端服务器
支持多用户、数据同步、自动备份、生产环境部署
"""

import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import jwt
import json
from datetime import datetime, timedelta
from functools import wraps
import hashlib
import shutil

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 配置
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'phone-management-system-secret-key-2023')

# Railway使用Volume存储数据，本地开发使用data目录
DATA_DIR = os.environ.get('RAILWAY_VOLUME_MOUNT_PATH', 'data')
DATABASE_FILE = os.path.join(DATA_DIR, 'database.json')
BACKUP_DIR = os.path.join(DATA_DIR, 'backups')

# 确保数据目录存在
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(BACKUP_DIR, exist_ok=True)

# 默认数据结构
DEFAULT_DATA = {
    "users": [
        {
            "id": "admin",
            "username": "admin",
            "password": "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",  # admin123
            "role": "admin",
            "createdAt": datetime.now().isoformat(),
            "lastLogin": None
        }
    ],
    "phones": [],
    "accounts": [],
    "bills": [],
    "settings": {
        "companyName": "手机号码管理系统",
        "version": "v3.5",
        "autoBackup": True,
        "backupInterval": 24
    }
}

def hash_password(password):
    """密码哈希"""
    return hashlib.sha256(password.encode()).hexdigest()

def load_database():
    """加载数据库"""
    try:
        if os.path.exists(DATABASE_FILE):
            with open(DATABASE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            # 创建默认数据库
            save_database(DEFAULT_DATA)
            return DEFAULT_DATA.copy()
    except Exception as e:
        print(f"加载数据库失败: {e}")
        return DEFAULT_DATA.copy()

def save_database(data):
    """保存数据库并创建备份"""
    try:
        # 保存主数据库
        with open(DATABASE_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # 创建备份
        backup_filename = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        backup_path = os.path.join(BACKUP_DIR, backup_filename)
        shutil.copy2(DATABASE_FILE, backup_path)
        
        # 清理旧备份（保留最近10个）
        cleanup_old_backups()
        
        return True
    except Exception as e:
        print(f"保存数据库失败: {e}")
        return False

def cleanup_old_backups():
    """清理旧备份文件"""
    try:
        backup_files = []
        for filename in os.listdir(BACKUP_DIR):
            if filename.startswith('backup_') and filename.endswith('.json'):
                filepath = os.path.join(BACKUP_DIR, filename)
                backup_files.append((filepath, os.path.getmtime(filepath)))
        
        # 按修改时间排序，保留最新的10个
        backup_files.sort(key=lambda x: x[1], reverse=True)
        for filepath, _ in backup_files[10:]:
            os.remove(filepath)
            
    except Exception as e:
        print(f"清理备份文件失败: {e}")

def token_required(f):
    """Token验证装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': '缺少认证令牌'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
            
            # 验证用户是否存在
            db = load_database()
            user = next((u for u in db['users'] if u['id'] == current_user_id), None)
            if not user:
                return jsonify({'message': '用户不存在'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': '令牌已过期'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': '无效的令牌'}), 401
        
        return f(current_user_id, *args, **kwargs)
    
    return decorated

# ==================== 认证相关 API ====================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({
                'success': False,
                'message': '用户名和密码不能为空'
            }), 400
        
        # 加载用户数据
        db = load_database()
        user = next((u for u in db['users'] if u['username'] == username), None)
        
        if not user or user['password'] != hash_password(password):
            return jsonify({
                'success': False,
                'message': '用户名或密码错误'
            }), 401
        
        # 更新最后登录时间
        user['lastLogin'] = datetime.now().isoformat()
        save_database(db)
        
        # 生成JWT令牌
        token = jwt.encode({
            'user_id': user['id'],
            'username': user['username'],
            'role': user['role'],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'role': user['role']
            },
            'message': '登录成功'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'登录失败: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        'status': 'ok',
        'message': '服务器运行正常',
        'timestamp': datetime.now().isoformat()
    })

# ==================== 数据 API ====================

@app.route('/api/phones', methods=['GET'])
@token_required
def get_phones(current_user_id):
    """获取所有手机号码"""
    try:
        db = load_database()
        return jsonify(db['phones'])
    except Exception as e:
        return jsonify({'message': f'获取数据失败: {str(e)}'}), 500

@app.route('/api/phones', methods=['POST'])
@token_required
def add_phone(current_user_id):
    """添加手机号码"""
    try:
        data = request.get_json()
        db = load_database()
        
        # 生成ID
        if 'id' not in data:
            data['id'] = f"phone_{len(db['phones']) + 1}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # 添加创建信息
        data['createdAt'] = datetime.now().isoformat()
        data['createdBy'] = current_user_id
        
        db['phones'].append(data)
        
        if save_database(db):
            return jsonify({'id': data['id'], 'message': '添加成功'}), 201
        else:
            return jsonify({'message': '保存失败'}), 500
            
    except Exception as e:
        return jsonify({'message': f'添加失败: {str(e)}'}), 500

@app.route('/api/phones/<phone_id>', methods=['PUT'])
@token_required
def update_phone(current_user_id, phone_id):
    """更新手机号码"""
    try:
        data = request.get_json()
        db = load_database()
        
        # 查找并更新
        for i, phone in enumerate(db['phones']):
            if phone['id'] == phone_id:
                data['id'] = phone_id
                data['updatedAt'] = datetime.now().isoformat()
                data['updatedBy'] = current_user_id
                db['phones'][i] = data
                
                if save_database(db):
                    return jsonify({'message': '更新成功'})
                else:
                    return jsonify({'message': '保存失败'}), 500
        
        return jsonify({'message': '数据不存在'}), 404
        
    except Exception as e:
        return jsonify({'message': f'更新失败: {str(e)}'}), 500

@app.route('/api/phones/<phone_id>', methods=['DELETE'])
@token_required
def delete_phone(current_user_id, phone_id):
    """删除手机号码"""
    try:
        db = load_database()
        
        # 查找并删除
        for i, phone in enumerate(db['phones']):
            if phone['id'] == phone_id:
                db['phones'].pop(i)
                
                if save_database(db):
                    return '', 204
                else:
                    return jsonify({'message': '保存失败'}), 500
        
        return jsonify({'message': '数据不存在'}), 404
        
    except Exception as e:
        return jsonify({'message': f'删除失败: {str(e)}'}), 500

@app.route('/api/accounts', methods=['GET'])
@token_required
def get_accounts(current_user_id):
    """获取所有账号"""
    try:
        db = load_database()
        return jsonify(db['accounts'])
    except Exception as e:
        return jsonify({'message': f'获取数据失败: {str(e)}'}), 500

@app.route('/api/accounts', methods=['POST'])
@token_required
def add_account(current_user_id):
    """添加账号"""
    try:
        data = request.get_json()
        db = load_database()
        
        if 'id' not in data:
            data['id'] = f"account_{len(db['accounts']) + 1}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        data['createdAt'] = datetime.now().isoformat()
        data['createdBy'] = current_user_id
        
        db['accounts'].append(data)
        
        if save_database(db):
            return jsonify({'id': data['id'], 'message': '添加成功'}), 201
        else:
            return jsonify({'message': '保存失败'}), 500
            
    except Exception as e:
        return jsonify({'message': f'添加失败: {str(e)}'}), 500

@app.route('/api/accounts/<account_id>', methods=['PUT'])
@token_required
def update_account(current_user_id, account_id):
    """更新账号"""
    try:
        data = request.get_json()
        db = load_database()
        
        for i, account in enumerate(db['accounts']):
            if account['id'] == account_id:
                data['id'] = account_id
                data['updatedAt'] = datetime.now().isoformat()
                data['updatedBy'] = current_user_id
                db['accounts'][i] = data
                
                if save_database(db):
                    return jsonify({'message': '更新成功'})
                else:
                    return jsonify({'message': '保存失败'}), 500
        
        return jsonify({'message': '数据不存在'}), 404
        
    except Exception as e:
        return jsonify({'message': f'更新失败: {str(e)}'}), 500

@app.route('/api/accounts/<account_id>', methods=['DELETE'])
@token_required
def delete_account(current_user_id, account_id):
    """删除账号"""
    try:
        db = load_database()
        
        for i, account in enumerate(db['accounts']):
            if account['id'] == account_id:
                db['accounts'].pop(i)
                
                if save_database(db):
                    return '', 204
                else:
                    return jsonify({'message': '保存失败'}), 500
        
        return jsonify({'message': '数据不存在'}), 404
        
    except Exception as e:
        return jsonify({'message': f'删除失败: {str(e)}'}), 500

@app.route('/api/bills', methods=['GET'])
@token_required
def get_bills(current_user_id):
    """获取所有账单"""
    try:
        db = load_database()
        return jsonify(db['bills'])
    except Exception as e:
        return jsonify({'message': f'获取数据失败: {str(e)}'}), 500

@app.route('/api/bills', methods=['POST'])
@token_required
def add_bill(current_user_id):
    """添加账单"""
    try:
        data = request.get_json()
        db = load_database()
        
        if 'id' not in data:
            data['id'] = f"bill_{len(db['bills']) + 1}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        data['createdAt'] = datetime.now().isoformat()
        data['createdBy'] = current_user_id
        
        db['bills'].append(data)
        
        if save_database(db):
            return jsonify({'id': data['id'], 'message': '添加成功'}), 201
        else:
            return jsonify({'message': '保存失败'}), 500
            
    except Exception as e:
        return jsonify({'message': f'添加失败: {str(e)}'}), 500

@app.route('/api/bills/<bill_id>', methods=['PUT'])
@token_required
def update_bill(current_user_id, bill_id):
    """更新账单"""
    try:
        data = request.get_json()
        db = load_database()
        
        for i, bill in enumerate(db['bills']):
            if bill['id'] == bill_id:
                data['id'] = bill_id
                data['updatedAt'] = datetime.now().isoformat()
                data['updatedBy'] = current_user_id
                db['bills'][i] = data
                
                if save_database(db):
                    return jsonify({'message': '更新成功'})
                else:
                    return jsonify({'message': '保存失败'}), 500
        
        return jsonify({'message': '数据不存在'}), 404
        
    except Exception as e:
        return jsonify({'message': f'更新失败: {str(e)}'}), 500

@app.route('/api/bills/<bill_id>', methods=['DELETE'])
@token_required
def delete_bill(current_user_id, bill_id):
    """删除账单"""
    try:
        db = load_database()
        
        for i, bill in enumerate(db['bills']):
            if bill['id'] == bill_id:
                db['bills'].pop(i)
                
                if save_database(db):
                    return '', 204
                else:
                    return jsonify({'message': '保存失败'}), 500
        
        return jsonify({'message': '数据不存在'}), 404
        
    except Exception as e:
        return jsonify({'message': f'删除失败: {str(e)}'}), 500

@app.route('/api/settings', methods=['GET'])
@token_required
def get_settings(current_user_id):
    """获取设置"""
    try:
        db = load_database()
        return jsonify(db['settings'])
    except Exception as e:
        return jsonify({'message': f'获取设置失败: {str(e)}'}), 500

@app.route('/api/users', methods=['GET'])
@token_required
def get_users(current_user_id):
    """获取用户列表（仅管理员）"""
    try:
        db = load_database()
        # 检查当前用户是否为管理员
        current_user = next((u for u in db['users'] if u['id'] == current_user_id), None)
        if not current_user or current_user.get('role') != 'admin':
            return jsonify({'message': '权限不足'}), 403
        
        # 返回用户列表（不包含密码）
        users = []
        for user in db['users']:
            safe_user = {k: v for k, v in user.items() if k != 'password'}
            users.append(safe_user)
        
        return jsonify(users)
    except Exception as e:
        return jsonify({'message': f'获取用户列表失败: {str(e)}'}), 500

@app.route('/api/<collection>/clear', methods=['DELETE'])
@token_required
def clear_collection(current_user_id, collection):
    """清空指定集合的所有数据（仅管理员）"""
    try:
        db = load_database()
        # 检查当前用户是否为管理员
        current_user = next((u for u in db['users'] if u['id'] == current_user_id), None)
        if not current_user or current_user.get('role') != 'admin':
            return jsonify({'message': '权限不足，只有管理员可以清空数据'}), 403
        
        # 支持的集合类型
        valid_collections = ['phones', 'accounts', 'bills']
        if collection not in valid_collections:
            return jsonify({'message': f'不支持的集合类型: {collection}'}), 400
        
        # 清空指定集合
        count = len(db[collection])
        db[collection] = []
        
        if save_database(db):
            return jsonify({
                'message': f'成功清空 {collection}',
                'deletedCount': count
            })
        else:
            return jsonify({'message': '保存失败'}), 500
            
    except Exception as e:
        return jsonify({'message': f'清空失败: {str(e)}'}), 500

# ==================== 静态文件服务 ====================

@app.route('/')
def index():
    """主页，返回HTML文件"""
    return send_from_directory('.', 'phone-management-system-v3-fast.html')

@app.route('/<path:filename>')
def static_files(filename):
    """静态文件服务"""
    return send_from_directory('.', filename)

# ==================== 启动服务器 ====================

def init_database():
    """初始化数据库"""
    db = load_database()
    return db

if __name__ == '__main__':
    # 初始化数据库
    init_database()
    
    # Railway会设置PORT环境变量
    port = int(os.environ.get('PORT', 5001))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    
    # 生产环境不显示详细信息
    if not debug_mode:
        print(f"🚀 手机号码管理系统启动中...")
        print(f"📂 数据目录: {DATA_DIR}")
        print(f"🌐 服务器端口: {port}")
        print(f"🔐 默认账户: admin / admin123")
    else:
        # 本地开发环境显示详细信息
        print("========================================")
        print("  手机号码管理系统 - 开发环境")
        print("========================================")
        print("")
        print("🔧 初始化数据库...")
        print(f"✅ 数据库初始化完成")
        print(f"📂 数据目录: {os.path.abspath(DATA_DIR)}")
        print("")
        print("🚀 启动Web服务器...")
        print("📱 访问地址:")
        print(f"   本机访问: http://localhost:{port}")
        print(f"   本机访问: http://127.0.0.1:{port}")
        print("")
        print("🔐 默认账户: admin / admin123")
        print("⚠️  请及时修改默认密码")
        print("")
        print("💡 按 Ctrl+C 停止服务器")
        print("========================================")
    
    app.run(host='0.0.0.0', port=port, debug=debug_mode)