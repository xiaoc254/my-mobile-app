import mongoose from 'mongoose';
import Order from './modules/order.js';
import Product from './modules/product.js';
import { config } from '../env.config.js';

// 连接数据库
mongoose.connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const seedOrderData = async () => {
    try {
        // 清除现有订单数据
        await Order.deleteMany({});
        console.log('已清除现有订单数据');

        // 获取商品数据用于创建订单
        const products = await Product.find({}).limit(6);

        if (products.length === 0) {
            console.log('请先运行商品种子数据: npm run seed');
            process.exit(1);
        }

        console.log('找到商品:', products.length, '个');

        // 模拟用户ID
        const userId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');

        const sampleOrders = [
            {
                orderNumber: "202312150001",
                userId,
                status: "pending",
                totalAmount: products[0].specs[0].price,
                shopName: "萌宠宠物",
                items: [{
                    productId: products[0]._id,
                    name: products[0].name,
                    image: products[0].images[0],
                    price: products[0].specs[0].price,
                    quantity: 1,
                    spec: products[0].specs[0].name
                }],
                shippingAddress: {
                    name: "张三",
                    phone: "13800138001",
                    address: "朝阳区某某街道123号",
                    city: "北京市",
                    province: "北京市",
                    postalCode: "100000"
                },
                paymentMethod: "alipay"
            },
            {
                orderNumber: "202312140002",
                userId,
                status: "pending_shipment",
                totalAmount: products[1].specs[0].price,
                shopName: "宠物之家",
                items: [{
                    productId: products[1]._id,
                    name: products[1].name,
                    image: products[1].images[0],
                    price: products[1].specs[0].price,
                    quantity: 1,
                    spec: products[1].specs[0].name
                }],
                shippingAddress: {
                    name: "李四",
                    phone: "13800138002",
                    address: "海淀区某某路456号",
                    city: "北京市",
                    province: "北京市",
                    postalCode: "100001"
                },
                paymentMethod: "wechat"
            },
            {
                orderNumber: "202312130003",
                userId,
                status: "delivered",
                totalAmount: products[2].specs[0].price,
                shopName: "纯野兔全粮",
                items: [{
                    productId: products[2]._id,
                    name: products[2].name,
                    image: products[2].images[0],
                    price: products[2].specs[0].price,
                    quantity: 1,
                    spec: products[2].specs[0].name
                }],
                shippingAddress: {
                    name: "王五",
                    phone: "13800138003",
                    address: "西城区某某胡同789号",
                    city: "北京市",
                    province: "北京市",
                    postalCode: "100002"
                },
                paymentMethod: "alipay"
            },
            {
                orderNumber: "202312120004",
                userId,
                status: "shipped",
                totalAmount: products[3].specs[0].price,
                shopName: "萌宠宠物",
                items: [{
                    productId: products[3]._id,
                    name: products[3].name,
                    image: products[3].images[0],
                    price: products[3].specs[0].price,
                    quantity: 1,
                    spec: products[3].specs[0].name
                }],
                shippingAddress: {
                    name: "赵六",
                    phone: "13800138004",
                    address: "东城区某某大街101号",
                    city: "北京市",
                    province: "北京市",
                    postalCode: "100003"
                },
                paymentMethod: "card"
            }
        ];

        // 插入订单数据
        const createdOrders = await Order.insertMany(sampleOrders);
        console.log(`成功插入 ${createdOrders.length} 个订单`);

        // 显示插入的订单信息
        createdOrders.forEach(order => {
            console.log(`订单号: ${order.orderNumber}, 状态: ${order.status}, 金额: ¥${order.totalAmount}`);
        });

    } catch (error) {
        console.error('插入订单数据失败:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedOrderData();
