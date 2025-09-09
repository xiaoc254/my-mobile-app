import express from "express";
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from "../controllers/productController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// 公开路由 - 不需要认证
router.get("/", getAllProducts);           // 获取商品列表
router.get("/:id", getProductById);        // 获取单个商品详情

// 需要认证的路由 - 管理员功能
router.post("/", authMiddleware, createProduct);      // 创建商品
router.put("/:id", authMiddleware, updateProduct);    // 更新商品
router.delete("/:id", authMiddleware, deleteProduct); // 删除商品

export default router;
