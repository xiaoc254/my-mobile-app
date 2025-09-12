import { Cart } from "../modules/cart.js";
import { Product } from "../modules/product.js";

// 获取用户购物车
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId }).populate('items.productId', 'name image price originalPrice stock');

    if (!cart) {
      // 如果购物车不存在，创建一个空的购物车
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    // 将 _id 字段映射为 id 字段
    const cartWithId = {
      ...cart.toObject(),
      id: cart._id.toString(),
      items: cart.items.map(item => ({
        ...item.toObject(),
        id: item._id.toString()
      }))
    };

    res.json({
      success: true,
      data: cartWithId
    });
  } catch (error) {
    console.error('获取购物车错误:', error);
    res.status(500).json({
      success: false,
      message: '获取购物车失败',
      error: error.message
    });
  }
};

// 添加商品到购物车
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1, spec = '默认规格' } = req.body;

    // 验证必要字段
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: '商品ID不能为空'
      });
    }

    // 验证商品是否存在
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    // 检查库存
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: '库存不足'
      });
    }

    // 准备购物车项目数据
    const itemData = {
      productId: product._id,
      productName: product.name,
      productImage: product.image,
      productBrand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: parseInt(quantity),
      spec
    };

    // 添加到购物车
    const cart = await Cart.addItem(userId, itemData);

    // 重新获取更新后的购物车数据
    const updatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name image price originalPrice stock');

    const cartWithId = {
      ...updatedCart.toObject(),
      id: updatedCart._id.toString(),
      items: updatedCart.items.map(item => ({
        ...item.toObject(),
        id: item._id.toString()
      }))
    };

    res.json({
      success: true,
      data: cartWithId,
      message: '商品已添加到购物车'
    });
  } catch (error) {
    console.error('添加到购物车错误:', error);
    res.status(500).json({
      success: false,
      message: '添加到购物车失败',
      error: error.message
    });
  }
};

// 更新购物车商品数量
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: '数量必须大于0'
      });
    }

    const cart = await Cart.updateItemQuantity(userId, itemId, parseInt(quantity));

    // 重新获取更新后的购物车数据
    const updatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name image price originalPrice stock');

    const cartWithId = {
      ...updatedCart.toObject(),
      id: updatedCart._id.toString(),
      items: updatedCart.items.map(item => ({
        ...item.toObject(),
        id: item._id.toString()
      }))
    };

    res.json({
      success: true,
      data: cartWithId,
      message: '购物车已更新'
    });
  } catch (error) {
    console.error('更新购物车错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '更新购物车失败',
      error: error.message
    });
  }
};

// 切换商品选中状态
export const toggleCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { selected } = req.body;

    const cart = await Cart.toggleItemSelection(userId, itemId, selected);

    // 重新获取更新后的购物车数据
    const updatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name image price originalPrice stock');

    const cartWithId = {
      ...updatedCart.toObject(),
      id: updatedCart._id.toString(),
      items: updatedCart.items.map(item => ({
        ...item.toObject(),
        id: item._id.toString()
      }))
    };

    res.json({
      success: true,
      data: cartWithId,
      message: '选中状态已更新'
    });
  } catch (error) {
    console.error('切换商品选中状态错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '更新失败',
      error: error.message
    });
  }
};

// 从购物车移除商品
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await Cart.removeItem(userId, itemId);

    // 重新获取更新后的购物车数据
    const updatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name image price originalPrice stock');

    const cartWithId = {
      ...updatedCart.toObject(),
      id: updatedCart._id.toString(),
      items: updatedCart.items.map(item => ({
        ...item.toObject(),
        id: item._id.toString()
      }))
    };

    res.json({
      success: true,
      data: cartWithId,
      message: '商品已从购物车移除'
    });
  } catch (error) {
    console.error('移除购物车商品错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '移除失败',
      error: error.message
    });
  }
};

// 清空购物车
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.clearCart(userId);

    const cartWithId = {
      ...cart.toObject(),
      id: cart._id.toString(),
      items: []
    };

    res.json({
      success: true,
      data: cartWithId,
      message: '购物车已清空'
    });
  } catch (error) {
    console.error('清空购物车错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '清空购物车失败',
      error: error.message
    });
  }
};

// 批量选中/取消选中
export const toggleAllItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const { selected } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: '购物车不存在'
      });
    }

    // 更新所有商品的选中状态
    cart.items.forEach(item => {
      item.selected = selected;
    });

    await cart.save();

    // 重新获取更新后的购物车数据
    const updatedCart = await Cart.findOne({ userId }).populate('items.productId', 'name image price originalPrice stock');

    const cartWithId = {
      ...updatedCart.toObject(),
      id: updatedCart._id.toString(),
      items: updatedCart.items.map(item => ({
        ...item.toObject(),
        id: item._id.toString()
      }))
    };

    res.json({
      success: true,
      data: cartWithId,
      message: selected ? '已全选' : '已取消全选'
    });
  } catch (error) {
    console.error('批量选中/取消选中错误:', error);
    res.status(500).json({
      success: false,
      message: '操作失败',
      error: error.message
    });
  }
};
