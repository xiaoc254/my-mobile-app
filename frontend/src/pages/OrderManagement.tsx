import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    Image,
    Button,
    SearchBar,
    Tag,
    NavBar,
    Empty,
    Badge
} from "antd-mobile";
import { UnorderedListOutline } from "antd-mobile-icons";

interface Order {
    id: string;
    orderNumber: string;
    status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
    createTime: string;
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

    // 模拟订单数据
    const orders: Order[] = [
        {
            id: "order_1",
            orderNumber: "202312150001",
            status: "pending",
            createTime: "2023-12-15 14:30",
            totalAmount: 94,
            shopName: "萌宠宠物",
            items: [
                {
                    id: "item_1",
                    productId: "1",
                    name: "猫狗尿分解剂宠物生物除臭去异臭...",
                    image: "/images/products/除味剂.jpg",
                    price: 94,
                    quantity: 1,
                    spec: "500ml装"
                }
            ]
        },
        {
            id: "order_2",
            orderNumber: "202312140002",
            status: "shipped",
            createTime: "2023-12-14 10:20",
            totalAmount: 159,
            shopName: "宠物之家",
            items: [
                {
                    id: "item_2",
                    productId: "2",
                    name: "猫窝四季通用冬季保暖安全感窝猫床半封闭式猫咪沙发小猫猫窝睡窝",
                    image: "/images/products/猫床.jpg",
                    price: 159,
                    quantity: 1,
                    spec: "中号"
                }
            ]
        },
        {
            id: "order_3",
            orderNumber: "202312130003",
            status: "delivered",
            createTime: "2023-12-13 16:45",
            totalAmount: 21.8,
            shopName: "纯野兔全粮",
            items: [
                {
                    id: "item_3",
                    productId: "1",
                    name: "高纤兔粮营养颗粒成兔幼兔通用美毛兔粮饲料",
                    image: "/images/products/兔粮.jpg",
                    price: 21.8,
                    quantity: 1,
                    spec: "500g"
                }
            ]
        }
    ];

    const getStatusText = (status: string) => {
        const statusMap = {
            pending: "待付款",
            paid: "已付款",
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
            shipped: "#3742fa",
            delivered: "#2ed573",
            cancelled: "#747d8c"
        };
        return colorMap[status as keyof typeof colorMap] || "#666";
    };

    const filterOrders = () => {
        let filtered = orders;

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

            {/* 订单列表 */}
            <div style={{ padding: "8px 16px" }}>
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <Card
                            key={order.id}
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
                                    {order.createTime}
                                </div>

                                <div style={{ display: "flex", gap: "8px" }}>
                                    {order.status === "pending" && (
                                        <>
                                            <Button
                                                size="small"
                                                fill="outline"
                                                color="default"
                                            >
                                                取消订单
                                            </Button>
                                            <Button
                                                size="small"
                                                color="primary"
                                            >
                                                立即付款
                                            </Button>
                                        </>
                                    )}

                                    {order.status === "shipped" && (
                                        <>
                                            <Button
                                                size="small"
                                                fill="outline"
                                                color="default"
                                            >
                                                查看物流
                                            </Button>
                                            <Button
                                                size="small"
                                                color="primary"
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