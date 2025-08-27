# 手机号码管理系统 v3.827 - 多用户网络版

🚀 **支持本地部署和云端部署的完整业务管理系统**

## ✨ 主要功能

- 📱 **手机号码管理**: 添加、编辑、删除、搜索手机号码
- 👥 **多账号管理**: 支持多平台账号绑定和管理
- 💰 **账单管理**: 月费记录、统计分析、到期提醒
- 🔐 **用户认证**: JWT令牌认证、权限管理
- 📊 **数据统计**: 费用分析、运营商分布、状态统计
- 💾 **数据备份**: 自动备份、手动导入导出
- 🌐 **多终端**: 支持多用户同时访问、数据实时同步

## 🛠️ 技术栈

### 后端
- **框架**: Python Flask 2.3.3
- **认证**: JWT (PyJWT)
- **存储**: JSON 文件 + 自动备份
- **跨域**: Flask-CORS
- **部署**: Gunicorn + Railway

### 前端
- **框架**: Vue.js 3 (CDN)
- **UI组件**: 原生CSS + 响应式设计
- **图表**: Chart.js
- **存储**: RemoteDatabase (API调用)

## 📦 项目文件结构

```
├── app.py                    # Flask后端服务器
├── requirements.txt          # Python依赖
├── Procfile                  # Railway部署配置
├── runtime.txt              # Python版本
├── .env.example             # 环境变量示例
├── .gitignore               # Git忽略文件
├── phone-management-system-v3-fast.html  # 前端文件
├── start_server.sh          # Mac/Linux启动脚本
├── start_server.bat         # Windows启动脚本
├── test_system.py           # 系统功能测试
├── test_restore.py          # 数据恢复测试
└── README.md                # 本文档
```

## 🚀 快速开始

### 本地部署

1. **克隆项目**
```bash
git clone [仓库地址]
cd 业务管理系统
```

2. **安装依赖**
```bash
pip install -r requirements.txt
```

3. **启动服务器**
```bash
# Mac/Linux
./start_server.sh

# Windows
start_server.bat

# 或直接运行
python app.py
```

4. **访问系统**
- 打开浏览器访问: `http://localhost:5001`
- 默认账户: `admin` / `admin123`

### 云端部署 (Railway)

#### 准备工作

1. **更新API地址**
   编辑 `phone-management-system-v3-fast.html` 文件第1070行:
   ```javascript
   const PRODUCTION_API_URL = 'https://YOUR-APP-NAME.railway.app/api';
   // 替换为你的实际Railway地址
   ```

2. **推送到GitHub**
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

#### Railway部署步骤

1. 访问 [Railway.app](https://railway.app)
2. 选择 "Deploy from GitHub repo"
3. 选择你的仓库
4. 点击 "Deploy Now"

#### 重要配置

1. **环境变量** (Variables 标签):
   - `SECRET_KEY`: 生成一个随机字符串
   - `FLASK_ENV`: `production`

2. **持久化存储** (必须！):
   - 添加 Volume: `data-storage`
   - Mount Path: `/data`

3. **域名生成**:
   - Settings → Domains → Generate Domain
   - 获得如: `https://your-app.railway.app`

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `SECRET_KEY` | JWT加密密钥 | 系统生成 | `your-secret-key-here` |
| `FLASK_ENV` | 运行环境 | `production` | `development`/`production` |
| `PORT` | 服务器端口 | `5001` | `5000` |
| `RAILWAY_VOLUME_MOUNT_PATH` | 数据存储路径 | `data` | `/data` |

### API端点

| 端点 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/health` | GET | 健康检查 | ❌ |
| `/api/auth/login` | POST | 用户登录 | ❌ |
| `/api/phones` | GET/POST | 手机号码管理 | ✅ |
| `/api/accounts` | GET/POST | 账号管理 | ✅ |
| `/api/bills` | GET/POST | 账单管理 | ✅ |
| `/api/users` | GET | 用户列表(仅管理员) | ✅ |
| `/api/settings` | GET | 系统设置 | ✅ |

## 🧪 测试验证

### 运行测试脚本

```bash
# 功能测试
python test_system.py

# 数据恢复测试  
python test_restore.py
```

### 手动测试

1. **健康检查**: `curl http://localhost:5001/api/health`
2. **登录测试**: 使用 admin/admin123
3. **功能测试**: 添加手机号、账号、账单
4. **数据恢复**: 备份和恢复功能

## 📊 功能特性

### 已实现功能 ✅

- [x] 用户认证和权限管理
- [x] 手机号码增删改查
- [x] 多平台账号管理
- [x] 账单记录和统计
- [x] 数据导入导出
- [x] 自动数据备份
- [x] 响应式设计
- [x] 多用户支持
- [x] 数据恢复功能修复
- [x] 生产环境部署支持

### 技术优化 🔧

- [x] JWT认证体系
- [x] API错误处理
- [x] 数组类型检查修复
- [x] 环境自动判断
- [x] Volume持久化存储
- [x] Gunicorn生产服务器

## 🔒 安全说明

### 默认密码
- **用户名**: `admin`
- **密码**: `admin123`
- **重要**: 首次登录后立即修改密码！

### 安全建议
1. 生产环境必须设置强密码的 `SECRET_KEY`
2. 定期备份数据到本地
3. 不要将 `data/` 目录提交到版本控制
4. 使用 HTTPS 部署生产环境

## 📈 性能指标

### Railway免费版限制
- **内存**: 512MB
- **CPU**: 共享
- **存储**: 1GB (需要Volume)
- **月免费额度**: $5 (约500小时运行)

### 建议配置
- **Hobby计划**: $5/月，无限运行时间
- **Volume大小**: 根据数据量调整
- **Workers**: 1-2个 (免费版)

## 🐛 常见问题

### 部署问题

**Q: 部署失败**
- A: 检查 `requirements.txt` 格式和Python版本

**Q: 数据丢失**  
- A: 确保添加了Railway Volume持久化存储

**Q: API连接失败**
- A: 检查前端API地址配置和CORS设置

### 功能问题

**Q: 登录失败**
- A: 检查用户名密码，确认 `SECRET_KEY` 环境变量设置

**Q: 数据恢复后消失**
- A: 已修复，数据现在保存到后端数据库

## 📝 更新日志

### v3.827 (2025-08-27)
- ✅ **新增**: Railway云端部署支持
- ✅ **修复**: 数据恢复功能持久化问题
- ✅ **优化**: API地址自动判断
- ✅ **增强**: 环境变量配置支持
- ✅ **添加**: Gunicorn生产服务器
- ✅ **隐藏**: 游客模式登录选项
- ✅ **修复**: 数组类型检查错误

### v3.5 (之前版本)
- 基础多用户认证系统
- 数据管理功能
- 本地IndexedDB存储

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支: `git checkout -b feature/AmazingFeature`
3. 提交更改: `git commit -m 'Add some AmazingFeature'`
4. 推送分支: `git push origin feature/AmazingFeature`
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 支持

如遇问题，请：
1. 查看本文档常见问题部分
2. 运行测试脚本诊断问题
3. 检查Railway部署日志
4. 创建Issue描述具体问题

---

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>