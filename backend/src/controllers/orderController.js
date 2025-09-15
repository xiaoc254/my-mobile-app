import { Order } from "../modules/order.js";
import mongoose from "mongoose";

// 辅助函数：格式化订单数据
const formatOrderResponse = (order) => {
  return {
    ...order,
    id: order._id.toString(),
    items: order.items.map(item => {
      // 如果商品已被删除，跳过此订单项（不返回无效数据）
      if (!item.productId) {
        console.warn(`订单项包含无效商品引用，将被过滤: ${item._id}`);
        return null; // 返回 null，稍后过滤掉
      }

      // 商品存在的情况
      return {
        ...item,
        id: item._id?.toString() || item.productId._id?.toString(),
        productId: item.productId._id.toString(),
        productName: item.productId.name || item.productName,
        productImage: item.productId.image || item.productImage,
        productBrand: item.productId.brand || item.productBrand || '未知品牌',
        name: item.productId.name || item.productName,
        image: item.productId.image || item.productImage,
        price: item.productId.price || item.price
      };
    }).filter(item => item !== null) // 过滤掉无效的项目
  };
};

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
      .populate('items.productId', 'name image price brand')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    const total = await Order.countDocuments(query);

    // 格式化订单数据
    const ordersWithId = orders.map(order => formatOrderResponse(order));

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
      .populate('items.productId', 'name image price brand')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    // 格式化订单数据
    const orderWithId = formatOrderResponse(order);

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

    // console.log('创建订单请求:', { userId, items, shippingAddress, paymentMethod, remark });

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

    // 先验证商品并计算真实总金额
    const { Product } = await import('../modules/product.js');
    let calculatedTotalAmount = 0;

    // 验证和处理商品数据 - 只使用真实商品数据
    const processedItems = await Promise.all(items.map(async (item) => {
      // 验证商品ID
      if (!item.productId || !mongoose.isValidObjectId(item.productId)) {
        throw new Error(`无效的商品ID: ${item.productId}`);
      }

      // 验证商品是否存在
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`商品不存在: ${item.productId}`);
      }

      // 验证库存
      if (product.stock < item.quantity) {
        throw new Error(`商品 ${product.name} 库存不足，当前库存: ${product.stock}`);
      }

      // 计算真实总金额
      calculatedTotalAmount += product.price * item.quantity;

      // 使用真实商品数据
      return {
        productId: product._id,
        productName: product.name,
        productImage: product.image,
        productBrand: product.brand,
        quantity: item.quantity,
        price: product.price, // 使用商品真实价格
        originalPrice: product.originalPrice,
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
      totalAmount: calculatedTotalAmount, // 使用计算出的真实总金额
      paymentMethod: paymentMethod || 'wechat',
      remark: remark || ''
    };

    // console.log('处理后的订单数据:', JSON.stringify(orderData, null, 2));

    const order = new Order(orderData);
    await order.save();

    // 返回订单信息 - 使用 populate 以保持数据格式一致
    const savedOrder = await Order.findById(order._id)
      .populate('items.productId', 'name image price brand')
      .lean();

    const orderWithId = formatOrderResponse(savedOrder);

    res.status(201).json({
      success: true,
      data: orderWithId,
      message: '订单创建成功'
    });
  } catch (error) {
    // console.error('创建订单错误:', error);
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
    )
    .populate('items.productId', 'name image price brand');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    const orderWithId = formatOrderResponse(order.toObject());

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
    )
    .populate('items.productId', 'name image price brand');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在或无法取消'
      });
    }

    const orderWithId = formatOrderResponse(order.toObject());

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
