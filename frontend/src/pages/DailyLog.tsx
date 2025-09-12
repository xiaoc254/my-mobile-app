import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import catImage from "../image/cat.jpg";
import dogImage from "../image/dog.jpg";

interface DailyLog {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: "happy" | "normal" | "sad" | "excited" | "tired";
  activities: string[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export default function DailyLog() {
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

  // 日志状态
  const [logs, setLogs] = useState<DailyLog[]>([
    {
      id: "1",
      date: new Date().toISOString().split("T")[0],
      title: "今天和布丁一起玩耍",
      content:
        "布丁今天特别活泼，我们一起玩了逗猫棒，它跳得很高，看起来很开心。",
      mood: "happy",
      activities: ["玩耍", "运动"],
      photos: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      title: "布丁的午睡时光",
      content: "布丁今天在阳台上晒着太阳睡了一整个下午，看起来很舒服。",
      mood: "normal",
      activities: ["休息"],
      photos: [],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const [showAddLog, setShowAddLog] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [newLog, setNewLog] = useState({
    title: "",
    content: "",
    mood: "happy" as DailyLog["mood"],
    activities: [] as string[],
  });

  // 处理返回
  const handleBack = () => {
    navigate("/pet");
  };

  // 添加新日志
  const handleAddLog = () => {
    if (newLog.title.trim() && newLog.content.trim()) {
      const log: DailyLog = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        title: newLog.title,
        content: newLog.content,
        mood: newLog.mood,
        activities: newLog.activities,
        photos: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLogs((prev) => [log, ...prev]);
      setNewLog({
        title: "",
        content: "",
        mood: "happy",
        activities: [],
      });
      setShowAddLog(false);
    }
  };

  // 编辑日志
  const handleEditLog = (log: DailyLog) => {
    setEditingLog(log);
    setNewLog({
      title: log.title,
      content: log.content,
      mood: log.mood,
      activities: log.activities,
    });
    setShowAddLog(true);
  };

  // 更新日志
  const handleUpdateLog = () => {
    if (editingLog && newLog.title.trim() && newLog.content.trim()) {
      setLogs((prev) =>
        prev.map((log) =>
          log.id === editingLog.id
            ? {
                ...log,
                title: newLog.title,
                content: newLog.content,
                mood: newLog.mood,
                activities: newLog.activities,
                updatedAt: new Date().toISOString(),
              }
            : log
        )
      );
      setNewLog({
        title: "",
        content: "",
        mood: "happy",
        activities: [],
      });
      setEditingLog(null);
      setShowAddLog(false);
    }
  };

  // 删除日志
  const handleDeleteLog = (logId: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== logId));
  };

  // 获取心情图标
  const getMoodIcon = (mood: DailyLog["mood"]) => {
    switch (mood) {
      case "happy":
        return "😊";
      case "normal":
        return "😐";
      case "sad":
        return "😢";
      case "excited":
        return "🤩";
      case "tired":
        return "😴";
      default:
        return "😊";
    }
  };

  // 获取心情名称
  const getMoodName = (mood: DailyLog["mood"]) => {
    switch (mood) {
      case "happy":
        return "开心";
      case "normal":
        return "正常";
      case "sad":
        return "难过";
      case "excited":
        return "兴奋";
      case "tired":
        return "疲惫";
      default:
        return "开心";
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 86400000);

    if (dateString === today.toISOString().split("T")[0]) {
      return "今天";
    } else if (dateString === yesterday.toISOString().split("T")[0]) {
      return "昨天";
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  // 活动选项
  const activityOptions = [
    "玩耍",
    "运动",
    "休息",
    "喂食",
    "洗澡",
    "训练",
    "外出",
    "其他",
  ];

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
          每日日志
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
              {petInfo.type === "cat" ? "喵星人" : "汪星人"} · 每日记录
            </p>
          </div>
        </div>

        {/* 添加日志按钮 */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => {
              setEditingLog(null);
              setNewLog({
                title: "",
                content: "",
                mood: "happy",
                activities: [],
              });
              setShowAddLog(true);
            }}
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
            + 记录今日日志
          </button>
        </div>

        {/* 日志列表 */}
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
            日志记录
          </h3>

          {logs.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#999",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "10px" }}>📝</div>
              <p>还没有日志记录</p>
              <p style={{ fontSize: "12px", marginTop: "5px" }}>
                点击上方按钮开始记录
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              {logs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    background: "#f8f9fa",
                    borderRadius: "12px",
                    padding: "15px",
                    border: "1px solid #e9ecef",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "10px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          margin: "0 0 5px 0",
                          fontSize: "16px",
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        {log.title}
                      </h4>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span>{formatDate(log.date)}</span>
                        <span>·</span>
                        <span>
                          {getMoodIcon(log.mood)} {getMoodName(log.mood)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleEditLog(log)}
                        style={{
                          background: "#007bff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          color: "#fff",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        style={{
                          background: "#dc3545",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          color: "#fff",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </div>

                  <p
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "14px",
                      color: "#555",
                      lineHeight: "1.5",
                    }}
                  >
                    {log.content}
                  </p>

                  {log.activities.length > 0 && (
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                    >
                      {log.activities.map((activity, index) => (
                        <span
                          key={index}
                          style={{
                            background: "#FFBF6B",
                            color: "#fff",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 统计信息 */}
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
            记录统计
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
                {logs.length}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>总记录数</div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#28a745",
                }}
              >
                {
                  logs.filter(
                    (log) => log.date === new Date().toISOString().split("T")[0]
                  ).length
                }
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>今日记录</div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#007bff",
                }}
              >
                {logs.filter((log) => log.mood === "happy").length}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>开心记录</div>
            </div>
          </div>
        </div>
      </div>

      {/* 添加/编辑日志弹窗 */}
      {showAddLog && (
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
              {editingLog ? "编辑日志" : "添加日志"}
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
                  标题
                </label>
                <input
                  type="text"
                  value={newLog.title}
                  onChange={(e) =>
                    setNewLog((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="例如：今天和布丁一起玩耍"
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
                  内容
                </label>
                <textarea
                  value={newLog.content}
                  onChange={(e) =>
                    setNewLog((prev) => ({ ...prev, content: e.target.value }))
                  }
                  placeholder="记录今天发生的事情..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    resize: "vertical",
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
                  心情
                </label>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {(
                    [
                      "happy",
                      "normal",
                      "sad",
                      "excited",
                      "tired",
                    ] as DailyLog["mood"][]
                  ).map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setNewLog((prev) => ({ ...prev, mood }))}
                      style={{
                        background:
                          newLog.mood === mood ? "#FFBF6B" : "#f8f9fa",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {getMoodIcon(mood)} {getMoodName(mood)}
                    </button>
                  ))}
                </div>
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
                  活动标签
                </label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {activityOptions.map((activity) => (
                    <button
                      key={activity}
                      onClick={() => {
                        const activities = newLog.activities.includes(activity)
                          ? newLog.activities.filter((a) => a !== activity)
                          : [...newLog.activities, activity];
                        setNewLog((prev) => ({ ...prev, activities }));
                      }}
                      style={{
                        background: newLog.activities.includes(activity)
                          ? "#FFBF6B"
                          : "#f8f9fa",
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "25px" }}>
              <button
                onClick={() => {
                  setShowAddLog(false);
                  setEditingLog(null);
                  setNewLog({
                    title: "",
                    content: "",
                    mood: "happy",
                    activities: [],
                  });
                }}
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
                onClick={editingLog ? handleUpdateLog : handleAddLog}
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
                {editingLog ? "更新" : "添加"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
