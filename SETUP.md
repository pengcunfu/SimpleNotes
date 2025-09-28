# SimpleNotes 快速安装指南

这是一个简化的安装指南，帮助您快速启动 SimpleNotes 系统。

## 系统要求

- Node.js 16+ 
- MongoDB 4.4+
- Minio 服务器 (可选，也可以使用 Docker)

## 快速开始

### 1. 安装依赖

```bash
# 克隆项目
git clone <your-repo-url>
cd SimpleNotes

# 安装所有依赖
npm run install:all
```

### 2. 环境配置

```bash
# 复制配置文件
cp server/config.env server/.env

# 编辑配置文件
nano server/.env
```

**最小配置（修改以下内容）：**

```env
# 数据库连接（确保 MongoDB 已启动）
MONGODB_URI=mongodb://localhost:27017/simplenotes

# JWT 密钥（请更改为随机字符串）
JWT_SECRET=your-super-secret-key-please-change-this

# 邮件配置（用于注册验证，可选）
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Minio 配置（如果使用 Docker，保持默认即可）
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

### 3. 启动服务

#### 选项 A：使用 Docker（推荐）

```bash
# 启动所有服务（MongoDB + Minio + 应用）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

#### 选项 B：手动启动

```bash
# 1. 启动 MongoDB
mongod

# 2. 启动 Minio（新终端）
# 下载 Minio
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
./minio server ./data --console-address ":9001"

# 3. 初始化应用（新终端）
cd server
npm run init

# 4. 创建管理员账号
npm run create-admin admin admin@example.com admin123

# 5. 启动应用
cd ..
npm run dev
```

### 4. 访问应用

- **前端**: http://localhost:5173
- **管理后台**: http://localhost:5173/admin
- **API**: http://localhost:3000
- **Minio 控制台**: http://localhost:9001

### 5. 登录管理后台

使用创建的管理员账号登录：
- 用户名: `admin`
- 邮箱: `admin@example.com`
- 密码: `admin123`

**⚠️ 重要：首次登录后请立即更改默认密码！**

## 常见问题

### Q: MongoDB 连接失败
```bash
# 检查 MongoDB 是否启动
sudo systemctl status mongod

# 启动 MongoDB
sudo systemctl start mongod
```

### Q: Minio 连接失败
```bash
# 检查 Minio 是否在指定端口运行
netstat -tulpn | grep 9000

# 使用 Docker 启动 Minio
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

### Q: 前端页面无法访问
```bash
# 检查前端开发服务器是否启动
cd client
npm run dev

# 检查端口是否被占用
netstat -tulpn | grep 5173
```

### Q: 无法发送邮件
- 确保邮件配置正确
- 如果使用 Gmail，需要使用应用专用密码
- 临时禁用邮件验证（将用户的 `isEmailVerified` 设为 `true`）

## 生产部署

### 使用 Docker 部署

```bash
# 1. 构建镜像
docker-compose -f docker-compose.prod.yml build

# 2. 启动生产环境
docker-compose -f docker-compose.prod.yml up -d

# 3. 配置反向代理（Nginx/Apache）
# 将域名指向服务器的 80/443 端口
```

### 手动部署

```bash
# 1. 构建前端
cd client
npm run build

# 2. 配置环境变量
export NODE_ENV=production
export MONGODB_URI=mongodb://your-mongo-server/simplenotes
export JWT_SECRET=your-production-secret

# 3. 启动后端
cd server
npm start

# 4. 配置 Web 服务器（Nginx）
# 静态文件指向 client/dist
# API 请求代理到后端端口
```

## 更多信息

- 📖 完整文档：[README.md](README.md)
- 🐛 问题反馈：创建 Issue
- 💬 讨论：Discussions

## 下一步

1. 📝 创建第一篇文档
2. 👥 邀请用户注册
3. 🎨 自定义主题和样式
4. 📊 查看使用统计
5. 🔧 配置邮件服务
6. 🚀 部署到生产环境

恭喜！您已成功安装 SimpleNotes 系统！
