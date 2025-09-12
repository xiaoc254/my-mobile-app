import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: {
    type: String,
    required: true
  },
  productBrand: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  spec: {
    type: String,
    default: '默认规格'
  },
  selected: {
    type: Boolean,
    default: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  selectedAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 计算购物车总计
cartSchema.methods.calculateTotals = function() {
  this.totalItems = this.items.length;
  this.totalAmount = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.selectedAmount = this.items
    .filter(item => item.selected)
    .reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return this;
};

// 更新时自动设置 updatedAt 和重新计算总计
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.calculateTotals();
  next();
});

cartSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// 添加商品到购物车的静态方法
cartSchema.statics.addItem = async function(userId, itemData) {
  let cart = await this.findOne({ userId });

  if (!cart) {
    // 如果购物车不存在，创建新的购物车
    cart = new this({
      userId,
      items: [itemData]
    });
  } else {
    // 检查商品是否已存在
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === itemData.productId.toString() &&
               item.spec === itemData.spec
    );

    if (existingItemIndex >= 0) {
      // 如果商品已存在，增加数量
      cart.items[existingItemIndex].quantity += itemData.quantity;
    } else {
      // 如果商品不存在，添加新项目
      cart.items.push(itemData);
    }
  }

  return await cart.save();
};

// 更新商品数量的静态方法
cartSchema.statics.updateItemQuantity = async function(userId, itemId, quantity) {
  const cart = await this.findOne({ userId });
  if (!cart) throw new Error('购物车不存在');

  const item = cart.items.id(itemId);
  if (!item) throw new Error('商品不存在');

  if (quantity <= 0) {
    cart.items.pull(itemId);
  } else {
    item.quantity = quantity;
  }

  return await cart.save();
};

// 切换商品选中状态的静态方法
cartSchema.statics.toggleItemSelection = async function(userId, itemId, selected) {
  const cart = await this.findOne({ userId });
  if (!cart) throw new Error('购物车不存在');

  const item = cart.items.id(itemId);
  if (!item) throw new Error('商品不存在');

  item.selected = selected;
  return await cart.save();
};

// 移除商品的静态方法
cartSchema.statics.removeItem = async function(userId, itemId) {
  const cart = await this.findOne({ userId });
  if (!cart) throw new Error('购物车不存在');

  cart.items.pull(itemId);
  return await cart.save();
};

// 清空购物车的静态方法
cartSchema.statics.clearCart = async function(userId) {
  const cart = await this.findOne({ userId });
  if (!cart) throw new Error('购物车不存在');

  cart.items = [];
  return await cart.save();
};

export const Cart = mongoose.model('Cart', cartSchema);
export const CartItem = mongoose.model('CartItem', cartItemSchema);
