import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
}

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "全部" },
    { id: "food", name: "宠物食品" },
    { id: "toy", name: "玩具" },
    { id: "care", name: "护理用品" },
    { id: "accessory", name: "配件" },
  ];

  useEffect(() => {
    // 模拟获取商品数据
    const fetchProducts = async () => {
      setLoading(true);
      setTimeout(() => {
        setProducts([
          {
            id: "1",
            name: "优质狗粮",
            price: 99.99,
            image: "/api/placeholder/200/200",
            category: "food",
            rating: 4.5,
          },
          {
            id: "2",
            name: "猫咪玩具",
            price: 29.99,
            image: "/api/placeholder/200/200",
            category: "toy",
            rating: 4.2,
          },
          {
            id: "3",
            name: "宠物洗发水",
            price: 49.99,
            image: "/api/placeholder/200/200",
            category: "care",
            rating: 4.7,
          },
          {
            id: "4",
            name: "宠物项圈",
            price: 19.99,
            image: "/api/placeholder/200/200",
            category: "accessory",
            rating: 4.0,
          },
          {
            id: "5",
            name: "猫咪零食",
            price: 39.99,
            image: "/api/placeholder/200/200",
            category: "food",
            rating: 4.3,
          },
          {
            id: "6",
            name: "狗狗玩具球",
            price: 24.99,
            image: "/api/placeholder/200/200",
            category: "toy",
            rating: 4.1,
          },
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchProducts();
  }, []);

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleSearch = () => {
    // 这里可以实现搜索功能
    console.log("搜索功能");
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
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 mb-4">宠物商城</h1>

          {/* 搜索栏 */}
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              placeholder="搜索商品..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              搜索
            </button>
          </div>

          {/* 分类筛选 */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 商品网格 */}
      <div className="max-w-md mx-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              {/* 商品图片 */}
              <div className="aspect-square bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-4xl">🛍️</span>
              </div>

              {/* 商品信息 */}
              <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-red-500">
                  ¥{product.price}
                </span>
                <div className="flex items-center">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm text-gray-600 ml-1">
                    {product.rating}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">暂无商品</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
