import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { DatePicker } from "antd-mobile";
import { CalendarOutline } from "antd-mobile-icons";
import { usePetForm } from "../context/PetFormContext";
// @ts-ignore
import { petAPI } from "../services/api";

export default function PetAgeWeight() {
  const navigate = useNavigate();
  const { petData, updatePetData, resetPetData } = usePetForm();
  const [startDate, setStartDate] = useState(petData.startDate || "");
  const [weight, setWeight] = useState(petData.weight || "");
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleConfirm = async () => {
    if (!startDate.trim() || !weight.trim()) {
      alert("请填写完整信息");
      return;
    }

    // 验证体重是否为有效数字
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      alert("请输入有效的体重");
      return;
    }

    setIsSubmitting(true);

    try {
      // 保存日期和体重信息
      updatePetData({
        startDate: startDate.trim(),
        weight: weight.trim(),
      });

      // 准备提交的数据（使用更新后的数据）
      const petDataToSubmit = {
        type: petData.type,
        gender: petData.gender,
        nickname: petData.nickname,
        avatar: petData.avatar,
        startDate: startDate.trim(),
        weight: weightNum,
      };

      console.log("提交宠物数据:", petDataToSubmit);

      // 调用API添加宠物
      const response = await petAPI.addPet(petDataToSubmit);

      if (response.success) {
        alert("宠物添加成功！");
        // 重置表单数据
        resetPetData();
        // 跳转到宠物页面
        navigate("/pet");
      } else {
        alert(response.message || "添加失败，请重试");
      }
    } catch (error: any) {
      console.error("添加宠物失败:", error);
      alert(error.message || "添加失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleDateClick = () => {
    setDatePickerVisible(true);
  };

  const handleDateConfirm = (value: Date) => {
    const formattedDate = `${value.getFullYear()}/${String(
      value.getMonth() + 1
    ).padStart(2, "0")}/${String(value.getDate()).padStart(2, "0")} ${String(
      value.getHours()
    ).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
    setStartDate(formattedDate);
    setDatePickerVisible(false);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeight(e.target.value);
  };

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
          height: "80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 20px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        {/* 第一行：返回按钮、进度条和占位符 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          {/* 返回按钮 */}
          <div
            onClick={handleBack}
            style={{
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderLeft: "2px solid #000",
                borderBottom: "2px solid #000",
                transform: "rotate(45deg)",
              }}
            ></div>
          </div>

          {/* 进度条 */}
          <div
            style={{
              width: "100%",
              height: "12px",
              background: "#E5E5E7",
              borderRadius: "6px",
              display: "flex",
              overflow: "hidden",
              margin: "0 20px",
            }}
          >
            <div
              style={{
                width: "75%",
                height: "100%",
                background: "#007AFF",
              }}
            ></div>
            <div
              style={{
                width: "25%",
                height: "100%",
                background: "#E5E5E7",
              }}
            ></div>
          </div>

          {/* 占位符 */}
          <div style={{ width: "24px" }}></div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div
        style={{
          padding: "40px 20px",
          height: "calc(100vh - 80px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* 上半部分：标题和输入框 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: "1",
            justifyContent: "center",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          {/* 标题 */}
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#000",
              margin: "0 0 16px 0",
              textAlign: "center",
            }}
          >
            宠物年龄和体重
          </h1>

          {/* 提示文字 */}
          <p
            style={{
              fontSize: "16px",
              color: "#000",
              margin: "0 0 60px 0",
              textAlign: "center",
            }}
          >
            请选择您的宠物年龄体重
          </p>

          {/* 输入区域 */}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* 开始日期输入 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  color: "#000",
                  fontWeight: "500",
                  minWidth: "80px",
                }}
              >
                开始日期:
              </span>
              <div
                style={{
                  flex: "1",
                  position: "relative",
                }}
              >
                <input
                  type="text"
                  value={startDate}
                  onChange={handleStartDateChange}
                  placeholder="yyyy/mm/日 --:--"
                  style={{
                    width: "100%",
                    border: "1px solid #000",
                    borderRadius: "8px",
                    padding: "12px 40px 12px 16px",
                    fontSize: "16px",
                    outline: "none",
                    color: "#000",
                    background: "#fff",
                  }}
                />
                <div
                  onClick={handleDateClick}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CalendarOutline
                    style={{
                      fontSize: "20px",
                      color: "#666",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 体重输入 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  color: "#000",
                  fontWeight: "500",
                  minWidth: "80px",
                }}
              >
                体重:
              </span>
              <div
                style={{
                  width: "50%",
                  position: "relative",
                }}
              >
                <input
                  type="text"
                  value={weight}
                  onChange={handleWeightChange}
                  placeholder="请输入"
                  style={{
                    width: "100%",
                    border: "1px solid #000",
                    borderRadius: "8px",
                    padding: "12px 40px 12px 16px",
                    fontSize: "16px",
                    outline: "none",
                    color: "#000",
                    background: "#fff",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "16px",
                    color: "#000",
                    fontWeight: "500",
                  }}
                >
                  KG
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 确定按钮 */}
        <div
          style={{
            width: "100%",
            maxWidth: "320px",
            marginBottom: "40px",
          }}
        >
          <button
            onClick={handleConfirm}
            disabled={!startDate.trim() || !weight.trim() || isSubmitting}
            style={{
              width: "100%",
              height: "55px",
              background:
                !startDate.trim() || !weight.trim() || isSubmitting
                  ? "#ccc"
                  : "#FFD700",
              border: "none",
              borderRadius: "25px",
              color: "#fff",
              fontSize: "18px",
              fontWeight: "bold",
              cursor:
                !startDate.trim() || !weight.trim() || isSubmitting
                  ? "not-allowed"
                  : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                !startDate.trim() || !weight.trim() || isSubmitting
                  ? "0 2px 6px rgba(0, 0, 0, 0.1)"
                  : "0 4px 12px rgba(255, 215, 0, 0.3)",
              transition: "all 0.3s ease",
              opacity:
                !startDate.trim() || !weight.trim() || isSubmitting ? 0.6 : 1,
            }}
            onMouseDown={(e) => {
              if (startDate.trim() && weight.trim()) {
                e.currentTarget.style.transform = "scale(0.95)";
              }
            }}
            onMouseUp={(e) => {
              if (startDate.trim() && weight.trim()) {
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
            onMouseLeave={(e) => {
              if (startDate.trim() && weight.trim()) {
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            {isSubmitting ? "提交中..." : "确定"}
          </button>
        </div>
      </div>

      {/* 日期选择器 */}
      <DatePicker
        visible={datePickerVisible}
        onClose={() => setDatePickerVisible(false)}
        onConfirm={handleDateConfirm}
        precision="minute"
        title="选择日期时间"
        confirmText="确定"
        cancelText="取消"
      />
    </div>
  );
}
