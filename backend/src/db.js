import mongoose from "mongoose";
import { config } from "../env.config.js";

// 连接MongoDB，添加错误处理
mongoose.connect(config.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
    console.log("尝试使用内存数据库模式...");
    // 如果MongoDB连接失败，我们可以使用内存存储
  });
