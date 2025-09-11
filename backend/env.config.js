// 环境配置文件
import dotenv from "dotenv";
dotenv.config();
export const config = {
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/mobile-app",
  JWT_SECRET: process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production",
  PORT: process.env.PORT || 3000,

  // AI服务配置
  AI_SERVICE: process.env.AI_SERVICE || "zhipu", // openai, zhipu, qwen, wenxin

  // OpenAI配置
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",

  // 智谱AI配置（支持图片分析）
  ZHIPU_API_KEY: process.env.ZHIPU_API_KEY,
  ZHIPU_MODEL: process.env.ZHIPU_MODEL || "glm-4v-plus",

  // 通义千问配置（支持图片分析）
  QWEN_API_KEY: process.env.QWEN_API_KEY,
  QWEN_MODEL: process.env.QWEN_MODEL || "qwen-vl-plus",

  // 百度文心一言配置（支持图片分析）
  WENXIN_API_KEY: process.env.WENXIN_API_KEY,
  WENXIN_SECRET_KEY: process.env.WENXIN_SECRET_KEY,
  WENXIN_MODEL: process.env.WENXIN_MODEL || "ERNIE-4.0-Vision-8K",

  // 网络配置
  PROXY: process.env.PROXY
};
