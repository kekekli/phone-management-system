#!/bin/bash

echo "=== 推送到GitHub脚本 ==="

# 检查远程仓库设置
echo "当前远程仓库:"
git remote -v

# 推送到GitHub
echo "开始推送..."
git push -u origin main

echo "推送完成！"
echo "仓库地址: https://github.com/kekekli/phone-management-system"