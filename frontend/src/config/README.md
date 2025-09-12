# 第三方登录配置指南

## 🚀 快速开始

### 1. 环境变量配置

复制 `.env.example` 文件为 `.env` 并配置真实的第三方登录信息：

```bash
# QQ登录配置
VITE_QQ_APP_ID=你的QQ_APP_ID
VITE_QQ_APP_KEY=你的QQ_APP_KEY

# 微信登录配置  
VITE_WECHAT_APP_ID=你的微信_APP_ID
VITE_WECHAT_APP_SECRET=你的微信_APP_SECRET

# 微博登录配置
VITE_WEIBO_APP_KEY=你的微博_APP_KEY
VITE_WEIBO_APP_SECRET=你的微博_APP_SECRET
```

### 2. 获取第三方应用配置

#### QQ互联开放平台
1. 访问：https://connect.qq.com/
2. 注册开发者账号
3. 创建网站应用
4. 获取 APP ID 和 APP Key
5. 配置回调地址：`http://localhost:3000/qq-callback`

#### 微信开放平台
1. 访问：https://open.weixin.qq.com/
2. 注册开发者账号
3. 创建网站应用
4. 获取 AppID 和 AppSecret
5. 配置授权回调域：`localhost:3000`

#### 微博开放平台
1. 访问：https://open.weibo.com/
2. 注册开发者账号
3. 创建网站应用
4. 获取 App Key 和 App Secret
5. 配置回调地址：`http://localhost:3000/weibo-callback`

## 📁 项目结构

```
frontend/src/
├── config/
│   ├── thirdPartyAuth.ts     # 第三方登录配置
│   └── README.md             # 配置说明文档
├── services/
│   └── authService.ts        # 登录服务类
├── pages/
│   ├── Login.tsx            # 登录页面
│   └── AuthCallback.tsx     # 第三方登录回调页面
└── route/
    └── route.tsx            # 路由配置（已添加回调路由）
```

## 🔧 配置说明

### thirdPartyAuth.ts
- 统一管理所有第三方登录配置
- 支持环境变量动态配置
- 提供URL生成和平台信息

### authService.ts
- 处理第三方登录的完整流程
- 管理用户登录状态
- 提供统一的登录接口

### AuthCallback.tsx
- 处理所有第三方登录的回调
- 统一的加载和错误处理界面
- 自动跳转功能

## 🎯 使用方式

### 在组件中使用
```tsx
import { authService } from '../services/authService';

// 发起第三方登录
const handleLogin = (platform: 'qq' | 'wechat' | 'weibo') => {
  authService.initiateThirdPartyLogin(platform);
};

// 检查登录状态
const isLoggedIn = authService.isLoggedIn();
const userInfo = authService.getSavedUserInfo();
```

## 🛡️ 安全考虑

### CSRF保护
- 使用state参数防止CSRF攻击
- 回调时验证state参数

### Token管理
- 安全存储access_token
- 自动处理token过期

### 错误处理
- 完善的错误捕获和提示
- 自动重试和降级处理

## 🔄 登录流程

### 完整流程
1. 用户点击第三方登录按钮
2. 跳转到第三方授权页面
3. 用户授权后回调到应用
4. 获取授权码并换取token
5. 获取用户信息
6. 保存登录状态
7. 跳转到应用首页

### 回调路由
- `/qq-callback` - QQ登录回调
- `/wechat-callback` - 微信登录回调  
- `/weibo-callback` - 微博登录回调

## 📝 注意事项

1. **域名配置**：确保回调地址与开放平台配置一致
2. **HTTPS要求**：生产环境需要使用HTTPS
3. **跨域处理**：可能需要配置代理或CORS
4. **错误处理**：完善的错误提示和用户引导
5. **状态管理**：正确管理登录状态和用户信息

## 🚀 部署配置

### 开发环境
```bash
VITE_APP_BASE_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:5000
```

### 生产环境
```bash
VITE_APP_BASE_URL=https://your-domain.com
VITE_API_BASE_URL=https://your-api-domain.com
```

## 🔍 调试模式

设置 `VITE_MOCK_LOGIN=true` 可以启用模拟登录模式，方便开发调试。
