import React from "react";
import { useNavigate } from "react-router-dom";

const TestPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-md mx-auto">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            功能测试页面
          </h1>
          <p className="text-gray-600">这是一个用于测试各种功能的页面</p>
        </div>

        {/* 测试内容 */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              页面功能
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>✅ 路由导航测试</li>
              <li>✅ 组件渲染测试</li>
              <li>✅ 样式显示测试</li>
              <li>✅ 响应式布局测试</li>
            </ul>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              开发信息
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>环境：</strong> 开发环境
              </p>
              <p>
                <strong>框架：</strong> React + TypeScript
              </p>
              <p>
                <strong>构建工具：</strong> Vite
              </p>
              <p>
                <strong>样式：</strong> Tailwind CSS
              </p>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              测试按钮
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => alert("测试成功！")}
                className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                测试弹窗
              </button>
              <button
                onClick={() => console.log("控制台测试")}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                测试控制台
              </button>
            </div>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="mt-8">
          <button
            onClick={handleBack}
            className="w-full py-3 px-6 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
