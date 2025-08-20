# 手机号码管理系统

一个为自媒体公司设计的手机号码管理系统，用于高效管理多个手机号码、平台绑定和费用控制。

## 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS + Ant Design
- **后端**: Node.js + Express + TypeScript
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **认证**: JWT Token
- **部署**: Docker

## 项目结构

```
phone-management-system/
├── backend/          # 后端API服务
├── frontend/         # 前端React应用  
├── docs/            # 项目文档
├── docker-compose.yml
└── README.md
```

## 功能特性

- 手机号码管理（增删改查）
- 平台绑定管理（抖音、小红书、微信等）
- 费用管理和统计分析
- 用户权限管理
- 数据报表和仪表板
- 批量操作和导入导出

## 快速开始

### 开发环境

1. 克隆项目并安装依赖：
```bash
cd phone-management-system
cd backend && npm install
cd ../frontend && npm install
```

2. 启动开发服务：
```bash
# 启动后端 (端口: 3001)
cd backend && npm run dev

# 启动前端 (端口: 3000)
cd frontend && npm start
```

### 生产部署

使用 Docker Compose:

```bash
docker-compose up -d
```

## 默认账号

- 管理员: admin / admin123
- 经理: manager / manager123  
- 用户: user / user123

## 许可证

MIT License