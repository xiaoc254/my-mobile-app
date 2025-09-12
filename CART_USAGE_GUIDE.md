# 购物车功能使用指南

## 功能概述

购物车功能已经完全实现，支持以下操作：

### 1. 添加商品到购物车

**方式一：在商城页面快速添加**

- 进入商城页面 (`/shop`)
- 浏览商品列表
- 点击商品卡片右下角的 "加入购物车" 按钮
- 默认添加数量为 1，规格为"默认规格"

**方式二：在商品详情页面添加**

- 从商城点击商品进入详情页 (`/product/:id`)
- 选择商品规格（如果有多个规格）
- 调整购买数量
- 点击 "加入购物车" 按钮

### 2. 查看购物车

**入口方式：**

- 从商城页面右上角的购物车图标（🛒）
- 从首页快速入口的购物车按钮
- 直接访问 `/cart` 路径

**购物车功能：**

- 查看所有已添加的商品
- 显示商品图片、名称、品牌、价格、规格
- 显示每个商品的数量和小计
- 显示购物车总计金额

### 3. 购物车操作

**数量调整：**

- 使用商品右侧的数量调节器（+/-）
- 最小数量为 1
- 最大数量受商品库存限制

**商品选择：**

- 点击商品左侧的复选框选择/取消选择
- 使用"全选"功能一键选择所有商品
- 只有选中的商品才会参与结算

**删除商品：**

- 向左滑动商品项，点击"删除"按钮
- 或使用购物车页面右上角的"清空"功能

### 4. 购物车状态指示

**商城页面：**

- 购物车图标显示当前商品总数量（Badge 形式）
- 图标颜色为主题色（金色）

**底部结算栏：**

- 显示已选商品数量
- 显示已选商品总金额
- 结算按钮（需要选择商品才能点击）

## 技术实现

### 后端 API

**基础路由：** `/api/cart`

**支持的接口：**

- `GET /api/cart` - 获取购物车
- `POST /api/cart` - 添加商品到购物车
- `PUT /api/cart/items/:itemId` - 更新商品数量
- `PUT /api/cart/items/:itemId/toggle` - 切换商品选中状态
- `DELETE /api/cart/items/:itemId` - 删除单个商品
- `DELETE /api/cart` - 清空购物车
- `PUT /api/cart/toggle-all` - 批量选择/取消选择

### 前端组件

**相关页面：**

- `Cart.tsx` - 购物车主页面
- `Shop.tsx` - 商城页面（包含快速添加功能）
- `Product.tsx` - 商品详情页面
- `Home.tsx` - 首页（包含购物车入口）

**API 服务：**

- `apiz.ts` - 购物车相关 API 调用封装

## 数据模型

### 购物车商品项结构

```typescript
interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productBrand: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  spec: string;
  selected: boolean;
  addedAt: string;
}
```

### 购物车结构

```typescript
interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  selectedAmount: number;
  createdAt: string;
  updatedAt: string;
}
```

## 注意事项

1. **登录要求**：购物车功能需要用户登录，未登录用户会被引导到登录页面

2. **库存检查**：添加商品时会检查库存，库存不足会提示错误

3. **自动计算**：购物车会自动计算总金额和选中商品金额

4. **数据持久化**：购物车数据保存在数据库中，用户重新登录后数据仍然存在

5. **响应式设计**：购物车界面适配移动端，支持滑动删除等手势操作

## 测试建议

1. 使用 `test-cart-api.js` 脚本测试后端 API
2. 在前端测试完整的用户流程：
   - 商城浏览 → 添加商品 → 查看购物车 → 调整数量 → 选择商品
3. 测试边界情况：
   - 未登录状态
   - 库存不足
   - 网络错误处理

## 未来扩展

可以考虑添加以下功能：

- 购物车商品推荐
- 批量操作（批量删除选中商品）
- 购物车分享功能
- 离线购物车支持
- 购物车过期提醒
