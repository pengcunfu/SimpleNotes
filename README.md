# SimpleNotes - Markdown 文档管理系统

一个基于 Vue 3 + Node.js + MongoDB + Minio 的现代化 Markdown 文档管理系统。

## 功能特性

### 核心功能
- 📝 **Markdown 编辑与预览** - 支持完整的 Markdown 语法和实时预览
- 👥 **用户管理** - 用户注册、登录、邮箱验证
- 🔐 **权限控制** - 普通用户和管理员角色区分
- 📚 **文档管理** - 文档的增删改查、分类、标签
- 📁 **文件存储** - 基于 Minio 的分布式文件存储
- 🔍 **搜索功能** - 全文搜索和筛选

### 技术特性
- 🎨 **现代化 UI** - 基于 Element Plus 的响应式设计
- 🌙 **暗色模式** - 支持明暗主题切换
- 📱 **移动端适配** - 完全响应式设计
- ⚡ **高性能** - 服务端渲染和客户端优化
- 🔒 **安全可靠** - JWT 认证、数据验证、XSS 防护

## 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Element Plus** - Vue 3 组件库
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Axios** - HTTP 客户端
- **Marked** - Markdown 解析
- **Highlight.js** - 代码高亮
- **Vite** - 构建工具

### 后端
- **Node.js** - JavaScript 运行时
- **Express** - Web 框架
- **MongoDB** - NoSQL 数据库
- **Mongoose** - MongoDB 对象建模
- **JWT** - 身份认证
- **Bcrypt** - 密码加密
- **Nodemailer** - 邮件服务
- **Multer** - 文件上传
- **Helmet** - 安全中间件

### 存储
- **Minio** - 对象存储服务
- **MongoDB** - 数据存储

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- MongoDB >= 4.4
- Minio 服务器

### 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或者分别安装
npm install
cd server && npm install
cd ../client && npm install
```

### 环境配置

1. 复制服务器配置文件：
```bash
cp server/config.env server/.env
```

2. 修改 `server/.env` 配置：
```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/simplenotes

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 邮件配置
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Minio 配置
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=simplenotes-files
MINIO_USE_SSL=false

# 前端地址
FRONTEND_URL=http://localhost:5173
```

### 启动服务

#### 使用 Docker Compose（推荐）

```bash
# 启动所有服务（MongoDB + Minio + 应用）
docker-compose up -d
```

#### 手动启动

1. **启动 MongoDB**
```bash
mongod
```

2. **启动 Minio**
```bash
# 下载并启动 Minio
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
./minio server ./data --console-address ":9001"
```

3. **启动应用**
```bash
# 开发模式（同时启动前后端）
npm run dev

# 或者分别启动
npm run server:dev  # 启动后端服务器
npm run client:dev  # 启动前端开发服务器
```

### 访问应用

- **前端应用**: http://localhost:5173
- **后端 API**: http://localhost:3000
- **Minio 控制台**: http://localhost:9001

### 默认管理员账号

首次启动后，您需要注册一个账号，然后手动在数据库中将该用户的 `role` 字段设置为 `admin`。

## 部署

### 生产环境部署

1. **构建前端应用**
```bash
cd client
npm run build
```

2. **配置环境变量**
```bash
# 设置生产环境配置
export NODE_ENV=production
export MONGODB_URI=mongodb://your-mongodb-server/simplenotes
export JWT_SECRET=your-production-jwt-secret
# ... 其他环境变量
```

3. **启动生产服务器**
```bash
cd server
npm start
```

### Docker 部署

```bash
# 构建镜像
docker build -t simplenotes .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://mongo:27017/simplenotes \
  -e JWT_SECRET=your-jwt-secret \
  --name simplenotes \
  simplenotes
```

## API 文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/verify-email` - 邮箱验证
- `POST /api/auth/forgot-password` - 忘记密码
- `POST /api/auth/reset-password` - 重置密码

### 文档相关
- `GET /api/documents` - 获取文档列表
- `GET /api/documents/:slug` - 获取文档详情
- `POST /api/documents` - 创建文档（管理员）
- `PUT /api/documents/:id` - 更新文档（管理员）
- `DELETE /api/documents/:id` - 删除文档（管理员）

### 用户相关
- `GET /api/users` - 获取用户列表（管理员）
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id` - 更新用户信息
- `DELETE /api/users/:id` - 删除用户（管理员）

### 文件上传
- `POST /api/upload/single` - 单文件上传（管理员）
- `POST /api/upload/multiple` - 多文件上传（管理员）
- `POST /api/upload/image` - 图片上传（管理员）
- `POST /api/upload/markdown` - Markdown 文件上传（管理员）

## 目录结构

```
SimpleNotes/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── views/         # 页面
│   │   ├── stores/        # 状态管理
│   │   ├── utils/         # 工具函数
│   │   ├── router/        # 路由配置
│   │   └── styles/        # 样式文件
│   ├── public/            # 静态资源
│   └── package.json
├── server/                # 后端应用
│   ├── routes/           # 路由
│   ├── models/           # 数据模型
│   ├── middleware/       # 中间件
│   ├── utils/            # 工具函数
│   ├── config.env        # 配置文件
│   ├── index.js          # 入口文件
│   └── package.json
├── docker-compose.yml    # Docker 编排
├── Dockerfile           # Docker 镜像
└── README.md           # 项目说明
```

## 开发指南

### 前端开发

1. **组件开发**
   - 使用 Vue 3 Composition API
   - 遵循 Element Plus 设计规范
   - 组件命名使用 PascalCase

2. **状态管理**
   - 使用 Pinia 进行状态管理
   - 按功能模块划分 store

3. **样式开发**
   - 使用 CSS 变量支持主题切换
   - 遵循响应式设计原则

### 后端开发

1. **API 设计**
   - 遵循 RESTful 设计原则
   - 使用统一的响应格式
   - 完善的错误处理

2. **数据库设计**
   - 使用 Mongoose 进行数据建模
   - 合理的索引设计
   - 数据验证和约束

3. **安全性**
   - JWT 身份认证
   - 输入验证和清理
   - 防止常见安全漏洞

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如果您觉得这个项目有用，请给它一个 ⭐️！

如果您有任何问题或建议，请创建一个 [Issue](https://github.com/your-username/simplenotes/issues)。