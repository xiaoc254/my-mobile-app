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

interface FeedingSchedule {
  id: string;
  time: string;
  food: string;
  amount: string;
  period: "morning" | "noon" | "evening";
}

export default function FeedingPlan() {
  const navigate = useNavigate();
  const location = useLocation();

  // 从路由参数获取选中的宠物ID
  const selectedPetId = location.state?.selectedPetId || "buding";

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

  // 不同宠物的喂食计划数据
  const petFeedingSchedules: Record<string, FeedingSchedule[]> = {
    buding: [
      {
        id: "1",
        time: "8:00",
        food: "狗粮",
        amount: "180g",
        period: "morning",
      },
      {
        id: "2",
        time: "8:00",
        food: "零食",
        amount: "20g",
        period: "morning",
      },
      {
        id: "3",
        time: "12:30",
        food: "零食",
        amount: "20g",
        period: "noon",
      },
      {
        id: "4",
        time: "5:00",
        food: "狗粮",
        amount: "150g",
        period: "evening",
      },
    ],
    xueqiu: [
      {
        id: "1",
        time: "7:30",
        food: "狗粮",
        amount: "200g",
        period: "morning",
      },
      {
        id: "2",
        time: "12:00",
        food: "零食",
        amount: "30g",
        period: "noon",
      },
      {
        id: "3",
        time: "18:00",
        food: "狗粮",
        amount: "180g",
        period: "evening",
      },
    ],
  };

  const [currentPet, setCurrentPet] = useState<PetInfo>(petData.buding);
  const [feedingSchedules, setFeedingSchedules] = useState<FeedingSchedule[]>(
    []
  );
  const [currentPetId, setCurrentPetId] = useState<string>(selectedPetId);
  const [isReminderOn, setIsReminderOn] = useState(true);

  // 根据选中的宠物更新数据
  useEffect(() => {
    const pet = petData[currentPetId] || petData.buding;
    const schedules =
      petFeedingSchedules[currentPetId] || petFeedingSchedules.buding;

    setCurrentPet(pet);
    setFeedingSchedules(schedules);
  }, [currentPetId]);

  // 切换宠物
  const handleSwitchPet = () => {
    const newPetId = currentPetId === "buding" ? "xueqiu" : "buding";
    setCurrentPetId(newPetId);
  };

  // 切换提醒开关
  const handleReminderToggle = () => {
    setIsReminderOn(!isReminderOn);
  };

  // 处理返回
  const handleBack = () => {
    navigate("/pet");
  };

  // 跳转到完成喂食页面 - 直接跳转，无状态变化
  const handleCompleteFeeding = (schedule: FeedingSchedule) => {
    console.log("=== 点击去完成按钮 ===");
    console.log("喂食计划:", schedule);
    console.log("当前宠物ID:", currentPetId);
    console.log("准备跳转到完成喂食页面...");

    // 直接跳转，不修改任何状态
    navigate("/feeding-complete", {
      state: {
        selectedPetId: currentPetId,
        feedingSchedule: schedule,
      },
    });

    console.log("跳转命令已执行");
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

  // 按时间段分组喂食计划
  const groupedSchedules = feedingSchedules.reduce((acc, schedule) => {
    if (!acc[schedule.period]) {
      acc[schedule.period] = [];
    }
    acc[schedule.period].push(schedule);
    return acc;
  }, {} as Record<string, FeedingSchedule[]>);

  // 营养成分数据
  const nutritionData = [
    { name: "蛋白质", color: "#007bff", value: 25 },
    { name: "脂肪", color: "#20c997", value: 20 },
    { name: "碳水化合物", color: "#28a745", value: 15 },
    { name: "维生素", color: "#ffc107", value: 12 },
    { name: "数据5", color: "#fd7e14", value: 10 },
    { name: "数据6", color: "#dc3545", value: 8 },
    { name: "数据7", color: "#6f42c1", value: 10 },
  ];

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#fff",
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
        {/* 返回按钮 */}
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
              fontSize: "20px",
              cursor: "pointer",
              color: "#333",
              padding: "8px",
              borderRadius: "50%",
              transition: "background-color 0.2s ease",
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.backgroundColor = "#f0f0f0";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            ←
          </button>
          <h1
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
              marginLeft: "8px",
            }}
          >
            喂食计划
          </h1>
        </div>

        {/* 宠物信息 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          {/* 宠物头像 */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
                bottom: "8px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "60px",
                height: "8px",
                background: "linear-gradient(90deg, #f8d7da 0%, #f5c6cb 100%)",
                borderRadius: "4px",
                border: "1px solid #e0a6b0",
              }}
            />
          </div>

          {/* 宠物详细信息 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "#666",
                lineHeight: "1.3",
              }}
            >
              <div
                style={{
                  marginBottom: "2px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#333",
                }}
              >
                宠物名称: {currentPet.name}
              </div>
              <div style={{ marginBottom: "2px" }}>
                宠物品种: {currentPet.type}
              </div>
              <div style={{ marginBottom: "2px" }}>年龄: {currentPet.age}</div>
              <div>体重: {currentPet.weight}</div>
            </div>
          </div>

          {/* 切换按钮 */}
          <button
            onClick={handleSwitchPet}
            style={{
              background: "#ff4757",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: "500",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(255, 71, 87, 0.3)",
              transition: "transform 0.2s ease",
              flexShrink: 0,
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.95)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            切换
          </button>
        </div>

        {/* 修改计划按钮 */}
        <button
          style={{
            width: "100%",
            height: "40px",
            background: "linear-gradient(135deg, #CBA43F 0%, #D4AF37 100%)",
            border: "none",
            borderRadius: "10px",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 3px 8px rgba(203, 164, 63, 0.4)",
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
          修改计划
        </button>
      </div>

      {/* 喂食计划区域 */}
      <div
        style={{
          padding: "16px",
          background: "#f5f5f5",
          flex: 1,
          overflow: "auto",
        }}
      >
        {/* 喂食计划标题 */}
        <h2
          style={{
            margin: "0 0 16px 0",
            fontSize: "16px",
            fontWeight: "600",
            color: "#333",
          }}
        >
          喂食计划
        </h2>

        {/* 按时间段显示喂食计划 */}
        {Object.entries(groupedSchedules).map(([period, schedules]) => (
          <div
            key={period}
            style={{
              marginBottom: "16px",
            }}
          >
            {/* 时间段标题 */}
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#333",
                marginBottom: "8px",
                paddingLeft: "4px",
              }}
            >
              {getPeriodName(period)}
            </div>

            {/* 喂食项目 */}
            <div
              style={{
                background: "#fff",
                borderRadius: "8px",
                padding: "12px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              }}
            >
              {schedules.map((schedule, index) => (
                <div
                  key={schedule.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: index < schedules.length - 1 ? "8px" : "0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    {/* 食物图标 */}
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        background: "#CBA43F",
                        borderRadius: "2px",
                        marginRight: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "10px",
                        color: "#fff",
                      }}
                    >
                      🍽️
                    </div>

                    {/* 喂食信息 */}
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#333",
                        fontWeight: "500",
                      }}
                    >
                      {schedule.time}喂食{schedule.amount}
                      {schedule.food}
                    </div>
                  </div>

                  {/* 去完成按钮 - 直接跳转，无状态变化 */}
                  <button
                    onClick={() => handleCompleteFeeding(schedule)}
                    style={{
                      background:
                        "linear-gradient(135deg, #CBA43F 0%, #D4AF37 100%)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      fontSize: "11px",
                      fontWeight: "500",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(203, 164, 63, 0.3)",
                      transition: "transform 0.2s ease",
                      flexShrink: 0,
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = "scale(0.95)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    去完成
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 底部提醒和营养分析区域 */}
      <div
        style={{
          padding: "16px",
          background: "#fff",
          borderTop: "1px solid #f0f0f0",
          flexShrink: 0,
        }}
      >
        {/* 提醒我喂食 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            padding: "12px",
            background: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #e9ecef",
          }}
        >
          <button
            style={{
              background: "linear-gradient(135deg, #CBA43F 0%, #D4AF37 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(203, 164, 63, 0.3)",
            }}
          >
            提醒我喂食
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              onClick={handleReminderToggle}
              style={{
                width: "44px",
                height: "24px",
                background: isReminderOn ? "#CBA43F" : "#e9ecef",
                borderRadius: "12px",
                position: "relative",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: isReminderOn ? "2px" : "22px",
                  top: "2px",
                  width: "20px",
                  height: "20px",
                  background: "#fff",
                  borderRadius: "50%",
                  transition: "right 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "12px",
                color: "#666",
                fontWeight: "500",
              }}
            >
              当前提醒方式为震动
            </span>
          </div>
        </div>

        {/* 营养分析 */}
        <div
          style={{
            marginBottom: "12px",
          }}
        >
          <button
            style={{
              background: "linear-gradient(135deg, #CBA43F 0%, #D4AF37 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(203, 164, 63, 0.3)",
              marginBottom: "8px",
            }}
          >
            营养分析
          </button>

          <div
            style={{
              fontSize: "12px",
              color: "#666",
              marginBottom: "12px",
              padding: "8px",
              background: "#f8f9fa",
              borderRadius: "6px",
              border: "1px solid #e9ecef",
            }}
          >
            提示建议: 可适当喂食维生素食品
          </div>
        </div>

        {/* 营养成分图表 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          {/* 图例 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {nutritionData.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    background: item.color,
                    borderRadius: "2px",
                  }}
                />
                <span
                  style={{
                    color: "#333",
                    fontWeight: "500",
                  }}
                >
                  {item.name}
                </span>
              </div>
            ))}
          </div>

          {/* 圆形图表 */}
          <div
            style={{
              width: "80px",
              height: "80px",
              position: "relative",
            }}
          >
            <svg
              width="80"
              height="80"
              style={{
                transform: "rotate(-90deg)",
              }}
            >
              {nutritionData.map((item, index) => {
                const total = nutritionData.reduce(
                  (sum, d) => sum + d.value,
                  0
                );
                const percentage = item.value / total;
                const circumference = 2 * Math.PI * 30;
                const strokeDasharray = `${
                  circumference * percentage
                } ${circumference}`;
                const strokeDashoffset = nutritionData
                  .slice(0, index)
                  .reduce(
                    (sum, d) => sum + (d.value / total) * circumference,
                    0
                  );

                return (
                  <circle
                    key={index}
                    cx="40"
                    cy="40"
                    r="30"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                    }}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
