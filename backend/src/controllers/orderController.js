import Order from '../modules/order.js';
import Product from '../modules/product.js';

// 创建订单
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, remark } = req.body;
    const userId = req.user?.id || '507f1f77bcf86cd799439011'; // 临时用户ID，实际应从JWT获取
    
    // 计算总价和验证商品
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `商品 ${item.productId} 不存在` });
      }
      
      const orderItem = {
        productId: item.productId,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity: item.quantity,
        spec: item.spec || ''
      };
      
      totalAmount += product.price * item.quantity;
      orderItems.push(orderItem);
    }
    
    const order = new Order({
      userId,
      items: orderItems,
      totalAmount,
      shopName: '萌宠宠物', // 默认商店名
      shippingAddress,
      paymentMethod,
      remark
    });
    
    await order.save();
    
    res.status(201).json({
      success: true,
      data: order,
      message: '订单创建成功'
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({ 
      success: false,
      message: '创建订单失败', 
      error: error.message 
    });
  }
};

// 获取用户订单列表
const getOrders = async (req, res) => {
  try {
    const userId = req.user?.id || '507f1f77bcf86cd799439011'; // 临时用户ID
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { userId };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('items.productId', 'name images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        orders,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({ 
      success: false,
      message: '获取订单列表失败', 
      error: error.message 
    });
  }
};

// 获取单个订单详情
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || '507f1f77bcf86cd799439011';
    
    const order = await Order.findOne({ _id: id, userId })
      .populate('items.productId', 'name images price description');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: '订单不存在' 
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({ 
      success: false,
      message: '获取订单详情失败', 
      error: error.message 
    });
  }
};

// 更新订单状态
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id || '507f1f77bcf86cd799439011';
    
    const validStatuses = ['pending', 'paid', 'pending_shipment', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: '无效的订单状态' 
      });
    }
    
    const order = await Order.findOneAndUpdate(
      { _id: id, userId },
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: '订单不存在' 
      });
    }
    
    res.json({
      success: true,
      data: order,
      message: '订单状态更新成功'
    });
  } catch (error) {
    console.error('更新订单状态失败:', error);
    res.status(500).json({ 
      success: false,
      message: '更新订单状态失败', 
      error: error.message 
    });
  }
};

// 取消订单
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || '507f1f77bcf86cd799439011';
    
    const order = await Order.findOne({ _id: id, userId });
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: '订单不存在' 
      });
    }
    
    if (order.status !== 'pending' && order.status !== 'paid') {
      return res.status(400).json({ 
        success: false,
        message: '该订单状态不能取消' 
      });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.json({
      success: true,
      data: order,
      message: '订单取消成功'
    });
  } catch (error) {
    console.error('取消订单失败:', error);
    res.status(500).json({ 
      success: false,
      message: '取消订单失败', 
      error: error.message 
    });
  }
};

export {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
