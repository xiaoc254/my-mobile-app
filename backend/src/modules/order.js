import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    spec: {
        type: String,
        default: ''
    }
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'pending_shipment', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    items: [orderItemSchema],
    shopName: {
        type: String,
        required: true
    },
    shippingAddress: {
        name: String,
        phone: String,
        address: String,
        city: String,
        province: String,
        postalCode: String
    },
    paymentMethod: {
        type: String,
        enum: ['alipay', 'wechat', 'card'],
        default: 'alipay'
    },
    remark: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// 生成订单号
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const date = new Date();
        const dateStr = date.getFullYear().toString() +
            (date.getMonth() + 1).toString().padStart(2, '0') +
            date.getDate().toString().padStart(2, '0');

        // 查找当天最后一个订单号
        const lastOrder = await mongoose.model('Order').findOne({
            orderNumber: new RegExp(`^${dateStr}`)
        }).sort({ orderNumber: -1 });

        let sequence = '0001';
        if (lastOrder) {
            const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
            sequence = (lastSequence + 1).toString().padStart(4, '0');
        }

        this.orderNumber = dateStr + sequence;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
