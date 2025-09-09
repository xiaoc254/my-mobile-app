import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
} from '../controllers/orderController.js';
// import authenticateToken from '../middleware/auth.js'; // 暂时注释，实际使用时取消注释

const router = express.Router();

// 创建订单
router.post('/', createOrder);

// 获取用户订单列表
router.get('/', getOrders);

// 获取单个订单详情
router.get('/:id', getOrderById);

// 更新订单状态
router.put('/:id/status', updateOrderStatus);

// 取消订单
router.put('/:id/cancel', cancelOrder);

export default router;