import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Image,
  Button,
  SearchBar,
  Tag,
  NavBar,
  Empty,
  Badge,
  Tabs,
  Toast,
  Loading,
  Form,
  Input,
  TextArea,
  Divider,
  Radio,
} from "antd-mobile";
import { UnorderedListOutline, LocationOutline } from "antd-mobile-icons";
import { orderAPI, IMAGE_BASE_URL } from "../services/apiz";

interface Order {
  _id: string;
  orderNumber: string;
  status:
    | "pending"
    | "paid"
    | "pending_shipment"
    | "shipped"
    | "delivered"
    | "cancelled";
  createdAt: string;
  totalAmount: number;
  items: OrderItem[];
  shopName: string;
}

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  spec: string;
  productName?: string;
  productImage?: string;
  productBrand?: string;
  originalPrice?: number;
  selected?: boolean;
}

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

interface CheckoutItem {
  productId: string;
  productName: string;
  productImage: string;
  productBrand?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  spec: string;
  selected: boolean;
}

export default function OrderManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 订单结算相关状态
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("wechat");
  const [remark, setRemark] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // 获取订单数据
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response: any = await orderAPI.getOrders();
      if (response.success) {
        setOrders(response.data.orders);
      } else {
        Toast.show("获取订单失败");
      }
    } catch (error) {
      console.error("获取订单失败:", error);
      Toast.show("获取订单失败");
      // 使用模拟数据作为后备
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始化检查模式
  useEffect(() => {
    const state = location.state;

    if (state?.type === "buyNow" && state?.items) {
      // 立即购买模式
      setIsCheckoutMode(true);
      setCheckoutItems(state.items);
    } else if (state?.type === "cartCheckout" && state?.items) {
      // 购物车结算模式
      setIsCheckoutMode(true);
      setCheckoutItems(state.items);
    } else {
      // 订单列表查看模式
      setIsCheckoutMode(false);
      fetchOrders();
    }
  }, [location.state]);

  useEffect(() => {
    if (!isCheckoutMode) {
      fetchOrders();
    }
  }, [isCheckoutMode]);

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: "待付款",
      paid: "已付款",
      pending_shipment: "待发货",
      shipped: "已发货",
      delivered: "已完成",
      cancelled: "已取消",
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: "#ff6b35",
      paid: "#ffa502",
      pending_shipment: "#f39c12",
      shipped: "#3742fa",
      delivered: "#2ed573",
      cancelled: "#747d8c",
    };
    return colorMap[status as keyof typeof colorMap] || "#666";
  };

  const filterOrders = () => {
    let filtered = orders;

    // 按状态筛选
    if (activeTab !== "all") {
      filtered = filtered.filter((order) => order.status === activeTab);
    }

    // 按搜索文本筛选
    if (searchText) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.includes(searchText) ||
          order.items.some((item) =>
            item.name.toLowerCase().includes(searchText.toLowerCase())
          )
      );
    }

    return filtered;
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // 取消订单
  const handleCancelOrder = async (orderId: string) => {
    try {
      const response: any = await orderAPI.cancelOrder(orderId);
      if (response.success) {
        Toast.show("订单取消成功");
        fetchOrders(); // 重新获取订单列表
      } else {
        Toast.show("取消订单失败");
      }
    } catch (error) {
      console.error("取消订单失败:", error);
      Toast.show("取消订单失败");
    }
  };

  // 更新订单状态
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response: any = await orderAPI.updateOrderStatus(orderId, status);
      if (response.success) {
        Toast.show("订单状态更新成功");
        fetchOrders(); // 重新获取订单列表
      } else {
        Toast.show("更新订单状态失败");
      }
    } catch (error) {
      console.error("更新订单状态失败:", error);
      Toast.show("更新订单状态失败");
    }
  };

  // 提交订单
  const handleSubmitOrder = async () => {
    // 验证地址信息
    if (
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.province ||
      !shippingAddress.city ||
      !shippingAddress.address ||
      !shippingAddress.postalCode
    ) {
      Toast.show("请填写完整的收货地址信息");
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(shippingAddress.phone)) {
      Toast.show("请输入有效的手机号码");
      return;
    }

    if (!/^\d{6}$/.test(shippingAddress.postalCode)) {
      Toast.show("请输入正确的邮政编码（6位数字）");
      return;
    }

    setSubmittingOrder(true);
    try {
      const orderData = {
        items: checkoutItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          productBrand: item.productBrand || "",
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: item.quantity,
          spec: item.spec,
        })),
        shippingAddress,
        paymentMethod,
        remark,
      };

      const response: any = await orderAPI.createOrder(orderData);

      if (response.success) {
        Toast.show({
          content: "订单创建成功！",
          afterClose: () => {
            // 跳转到订单详情页面或返回
            navigate("/order-management", { replace: true });
          },
        });
      } else {
        Toast.show(response.message || "创建订单失败");
      }
    } catch (error: any) {
      console.error("创建订单错误:", error);
      if (error.response?.status === 401) {
        Toast.show({
          content: "请先登录",
          afterClose: () => {
            navigate("/login");
          },
        });
      } else {
        Toast.show(error.response?.data?.message || "创建订单失败");
      }
    } finally {
      setSubmittingOrder(false);
    }
  };

  // 计算总金额
  const calculateTotal = () => {
    return checkoutItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  const filteredOrders = filterOrders();

  // 如果是结算模式，显示结算页面
  if (isCheckoutMode) {
    return (
      <div
        style={{
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          paddingBottom: "80px",
        }}
      >
        {/* 导航栏 */}
        <NavBar onBack={() => navigate(-1)}>确认订单</NavBar>

        {/* 收货地址 */}
        <Card style={{ margin: "8px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <LocationOutline
              style={{ fontSize: "18px", color: "#1677ff", marginRight: "8px" }}
            />
            <span style={{ fontSize: "16px", fontWeight: "500" }}>
              收货地址
            </span>
          </div>

          <Form layout="vertical" style={{ "--prefix-width": "0px" }}>
            <Form.Item label="收货人姓名">
              <Input
                placeholder="请输入收货人姓名"
                value={shippingAddress.name}
                onChange={(val) =>
                  setShippingAddress({ ...shippingAddress, name: val })
                }
              />
            </Form.Item>

            <Form.Item label="手机号码">
              <Input
                placeholder="请输入手机号码"
                value={shippingAddress.phone}
                onChange={(val) =>
                  setShippingAddress({ ...shippingAddress, phone: val })
                }
              />
            </Form.Item>

            <Form.Item label="省份">
              <Input
                placeholder="请输入省份，如：广东省"
                value={shippingAddress.province}
                onChange={(val) =>
                  setShippingAddress({ ...shippingAddress, province: val })
                }
              />
            </Form.Item>

            <Form.Item label="城市">
              <Input
                placeholder="请输入城市，如：深圳市"
                value={shippingAddress.city}
                onChange={(val) =>
                  setShippingAddress({ ...shippingAddress, city: val })
                }
              />
            </Form.Item>

            <Form.Item label="详细地址">
              <TextArea
                placeholder="请输入详细地址"
                value={shippingAddress.address}
                onChange={(val) =>
                  setShippingAddress({ ...shippingAddress, address: val })
                }
                rows={2}
              />
            </Form.Item>

            <Form.Item label="邮政编码">
              <Input
                placeholder="请输入邮政编码"
                value={shippingAddress.postalCode}
                onChange={(val) =>
                  setShippingAddress({ ...shippingAddress, postalCode: val })
                }
              />
            </Form.Item>
          </Form>
        </Card>

        {/* 商品信息 */}
        <Card style={{ margin: "8px 16px" }}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "500",
              marginBottom: "16px",
            }}
          >
            商品信息
          </div>

          {checkoutItems.map((item, index) => (
            <div
              key={index}
              style={{
                marginBottom: index < checkoutItems.length - 1 ? "16px" : "0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <Image
                  src={`${IMAGE_BASE_URL}${item.productImage}`}
                  width={60}
                  height={60}
                  style={{ borderRadius: "8px", marginRight: "12px" }}
                  fit="cover"
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      marginBottom: "4px",
                      color: "#333",
                    }}
                  >
                    {item.productName}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      marginBottom: "4px",
                    }}
                  >
                    规格：{item.spec}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "16px",
                        color: "#ff4757",
                        fontWeight: "500",
                      }}
                    >
                      ¥{item.price}
                    </span>
                    <span style={{ fontSize: "14px", color: "#666" }}>
                      x{item.quantity}
                    </span>
                  </div>
                </div>
              </div>
              {index < checkoutItems.length - 1 && (
                <Divider style={{ margin: "16px 0" }} />
              )}
            </div>
          ))}
        </Card>

        {/* 支付方式 */}
        <Card style={{ margin: "8px 16px" }}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "500",
              marginBottom: "16px",
            }}
          >
            支付方式
          </div>

          <Radio.Group
            value={paymentMethod}
            onChange={(val) => setPaymentMethod(val as string)}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <Radio value="wechat">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: "20px", marginRight: "8px" }}>
                    💚
                  </span>
                  微信支付
                </div>
              </Radio>
              <Radio value="alipay">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: "20px", marginRight: "8px" }}>
                    💙
                  </span>
                  支付宝
                </div>
              </Radio>
            </div>
          </Radio.Group>
        </Card>

        {/* 订单备注 */}
        <Card style={{ margin: "8px 16px" }}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "500",
              marginBottom: "16px",
            }}
          >
            订单备注
          </div>
          <TextArea
            placeholder="给商家留言（选填）"
            value={remark}
            onChange={setRemark}
            rows={3}
            maxLength={200}
            showCount
          />
        </Card>

        {/* 价格汇总 */}
        <Card style={{ margin: "8px 16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span style={{ color: "#666" }}>商品金额</span>
            <span>¥{calculateTotal().toFixed(2)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <span style={{ color: "#666" }}>运费</span>
            <span>¥0.00</span>
          </div>
          <Divider />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "16px", fontWeight: "500" }}>实付款</span>
            <span
              style={{ fontSize: "18px", color: "#ff4757", fontWeight: "600" }}
            >
              ¥{calculateTotal().toFixed(2)}
            </span>
          </div>
        </Card>

        {/* 底部提交按钮 */}
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
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1000,
          }}
        >
          <div>
            <div style={{ fontSize: "14px", color: "#666" }}>
              共{checkoutItems.reduce((sum, item) => sum + item.quantity, 0)}
              件商品
            </div>
            <div
              style={{ fontSize: "18px", color: "#ff4757", fontWeight: "600" }}
            >
              ¥{calculateTotal().toFixed(2)}
            </div>
          </div>
          <Button
            color="primary"
            size="large"
            style={{ width: "120px" }}
            onClick={handleSubmitOrder}
            loading={submittingOrder}
            disabled={submittingOrder}
          >
            提交订单
          </Button>
        </div>
      </div>
    );
  }

  // 订单列表模式
  return (
    <div
      style={{
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        paddingBottom: "60px",
      }}
    >
      {/* 导航栏 */}
      <NavBar onBack={() => navigate(-1)}>订单管理</NavBar>

      {/* 搜索框 */}
      <div style={{ padding: "12px 16px", backgroundColor: "white" }}>
        <SearchBar
          placeholder="搜索订单号或商品名称"
          value={searchText}
          onChange={setSearchText}
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: "20px",
          }}
        />
      </div>

      {/* 状态筛选标签 */}
      <div style={{ backgroundColor: "white", paddingBottom: "8px" }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{
            "--content-padding": "0 16px",
          }}
        >
          <Tabs.Tab title="全部" key="all" />
          <Tabs.Tab title="待付款" key="pending" />
          <Tabs.Tab title="待发货" key="pending_shipment" />
          <Tabs.Tab title="已发货" key="shipped" />
          <Tabs.Tab title="已完成" key="delivered" />
        </Tabs>
      </div>

      {/* 订单列表 */}
      <div style={{ padding: "8px 16px" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <Loading />
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <Card
              key={order._id}
              style={{
                marginBottom: "12px",
                borderRadius: "8px",
              }}
            >
              {/* 商店名称和状态 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #f0f0f0",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: "500" }}>
                    {order.shopName}
                  </span>
                  <Badge
                    content="自营"
                    style={{
                      backgroundColor: "#ff6b35",
                      marginLeft: "8px",
                      fontSize: "10px",
                    }}
                  />
                </div>
                <Tag
                  color={getStatusColor(order.status)}
                  style={{ color: "white", fontSize: "12px" }}
                >
                  {getStatusText(order.status)}
                </Tag>
              </div>

              {/* 商品信息 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  cursor: "pointer",
                  marginBottom: "12px",
                }}
                onClick={() => handleProductClick(order.items[0].productId)}
              >
                <Image
                  src={order.items[0].image}
                  width={80}
                  height={80}
                  style={{
                    borderRadius: "8px",
                    marginRight: "12px",
                    flexShrink: 0,
                  }}
                  fit="cover"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      lineHeight: "1.4",
                      marginBottom: "8px",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      color: "#333",
                    }}
                  >
                    {order.items[0].name}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      marginBottom: "8px",
                    }}
                  >
                    规格：{order.items[0].spec}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "16px",
                        color: "#ff6b35",
                        fontWeight: "bold",
                      }}
                    >
                      ¥{order.totalAmount}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      x{order.items[0].quantity}
                    </span>
                  </div>
                </div>
              </div>

              {/* 底部操作区 */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "12px",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#999",
                  }}
                >
                  {new Date(order.createdAt).toLocaleString("zh-CN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {order.status === "pending" && (
                    <>
                      <Button
                        size="small"
                        fill="outline"
                        color="default"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        取消订单
                      </Button>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "paid")
                        }
                      >
                        立即付款
                      </Button>
                    </>
                  )}

                  {order.status === "pending_shipment" && (
                    <>
                      <Button size="small" fill="outline" color="default">
                        催发货
                      </Button>
                      <Button size="small" color="primary">
                        联系客服
                      </Button>
                    </>
                  )}

                  {order.status === "shipped" && (
                    <>
                      <Button
                        size="small"
                        fill="outline"
                        color="default"
                        onClick={() => {
                          Toast.show("物流查询功能开发中...");
                        }}
                      >
                        查看物流
                      </Button>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() =>
                          handleUpdateOrderStatus(order._id, "delivered")
                        }
                      >
                        确认收货
                      </Button>
                    </>
                  )}

                  {order.status === "delivered" && (
                    <Button
                      size="small"
                      fill="outline"
                      color="default"
                      onClick={() => {
                        Toast.show("再次购买功能开发中...");
                      }}
                    >
                      再次购买
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "50vh",
              padding: "20px",
            }}
          >
            <Empty
              image={
                <UnorderedListOutline
                  style={{ fontSize: "64px", color: "#ccc" }}
                />
              }
              description="暂无订单"
            />
            <Button
              color="primary"
              onClick={() => navigate("/download")}
              style={{ marginTop: "20px" }}
            >
              去购物
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
