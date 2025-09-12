import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  image: string;
}

const OrderManagement: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const statusOptions = [
    { id: "all", name: "全部", color: "gray" },
    { id: "pending", name: "待付款", color: "orange" },
    { id: "paid", name: "已付款", color: "blue" },
    { id: "shipped", name: "已发货", color: "purple" },
    { id: "delivered", name: "已送达", color: "green" },
    { id: "cancelled", name: "已取消", color: "red" },
  ];

  useEffect(() => {
    // 模拟获取订单数据
    const fetchOrders = async () => {
      setLoading(true);
      setTimeout(() => {
        setOrders([
          {
            id: "1",
            productName: "优质狗粮",
            quantity: 2,
            price: 199.98,
            status: "pending",
            orderDate: "2024-01-15",
            image: "/api/placeholder/100/100",
          },
          {
            id: "2",
            productName: "猫咪玩具",
            quantity: 1,
            price: 29.99,
            status: "shipped",
            orderDate: "2024-01-14",
            image: "/api/placeholder/100/100",
          },
          {
            id: "3",
            productName: "宠物洗发水",
            quantity: 1,
            price: 49.99,
            status: "delivered",
            orderDate: "2024-01-10",
            image: "/api/placeholder/100/100",
          },
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchOrders();
  }, []);

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  const getStatusColor = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.id === status);
    return statusConfig?.color || "gray";
  };

  const getStatusName = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.id === status);
    return statusConfig?.name || status;
  };

  const handleOrderAction = (orderId: string, action: string) => {
    console.log(`订单 ${orderId} 执行操作: ${action}`);
    // 这里应该调用相应的API
    alert(`已执行操作: ${action}`);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <button
            onClick={handleBack}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold">订单管理</h1>
        </div>
      </div>

      {/* 状态筛选 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {statusOptions.map((status) => (
              <button
                key={status.id}
                onClick={() => setSelectedStatus(status.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedStatus === status.id
                    ? `bg-${status.color}-500 text-white`
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {status.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="max-w-md mx-auto p-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500">暂无订单</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm p-4">
                {/* 订单头部 */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">
                    订单号: {order.id}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs text-white bg-${getStatusColor(
                      order.status
                    )}-500`}
                  >
                    {getStatusName(order.status)}
                  </span>
                </div>

                {/* 商品信息 */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🛍️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {order.productName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      数量: {order.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      下单时间: {order.orderDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-500">¥{order.price}</p>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-2">
                  {order.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleOrderAction(order.id, "pay")}
                        className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                      >
                        立即付款
                      </button>
                      <button
                        onClick={() => handleOrderAction(order.id, "cancel")}
                        className="flex-1 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600"
                      >
                        取消订单
                      </button>
                    </>
                  )}
                  {order.status === "delivered" && (
                    <button
                      onClick={() => handleOrderAction(order.id, "review")}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                    >
                      评价商品
                    </button>
                  )}
                  {order.status === "shipped" && (
                    <button
                      onClick={() => handleOrderAction(order.id, "track")}
                      className="flex-1 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                    >
                      查看物流
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
