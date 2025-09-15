import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import catImage from "../image/cat.jpg";
import dogImage from "../image/dog.jpg";

interface ExercisePlan {
  id: string;
  name: string;
  duration: number; // 分钟
  type: "walk" | "play" | "training" | "other";
  reminder: boolean;
  reminderTime: string;
  completed: boolean;
  completedAt?: string;
}

export default function ExercisePlan() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPetId = location.state?.selectedPetId || "buding";

  // 获取宠物信息
  const getPetInfo = () => {
    if (selectedPetId === "buding") {
      return { name: "布丁", type: "cat", avatar: catImage };
    } else if (selectedPetId === "xueqiu") {
      return { name: "雪球", type: "dog", avatar: dogImage };
    }
    return { name: "布丁", type: "cat", avatar: catImage };
  };

  const petInfo = getPetInfo();

  // 运动计划状态
  const [exercisePlans, setExercisePlans] = useState<ExercisePlan[]>([
    {
      id: "1",
      name: "晨间散步",
      duration: 30,
      type: "walk",
      reminder: true,
      reminderTime: "08:00",
      completed: false,
    },
    {
      id: "2",
      name: "玩耍时间",
      duration: 20,
      type: "play",
      reminder: true,
      reminderTime: "15:00",
      completed: false,
    },
    {
      id: "3",
      name: "训练课程",
      duration: 15,
      type: "training",
      reminder: false,
      reminderTime: "19:00",
      completed: false,
    },
  ]);

  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    duration: 30,
    type: "walk" as ExercisePlan["type"],
    reminder: true,
    reminderTime: "08:00",
  });

  // 处理返回
  const handleBack = () => {
    navigate(-1);
  };

  // 切换计划完成状态
  const togglePlanCompletion = (planId: string) => {
    setExercisePlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
              ...plan,
              completed: !plan.completed,
              completedAt: !plan.completed
                ? new Date().toISOString()
                : undefined,
            }
          : plan
      )
    );
  };

  // 添加新计划
  const handleAddPlan = () => {
    if (newPlan.name.trim()) {
      const plan: ExercisePlan = {
        id: Date.now().toString(),
        name: newPlan.name,
        duration: newPlan.duration,
        type: newPlan.type,
        reminder: newPlan.reminder,
        reminderTime: newPlan.reminderTime,
        completed: false,
      };
      setExercisePlans((prev) => [...prev, plan]);
      setNewPlan({
        name: "",
        duration: 30,
        type: "walk",
        reminder: true,
        reminderTime: "08:00",
      });
      setShowAddPlan(false);
    }
  };

  // 删除计划
  const handleDeletePlan = (planId: string) => {
    setExercisePlans((prev) => prev.filter((plan) => plan.id !== planId));
  };

  // 获取运动类型图标
  const getExerciseIcon = (type: ExercisePlan["type"]) => {
    switch (type) {
      case "walk":
        return "🚶";
      case "play":
        return "🎾";
      case "training":
        return "🎯";
      case "other":
        return "⚽";
      default:
        return "🏃";
    }
  };

  // 获取运动类型名称
  const getExerciseTypeName = (type: ExercisePlan["type"]) => {
    switch (type) {
      case "walk":
        return "散步";
      case "play":
        return "玩耍";
      case "training":
        return "训练";
      case "other":
        return "其他";
      default:
        return "运动";
    }
  };

  // 计算完成率
  const completionRate =
    exercisePlans.length > 0
      ? Math.round(
          (exercisePlans.filter((plan) => plan.completed).length /
            exercisePlans.length) *
            100
        )
      : 0;

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "#fff",
        padding: "0",
        fontFamily:
          "PingFang SC, -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      {/* 顶部导航栏 */}
      <div
        style={{
          height: "60px",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid #f0f0f0",
          position: "relative",
          zIndex: 10,
        }}
      >
        <button
          onClick={handleBack}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            color: "#333",
            padding: "8px",
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
          }}
        >
          运动计划
        </h1>
        <div style={{ width: "34px" }}></div>
      </div>

      {/* 主要内容区域 */}
      <div
        style={{
          height: "calc(100vh - 60px)",
          overflow: "auto",
          padding: "20px",
        }}
      >
        {/* 宠物信息卡片 */}
        <div
          style={{
            background: "#FFBF6B",
            borderRadius: "15px",
            padding: "20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "15px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <img
              src={petInfo.avatar}
              alt={petInfo.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "bold",
                color: "#fff",
                marginBottom: "5px",
              }}
            >
              {petInfo.name}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#fff",
                opacity: 0.9,
              }}
            >
              {petInfo.type === "cat" ? "喵星人" : "汪星人"} · 运动计划管理
            </p>
          </div>
        </div>

        {/* 修改计划按钮 */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setShowAddPlan(true)}
            style={{
              width: "100%",
              height: "50px",
              background: "#CBA43F",
              border: "none",
              borderRadius: "25px",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(203, 164, 63, 0.3)",
              transition: "transform 0.2s ease",
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
            + 添加运动计划
          </button>
        </div>

        {/* 运动计划列表 */}
        <div
          style={{
            background: "#fff",
            borderRadius: "15px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h3
            style={{
              margin: "0 0 15px 0",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            今日运动计划
          </h3>

          {exercisePlans.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#999",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>🏃</div>
              <p>还没有运动计划</p>
              <p style={{ fontSize: "12px", marginTop: "5px" }}>
                点击上方按钮添加计划
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {exercisePlans.map((plan) => (
                <div
                  key={plan.id}
                  style={{
                    background: plan.completed ? "#f8f9fa" : "#fff",
                    border: plan.completed
                      ? "1px solid #e9ecef"
                      : "1px solid #f0f0f0",
                    borderRadius: "12px",
                    padding: "15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    opacity: plan.completed ? 0.7 : 1,
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flex: 1,
                    }}
                  >
                    <div style={{ fontSize: "24px" }}>
                      {getExerciseIcon(plan.type)}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: plan.completed ? "#999" : "#333",
                          textDecoration: plan.completed
                            ? "line-through"
                            : "none",
                        }}
                      >
                        {plan.name}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginTop: "2px",
                        }}
                      >
                        {getExerciseTypeName(plan.type)} · {plan.duration}分钟
                        {plan.reminder && ` · ${plan.reminderTime}提醒`}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <button
                      onClick={() => togglePlanCompletion(plan.id)}
                      style={{
                        background: plan.completed ? "#28a745" : "#FFBF6B",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {plan.completed ? "✓ 已完成" : "去完成"}
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      style={{
                        background: "#dc3545",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 8px",
                        color: "#fff",
                        fontSize: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 运动统计 */}
        <div
          style={{
            background: "#fff",
            borderRadius: "15px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
          }}
        >
          <h3
            style={{
              margin: "0 0 15px 0",
              fontSize: "16px",
              fontWeight: "bold",
              color: "#333",
            }}
          >
            今日统计
          </h3>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#FFBF6B",
                }}
              >
                {completionRate}%
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>完成率</div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#28a745",
                }}
              >
                {exercisePlans.filter((plan) => plan.completed).length}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>已完成</div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#007bff",
                }}
              >
                {exercisePlans.reduce(
                  (total, plan) => total + (plan.completed ? plan.duration : 0),
                  0
                )}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>分钟</div>
            </div>
          </div>
        </div>
      </div>

      {/* 添加计划弹窗 */}
      {showAddPlan && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "15px",
              padding: "25px",
              width: "100%",
              maxWidth: "400px",
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
                textAlign: "center",
              }}
            >
              添加运动计划
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div>
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "5px",
                    display: "block",
                  }}
                >
                  计划名称
                </label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) =>
                    setNewPlan((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="例如：晨间散步"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "5px",
                    display: "block",
                  }}
                >
                  运动类型
                </label>
                <select
                  value={newPlan.type}
                  onChange={(e) =>
                    setNewPlan((prev) => ({
                      ...prev,
                      type: e.target.value as ExercisePlan["type"],
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="walk">散步</option>
                  <option value="play">玩耍</option>
                  <option value="training">训练</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "5px",
                    display: "block",
                  }}
                >
                  持续时间（分钟）
                </label>
                <input
                  type="number"
                  value={newPlan.duration}
                  onChange={(e) =>
                    setNewPlan((prev) => ({
                      ...prev,
                      duration: parseInt(e.target.value) || 30,
                    }))
                  }
                  min="1"
                  max="180"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "5px",
                    display: "block",
                  }}
                >
                  提醒时间
                </label>
                <input
                  type="time"
                  value={newPlan.reminderTime}
                  onChange={(e) =>
                    setNewPlan((prev) => ({
                      ...prev,
                      reminderTime: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="checkbox"
                  checked={newPlan.reminder}
                  onChange={(e) =>
                    setNewPlan((prev) => ({
                      ...prev,
                      reminder: e.target.checked,
                    }))
                  }
                  style={{ transform: "scale(1.2)" }}
                />
                <label style={{ fontSize: "14px", color: "#333" }}>
                  启用提醒
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "25px" }}>
              <button
                onClick={() => setShowAddPlan(false)}
                style={{
                  flex: 1,
                  height: "45px",
                  background: "#f8f9fa",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  color: "#666",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                取消
              </button>
              <button
                onClick={handleAddPlan}
                style={{
                  flex: 1,
                  height: "45px",
                  background: "#FFBF6B",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
