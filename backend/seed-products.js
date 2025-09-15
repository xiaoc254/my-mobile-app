
import mongoose from 'mongoose';
import { Product } from './src/modules/product.js';
import { config } from './env.config.js';

// 连接数据库
mongoose.connect(config.MONGO_URI);

const sampleProducts = [
  {
    name: "高端猫粮 - 三文鱼口味",
    brand: "皇家宠物",
    description: "专为成年猫咪设计的营养均衡猫粮，含有丰富的三文鱼蛋白质，支持健康的皮毛和消化系统。无添加防腐剂，天然健康。",
    image: "/uploads/9686762819_260695147.310x310.jpg",
    images: [
      "/uploads/9686762819_260695147.310x310.jpg",
      "/uploads/eOlTs0bQZx9zomh9z1ma9g.jpg"
    ],
    price: 128.00,
    originalPrice: 158.00,
    sales: 256,
    rating: 4.8,
    tags: ["猫粮", "三文鱼", "营养", "无添加"],
    category: "food",
    stock: 100,
    specifications: {
      weight: "1.5kg/3kg/6kg可选",
      material: "三文鱼肉、糙米、蔬菜",
      ageRange: "成年猫"
    },
    features: ["高蛋白", "易消化", "亮毛配方", "无防腐剂"],
    isActive: true
  },
  {
    name: "狗狗互动玩具球",
    brand: "宠物乐园",
    description: "智能互动球玩具，内置感应器可自动移动，激发狗狗的运动兴趣和狩猎本能。安全材质制作，耐咬耐玩。",
    image: "/uploads/O1CN01lR6PzC1HFvLsYiPcX_!!737880729.avif",
    images: [
      "/uploads/O1CN01lR6PzC1HFvLsYiPcX_!!737880729.avif",
      "/uploads/O1CN01ltul2t1lwSkhQm10c_!!0-item_pic.avif"
    ],
    price: 89.00,
    originalPrice: 120.00,
    sales: 189,
    rating: 4.5,
    tags: ["狗玩具", "互动", "运动", "智能"],
    category: "toy",
    stock: 50,
    specifications: {
      dimensions: "直径8cm",
      material: "TPR环保材质",
      ageRange: "全年龄段"
    },
    features: ["自动移动", "安全材质", "互动娱乐", "锻炼身体"],
    isActive: true
  },
  {
    name: "宠物专用洗护套装",
    brand: "清洁专家",
    description: "专业宠物洗护用品套装，包含洗发水和护毛素。温和配方不刺激皮肤，适合各种毛发类型的宠物使用。",
    image: "/uploads/O1CN01Vsygzb1WggvVutT8Q_!!0-item_pic.avif",
    images: [
      "/uploads/O1CN01Vsygzb1WggvVutT8Q_!!0-item_pic.avif",
      "/uploads/O1CN01ZKiaUV1U5w8QicmEb_!!3322882467-0-cib.310x310.jpg"
    ],
    price: 68.00,
    originalPrice: 88.00,
    sales: 334,
    rating: 4.6,
    tags: ["洗护", "温和", "护毛", "套装"],
    category: "health",
    stock: 75,
    specifications: {
      weight: "500ml*2瓶",
      material: "天然植物提取物",
      ageRange: "全年龄段"
    },
    features: ["温和配方", "深层清洁", "护毛亮泽", "天然成分"],
    isActive: true
  },
  {
    name: "猫咪抓板玩具",
    brand: "喵星球",
    description: "天然剑麻制作的猫抓板，帮助猫咪磨爪子，保护家具。底座稳固，不易倾倒，附带逗猫棒增加趣味性。",
    image: "/uploads/OIP (4).jpg",
    images: [
      "/uploads/OIP (4).jpg",
      "/uploads/sg-11134201-7rd5o-m6nwi26a7dsq5e.jpg"
    ],
    price: 156.00,
    originalPrice: 198.00,
    sales: 123,
    rating: 4.7,
    tags: ["猫抓板", "磨爪", "天然", "稳固"],
    category: "toy",
    stock: 30,
    specifications: {
      dimensions: "40cm*30cm*60cm",
      material: "天然剑麻+实木",
      ageRange: "全年龄段"
    },
    features: ["天然材质", "稳固底座", "附带玩具", "保护家具"],
    isActive: true
  },
  {
    name: "狗狗营养膏",
    brand: "健康伙伴",
    description: "高营养密度的狗狗营养膏，富含维生素和矿物质。适合幼犬、老年犬及体弱犬只补充营养。口感佳，易吸收。",
    image: "/uploads/9686762819_260695147.310x310.jpg",
    images: [
      "/uploads/9686762819_260695147.310x310.jpg",
      "/uploads/eOlTs0bQZx9zomh9z1ma9g.jpg"
    ],
    price: 45.00,
    originalPrice: 65.00,
    sales: 567,
    rating: 4.4,
    tags: ["营养膏", "维生素", "易吸收", "全犬种"],
    category: "health",
    stock: 200,
    specifications: {
      weight: "120g",
      material: "维生素A/D/E、钙、铁等",
      ageRange: "全年龄段"
    },
    features: ["高营养", "易吸收", "口感好", "全面营养"],
    isActive: true
  },
  {
    name: "宠物自动饮水机",
    brand: "智能生活",
    description: "智能循环过滤饮水机，保持水质新鲜。静音设计，LED指示灯显示工作状态。大容量设计，适合多宠物家庭。",
    image: "/uploads/O1CN01lR6PzC1HFvLsYiPcX_!!737880729.avif",
    images: [
      "/uploads/O1CN01lR6PzC1HFvLsYiPcX_!!737880729.avif",
      "/uploads/O1CN01ltul2t1lwSkhQm10c_!!0-item_pic.avif"
    ],
    price: 198.00,
    originalPrice: 258.00,
    sales: 89,
    rating: 4.9,
    tags: ["饮水机", "循环过滤", "静音", "大容量"],
    category: "accessory",
    stock: 25,
    specifications: {
      dimensions: "25cm*25cm*15cm",
      weight: "2.5L容量",
      material: "ABS+不锈钢"
    },
    features: ["循环过滤", "静音运行", "LED指示", "大容量"],
    isActive: true
  },
  {
    name: "小型犬专用狗粮",
    brand: "小巧美味",
    description: "专为小型犬设计的营养狗粮，颗粒小巧易咀嚼。富含优质蛋白质和必需脂肪酸，支持小型犬的健康成长。",
    image: "/uploads/O1CN01Vsygzb1WggvVutT8Q_!!0-item_pic.avif",
    images: [
      "/uploads/O1CN01Vsygzb1WggvVutT8Q_!!0-item_pic.avif",
      "/uploads/O1CN01ZKiaUV1U5w8QicmEb_!!3322882467-0-cib.310x310.jpg"
    ],
    price: 98.00,
    originalPrice: 128.00,
    sales: 445,
    rating: 4.3,
    tags: ["小型犬", "狗粮", "易咀嚼", "营养"],
    category: "food",
    stock: 80,
    specifications: {
      weight: "2kg",
      material: "鸡肉、大米、蔬菜",
      ageRange: "小型犬专用"
    },
    features: ["小颗粒", "易消化", "营养均衡", "适口性好"],
    isActive: true
  },
  {
    name: "宠物指甲剪套装",
    brand: "护理专家",
    description: "专业宠物指甲护理套装，包含指甲剪、指甲锉和止血粉。人体工学设计，操作简单安全，适合各种大小的宠物。",
    image: "/uploads/OIP (4).jpg",
    images: [
      "/uploads/OIP (4).jpg",
      "/uploads/sg-11134201-7rd5o-m6nwi26a7dsq5e.jpg"
    ],
    price: 35.00,
    originalPrice: 50.00,
    sales: 678,
    rating: 4.2,
    tags: ["指甲剪", "护理", "套装", "安全"],
    category: "health",
    stock: 150,
    specifications: {
      material: "不锈钢+塑料",
      dimensions: "15cm长",
      ageRange: "全年龄段"
    },
    features: ["人体工学", "锋利耐用", "安全设计", "套装齐全"],
    isActive: true
  }
];

async function seedProducts() {
  try {
    console.log('开始清理现有产品数据...');
    await Product.deleteMany({});
    console.log('现有产品数据已清理');

    console.log('开始插入新的产品数据...');
    const createdProducts = await Product.insertMany(sampleProducts);

    console.log(`成功创建 ${createdProducts.length} 个产品:`);
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (ID: ${product._id})`);
    });

    console.log('\n数据库初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('创建产品数据失败:', error);
    process.exit(1);
  }
}

// 等待数据库连接
mongoose.connection.once('open', () => {
  console.log('数据库连接成功，开始初始化数据...');
  seedProducts();
});

mongoose.connection.on('error', (err) => {
  console.error('数据库连接错误:', err);
  process.exit(1);
});
