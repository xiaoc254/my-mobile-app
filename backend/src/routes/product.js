import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// 获取商品列表 - 公开接口，不需要认证
router.get("/", getProducts);

// 根据ID获取商品详情 - 公开接口，不需要认证
router.get("/:id", getProductById);

// 以下接口需要管理员权限（暂时使用普通认证，后续可以添加管理员权限检查）
router.use(authenticateToken);

// 创建商品
router.post("/", createProduct);

// 更新商品
router.put("/:id", updateProduct);

// 删除商品
router.delete("/:id", deleteProduct);

export default router;
