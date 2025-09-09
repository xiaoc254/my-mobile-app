import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    Loading
} from "antd-mobile";
import { UnorderedListOutline } from "antd-mobile-icons";
import { orderAPI } from "../services/api";

interface Order {
    _id: string;
    orderNumber: string;
    status: "pending" | "paid" | "pending_shipment" | "shipped" | "delivered" | "cancelled";
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
}

export default function OrderManagement() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    // 获取订单数据
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response: any = await orderAPI.getOrders();
            if (response.success) {
                setOrders(response.data.orders);
            } else {
                Toast.show('获取订单失败');
            }
        } catch (error) {
            console.error('获取订单失败:', error);
            Toast.show('获取订单失败');
            // 使用模拟数据作为后备
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusText = (status: string) => {
        const statusMap = {
            pending: "待付款",
            paid: "已付款",
            pending_shipment: "待发货",
            shipped: "已发货",
            delivered: "已完成",
            cancelled: "已取消"
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
            cancelled: "#747d8c"
        };
        return colorMap[status as keyof typeof colorMap] || "#666";
    };

    const filterOrders = () => {
        let filtered = orders;

        // 按状态筛选
        if (activeTab !== "all") {
            filtered = filtered.filter(order => order.status === activeTab);
        }

        // 按搜索文本筛选
        if (searchText) {
            filtered = filtered.filter(order =>
                order.orderNumber.includes(searchText) ||
                order.items.some(item => item.name.toLowerCase().includes(searchText.toLowerCase()))
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
                Toast.show('订单取消成功');
                fetchOrders(); // 重新获取订单列表
            } else {
                Toast.show('取消订单失败');
            }
        } catch (error) {
            console.error('取消订单失败:', error);
            Toast.show('取消订单失败');
        }
    };

    // 更新订单状态
    const handleUpdateOrderStatus = async (orderId: string, status: string) => {
        try {
            const response: any = await orderAPI.updateOrderStatus(orderId, status);
            if (response.success) {
                Toast.show('订单状态更新成功');
                fetchOrders(); // 重新获取订单列表
            } else {
                Toast.show('更新订单状态失败');
            }
        } catch (error) {
            console.error('更新订单状态失败:', error);
            Toast.show('更新订单状态失败');
        }
    };

    const filteredOrders = filterOrders();

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", paddingBottom: "60px" }}>
            {/* 导航栏 */}
            <NavBar onBack={() => navigate(-1)}>
                订单管理
            </NavBar>

            {/* 搜索框 */}
            <div style={{ padding: "12px 16px", backgroundColor: "white" }}>
                <SearchBar
                    placeholder="搜索订单号或商品名称"
                    value={searchText}
                    onChange={setSearchText}
                    style={{
                        backgroundColor: "#f5f5f5",
                        borderRadius: "20px"
                    }}
                />
            </div>

            {/* 状态筛选标签 */}
            <div style={{ backgroundColor: "white", paddingBottom: "8px" }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{
                        "--content-padding": "0 16px"
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
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "200px"
                    }}>
                        <Loading />
                    </div>
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <Card
                            key={order._id}
                            style={{
                                marginBottom: "12px",
                                borderRadius: "8px"
                            }}
                        >
                            {/* 商店名称和状态 */}
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 0",
                                borderBottom: "1px solid #f0f0f0",
                                marginBottom: "12px"
                            }}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                        {order.shopName}
                                    </span>
                                    <Badge
                                        content="自营"
                                        style={{
                                            backgroundColor: "#ff6b35",
                                            marginLeft: "8px",
                                            fontSize: "10px"
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
                                    marginBottom: "12px"
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
                                        flexShrink: 0
                                    }}
                                    fit="cover"
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: "14px",
                                        lineHeight: "1.4",
                                        marginBottom: "8px",
                                        overflow: "hidden",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        color: "#333"
                                    }}>
                                        {order.items[0].name}
                                    </div>

                                    <div style={{
                                        fontSize: "12px",
                                        color: "#999",
                                        marginBottom: "8px"
                                    }}>
                                        规格：{order.items[0].spec}
                                    </div>

                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}>
                                        <span style={{
                                            fontSize: "16px",
                                            color: "#ff6b35",
                                            fontWeight: "bold"
                                        }}>
                                            ¥{order.totalAmount}
                                        </span>
                                        <span style={{
                                            fontSize: "12px",
                                            color: "#666"
                                        }}>
                                            x{order.items[0].quantity}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 底部操作区 */}
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingTop: "12px",
                                borderTop: "1px solid #f0f0f0"
                            }}>
                                <div style={{
                                    fontSize: "12px",
                                    color: "#999"
                                }}>
                                    {new Date(order.createdAt).toLocaleString('zh-CN', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
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
                                                onClick={() => handleUpdateOrderStatus(order._id, 'paid')}
                                            >
                                                立即付款
                                            </Button>
                                        </>
                                    )}

                                    {order.status === "pending_shipment" && (
                                        <>
                                            <Button
                                                size="small"
                                                fill="outline"
                                                color="default"
                                            >
                                                催发货
                                            </Button>
                                            <Button
                                                size="small"
                                                color="primary"
                                            >
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
                                                onClick={() => { Toast.show('物流查询功能开发中...'); }}
                                            >
                                                查看物流
                                            </Button>
                                            <Button
                                                size="small"
                                                color="primary"
                                                onClick={() => handleUpdateOrderStatus(order._id, 'delivered')}
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
                                            onClick={() => { Toast.show('再次购买功能开发中...'); }}
                                        >
                                            再次购买
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "50vh",
                        padding: "20px"
                    }}>
                        <Empty
                            image={<UnorderedListOutline style={{ fontSize: "64px", color: "#ccc" }} />}
                            description="暂无订单"
                        />
                        <Button
                            color="primary"
                            onClick={() => navigate('/download')}
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