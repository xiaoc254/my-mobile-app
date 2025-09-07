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

console.log("环境变量加载状态:");
console.log("OPENAI_API_KEY存在:", !!process.env.OPENAI_API_KEY);
console.log("OPENAI_API_KEY前缀:", process.env.OPENAI_API_KEY?.substring(0, 10));
const app = express();

app.use(cors());
app.use(express.json());

// 注册所有路由（包括 ai、auth 等）
app.use("/api", routes);

const PORT = config.PORT;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
