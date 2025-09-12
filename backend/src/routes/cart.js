import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  toggleCartItem,
  removeFromCart,
  clearCart,
  toggleAllItems
} from "../controllers/cartController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// 所有购物车相关路由都需要身份验证
router.use(authenticateToken);

// 获取购物车
router.get("/", getCart);

// 添加商品到购物车
router.post("/", addToCart);

// 更新购物车商品数量
router.put("/items/:itemId", updateCartItem);

// 切换商品选中状态
router.put("/items/:itemId/toggle", toggleCartItem);

// 从购物车移除商品
router.delete("/items/:itemId", removeFromCart);

// 清空购物车
router.delete("/", clearCart);

// 批量选中/取消选中
router.put("/toggle-all", toggleAllItems);

export default router;
