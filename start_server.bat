@echo off
echo ========================================
echo   手机号码管理系统 - 启动服务器
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Python，请先安装Python 3.7+
    pause
    exit
)

REM 安装依赖
echo [1/3] 正在检查并安装依赖...
pip install -r requirements.txt

echo.
echo [2/3] 正在启动服务器...
echo.
echo ----------------------------------------
echo   访问地址: http://localhost:5001
echo   默认账户: admin / admin123
echo   按 Ctrl+C 停止服务器
echo ----------------------------------------
echo.

REM 启动服务器
python app.py

pause