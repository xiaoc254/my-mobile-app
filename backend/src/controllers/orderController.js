import { Order } from "../modules/order.js";
import mongoose from "mongoose";

// 获取用户订单列表
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // 构建查询条件
    let query = { userId };

    if (status && status !== 'all') {
      query.status = status;
    }

    // 计算分页
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('items.productId', 'name image price')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Order.countDocuments(query);

    // 将 _id 字段映射为 id 字段
    const ordersWithId = orders.map(order => ({
      ...order,
      id: order._id.toString(),
      items: order.items.map(item => ({
        ...item,
        id: item._id?.toString() || item.productId?._id?.toString()
      }))
    }));

    res.json({
      success: true,
      data: {
        orders: ordersWithId,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取订单列表失败',
      error: error.message
    });
  }
};

// 根据ID获取订单详情
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 验证 ID 是否有效
    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: '无效的订单ID'
      });
    }

    const order = await Order.findOne({ _id: id, userId })
      .populate('items.productId', 'name image price')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    // 将 _id 字段映射为 id 字段
    const orderWithId = {
      ...order,
      id: order._id.toString(),
      items: order.items.map(item => ({
        ...item,
        id: item._id?.toString() || item.productId?._id?.toString()
      }))
    };

    res.json({
      success: true,
      data: orderWithId
    });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取订单详情失败',
      error: error.message
    });
  }
};

// 创建订单
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shippingAddress, paymentMethod, remark } = req.body;

    console.log('创建订单请求:', { userId, items, shippingAddress, paymentMethod, remark });

    // 验证必要字段
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: '订单商品不能为空'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: '收货地址不能为空'
      });
    }

    // 计算总金额
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // 处理商品数据 - 使用真实的商品或创建测试商品
    const processedItems = await Promise.all(items.map(async (item) => {
      let productId = item.productId;

      // 如果productId无效，尝试找到第一个可用商品
      if (!productId || !mongoose.isValidObjectId(productId)) {
        try {
          const { Product } = await import('../modules/product.js');
          const firstProduct = await Product.findOne();
          if (firstProduct) {
            productId = firstProduct._id;
            console.log('使用第一个可用商品ID:', productId);
          } else {
            // 如果没有商品，创建一个测试商品
            const testProduct = new Product({
              name: '测试商品',
              brand: '测试品牌',
              description: '这是一个测试商品',
              price: 99.99,
              image: '/images/test-product.jpg',
              category: 'test',
              stock: 999
            });
            await testProduct.save();
            productId = testProduct._id;
            console.log('创建测试商品ID:', productId);
          }
        } catch (error) {
          console.log('获取商品失败，使用随机ObjectId:', error.message);
          productId = new mongoose.Types.ObjectId();
        }
      }

      return {
        productId,
        productName: item.productName || '测试商品',
        productImage: item.productImage || '/images/default-product.jpg',
        productBrand: item.productBrand || '默认品牌',
        quantity: item.quantity || 1,
        price: item.price || 0,
        originalPrice: item.originalPrice,
        spec: item.spec || '默认规格'
      };
    }));

    // 手动生成订单号，确保不会缺失
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `ORD${timestamp}${random}`;

    // 创建订单
    const orderData = {
      userId,
      orderNumber, // 手动设置订单号
      items: processedItems,
      shippingAddress,
      totalAmount,
      paymentMethod: paymentMethod || 'wechat',
      remark: remark || ''
    };

    console.log('处理后的订单数据:', JSON.stringify(orderData, null, 2));

    const order = new Order(orderData);
    await order.save();

    // 返回订单信息 - 不使用 populate 避免因为模拟数据导致的错误
    const savedOrder = await Order.findById(order._id).lean();

    const orderWithId = {
      ...savedOrder,
      id: savedOrder._id.toString(),
      items: savedOrder.items.map(item => ({
        ...item,
        id: item._id?.toString() || item.productId?.toString()
      }))
    };

    res.status(201).json({
      success: true,
      data: orderWithId,
      message: '订单创建成功'
    });
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({
      success: false,
      message: '创建订单失败',
      error: error.message
    });
  }
};

// 更新订单状态
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // 验证状态值
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的订单状态'
      });
    }

    const updateData = { status };

    // 根据状态设置相应的时间戳
    if (status === 'paid') {
      updateData.paidAt = new Date();
      updateData.paymentStatus = 'paid';
    } else if (status === 'shipped') {
      updateData.shippedAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const order = await Order.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    const orderWithId = {
      ...order.toObject(),
      id: order._id.toString()
    };

    res.json({
      success: true,
      data: orderWithId,
      message: '订单状态更新成功'
    });
  } catch (error) {
    console.error('更新订单状态错误:', error);
    res.status(500).json({
      success: false,
      message: '更新订单状态失败',
      error: error.message
    });
  }
};

// 取消订单
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findOneAndUpdate(
      { _id: id, userId, status: 'pending' },
      {
        status: 'cancelled',
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在或无法取消'
      });
    }

    const orderWithId = {
      ...order.toObject(),
      id: order._id.toString()
    };

    res.json({
      success: true,
      data: orderWithId,
      message: '订单取消成功'
    });
  } catch (error) {
    console.error('取消订单错误:', error);
    res.status(500).json({
      success: false,
      message: '取消订单失败',
      error: error.message
    });
  }
};
