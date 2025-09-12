import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PetAgeWeight: React.FC = () => {
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [ageUnit, setAgeUnit] = useState<"months" | "years">("months");

  const handleNext = () => {
    if (age.trim() && weight.trim()) {
      // 这里可以保存数据到状态管理或发送到后端
      console.log("Pet age:", age, ageUnit);
      console.log("Pet weight:", weight);
      navigate("/pet-detail");
    }
  };

  const handleBack = () => {
    navigate("/pet-avatar-nickname");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-md mx-auto">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            宠物年龄和体重
          </h1>
          <p className="text-gray-600">告诉我们你的宠物的基本信息</p>
        </div>

        {/* 年龄输入 */}
        <div className="mb-8">
          <label className="block text-lg font-medium text-gray-700 mb-3">
            宠物年龄
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="请输入年龄"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              min="0"
              max="30"
            />
            <select
              value={ageUnit}
              onChange={(e) => setAgeUnit(e.target.value as "months" | "years")}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white"
            >
              <option value="months">月</option>
              <option value="years">岁</option>
            </select>
          </div>
        </div>

        {/* 体重输入 */}
        <div className="mb-8">
          <label className="block text-lg font-medium text-gray-700 mb-3">
            宠物体重
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="请输入体重"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              min="0"
              step="0.1"
            />
            <span className="flex items-center px-4 py-3 text-lg text-gray-600 bg-gray-100 rounded-lg">
              公斤
            </span>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡
            提示：准确的年龄和体重信息有助于我们为你的宠物制定更合适的健康计划
          </p>
        </div>

        {/* 按钮组 */}
        <div className="flex space-x-4">
          <button
            onClick={handleBack}
            className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            返回
          </button>
          <button
            onClick={handleNext}
            disabled={!age.trim() || !weight.trim()}
            className="flex-1 py-3 px-6 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            完成设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetAgeWeight;
