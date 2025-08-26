#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
系统功能测试脚本
"""

import requests
import json
import sys

BASE_URL = "http://localhost:5001/api"
TEST_USER = {"username": "admin", "password": "admin123"}

def test_health():
    """测试健康检查"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ 健康检查 - 通过")
            return True
        else:
            print(f"❌ 健康检查 - 失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 健康检查 - 连接失败: {e}")
        return False

def test_login():
    """测试登录功能"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            headers={"Content-Type": "application/json"},
            data=json.dumps(TEST_USER)
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ 登录功能 - 通过")
                return result.get('token')
            else:
                print(f"❌ 登录功能 - 失败: {result.get('message')}")
                return None
        else:
            print(f"❌ 登录功能 - HTTP错误: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ 登录功能 - 异常: {e}")
        return None

def test_authenticated_api(token):
    """测试认证API"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 测试获取数据
    try:
        response = requests.get(f"{BASE_URL}/phones", headers=headers)
        if response.status_code == 200:
            print("✅ 认证API - 获取数据通过")
        else:
            print(f"❌ 认证API - 获取数据失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 认证API - 获取数据异常: {e}")
        return False
    
    # 测试添加数据
    test_phone = {
        "phoneNumber": "13800138000",
        "operator": "移动",
        "plan": "无限流量套餐",
        "monthlyFee": 88.00,
        "status": "正常使用"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/phones", headers=headers, data=json.dumps(test_phone))
        if response.status_code == 201:
            print("✅ 认证API - 添加数据通过")
            result = response.json()
            return result.get('id')
        else:
            print(f"❌ 认证API - 添加数据失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 认证API - 添加数据异常: {e}")
        return False

def main():
    """主测试函数"""
    print("========================================")
    print("  手机号码管理系统 - 功能测试")
    print("========================================")
    print()
    
    # 测试健康检查
    if not test_health():
        print("❌ 测试失败 - 服务器未启动或无响应")
        sys.exit(1)
    
    # 测试登录
    token = test_login()
    if not token:
        print("❌ 测试失败 - 登录功能异常")
        sys.exit(1)
    
    # 测试认证API
    phone_id = test_authenticated_api(token)
    if not phone_id:
        print("❌ 测试失败 - API认证异常")
        sys.exit(1)
    
    print()
    print("========================================")
    print("  🎉 所有测试通过！")
    print(f"  📱 测试添加的手机号ID: {phone_id}")
    print("  🌐 前端页面: file:///Users/kke/claude-projects/业务管理系统/phone-management-system-v3-fast.html")
    print("  🖥️  后端API: http://localhost:5001")
    print("  🔐 登录账户: admin / admin123")
    print("========================================")

if __name__ == "__main__":
    main()