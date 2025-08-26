#!/bin/bash

echo "========================================"
echo "  手机号码管理系统 - 启动服务器"
echo "========================================"
echo ""

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未检测到Python，请先安装Python 3.7+"
    exit 1
fi

# 创建虚拟环境（可选）
if [ ! -d "venv" ]; then
    echo "[1/4] 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "[2/4] 激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "[3/4] 安装依赖..."
pip install -r requirements.txt

echo ""
echo "[4/4] 启动服务器..."
echo ""
echo "----------------------------------------"
echo "  访问地址: http://localhost:5001"
echo "  默认账户: admin / admin123"
echo "  按 Ctrl+C 停止服务器"
echo "----------------------------------------"
echo ""

# 启动服务器
python app.py