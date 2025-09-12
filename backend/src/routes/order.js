import express from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder
} from "../controllers/orderController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// 所有订单相关路由都需要身份验证
router.use(authenticateToken);

// 获取用户订单列表
router.get("/", getOrders);

// 根据ID获取订单详情
router.get("/:id", getOrderById);

// 创建订单
router.post("/", createOrder);

// 更新订单状态
router.put("/:id/status", updateOrderStatus);

// 取消订单
router.put("/:id/cancel", cancelOrder);

export default router;
