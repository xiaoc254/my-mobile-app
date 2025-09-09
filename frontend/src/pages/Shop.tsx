import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchBar,
  Image,
  Tag,
  PullToRefresh,
  InfiniteScroll,
  Toast,
  List
} from "antd-mobile";

interface Product {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  originalPrice?: number;
  sales: number;
  rating: number;
  tags: string[];
  category: string;
}

export default function Shop() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // 真实商品数据，使用真实图片
  const realProducts: Product[] = [
    {
      id: "1",
      name: "高纤兔粮营养颗粒成兔幼兔通用美毛兔粮饲料",
      brand: "纯野兔全粮",
      image: "/images/products/兔粮.jpg",
      price: 21.8,
      originalPrice: 54.0,
      sales: 10000,
      rating: 4.8,
      tags: ["营养均衡", "高纤维"],
      category: "food"
    },
    {
      id: "2",
      name: "猫窝四季通用冬季保暖安全感窝猫床半封闭式猫咪沙发小猫猫窝睡窝",
      brand: "宠物之家",
      image: "/images/products/猫床.jpg",
      price: 159.0,
      originalPrice: 299.0,
      sales: 5000,
      rating: 4.9,
      tags: ["四季通用", "保暖舒适"],
      category: "supplies"
    },
    {
      id: "3",
      name: "宠物用品猫抓板磨爪猫咪玩具大号",
      brand: "宠物乐园",
      image: "/images/products/猫抓板.jpg",
      price: 8.8,
      originalPrice: 15.0,
      sales: 8000,
      rating: 4.7,
      tags: ["磨爪玩具", "大号"],
      category: "toys"
    },
    {
      id: "4",
      name: "vetwish宠物鱼油猫用卵磷脂美毛护肤猫咪鱼油胶囊猫咪专用",
      brand: "vetwish",
      image: "/images/products/鱼油.jpg",
      price: 99.8,
      originalPrice: 199.0,
      sales: 3000,
      rating: 4.8,
      tags: ["美毛护肤", "卵磷脂"],
      category: "health"
    },
    {
      id: "5",
      name: "猫砂盆除臭剂天然植物去除异味持久净味器",
      brand: "净味专家",
      image: "/images/products/除味剂.jpg",
      price: 24.9,
      originalPrice: 39.0,
      sales: 12000,
      rating: 4.9,
      tags: ["天然植物", "持久净味"],
      category: "supplies"
    },
    {
      id: "6",
      name: "宠物纪念相框定制猫狗照片摆台创意礼品",
      brand: "纪念工坊",
      image: "/images/products/纪念框.jpg",
      price: 16.8,
      originalPrice: 25.0,
      sales: 2000,
      rating: 4.6,
      tags: ["定制相框", "创意礼品"],
      category: "toys"
    }
  ];

  useEffect(() => {
    fetchProducts(true);
  }, [searchText]);

  const fetchProducts = async (reset = false) => {
    try {
      setLoading(true);

      // 模拟API调用，实际使用真实数据
      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredProducts = realProducts;

      if (searchText) {
        filteredProducts = realProducts.filter(product =>
          product.name.toLowerCase().includes(searchText.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      if (reset) {
        setProducts(filteredProducts);
      } else {
        setProducts(prev => [...prev, ...filteredProducts]);
      }

      setHasMore(false); // 简化处理，不做分页
    } catch (error) {
      console.error("获取商品失败:", error);
      Toast.show("获取商品失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const onRefresh = async () => {
    await fetchProducts(true);
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    await fetchProducts(false);
  };

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", paddingBottom: "60px" }}>
      {/* 顶部导航 */}
      <div style={{
        backgroundColor: "white",
        padding: "10px 16px 16px",
        color: "#333",
        borderBottom: "1px solid #f0f0f0"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{
            fontSize: "18px",
            fontWeight: "bold",
            flexShrink: 0,
            color: "rgb(201, 167, 66)"
          }}>
            萌宠商城
          </div>

          {/* 搜索框 */}
          <div style={{ flex: 1 }}>
            <SearchBar
              placeholder="输入搜索商品名称"
              value={searchText}
              onChange={setSearchText}
              onSearch={handleSearch}
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: "20px"
              }}
            />
          </div>
        </div>
      </div>

      {/* 活动横幅 */}
      <div style={{ margin: "12px 16px" }}>
        <Image
          src="/images/products/商品活动图.jpg"
          width="100%"
          height={160}
          style={{
            borderRadius: "12px",
            objectFit: "cover"
          }}
          fit="cover"
        />
      </div>

      {/* 精选推荐标题 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "16px",
        backgroundColor: "white",
        margin: "8px 16px",
        borderRadius: "8px"
      }}>
        <span style={{ fontSize: "16px", marginRight: "8px" }}>⭐</span>
        <span style={{ fontSize: "16px", fontWeight: "bold" }}>环保宠物用品推荐</span>
      </div>

      {/* 商品列表 */}
      <div style={{ padding: "0 16px" }}>
        <PullToRefresh onRefresh={onRefresh}>
          <List>
            {products.map((product) => (
              <List.Item
                key={product.id}
                style={{
                  backgroundColor: "white",
                  marginBottom: "12px",
                  borderRadius: "8px",
                  padding: "0"
                }}
                onClick={() => handleProductClick(product.id)}
              >
                <div style={{ display: "flex", padding: "12px", alignItems: "flex-start" }}>
                  {/* 商品图片 */}
                  <div style={{ marginTop: "10px", flexShrink: 0, marginRight: "12px" }}>
                    <Image
                      src={product.image}
                      width={100}
                      height={100}
                      style={{
                        borderRadius: "8px"
                      }}
                      fit="cover"
                    />
                  </div>

                  {/* 商品信息 */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* 品牌标签 */}
                    <div style={{ marginBottom: "4px" }}>
                      <Tag
                        color="#1890ff"
                        style={{ fontSize: "10px", padding: "1px 6px" }}
                      >
                        {product.brand}
                      </Tag>
                    </div>

                    {/* 商品名称 */}
                    <div style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      lineHeight: "1.4",
                      marginBottom: "8px",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical"
                    }}>
                      {product.name}
                    </div>

                    {/* 价格区域 */}
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "baseline" }}>
                        <span style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: "#FF4500",
                          marginRight: "8px"
                        }}>
                          ¥{product.price}
                        </span>
                        {product.originalPrice && (
                          <span style={{
                            fontSize: "12px",
                            color: "#999",
                            textDecoration: "line-through"
                          }}>
                            ¥{product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 评价和销量 */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "12px",
                      color: "#666"
                    }}>
                      <span>⭐ {product.rating}</span>
                      <span>已售{product.sales}+</span>
                    </div>
                  </div>
                </div>
              </List.Item>
            ))}
          </List>

          <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
            {hasMore ? (
              <div style={{
                textAlign: "center",
                padding: "20px",
                color: "#999"
              }}>
                加载中...
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "20px",
                color: "#999"
              }}>
                没有更多商品了
              </div>
            )}
          </InfiniteScroll>
        </PullToRefresh>
      </div>
    </div>
  );
}