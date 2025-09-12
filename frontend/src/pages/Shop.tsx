import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  SearchBar,
  Image,
  Tag,
  PullToRefresh,
  InfiniteScroll,
  Toast,
  List,
  Loading,
  Badge,
} from "antd-mobile";
import { MoreOutline } from "antd-mobile-icons";
import { productAPI, IMAGE_BASE_URL } from "../services/apiz";

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
  const [initialLoading, setInitialLoading] = useState(true);

  // 从后端获取商品数据
  const fetchProducts = async (search?: string, category?: string) => {
    try {
      setLoading(true);
      const response: any = await productAPI.getProducts();
      if (response.success && response.data) {
        let fetchedProducts = response.data.products || response.data;

        // 前端过滤（如果需要的话）
        if (search) {
          fetchedProducts = fetchedProducts.filter(
            (product: Product) =>
              product.name.toLowerCase().includes(search.toLowerCase()) ||
              product.brand.toLowerCase().includes(search.toLowerCase())
          );
        }

        if (category && category !== "all") {
          fetchedProducts = fetchedProducts.filter(
            (product: Product) => product.category === category
          );
        }

        setProducts(fetchedProducts);
        setHasMore(false); // 暂时禁用无限滚动，因为后端还没有分页
      } else {
        Toast.show("获取商品数据失败");
        setProducts([]);
      }
    } catch (error) {
      console.error("获取商品数据错误:", error);
      Toast.show("网络错误，请稍后重试");
      setProducts([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // 初始化数据加载
  useEffect(() => {
    fetchProducts();
  }, []);

  // 搜索时重新加载数据
  useEffect(() => {
    if (searchText) {
      fetchProducts(searchText);
    } else {
      fetchProducts();
    }
  }, [searchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleProductClick = (productId: string) => {
    if (!productId || productId === "undefined") {
      Toast.show("商品ID无效");
      return;
    }
    navigate(`/product/${productId}`);
  };

  const onRefresh = async () => {
    await fetchProducts(searchText);
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    // 暂时禁用无限滚动，等待后端实现分页
    Toast.show("没有更多数据了");
  };

  // 初始加载状态
  if (initialLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Loading />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        paddingBottom: "60px",
      }}
    >
      {/* 顶部导航 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "10px 16px 16px",
          color: "#333",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              flexShrink: 0,
              color: "rgb(201, 167, 66)",
            }}
          >
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
                borderRadius: "20px",
              }}
            />
          </div>

          {/* 购物车图标 */}
          <div
            style={{
              marginLeft: "12px",
              cursor: "pointer",
              padding: "8px",
            }}
            onClick={() => navigate("/cart")}
          >
            <Badge content="🛒" style={{ "--right": "-5px", "--top": "-5px" }}>
              <MoreOutline fontSize={20} />
            </Badge>
          </div>
        </div>
      </div>

      {/* 活动横幅 */}
      <div style={{ margin: "12px 16px" }}>
        <Image
          src={`${IMAGE_BASE_URL}/images/products/商品活动图.jpg`}
          width="100%"
          height={160}
          style={{
            borderRadius: "12px",
            objectFit: "cover",
          }}
          fit="cover"
        />
      </div>

      {/* 精选推荐标题 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px",
          backgroundColor: "white",
          margin: "8px 16px",
          borderRadius: "8px",
        }}
      >
        <span style={{ fontSize: "16px", marginRight: "8px" }}>⭐</span>
        <span style={{ fontSize: "16px", fontWeight: "bold" }}>
          环保宠物用品推荐
        </span>
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
                  padding: "0",
                }}
                onClick={() => handleProductClick(product.id)}
              >
                <div
                  style={{
                    display: "flex",
                    padding: "12px",
                    alignItems: "flex-start",
                  }}
                >
                  {/* 商品图片 */}
                  <div
                    style={{
                      marginTop: "10px",
                      flexShrink: 0,
                      marginRight: "12px",
                    }}
                  >
                    <Image
                      src={`${IMAGE_BASE_URL}${product.image}`}
                      width={100}
                      height={100}
                      style={{
                        borderRadius: "8px",
                      }}
                      fit="cover"
                    />
                  </div>

                  {/* 商品信息 */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
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
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        lineHeight: "1.4",
                        marginBottom: "8px",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {product.name}
                    </div>

                    {/* 价格区域 */}
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "baseline" }}>
                        <span
                          style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            color: "#FF4500",
                            marginRight: "8px",
                          }}
                        >
                          ¥{product.price}
                        </span>
                        {product.originalPrice && (
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#999",
                              textDecoration: "line-through",
                            }}
                          >
                            ¥{product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 评价和销量 */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
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
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#999",
                }}
              >
                加载中...
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#999",
                }}
              >
                没有更多商品了
              </div>
            )}
          </InfiniteScroll>
        </PullToRefresh>
      </div>
    </div>
  );
}
