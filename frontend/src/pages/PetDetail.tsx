import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import catImage from "../image/cat.jpg";
import dogImage from "../image/dog.jpg";

interface Task {
  id: string;
  time: string;
  title: string;
  status: "in_progress" | "completed";
  isSelected: boolean;
}

interface PetInfo {
  id: string;
  name: string;
  type: string;
  age: string;
  weight: string;
  avatar: string;
}

export default function PetDetail() {
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

  // 不同宠物的任务数据
  const petTasks: Record<string, Task[]> = {
    buding: [
      {
        id: "1",
        time: "2025/5/10 17:00",
        title: "猫咪运动计划",
        status: "in_progress",
        isSelected: false,
      },
      {
        id: "2",
        time: "2025/5/10 18:00",
        title: "猫咪喂食计划",
        status: "in_progress",
        isSelected: true,
      },
      {
        id: "3",
        time: "2025/5/9 10:00",
        title: "猫咪每日日志",
        status: "completed",
        isSelected: false,
      },
      {
        id: "4",
        time: "2025/5/9 11:00",
        title: "猫咪体温记录",
        status: "completed",
        isSelected: true,
      },
    ],
    xueqiu: [
      {
        id: "1",
        time: "2025/5/10 16:00",
        title: "狗狗散步计划",
        status: "in_progress",
        isSelected: false,
      },
      {
        id: "2",
        time: "2025/5/10 19:00",
        title: "狗狗喂食计划",
        status: "in_progress",
        isSelected: true,
      },
      {
        id: "3",
        time: "2025/5/9 09:00",
        title: "狗狗训练记录",
        status: "completed",
        isSelected: false,
      },
      {
        id: "4",
        time: "2025/5/9 14:00",
        title: "狗狗健康检查",
        status: "completed",
        isSelected: true,
      },
    ],
  };

  // 不同宠物的月度计划数据
  const petMonthlyPlans: Record<
    string,
    { walk: string; play: string; progress: number }
  > = {
    buding: {
      walk: "散步60h",
      play: "玩耍80h",
      progress: 45,
    },
    xueqiu: {
      walk: "散步120h",
      play: "玩耍150h",
      progress: 65,
    },
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPet, setCurrentPet] = useState<PetInfo>(petData.buding);
  const [monthlyPlan, setMonthlyPlan] = useState(petMonthlyPlans.buding);
  const [currentPetId, setCurrentPetId] = useState<string>(selectedPetId);

  // 根据选中的宠物更新数据
  useEffect(() => {
    const pet = petData[currentPetId] || petData.buding;
    const petTaskList = petTasks[currentPetId] || petTasks.buding;
    const petPlan = petMonthlyPlans[currentPetId] || petMonthlyPlans.buding;

    setCurrentPet(pet);
    setTasks(petTaskList);
    setMonthlyPlan(petPlan);
  }, [currentPetId]);

  const handleBack = () => {
    navigate("/pet");
  };

  // 切换宠物
  const handleSwitchPet = () => {
    const newPetId = currentPetId === "buding" ? "xueqiu" : "buding";
    setCurrentPetId(newPetId);
  };

  const handleTaskToggle = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, isSelected: !task.isSelected } : task
      )
    );
  };

  const handleTaskAction = (taskId: string, action: string) => {
    console.log(`Task ${taskId} - Action: ${action}`);

    // 根据任务类型和操作跳转到相应页面
    if (action === "complete") {
      switch (taskId) {
        case "2": // 喂食计划
          navigate("/feeding-plan", { state: { selectedPetId: currentPetId } });
          break;
        case "1": // 运动计划
          // 可以跳转到运动计划页面
          console.log("跳转到运动计划页面");
          break;
        case "3": // 每日日志
          // 可以跳转到日志页面
          console.log("跳转到每日日志页面");
          break;
        case "4": // 体温记录
          // 可以跳转到体温记录页面
          console.log("跳转到体温记录页面");
          break;
        default:
          console.log("未知任务类型");
      }
    } else if (action === "view" && taskId === "2") {
      navigate("/feeding-plan", { state: { selectedPetId: currentPetId } });
    }
  };

  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const completedTasks = tasks.filter((task) => task.status === "completed");

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
      {/* 顶部宠物信息区域 */}
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
            marginBottom: "12px",
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
              marginRight: "12px",
              color: "#333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ←
          </button>
        </div>

        {/* 宠物信息卡片 */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          {/* 宠物头像 */}
          <div
            style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
          </div>

          {/* 宠物信息 */}
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
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "2px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#333",
                  lineHeight: "1.2",
                }}
              >
                宠物名称: {currentPet.name}
              </span>
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

            <div
              style={{
                fontSize: "13px",
                color: "#666",
                lineHeight: "1.3",
              }}
            >
              <div style={{ marginBottom: "1px" }}>
                宠物品种: {currentPet.type}
              </div>
              <div style={{ marginBottom: "1px" }}>年龄: {currentPet.age}</div>
              <div>体重: {currentPet.weight}</div>
            </div>
          </div>
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

      {/* 今日计划提醒区域 */}
      <div
        style={{
          padding: "12px",
          background: "#f5f5f5",
          flex: 1,
          overflow: "auto",
        }}
      >
        <h2
          style={{
            margin: "0 0 12px 0",
            fontSize: "15px",
            fontWeight: "600",
            color: "#333",
          }}
        >
          今日计划提醒
        </h2>

        {/* 进行中的任务 */}
        <div
          style={{
            marginBottom: "12px",
          }}
        >
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "13px",
              fontWeight: "600",
              color: "#ff6b35",
            }}
          >
            进行中
          </h3>

          <div
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: "8px",
              padding: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            }}
          >
            {/* 连接线 */}
            <div
              style={{
                position: "absolute",
                left: "18px",
                top: "24px",
                bottom: "24px",
                width: "2px",
                background:
                  "linear-gradient(to bottom, #e0e0e0 0%, #e0e0e0 50%, transparent 50%, transparent 100%)",
                backgroundSize: "2px 4px",
                zIndex: 1,
              }}
            />

            {inProgressTasks.map((task, index) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginBottom:
                    index < inProgressTasks.length - 1 ? "8px" : "0",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {/* 时间点 */}
                <div
                  onClick={() => handleTaskToggle(task.id)}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: task.isSelected ? "#007bff" : "#fff",
                    border: "2px solid #007bff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "16px",
                    flexShrink: 0,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {task.isSelected && (
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#fff",
                      }}
                    />
                  )}
                </div>

                {/* 任务信息 */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#333",
                        marginBottom: "2px",
                      }}
                    >
                      {task.time}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      {task.title}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => handleTaskAction(task.id, "complete")}
                      style={{
                        background:
                          "linear-gradient(135deg, #CBA43F 0%, #D4AF37 100%)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "10px",
                        fontWeight: "500",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(203, 164, 63, 0.3)",
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
                      去完成
                    </button>
                    <button
                      onClick={() => handleTaskAction(task.id, "view")}
                      style={{
                        background: "#CBA43F",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "10px",
                        fontWeight: "500",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(203, 164, 63, 0.3)",
                      }}
                    >
                      查看记录
                    </button>
                    <button
                      onClick={() => handleTaskAction(task.id, "edit")}
                      style={{
                        background: "#CBA43F",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "10px",
                        fontWeight: "500",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(203, 164, 63, 0.3)",
                      }}
                    >
                      编辑计划
                    </button>
                    <button
                      onClick={() => handleTaskAction(task.id, "delete")}
                      style={{
                        background: "#CBA43F",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "10px",
                        fontWeight: "500",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(203, 164, 63, 0.3)",
                      }}
                    >
                      删除计划
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 已完成的任务 */}
        <div>
          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "13px",
              fontWeight: "600",
              color: "#28a745",
            }}
          >
            已完成
          </h3>

          <div
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: "8px",
              padding: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            }}
          >
            {/* 连接线 */}
            <div
              style={{
                position: "absolute",
                left: "18px",
                top: "24px",
                bottom: "24px",
                width: "2px",
                background:
                  "linear-gradient(to bottom, #e0e0e0 0%, #e0e0e0 50%, transparent 50%, transparent 100%)",
                backgroundSize: "2px 4px",
                zIndex: 1,
              }}
            />

            {completedTasks.map((task, index) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginBottom: index < completedTasks.length - 1 ? "8px" : "0",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {/* 时间点 */}
                <div
                  onClick={() => handleTaskToggle(task.id)}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: task.isSelected ? "#007bff" : "#fff",
                    border: "2px solid #007bff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "16px",
                    flexShrink: 0,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {task.isSelected && (
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#fff",
                      }}
                    />
                  )}
                </div>

                {/* 任务信息 */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#333",
                        marginBottom: "2px",
                      }}
                    >
                      {task.time}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      {task.title}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => handleTaskAction(task.id, "view")}
                      style={{
                        background: "#CBA43F",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "10px",
                        fontWeight: "500",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(203, 164, 63, 0.3)",
                      }}
                    >
                      查看记录
                    </button>
                    <button
                      onClick={() => handleTaskAction(task.id, "edit")}
                      style={{
                        background: "#CBA43F",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "10px",
                        fontWeight: "500",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(203, 164, 63, 0.3)",
                      }}
                    >
                      编辑计划
                    </button>
                    <button
                      onClick={() => handleTaskAction(task.id, "delete")}
                      style={{
                        background: "#CBA43F",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "10px",
                        fontWeight: "500",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(203, 164, 63, 0.3)",
                      }}
                    >
                      删除计划
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部月度计划和进度区域 */}
      <div
        style={{
          padding: "16px",
          background: "#fff",
          borderTop: "1px solid #f0f0f0",
          flexShrink: 0,
        }}
      >
        {/* 运动提醒 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
            padding: "10px",
            background: "#f8f9fa",
            borderRadius: "8px",
            border: "1px solid #e9ecef",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <button
              style={{
                background: "#CBA43F",
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
              提醒我运动
            </button>
            <div
              style={{
                width: "44px",
                height: "24px",
                background: "#28a745",
                borderRadius: "12px",
                position: "relative",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: "2px",
                  top: "2px",
                  width: "20px",
                  height: "20px",
                  background: "#fff",
                  borderRadius: "50%",
                  transition: "transform 0.2s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              />
            </div>
          </div>
          <span
            style={{
              fontSize: "12px",
              color: "#666",
              fontWeight: "500",
            }}
          >
            提醒方式为铃声
          </span>
        </div>

        {/* 月度计划 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
            }}
          >
            📅
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: "600",
              color: "#333",
            }}
          >
            本月计划
          </h3>
        </div>

        <div
          style={{
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              color: "#333",
              marginBottom: "4px",
              fontWeight: "500",
            }}
          >
            {monthlyPlan.walk}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#333",
              fontWeight: "500",
            }}
          >
            {monthlyPlan.play}
          </div>
        </div>

        {/* 进度显示 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "#666",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              目前进度
            </div>
          </div>
          <div
            style={{
              position: "relative",
              width: "60px",
              height: "60px",
            }}
          >
            {/* 进度圆环 */}
            <svg
              width="60"
              height="60"
              style={{
                transform: "rotate(-90deg)",
              }}
            >
              <circle
                cx="30"
                cy="30"
                r="24"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="5"
              />
              <circle
                cx="30"
                cy="30"
                r="24"
                fill="none"
                stroke="#CBA43F"
                strokeWidth="5"
                strokeDasharray={`${
                  2 * Math.PI * 24 * (monthlyPlan.progress / 100)
                } ${2 * Math.PI * 24}`}
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(203, 164, 63, 0.3))",
                }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "12px",
                fontWeight: "700",
                color: "#333",
              }}
            >
              {monthlyPlan.progress}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
