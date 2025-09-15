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
// 增加请求体大小限制以支持图片上传 (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 配置静态文件服务 - 提供图片访问
app.use('/uploads', express.static(path.join(__dirname, '../public/images')));

// 注册所有路由（包括 ai、auth 等）
app.use("/api", routes);

const PORT = config.PORT;
const HOST = '0.0.0.0'; // 监听所有网络接口
app.listen(PORT, HOST, () => {
  console.log(`Server running at:`);
  console.log(`  - Local:   http://localhost:${PORT}`);
  console.log(`  - Network: http://172.20.10.2:${PORT}`);
  console.log(`  - All interfaces: http://${HOST}:${PORT}`);
});
