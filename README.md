# SimpleNotes - Markdown 文档管理系统

基于 Vue 3 + Node.js + MongoDB + Minio 的现代化 Markdown 文档管理系统。

## 🚀 快速部署

### 方式1：应用部署（使用远程数据库）

使用远程数据库 (8.155.40.179) 和 Minio 存储：

```bash
# 1. 复制环境配置
cp env.example .env

# 2. 编辑配置文件（可选）
nano .env

# 3. 启动应用服务
npm run docker:app

# 4. 查看服务状态
docker-compose ps

# 5. 查看日志
npm run docker:logs
```

**访问地址：**
- 前端：http://localhost:8081
- 后端API：http://localhost:3001

### 方式2：完整本地部署

本地部署所有服务（包括 MongoDB、Minio、Redis）：

```bash
# 1. 复制环境配置
cp env.example .env

# 2. 启动完整服务
npm run docker:full

# 3. 查看服务状态
docker-compose -f docker-compose.full.yml ps

# 4. 查看日志
npm run docker:logs:full
```

**访问地址：**
- 前端：http://localhost:8081
- 后端API：http://localhost:3001
- MongoDB：localhost:27017
- Minio：http://localhost:9000
- Minio Console：http://localhost:9001

## 📁 项目结构

```
SimpleNotes/
├── notes-server/           # Node.js 后端服务
│   ├── routes/            # API 路由
│   ├── models/            # 数据模型
│   ├── middleware/        # 中间件
│   ├── utils/             # 工具函数
│   ├── scripts/           # 脚本文件
│   └── Dockerfile         # 后端容器配置
├── notes-web/             # Vue 3 前端应用
│   ├── src/              # 源代码
│   ├── nginx.conf        # Nginx 配置
│   └── Dockerfile        # 前端容器配置
├── docker-compose.yml     # 应用部署配置
├── docker-compose.full.yml # 完整部署配置
└── env.example           # 环境变量示例
```

## ⚙️ 环境配置

创建 `.env` 文件：

```bash
cp env.example .env
```

重要配置项：

```env
# JWT 安全密钥（生产环境必须修改）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 应用配置
FRONTEND_URL=http://localhost:8081
NODE_ENV=production

# 邮件配置（用于用户注册验证）
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# 远程 Minio 配置
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
```

## 🔧 开发模式

### 安装依赖

```bash
# 安装后端依赖
cd notes-server
npm install

# 安装前端依赖
cd ../notes-web
npm install

# 或者一键安装
npm run install:all
```

### 本地开发

```bash
# 启动后端服务（端口 3001）
npm run dev:server

# 启动前端服务（端口 8081）
npm run dev:web

# 同时启动前后端
npm run dev
```

## 📋 可用脚本

```bash
# 开发相关
npm run dev:server      # 启动后端开发服务
npm run dev:web         # 启动前端开发服务
npm run dev             # 同时启动前后端
npm run build:web       # 构建前端

# Docker 部署
npm run docker:app      # 启动应用服务（使用远程数据库）
npm run docker:app:down # 停止应用服务
npm run docker:full     # 启动完整服务（本地所有组件）
npm run docker:full:down # 停止完整服务

# 日志查看
npm run docker:logs     # 查看应用服务日志
npm run docker:logs:full # 查看完整服务日志

# 依赖安装
npm run install:all     # 安装所有依赖
```

## 🌐 端口配置

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 | 8081 | Vue 应用主入口 |
| 后端 | 3001 | Node.js API 服务 |
| MongoDB | 27017 | 数据库（仅完整部署） |
| Minio | 9000 | 文件存储（仅完整部署） |
| Minio Console | 9001 | 存储管理界面（仅完整部署） |

## 🗄️ 数据库配置

### 应用部署模式
使用远程 MongoDB：`8.155.40.179:27017`

### 完整部署模式
使用本地 MongoDB 容器，默认用户：
- 用户名：admin
- 密码：password123
- 数据库：simplenotes

## 📁 文件存储

### 应用部署模式
使用远程 Minio：`8.155.40.179:9000`

### 完整部署模式
使用本地 Minio 容器：
- 访问密钥：minioadmin
- 秘密密钥：minioadmin123
- 存储桶：simplenotes-files

## 🔍 故障排除

### 常见问题

1. **端口被占用**
```bash
# 查看端口占用
netstat -tulpn | grep :8081
netstat -tulpn | grep :3001

# 停止占用端口的服务
sudo fuser -k 8081/tcp
sudo fuser -k 3001/tcp
```

2. **容器启动失败**
```bash
# 查看容器日志
docker logs simplenotes-backend
docker logs simplenotes-frontend

# 重启服务
npm run docker:app:down
npm run docker:app
```

3. **数据库连接失败**
- 确保远程数据库 8.155.40.179:27017 可访问
- 检查防火墙设置
- 验证数据库用户权限

## 📞 技术支持

如果遇到问题，请检查：
1. Docker 是否正常运行
2. 端口是否被占用
3. 环境变量配置是否正确
4. 远程服务是否可访问

## 🎯 默认账号

首次部署后，系统会自动创建默认管理员账号：
- 用户名：admin
- 邮箱：admin@simplenotes.com
- 密码：admin123

**⚠️ 重要：登录后请立即修改默认密码！**