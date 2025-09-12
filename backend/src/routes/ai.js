import express from "express";
import { getAIResponse } from "../controllers/aiController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// AI 聊天接口 - 需要认证
router.post("/", authenticateToken, getAIResponse);

export default router;
