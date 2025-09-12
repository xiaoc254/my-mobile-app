import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import catImage from "../image/cat.jpg";
import dogImage from "../image/dog.jpg";

interface PetInfo {
  id: string;
  name: string;
  type: string;
  age: string;
  weight: string;
  avatar: string;
}

export default function FeedingComplete() {
  const navigate = useNavigate();
  const location = useLocation();

  // 从路由参数获取选中的宠物ID和喂食计划信息
  const selectedPetId = location.state?.selectedPetId || "buding";
  const feedingSchedule = location.state?.feedingSchedule || null;

  // 宠物信息数据
  const petData: Record<string, PetInfo> = {
    buding: {
      id: "buding",
      name: "布丁",
      type: "猫咪",
      age: "一年零三个月",
      weight: "10KG",
      avatar: catImage,
    },
    xueqiu: {
      id: "xueqiu",
      name: "雪球",
      type: "狗狗",
      age: "两年零一个月",
      weight: "15KG",
      avatar: dogImage,
    },
  };

  const [currentPet, setCurrentPet] = useState<PetInfo>(petData.buding);
  const [isCompleted, setIsCompleted] = useState(false);

  // 根据选中的宠物更新数据
  useEffect(() => {
    const pet = petData[selectedPetId] || petData.buding;
    setCurrentPet(pet);
  }, [selectedPetId]);

  const handleBack = () => {
    navigate("/feeding-plan", { state: { selectedPetId: selectedPetId } });
  };

  // 确认完成喂食
  const handleConfirmFeeding = () => {
    setIsCompleted(true);

    // 设置localStorage标记，表示喂食任务已完成
    localStorage.setItem("lastVisitedTask", "feeding");

    // 这里可以添加完成喂食的逻辑，比如保存到数据库
    console.log(
      `完成喂食: ${feedingSchedule?.time} ${feedingSchedule?.amount}${feedingSchedule?.food}`
    );
    console.log("已设置喂食任务完成标记");

    // 2秒后自动返回喂食计划页面
    setTimeout(() => {
      navigate("/feeding-plan", { state: { selectedPetId: selectedPetId } });
    }, 2000);
  };

  // 获取时间段的中文名称
  const getPeriodName = (period: string) => {
    switch (period) {
      case "morning":
        return "早";
      case "noon":
        return "中";
      case "evening":
        return "晚";
      default:
        return period;
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#f5f5f5",
        fontFamily:
          "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 顶部区域 */}
      <div
        style={{
          background: "#fff",
          padding: "12px 16px 16px 16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          flexShrink: 0,
        }}
      >
        {/* 返回按钮和标题 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <button
            onClick={handleBack}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              padding: "8px",
              color: "#333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ←
          </button>
          <span
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#333",
              marginLeft: "12px",
            }}
          >
            完成喂食
          </span>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div
        style={{
          padding: "20px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!isCompleted ? (
          <>
            {/* 宠物头像 */}
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                overflow: "hidden",
                marginBottom: "24px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                position: "relative",
              }}
            >
              <img
                src={currentPet.avatar}
                alt={currentPet.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              {/* 模拟项圈 */}
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "80px",
                  height: "10px",
                  background:
                    "linear-gradient(90deg, #f8d7da 0%, #f5c6cb 100%)",
                  borderRadius: "5px",
                  border: "1px solid #e0a6b0",
                }}
              />
            </div>

            {/* 喂食信息卡片 */}
            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                marginBottom: "32px",
                width: "100%",
                maxWidth: "320px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#333",
                  textAlign: "center",
                }}
              >
                喂食计划
              </h2>

              {feedingSchedule && (
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginBottom: "8px",
                    }}
                  >
                    时间段: {getPeriodName(feedingSchedule.period)}
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#333",
                      marginBottom: "4px",
                    }}
                  >
                    {feedingSchedule.time}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                    }}
                  >
                    喂食 {feedingSchedule.amount} {feedingSchedule.food}
                  </div>
                </div>
              )}

              <div
                style={{
                  fontSize: "12px",
                  color: "#999",
                  textAlign: "center",
                  lineHeight: "1.4",
                }}
              >
                请确认您已经完成了这次喂食
              </div>
            </div>

            {/* 确认按钮 */}
            <button
              onClick={handleConfirmFeeding}
              style={{
                width: "100%",
                maxWidth: "320px",
                height: "48px",
                background: "linear-gradient(135deg, #CBA43F 0%, #D4AF37 100%)",
                border: "none",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(203, 164, 63, 0.4)",
                transition: "transform 0.2s ease",
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.98)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              确认完成喂食
            </button>
          </>
        ) : (
          /* 完成状态 */
          <div
            style={{
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
              }}
            >
              ✅
            </div>
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "20px",
                fontWeight: "600",
                color: "#28a745",
              }}
            >
              喂食完成！
            </h2>
            <p
              style={{
                margin: "0 0 24px 0",
                fontSize: "14px",
                color: "#666",
              }}
            >
              正在返回喂食计划页面...
            </p>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid #f3f3f3",
                borderTop: "3px solid #CBA43F",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto",
              }}
            />
          </div>
        )}
      </div>

      {/* 添加旋转动画 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
