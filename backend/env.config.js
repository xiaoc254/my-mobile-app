// 环境配置文件
import dotenv from "dotenv";
dotenv.config();
export const config = {
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/mobile-app",
  JWT_SECRET: process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production",
  PORT: process.env.PORT || 3000,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY
};
