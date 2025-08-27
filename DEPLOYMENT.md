# Railway部署完整指南

本指南将引导您将手机号码管理系统部署到Railway云平台。

## 📋 部署检查清单

### ✅ 准备阶段
- [x] requirements.txt 已更新 (包含 gunicorn, python-dotenv)
- [x] Procfile 已创建
- [x] runtime.txt 已创建  
- [x] app.py 已增强 (环境变量支持)
- [x] .gitignore 已配置
- [x] .env.example 已创建

### 🔧 部署前配置

#### 1. 更新前端API地址
编辑 `phone-management-system-v3-fast.html` 第1070行：

```javascript
// 替换这一行：
const PRODUCTION_API_URL = 'https://YOUR-APP-NAME.railway.app/api';

// 改为你的实际Railway域名：
const PRODUCTION_API_URL = 'https://your-actual-app-name.railway.app/api';
```

#### 2. 生成SECRET_KEY
```python
# 运行以下代码生成安全密钥
import secrets
print(secrets.token_hex(32))
```

## 🚀 Railway部署步骤

### 第一步：推送代码到GitHub

```bash
# 1. 检查Git状态
git status

# 2. 添加所有文件
git add .

# 3. 提交更改
git commit -m "Railway deployment ready - v3.827"

# 4. 推送到远程仓库
git push origin main
```

### 第二步：Railway项目创建

1. 访问 **https://railway.app**
2. 点击 **"Start a New Project"**
3. 选择 **"Login with GitHub"**
4. 授权Railway访问GitHub
5. 点击 **"New Project"**
6. 选择 **"Deploy from GitHub repo"**
7. 搜索并选择您的仓库
8. 点击 **"Deploy Now"**

### 第三步：配置环境变量

在Railway Dashboard中：

1. 点击您的应用服务
2. 选择 **"Variables"** 标签  
3. 点击 **"New Variable"**
4. 添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `SECRET_KEY` | [生成的64位随机字符串] | JWT加密密钥 |
| `FLASK_ENV` | `production` | 生产环境标识 |

**示例环境变量：**
```
SECRET_KEY=a1b2c3d4e5f6...64位随机字符串
FLASK_ENV=production
```

### 第四步：添加持久化存储 (重要！)

1. 在项目页面，点击 **"New"** → **"Volume"**
2. 配置Volume：
   - **Name**: `data-storage`
   - **Mount Path**: `/data`
3. 点击 **"Attach"** 连接到服务

⚠️ **不添加Volume，数据会在每次部署后丢失！**

### 第五步：生成访问域名

1. 点击 **"Settings"** 标签
2. 找到 **"Domains"** 部分  
3. 点击 **"Generate Domain"**
4. 获得类似格式：`https://your-app-name.railway.app`

### 第六步：更新前端配置

获得Railway域名后，更新前端API地址：

```javascript
// 在 phone-management-system-v3-fast.html 中更新
const PRODUCTION_API_URL = 'https://your-actual-app-name.railway.app/api';
```

重新提交并推送：
```bash
git add phone-management-system-v3-fast.html
git commit -m "Update production API URL"
git push origin main
```

## 🧪 部署验证

### 1. 健康检查
访问：`https://your-app-name.railway.app/api/health`

预期响应：
```json
{
  "status": "ok", 
  "message": "服务器运行正常",
  "timestamp": "2025-08-27T..."
}
```

### 2. 登录测试
访问：`https://your-app-name.railway.app`

使用默认账户：
- 用户名：`admin`
- 密码：`admin123`

### 3. 功能验证
- 添加手机号码
- 创建账号
- 记录账单
- 数据统计

## 📊 Cloudflare Pages前端部署 (可选)

如果希望前后端分离部署：

### 准备前端仓库
```bash
mkdir phone-management-frontend
cd phone-management-frontend

# 复制前端文件
cp ../phone-management-system-v3-fast.html index.html
mkdir libs
# 复制必要的JS库文件
```

### Cloudflare Pages部署
1. 登录 Cloudflare Dashboard
2. 选择 **Pages**
3. 点击 **"Create a project"**
4. 选择 GitHub仓库
5. 构建配置：
   - Framework preset: **None**
   - Build command: (留空)
   - Build output directory: `/`

## 🔍 故障排除

### 常见部署错误

#### 1. 构建失败
```
Error: Module not found: gunicorn
```
**解决方案**：检查 `requirements.txt` 是否包含 `gunicorn==21.2.0`

#### 2. 启动失败
```
Error: Permission denied
```
**解决方案**：检查 `Procfile` 格式是否正确

#### 3. 数据丢失
```
数据在重新部署后消失
```
**解决方案**：确保添加了Railway Volume存储

#### 4. API连接失败
```
CORS error / 404 Not Found
```
**解决方案**：
1. 检查前端API地址配置
2. 确认后端服务正常运行
3. 检查环境变量设置

### 日志查看
Railway Dashboard → Deployments → View Logs

### 监控使用量
Railway Dashboard → Usage
- 内存使用
- CPU使用  
- 剩余免费额度

## 💰 费用说明

### Railway定价 (2025年)

| 计划 | 价格 | 包含内容 | 适用场景 |
|------|------|----------|----------|
| 免费版 | $0 | $5免费额度/月<br>约500小时运行 | 个人测试 |
| Hobby | $5/月 | 无限运行时间<br>8GB内存 | 小团队 |
| Pro | $20/月 | 更高性能<br>优先支持 | 商业使用 |

## 📈 性能优化

### 生产环境建议

1. **资源配置**
   - 最少512MB内存
   - 1-2个Gunicorn workers
   - Volume大小根据数据量调整

2. **数据备份**
   ```bash
   # 定期下载备份
   curl https://your-app.railway.app/api/backup > backup.json
   ```

3. **监控和维护**
   - 定期检查日志
   - 监控内存使用
   - 关注免费额度消耗

## 🔒 安全配置

### 部署后必做

1. **修改默认密码**
   - 立即登录并修改admin密码

2. **环境变量安全**
   - SECRET_KEY使用强密码
   - 不要在代码中硬编码密钥

3. **定期备份**
   - 设置自动备份计划
   - 保存备份到本地

## 📞 技术支持

遇到问题时：

1. **查看日志**：Railway Dashboard → Deployments → Logs
2. **检查环境变量**：确保所有必需变量已设置
3. **验证Volume**：确保数据存储已配置
4. **测试API**：使用curl命令测试API端点
5. **本地调试**：先在本地环境验证功能

---

## 🎯 快速命令参考

```bash
# 本地测试
python app.py

# Git推送
git add . && git commit -m "update" && git push

# 测试API
curl https://your-app.railway.app/api/health

# 下载备份
curl https://your-app.railway.app/api/backup > backup.json

# 生成SECRET_KEY
python -c "import secrets; print(secrets.token_hex(32))"
```

祝您部署成功！🎉