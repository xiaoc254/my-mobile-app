import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import "./db.js";
import { config } from "../env.config.js";
import routes from "./routes/index.js";  // ⭐ 引入总路由

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置dotenv从backend目录加载.env文件
dotenv.config({ path: path.join(__dirname, '../.env') });

// 显示当前AI服务配置状态
const currentAIService = process.env.AI_SERVICE || 'openai';
const aiServiceNames = {
  'openai': 'OpenAI (ChatGPT)',
  'zhipu': '智谱AI (ChatGLM)',
  'qwen': '通义千问 (阿里云)',
  'wenxin': '百度文心一言'
};

console.log("AI服务配置状态:");
console.log(`当前使用的AI服务: ${aiServiceNames[currentAIService] || currentAIService}`);

// 显示对应的API Key状态
const apiKeyName = `${currentAIService.toUpperCase()}_API_KEY`;
const apiKey = process.env[apiKeyName];
console.log(`${apiKeyName}存在:`, !!apiKey && apiKey !== 'your-api-key-here');
if (apiKey && apiKey !== 'your-api-key-here') {
  console.log(`${apiKeyName}前缀:`, apiKey.substring(0, 10));
} else {
  console.log(`${apiKeyName}状态: 未配置或使用默认值`);
}
const app = express();

app.use(cors());
app.use(express.json());

// 注册所有路由（包括 ai、auth 等）
app.use("/api", routes);

const PORT = config.PORT;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
