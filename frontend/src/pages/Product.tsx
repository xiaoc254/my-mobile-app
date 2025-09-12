import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Stepper,
  Tag,
  Space,
  Image,
  Grid,
  Divider,
  Rate,
  List,
  NavBar,
  Toast,
  Loading,
} from "antd-mobile";
import { HeartOutline, HeartFill, MoreOutline } from "antd-mobile-icons";
import { productAPI, cartAPI, IMAGE_BASE_URL } from "../services/apiz";

interface ProductSpec {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  images: string[];
  description: string;
  specs: ProductSpec[];
  features: string[];
  rating: number;
  reviewCount: number;
  sales: number;
}

export default function Product() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedSpec, setSelectedSpec] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      // 检查 ID 是否有效
      if (!id || id === "undefined") {
        Toast.show("商品ID无效");
        navigate(-1);
        return;
      }

      const response: any = await productAPI.getProductById(id);

      if (response.success) {
        // 将后端数据转换为前端期望的格式
        const backendProduct = response.data;
        const frontendProduct: Product = {
          id: backendProduct.id,
          name: backendProduct.name,
          brand: backendProduct.brand,
          images: backendProduct.images || [backendProduct.image],
          description: backendProduct.description,
          specs: [
            {
              id: "default",
              name: "默认规格",
              price: backendProduct.price,
              originalPrice: backendProduct.originalPrice,
              stock: backendProduct.stock || 999,
            },
          ],
          features: backendProduct.features || [],
          rating: backendProduct.rating || 5.0,
          reviewCount: Math.floor(Math.random() * 1000) + 100, // 模拟评价数量
          sales: backendProduct.sales || 0,
        };
        setProduct(frontendProduct);
      } else {
        Toast.show("商品不存在");
        navigate(-1);
      }
    } catch (error) {
      console.error("获取商品失败:", error);

      // 如果后端还没有数据，使用模拟数据
      const mockProducts: Record<string, Product> = {
        "1": {
          id: "1",
          name: "高纤兔粮营养颗粒成兔幼兔通用美毛兔粮饲料",
          brand: "纯野兔全粮",
          images: ["/images/products/兔粮.jpg"],
          description:
            "全价提兔专业兔料配方免咆，专为幼兔设计的营养兔粮，含有丰富的高纤维成分，有助于兔子的消化健康。",
          specs: [
            {
              id: "500g",
              name: "500g",
              price: 21.8,
              originalPrice: 54.0,
              stock: 999,
            },
            {
              id: "1kg",
              name: "1kg",
              price: 39.8,
              originalPrice: 98.0,
              stock: 999,
            },
            {
              id: "2kg",
              name: "2kg",
              price: 75.8,
              originalPrice: 189.0,
              stock: 999,
            },
          ],
          features: [
            "营养均衡",
            "科学健康",
            "提升免疫力",
            "营养高纤",
            "呵护肠胃",
          ],
          rating: 4.8,
          reviewCount: 1234,
          sales: 10000,
        },
        "2": {
          id: "2",
          name: "猫窝四季通用冬季保暖安全感窝猫床半封闭式猫咪沙发小猫猫窝睡窝",
          brand: "宠物之家",
          images: ["/images/products/猫床.jpg"],
          description:
            "高品质猫窝，四季通用设计，冬季保暖效果佳，半封闭式设计给猫咪安全感，舒适的沙发式睡窝。",
          specs: [
            {
              id: "medium",
              name: "中号",
              price: 159.0,
              originalPrice: 299.0,
              stock: 500,
            },
          ],
          features: ["四季通用", "保暖舒适", "半封闭式", "安全感设计"],
          rating: 4.9,
          reviewCount: 567,
          sales: 5000,
        },
        "3": {
          id: "3",
          name: "宠物用品猫抓板磨爪猫咪玩具大号",
          brand: "宠物乐园",
          images: ["/images/products/猫抓板.jpg"],
          description:
            "大号猫抓板，天然材质制作，帮助猫咪磨爪和娱乐，有效保护家具。",
          specs: [
            {
              id: "large",
              name: "大号",
              price: 8.8,
              originalPrice: 15.0,
              stock: 200,
            },
          ],
          features: ["磨爪玩具", "天然材质", "大号尺寸", "保护家具"],
          rating: 4.7,
          reviewCount: 234,
          sales: 8000,
        },
        "4": {
          id: "4",
          name: "vetwish宠物鱼油猫用卵磷脂美毛护肤猫咪鱼油胶囊猫咪专用",
          brand: "vetwish",
          images: ["/images/products/鱼油.jpg"],
          description:
            "专业宠物鱼油，富含卵磷脂，有效美毛护肤，提升猫咪毛发光泽和皮肤健康。",
          specs: [
            {
              id: "60caps",
              name: "60粒装",
              price: 99.8,
              originalPrice: 199.0,
              stock: 300,
            },
          ],
          features: ["美毛护肤", "卵磷脂", "营养补充", "专业配方"],
          rating: 4.8,
          reviewCount: 890,
          sales: 3000,
        },
        "5": {
          id: "5",
          name: "猫砂盆除臭剂天然植物去除异味持久净味器",
          brand: "净味专家",
          images: ["/images/products/除味剂.jpg"],
          description:
            "天然植物提取的除臭剂，有效去除异味，持久净味，安全无害。",
          specs: [
            {
              id: "500ml",
              name: "500ml装",
              price: 24.9,
              originalPrice: 39.0,
              stock: 150,
            },
          ],
          features: ["天然植物", "持久净味", "安全无害", "高效除臭"],
          rating: 4.9,
          reviewCount: 345,
          sales: 12000,
        },
        "6": {
          id: "6",
          name: "宠物纪念相框定制猫狗照片摆台创意礼品",
          brand: "纪念工坊",
          images: ["/images/products/纪念框.jpg"],
          description:
            "定制宠物相框，精美摆台设计，是纪念爱宠的最佳选择，创意礼品。",
          specs: [
            {
              id: "standard",
              name: "标准版",
              price: 16.8,
              originalPrice: 25.0,
              stock: 800,
            },
          ],
          features: ["定制相框", "创意设计", "精美摆台", "纪念价值"],
          rating: 4.6,
          reviewCount: 1567,
          sales: 2000,
        },
      };

      const mockProduct = mockProducts[id || "1"] || mockProducts["1"];
      setProduct(mockProduct);
      Toast.show("使用模拟数据展示");
    } finally {
      setLoading(false);
    }
  };

  const currentSpec = product?.specs[selectedSpec];

  const handleAddToCart = async () => {
    if (!product || !currentSpec) return;

    try {
      const response: any = await cartAPI.addToCart({
        productId: product.id,
        quantity,
        spec: currentSpec.name,
      });

      if (response.success) {
        Toast.show("已添加到购物车");
      } else {
        Toast.show(response.message || "添加到购物车失败");
      }
    } catch (error: any) {
      console.error("添加到购物车错误:", error);

      // 如果是认证错误，提示用户登录
      if (error.response?.status === 401) {
        Toast.show("请先登录");
        navigate("/login");
      } else {
        Toast.show(error.response?.data?.message || "添加到购物车失败");
      }
    }
  };

  const handleBuyNow = () => {
    if (!product || !currentSpec) return;

    // 立即购买逻辑
    console.log("立即购买:", {
      productId: product.id,
      specId: currentSpec.id,
      quantity,
    });
    Toast.show("正在跳转到支付页面...");
  };

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Loading />
      </div>
    );
  }

  if (!product) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>商品不存在</p>
        <Button onClick={() => navigate(-1)}>返回</Button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: "80px", backgroundColor: "#f5f5f5" }}>
      {/* 导航栏 */}
      <NavBar
        onBack={() => navigate(-1)}
        style={{ backgroundColor: "white" }}
        right={
          <Space>
            <MoreOutline fontSize={20} />
            <div onClick={() => setIsFavorite(!isFavorite)}>
              {isFavorite ? (
                <HeartFill fontSize={20} color="#ff4757" />
              ) : (
                <HeartOutline fontSize={20} />
              )}
            </div>
          </Space>
        }
      >
        商品详情
      </NavBar>

      {/* 商品图片轮播 */}
      <div style={{ backgroundColor: "white", padding: "20px" }}>
        <Image
          src={`${IMAGE_BASE_URL}${product.images[0]}`}
          width="100%"
          height={300}
          style={{ borderRadius: "8px" }}
          placeholder="加载中..."
        />

        {/* 商品基本信息 */}
        <div style={{ marginTop: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#ff4757",
              }}
            >
              ¥{currentSpec?.price || 0}
            </span>
            {currentSpec?.originalPrice && (
              <span
                style={{
                  fontSize: "14px",
                  color: "#999",
                  textDecoration: "line-through",
                  marginLeft: "8px",
                }}
              >
                ¥{currentSpec.originalPrice}
              </span>
            )}
            <Tag color="#ff4757" style={{ marginLeft: "8px" }}>
              促销价
            </Tag>
          </div>

          <h3
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              margin: "8px 0",
              lineHeight: "1.4",
            }}
          >
            {product.brand} {product.name}
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "12px",
              color: "#666",
              marginBottom: "16px",
            }}
          >
            <Rate
              value={product.rating}
              readOnly
              allowHalf
              style={{ fontSize: "12px" }}
            />
            <span style={{ marginLeft: "8px" }}>
              {product.rating}分 | {product.reviewCount}条评价 | 已售
              {product.sales}+
            </span>
          </div>
        </div>
      </div>

      {/* 规格选择 */}
      <Card style={{ margin: "8px 16px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h4 style={{ marginBottom: "12px" }}>选择规格</h4>
          <Grid columns={3} gap={8}>
            {product.specs.map((spec, index) => (
              <div key={spec.id}>
                <Button
                  size="small"
                  color={selectedSpec === index ? "primary" : "default"}
                  fill={selectedSpec === index ? "solid" : "outline"}
                  onClick={() => setSelectedSpec(index)}
                  block
                >
                  {spec.name}
                </Button>
              </div>
            ))}
          </Grid>
        </div>

        {/* 数量选择 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>数量</span>
          <Stepper
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={currentSpec?.stock || 999}
          />
        </div>
      </Card>

      {/* 商品特点 */}
      <Card style={{ margin: "8px 16px" }}>
        <h4 style={{ marginBottom: "12px" }}>商品特点</h4>
        <Space wrap>
          {product.features.map((feature, index) => (
            <Tag key={index} color="#52c41a" round>
              {feature}
            </Tag>
          ))}
        </Space>
      </Card>

      {/* 商品详情 */}
      <Card style={{ margin: "8px 16px" }}>
        <h4 style={{ marginBottom: "12px" }}>商品详情</h4>
        <p
          style={{
            lineHeight: "1.6",
            color: "#666",
            fontSize: "14px",
          }}
        >
          {product.description}
        </p>

        <Divider />

        <List>
          <List.Item extra="500g/1kg/2kg">规格</List.Item>
          <List.Item extra="成兔/幼兔通用">适用年龄</List.Item>
          <List.Item extra="干燥通风处保存">保存方式</List.Item>
          <List.Item extra="12个月">保质期</List.Item>
        </List>
      </Card>

      {/* 底部操作栏 */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          padding: "12px 16px",
          borderTop: "1px solid #f0f0f0",
          display: "flex",
          gap: "12px",
          zIndex: 1000,
        }}
      >
        <Button
          color="primary"
          fill="outline"
          style={{ flex: 1 }}
          onClick={handleAddToCart}
        >
          加入购物车
        </Button>
        <Button color="primary" style={{ flex: 1 }} onClick={handleBuyNow}>
          立即购买
        </Button>
      </div>
    </div>
  );
}
