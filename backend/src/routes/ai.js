import express from "express";
import { getAIResponse, analyzeVoice, analyzeVideo, uploadVideo } from "../controllers/aiController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// AI 聊天接口 - 需要认证
router.post("/", authenticateToken, getAIResponse);

// 声音分析接口 - 需要认证
router.post("/voice-analysis", authenticateToken, analyzeVoice);

// 视频分析接口 - 需要认证
router.post("/video-analysis", authenticateToken, uploadVideo, analyzeVideo);

export default router;
