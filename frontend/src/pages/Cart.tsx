import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
  Stepper,
  SwipeAction,
  Image,
  NavBar,
  Toast,
  Loading,
  Empty,
  Dialog,
} from "antd-mobile";
// import { DeleteOutline } from "antd-mobile-icons";
import { cartAPI, IMAGE_BASE_URL } from "../services/apiz";

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productBrand: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  spec: string;
  selected: boolean;
  addedAt: string;
}

interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  selectedAmount: number;
  createdAt: string;
  updatedAt: string;
}

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // 获取购物车数据
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response: any = await cartAPI.getCart();

      if (response.success) {
        setCart(response.data);
      } else {
        Toast.show("获取购物车失败");
      }
    } catch (error) {
      console.error("获取购物车错误:", error);
      Toast.show("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 更新商品数量
  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) return;

    try {
      setUpdating(true);
      const response: any = await cartAPI.updateCartItem(itemId, quantity);

      if (response.success) {
        setCart(response.data);
      } else {
        Toast.show("更新失败");
      }
    } catch (error) {
      console.error("更新数量错误:", error);
      Toast.show("更新失败");
    } finally {
      setUpdating(false);
    }
  };

  // 切换商品选中状态
  const toggleItemSelection = async (itemId: string, selected: boolean) => {
    try {
      setUpdating(true);
      const response: any = await cartAPI.toggleCartItem(itemId, selected);

      if (response.success) {
        setCart(response.data);
      } else {
        Toast.show("操作失败");
      }
    } catch (error) {
      console.error("切换选中状态错误:", error);
      Toast.show("操作失败");
    } finally {
      setUpdating(false);
    }
  };

  // 删除商品
  const removeItem = async (itemId: string) => {
    try {
      setUpdating(true);
      const response: any = await cartAPI.removeFromCart(itemId);

      if (response.success) {
        setCart(response.data);
        Toast.show("商品已删除");
      } else {
        Toast.show("删除失败");
      }
    } catch (error) {
      console.error("删除商品错误:", error);
      Toast.show("删除失败");
    } finally {
      setUpdating(false);
    }
  };

  // 全选/取消全选
  const toggleAllItems = async () => {
    if (!cart) return;

    const allSelected = cart.items.every((item) => item.selected);

    try {
      setUpdating(true);
      const response: any = await cartAPI.toggleAllItems(!allSelected);

      if (response.success) {
        setCart(response.data);
      } else {
        Toast.show("操作失败");
      }
    } catch (error) {
      console.error("全选操作错误:", error);
      Toast.show("操作失败");
    } finally {
      setUpdating(false);
    }
  };

  // 清空购物车
  const clearCart = async () => {
    const result = await Dialog.confirm({
      content: "确定要清空购物车吗？",
    });

    if (result) {
      try {
        setUpdating(true);
        const response: any = await cartAPI.clearCart();

        if (response.success) {
          setCart(response.data);
          Toast.show("购物车已清空");
        } else {
          Toast.show("清空失败");
        }
      } catch (error) {
        console.error("清空购物车错误:", error);
        Toast.show("清空失败");
      } finally {
        setUpdating(false);
      }
    }
  };

  // 结算
  const checkout = () => {
    if (!cart || cart.items.filter((item) => item.selected).length === 0) {
      Toast.show("请选择要结算的商品");
      return;
    }

    // 获取选中的商品
    const selectedItems = cart.items.filter((item) => item.selected);

    // 转换为结算页面需要的格式
    const checkoutItems = selectedItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      productBrand: item.productBrand,
      price: item.price,
      originalPrice: item.originalPrice,
      quantity: item.quantity,
      spec: item.spec,
      selected: true,
    }));

    Toast.show({
      content: "正在跳转到结算页面...",
      afterClose: () => {
        // 跳转到订单管理页面的结算模式
        navigate("/order-management", {
          state: {
            type: "cartCheckout",
            items: checkoutItems,
          },
        });
      },
    });
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

  return (
    <div style={{ paddingBottom: "80px", backgroundColor: "#f5f5f5" }}>
      {/* 导航栏 */}
      <NavBar
        onBack={() => navigate(-1)}
        style={{ backgroundColor: "white" }}
        right={
          cart && cart.items.length > 0 ? (
            <span
              onClick={clearCart}
              style={{ fontSize: "14px", color: "#999" }}
            >
              清空
            </span>
          ) : null
        }
      >
        购物车
        {cart && cart.items.length > 0 && (
          <span style={{ fontSize: "12px", color: "#999", marginLeft: "8px" }}>
            ({cart.totalItems}件)
          </span>
        )}
      </NavBar>

      {/* 购物车内容 */}
      {!cart || cart.items.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
            padding: "20px",
          }}
        >
          <Empty description="购物车是空的" style={{ marginBottom: "20px" }} />
          <Button
            color="primary"
            onClick={() => navigate("/shop")}
            style={{ width: "60%" }}
          >
            去逛逛
          </Button>
        </div>
      ) : (
        <>
          {/* 全选区域 */}
          <div
            style={{
              backgroundColor: "white",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                checked={cart.items.every((item) => item.selected)}
                onChange={toggleAllItems}
                disabled={updating}
              >
                全选
              </Checkbox>
            </div>
            <span style={{ fontSize: "12px", color: "#999" }}>
              共{cart.totalItems}件商品
            </span>
          </div>

          {/* 商品列表 */}
          <div style={{ backgroundColor: "white" }}>
            {cart.items.map((item, index) => (
              <SwipeAction
                key={item.id}
                rightActions={[
                  {
                    key: "delete",
                    text: "删除",
                    color: "danger",
                    onClick: () => removeItem(item.id),
                  },
                ]}
              >
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom:
                      index < cart.items.length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start" }}>
                    {/* 选择框 */}
                    <div style={{ marginRight: "12px", marginTop: "8px" }}>
                      <Checkbox
                        checked={item.selected}
                        onChange={(checked) =>
                          toggleItemSelection(item.id, checked)
                        }
                        disabled={updating}
                      />
                    </div>

                    {/* 商品图片 */}
                    <div style={{ marginRight: "12px", flexShrink: 0 }}>
                      <Image
                        src={`${IMAGE_BASE_URL}${item.productImage}`}
                        width={80}
                        height={80}
                        style={{ borderRadius: "8px" }}
                        fit="cover"
                        onClick={() => navigate(`/product/${item.productId}`)}
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
                      {/* 品牌 */}
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#1890ff",
                          marginBottom: "4px",
                        }}
                      >
                        {item.productBrand}
                      </div>

                      {/* 商品名称 */}
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          lineHeight: "1.4",
                          marginBottom: "4px",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                        onClick={() => navigate(`/product/${item.productId}`)}
                      >
                        {item.productName}
                      </div>

                      {/* 规格 */}
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#999",
                          marginBottom: "8px",
                        }}
                      >
                        规格: {item.spec}
                      </div>

                      {/* 价格和数量 */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{ display: "flex", alignItems: "baseline" }}
                        >
                          <span
                            style={{
                              fontSize: "16px",
                              fontWeight: "bold",
                              color: "#FF4500",
                              marginRight: "8px",
                            }}
                          >
                            ¥{item.price}
                          </span>
                          {item.originalPrice && (
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#999",
                                textDecoration: "line-through",
                              }}
                            >
                              ¥{item.originalPrice}
                            </span>
                          )}
                        </div>

                        <Stepper
                          value={item.quantity}
                          onChange={(value) => updateQuantity(item.id, value)}
                          min={1}
                          max={999}
                          disabled={updating}
                          style={{ fontSize: "14px" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </SwipeAction>
            ))}
          </div>
        </>
      )}

      {/* 底部结算栏 */}
      {cart && cart.items.length > 0 && (
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
          <div style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              checked={cart.items.every((item) => item.selected)}
              onChange={toggleAllItems}
              disabled={updating}
            >
              全选
            </Checkbox>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "#999" }}>
                已选{cart.items.filter((item) => item.selected).length}件
              </div>
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <span style={{ fontSize: "12px", color: "#999" }}>合计: </span>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#FF4500",
                  }}
                >
                  ¥{cart.selectedAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              color="primary"
              onClick={checkout}
              disabled={
                cart.items.filter((item) => item.selected).length === 0 ||
                updating
              }
              style={{ minWidth: "80px" }}
            >
              结算
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
