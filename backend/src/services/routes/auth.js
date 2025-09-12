import express from "express";
import {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword,
  logout
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// 公开路由
router.post("/register", register);
router.post("/login", login);

// 需要认证的路由
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.put("/password", authenticateToken, changePassword);
router.post("/logout", authenticateToken, logout);

export default router;
