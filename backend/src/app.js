import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./db.js";
import { config } from "../env.config.js";
import routes from "./routes/index.js";  // ⭐ 引入总路由

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// 注册所有路由（包括 ai、auth 等）
app.use("/api", routes);

const PORT = config.PORT;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
