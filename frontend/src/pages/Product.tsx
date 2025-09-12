import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface ProductData {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
}

const Product: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟获取商品数据
    const fetchProduct = async () => {
      setLoading(true);
      // 这里应该调用实际的API
      setTimeout(() => {
        setProduct({
          id: id || "1",
          name: "优质宠物食品",
          price: 99.99,
          description:
            "这是一款专为宠物设计的优质食品，富含营养，适合各种年龄段的宠物。",
          image: "/api/placeholder/300/300",
          category: "宠物食品",
          stock: 50,
        });
        setLoading(false);
      }, 1000);
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      // 这里应该调用添加到购物车的API
      console.log("添加到购物车:", { product: product.id, quantity });
      alert("已添加到购物车！");
    }
  };

  const handleBuyNow = () => {
    if (product && quantity > 0) {
      // 这里应该跳转到结算页面
      console.log("立即购买:", { product: product.id, quantity });
      navigate("/order-management");
    }
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">商品不存在</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            返回
          </button>
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
          <h1 className="text-lg font-semibold">商品详情</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* 商品图片 */}
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-6xl">🛍️</span>
          </div>
        </div>

        {/* 商品信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {product.name}
          </h2>
          <p className="text-gray-600 mb-4">{product.description}</p>

          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-red-500">
              ¥{product.price}
            </span>
            <span className="text-sm text-gray-500">库存: {product.stock}</span>
          </div>

          {/* 数量选择 */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">数量:</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
              >
                -
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <button
            onClick={handleAddToCart}
            className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            加入购物车
          </button>
          <button
            onClick={handleBuyNow}
            className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            立即购买
          </button>
        </div>
      </div>
    </div>
  );
};

export default Product;
