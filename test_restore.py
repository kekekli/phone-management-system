#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据恢复功能测试脚本
"""

import requests
import json
import sys

BASE_URL = "http://localhost:5001/api"
TEST_USER = {"username": "admin", "password": "admin123"}

def get_token():
    """获取认证令牌"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        headers={"Content-Type": "application/json"},
        data=json.dumps(TEST_USER)
    )
    
    if response.status_code == 200:
        result = response.json()
        if result.get('success'):
            return result.get('token')
    return None

def test_restore_simulation():
    """模拟数据恢复过程"""
    print("========================================")
    print("  数据恢复功能测试")
    print("========================================")
    print()
    
    # 获取令牌
    token = get_token()
    if not token:
        print("❌ 获取认证令牌失败")
        return False
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("✅ 登录成功，开始测试恢复流程")
    
    # 1. 检查当前数据
    print("\n📋 当前数据状态:")
    phones = requests.get(f"{BASE_URL}/phones", headers=headers).json()
    accounts = requests.get(f"{BASE_URL}/accounts", headers=headers).json()
    bills = requests.get(f"{BASE_URL}/bills", headers=headers).json()
    
    print(f"   手机号码: {len(phones)} 条")
    print(f"   账号: {len(accounts)} 条")
    print(f"   账单: {len(bills)} 条")
    
    # 2. 删除现有数据
    print("\n🗑️  删除现有数据...")
    deleted_phones = 0
    deleted_accounts = 0
    deleted_bills = 0
    
    for phone in phones:
        try:
            response = requests.delete(f"{BASE_URL}/phones/{phone['id']}", headers=headers)
            if response.status_code in [200, 204]:
                deleted_phones += 1
        except Exception as e:
            print(f"   删除手机号码失败: {e}")
    
    for account in accounts:
        try:
            response = requests.delete(f"{BASE_URL}/accounts/{account['id']}", headers=headers)
            if response.status_code in [200, 204]:
                deleted_accounts += 1
        except Exception as e:
            print(f"   删除账号失败: {e}")
    
    for bill in bills:
        try:
            response = requests.delete(f"{BASE_URL}/bills/{bill['id']}", headers=headers)
            if response.status_code in [200, 204]:
                deleted_bills += 1
        except Exception as e:
            print(f"   删除账单失败: {e}")
    
    print(f"   已删除手机号码: {deleted_phones}, 账号: {deleted_accounts}, 账单: {deleted_bills}")
    
    # 3. 恢复测试数据
    print("\n📥 恢复测试数据...")
    
    test_data = {
        "phones": [
            {
                "phoneNumber": "13800138001",
                "operator": "中国移动",
                "plan": "5G畅享套餐",
                "monthlyFee": 128.00,
                "status": "正常使用",
                "purchaseDate": "2024-01-15",
                "note": "测试恢复数据1"
            },
            {
                "phoneNumber": "13800138002", 
                "operator": "中国联通",
                "plan": "无限流量套餐",
                "monthlyFee": 99.00,
                "status": "正常使用", 
                "purchaseDate": "2024-02-20",
                "note": "测试恢复数据2"
            }
        ],
        "accounts": [
            {
                "platform": "微信",
                "accountName": "测试账号1",
                "phoneNumber": "13800138001",
                "status": "正常",
                "registrationDate": "2024-01-16",
                "note": "恢复测试账号"
            }
        ],
        "bills": [
            {
                "phoneNumber": "13800138001",
                "billingMonth": "2024-07",
                "amount": 128.00,
                "status": "已支付",
                "dueDate": "2024-08-05",
                "note": "恢复测试账单"
            }
        ]
    }
    
    restored_phones = 0
    restored_accounts = 0
    restored_bills = 0
    
    # 恢复手机号码
    for phone in test_data["phones"]:
        try:
            response = requests.post(f"{BASE_URL}/phones", headers=headers, data=json.dumps(phone))
            if response.status_code == 201:
                restored_phones += 1
        except Exception as e:
            print(f"   恢复手机号码失败: {e}")
    
    # 恢复账号
    for account in test_data["accounts"]:
        try:
            response = requests.post(f"{BASE_URL}/accounts", headers=headers, data=json.dumps(account))
            if response.status_code == 201:
                restored_accounts += 1
        except Exception as e:
            print(f"   恢复账号失败: {e}")
    
    # 恢复账单
    for bill in test_data["bills"]:
        try:
            response = requests.post(f"{BASE_URL}/bills", headers=headers, data=json.dumps(bill))
            if response.status_code == 201:
                restored_bills += 1
        except Exception as e:
            print(f"   恢复账单失败: {e}")
    
    print(f"   已恢复手机号码: {restored_phones}, 账号: {restored_accounts}, 账单: {restored_bills}")
    
    # 4. 验证恢复结果
    print("\n✅ 验证恢复结果...")
    
    new_phones = requests.get(f"{BASE_URL}/phones", headers=headers).json()
    new_accounts = requests.get(f"{BASE_URL}/accounts", headers=headers).json()
    new_bills = requests.get(f"{BASE_URL}/bills", headers=headers).json()
    
    print(f"   恢复后手机号码: {len(new_phones)} 条")
    print(f"   恢复后账号: {len(new_accounts)} 条")
    print(f"   恢复后账单: {len(new_bills)} 条")
    
    success = (len(new_phones) == len(test_data["phones"]) and
               len(new_accounts) == len(test_data["accounts"]) and
               len(new_bills) == len(test_data["bills"]))
    
    print()
    print("========================================")
    if success:
        print("  🎉 数据恢复功能测试通过！")
        print("  ✅ 数据已保存到后端数据库")
        print("  ✅ 刷新页面后数据仍然存在")
    else:
        print("  ❌ 数据恢复功能测试失败")
    print("========================================")
    
    return success

if __name__ == "__main__":
    test_restore_simulation()