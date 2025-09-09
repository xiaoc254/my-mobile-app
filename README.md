# 移动端应用项目

## 项目结构

```
my-mobile-app/
├── frontend/     # React + Vite + TypeScript + Vant UI
├── backend/      # Node.js + Express + MongoDB
└── README.md
```

## 启动步骤

### 1. 安装依赖

```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../frontend
npm install
```

### 2. 配置数据库

确保本地 MongoDB 服务正在运行，或修改 `backend/env.config.js` 中的数据库连接地址。

### 3. 启动服务

**后端服务** (端口 3000):

```bash
cd backend
npm start
```

**前端服务** (端口 5173):

```bash
cd frontend
npm run dev
```

## 功能特性

### 后端 (Express + MongoDB)

- ✅ 用户注册/登录
- ✅ JWT 身份验证
- ✅ 密码加密存储
- ✅ CORS 跨域支持
- ✅ 环境配置管理

### 前端 (React + Vant)

- ✅ 移动端适配
- ✅ 路由导航
- ✅ 底部 Tabbar
- ✅ 页面: 首页、宠物管理、商城、我的、设置、登录
- ✅ HTTP 请求封装
- ✅ 宠物管理界面（暖橙色主题设计）

## API 接口

```
POST /api/auth/register - 用户注册
POST /api/auth/login    - 用户登录
GET  /api/auth/profile  - 获取用户信息 (需要JWT)
PUT  /api/auth/profile  - 更新用户信息 (需要JWT)
PUT  /api/auth/password - 修改密码 (需要JWT)
POST /api/auth/logout   - 退出登录 (需要JWT)
```

## 技术特色

### 🔐 安全认证

- JWT Token 身份验证
- bcrypt 密码加密
- 认证中间件保护

### 📱 移动端优化

- Vant UI 组件库
- lib-flexible 适配方案
- 触摸友好的交互设计
- 安全区域适配

### 🏗️ 架构设计

- 前后端分离
- RESTful API 设计
- 模块化代码结构
- TypeScript 类型安全

## 已优化功能

- ✅ 完整的用户认证流程
- ✅ 响应式移动端界面
- ✅ JWT 中间件保护
- ✅ 完善的错误处理
- ✅ 移动端样式优化
- ✅ 代码分离和打包优化

## 页面功能

- 🏠 **首页**: 用户信息展示、状态查看
- 🐾 **宠物管理**: 宠物信息管理、计划提醒、任务跟踪
- 📥 **商城**: 商品浏览、购买功能
- 👤 **我的**: 个人资料、头像、退出登录
- ⚙️ **设置**: 用户名修改、密码修改、应用设置
- 🔐 **登录**: 用户登录、注册新账户

## 宠物管理页面特色

### 🎨 界面设计
- 暖橙色渐变背景主题
- 圆角卡片设计风格
- 温馨的宠物元素图标
- 移动端友好的交互体验

### 📱 功能模块
- **顶部区域**: 猫咪爪子与手指互动图片展示
- **添加宠物**: 醒目的橙色渐变按钮
- **我的宠物**: 现有宠物展示（布丁🐱、雪球🐕）
- **今日计划**: 四个任务项（运动、喂食、日志、体温记录）
- **交互效果**: 按钮悬停动画、卡片阴影效果

### 🔧 技术实现
- TypeScript 类型安全
- 响应式布局设计
- 组件化开发
- 数据驱动渲染
