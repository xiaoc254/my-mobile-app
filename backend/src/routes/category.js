import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// 获取分类列表 - 公开接口，不需要认证
router.get("/", getCategories);

// 根据ID获取分类详情 - 公开接口，不需要认证
router.get("/:id", getCategoryById);

// 以下接口需要管理员权限（暂时使用普通认证，后续可以添加管理员权限检查）
router.use(authenticateToken);

// 创建分类
router.post("/", createCategory);

// 更新分类
router.put("/:id", updateCategory);

// 删除分类
router.delete("/:id", deleteCategory);

export default router;
