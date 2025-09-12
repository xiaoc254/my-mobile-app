import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PetAvatarNickname: React.FC = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  const avatars = [
    "🐱",
    "🐶",
    "🐰",
    "🐹",
    "🐭",
    "🐨",
    "🐼",
    "🐸",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🐔",
    "🐧",
  ];

  const handleNext = () => {
    if (nickname.trim() && selectedAvatar) {
      // 这里可以保存数据到状态管理或发送到后端
      console.log("Pet nickname:", nickname);
      console.log("Selected avatar:", selectedAvatar);
      navigate("/pet-age-weight");
    }
  };

  const handleBack = () => {
    navigate("/pet-type-select");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-md mx-auto">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            设置头像和昵称
          </h1>
          <p className="text-gray-600">为你的宠物选择一个可爱的头像和昵称</p>
        </div>

        {/* 昵称输入 */}
        <div className="mb-8">
          <label className="block text-lg font-medium text-gray-700 mb-3">
            宠物昵称
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="请输入宠物的昵称"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            maxLength={10}
          />
        </div>

        {/* 头像选择 */}
        <div className="mb-8">
          <label className="block text-lg font-medium text-gray-700 mb-3">
            选择头像
          </label>
          <div className="grid grid-cols-4 gap-4">
            {avatars.map((avatar, index) => (
              <button
                key={index}
                onClick={() => setSelectedAvatar(avatar)}
                className={`w-16 h-16 text-3xl rounded-lg border-2 transition-all duration-200 ${
                  selectedAvatar === avatar
                    ? "border-blue-500 bg-blue-50 scale-110"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {avatar}
              </button>
            ))}
          </div>
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
            disabled={!nickname.trim() || !selectedAvatar}
            className="flex-1 py-3 px-6 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            下一步
          </button>
        </div>
      </div>
    </div>
  );
};

export default PetAvatarNickname;
