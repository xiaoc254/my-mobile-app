import Product from "./modules/product.js";
import "./db.js";

const seedProducts = [
    {
        name: "高纤兔粮营养颗粒成兔幼兔通用美毛兔粮饲料",
        brand: "纯野兔全粮",
        images: [
            "/images/products/兔粮.jpg"
        ],
        description: "全价提兔专业兔料配方免咆，专为幼兔设计的营养兔粮，含有丰富的高纤维成分，有助于兔子的消化健康。",
        specs: [
            {
                id: "500g",
                name: "500g",
                price: 21.8,
                originalPrice: 54.0,
                stock: 999
            },
            {
                id: "1kg",
                name: "1kg",
                price: 39.8,
                originalPrice: 98.0,
                stock: 999
            },
            {
                id: "2kg",
                name: "2kg",
                price: 75.8,
                originalPrice: 189.0,
                stock: 999
            }
        ],
        features: [
            "营养均衡",
            "科学健康",
            "提升免疫力",
            "营养高纤",
            "呵护肠胃"
        ],
        rating: 4.8,
        reviewCount: 1234,
        sales: 10000,
        category: "food"
    },
    {
        name: "猫窝四季通用冬季保暖安全感窝猫床半封闭式猫咪沙发小猫猫窝睡窝",
        brand: "宠物之家",
        images: [
            "/images/products/猫床.jpg"
        ],
        description: "高品质猫窝，四季通用设计，冬季保暖效果佳，半封闭式设计给猫咪安全感，舒适的沙发式睡窝。",
        specs: [
            {
                id: "400g",
                name: "400g",
                price: 159.0,
                originalPrice: 299.0,
                stock: 500
            }
        ],
        features: [
            "四季通用",
            "保暖舒适",
            "半封闭式",
            "安全感设计"
        ],
        rating: 4.9,
        reviewCount: 567,
        sales: 5000,
        category: "supplies"
    },
    {
        name: "宠物用品猫抓板磨爪猫咪玩具大号",
        brand: "宠物乐园",
        images: [
            "/images/products/猫抓板.jpg"
        ],
        description: "大号猫抓板，天然材质制作，帮助猫咪磨爪和娱乐。",
        specs: [
            {
                id: "medium",
                name: "大号",
                price: 8.8,
                originalPrice: 15.0,
                stock: 200
            }
        ],
        features: [
            "磨爪玩具",
            "天然材质",
            "大号尺寸",
            "缓解压力"
        ],
        rating: 4.6,
        reviewCount: 234,
        sales: 3000,
        category: "toys"
    },
    {
        name: "vetwish宠物鱼油猫用卵磷脂美毛护肤猫咪鱼油胶囊猫咪专用",
        brand: "vetwish",
        images: [
            "/images/products/鱼油.jpg"
        ],
        description: "专业宠物鱼油，富含卵磷脂，有效美毛护肤，提升猫咪毛发光泽和皮肤健康。",
        specs: [
            {
                id: "standard",
                name: "标准版",
                price: 99.8,
                originalPrice: 199.0,
                stock: 300
            }
        ],
        features: [
            "美毛护肤",
            "卵磷脂",
            "营养补充",
            "专业配方"
        ],
        rating: 4.8,
        reviewCount: 890,
        sales: 3000,
        category: "health"
    },
    {
        name: "猫砂盆除臭剂天然植物去除异味持久净味器",
        brand: "净味专家",
        images: [
            "/images/products/除味剂.jpg"
        ],
        description: "天然植物提取的除臭剂，有效去除异味，持久净味。",
        specs: [
            {
                id: "500ml",
                name: "500ml装",
                price: 24.9,
                originalPrice: 39.0,
                stock: 150
            }
        ],
        features: [
            "天然植物",
            "持久净味",
            "安全无害",
            "高效除臭"
        ],
        rating: 4.9,
        reviewCount: 345,
        sales: 12000,
        category: "supplies"
    },
    {
        name: "宠物纪念相框定制猫狗照片摆台创意礼品",
        brand: "纪念工坊",
        images: [
            "/images/products/纪念框.jpg"
        ],
        description: "定制宠物相框，精美摆台设计，是纪念爱宠的最佳选择。",
        specs: [
            {
                id: "standard",
                name: "标准版",
                price: 16.8,
                originalPrice: 25.0,
                stock: 800
            }
        ],
        features: [
            "定制相框",
            "创意设计",
            "精美摆台",
            "纪念价值"
        ],
        rating: 4.6,
        reviewCount: 1567,
        sales: 2000,
        category: "toys"
    }
];

async function seedDatabase() {
    try {
        console.log("开始插入种子数据...");

        // 清除现有数据
        await Product.deleteMany({});
        console.log("已清除现有商品数据");

        // 插入新数据
        await Product.insertMany(seedProducts);
        console.log(`成功插入 ${seedProducts.length} 个商品`);

        console.log("种子数据插入完成！");
        process.exit(0);
    } catch (error) {
        console.error("插入种子数据失败:", error);
        process.exit(1);
    }
}

seedDatabase();
