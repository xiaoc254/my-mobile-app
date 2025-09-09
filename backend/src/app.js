import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import productRouter from "./routes/product.js";
import orderRouter from "./routes/order.js";
import "./db.js"; // MongoDB 连接
import { config } from "../env.config.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

const PORT = config.PORT;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
