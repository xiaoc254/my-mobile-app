# 环境变量配置指南

## 🔧 后端环境变量配置

在 `backend/` 目录下创建 `.env` 文件，包含以下配置：

```bash
# 数据库配置
MONGO_URI=mongodb://localhost:27017/mobile-app

# JWT密钥 - 必须设置！请使用以下命令生成安全密钥：
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 服务器端口
PORT=3000

# AI服务配置
AI_SERVICE=zhipu

# OpenAI配置
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# 智谱AI配置（支持图片分析）
ZHIPU_API_KEY=your-zhipu-api-key
ZHIPU_MODEL=glm-4v-plus

# 通义千问配置（支持图片分析）
QWEN_API_KEY=your-qwen-api-key
QWEN_MODEL=qwen-vl-plus

# 百度文心一言配置（支持图片分析）
WENXIN_API_KEY=your-wenxin-api-key
WENXIN_SECRET_KEY=your-wenxin-secret-key
WENXIN_MODEL=ERNIE-4.0-Vision-8K

# 网络代理配置（如需要）
PROXY=

# 环境配置
NODE_ENV=development
```

## 🌐 前端环境变量配置

在 `frontend/` 目录下创建 `.env` 文件，包含以下配置：

```bash
# 前端环境变量配置

# API服务地址（生产环境时配置）
VITE_API_URL=/api

# 图片服务地址（生产环境时配置）
VITE_IMAGE_BASE_URL=

# 第三方登录配置
# QQ登录配置
VITE_QQ_APP_ID=your-qq-app-id
VITE_QQ_APP_KEY=your-qq-app-key

# 微信登录配置
VITE_WECHAT_APP_ID=your-wechat-app-id
VITE_WECHAT_APP_SECRET=your-wechat-app-secret

# 微博登录配置
VITE_WEIBO_APP_KEY=your-weibo-app-key
VITE_WEIBO_APP_SECRET=your-weibo-app-secret

# 应用环境
NODE_ENV=development
```

## 🔐 安全注意事项

1. **永远不要提交 `.env` 文件到版本控制系统**
2. **生产环境必须使用安全的 JWT_SECRET**
3. **所有 API 密钥都应该从对应的服务商官方获取**
4. **生产环境建议使用环境变量或密钥管理服务**

## 🚀 快速开始

1. 复制上述配置到对应的 `.env` 文件
2. 替换所有 `your-*` 占位符为实际的配置值
3. 生成安全的 JWT 密钥：
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
4. 重启应用服务

## 📋 第三方服务申请

### QQ 互联

- 访问：https://connect.qq.com/
- 获取 APP ID 和 APP Key

### 微信开放平台

- 访问：https://open.weixin.qq.com/
- 获取 AppID 和 AppSecret

### AI 服务

- **智谱 AI**: https://open.bigmodel.cn/
- **通义千问**: https://dashscope.aliyun.com/
- **OpenAI**: https://platform.openai.com/
- **百度文心**: https://cloud.baidu.com/product/wenxinworkshop
