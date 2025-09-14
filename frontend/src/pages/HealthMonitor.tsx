import { useNavigate } from "react-router-dom";
import { NavBar, Button, Toast } from "antd-mobile";
import dogImg from "../image/dog.jpg";

export default function HealthMonitor() {
  const navigate = useNavigate();

  const handleVoiceAnalysis = () => {
    navigate("/voice-analysis");
  };

  const handleVisualAnalysis = () => {
    Toast.show({
      content: "视觉行为分析功能开发中，敬请期待！",
      position: "center",
    });
  };

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* 顶部导航栏 */}
      <NavBar
        back="返回"
        onBack={() => navigate(-1)}
        style={{
          backgroundColor: "#fff",
          color: "#333",
        }}
      >
        健康监测
      </NavBar>

      {/* 页面内容 */}
      <div style={{ backgroundColor: "#fff", minHeight: "calc(100vh - 45px)" }}>
        {/* 宠物图片展示区域 */}
        <div
          style={{
            textAlign: "center",
            paddingTop: "40px",
            paddingBottom: "60px",
          }}
        >
          <div
            style={{
              width: "280px",
              height: "200px",
              margin: "0 auto",
              borderRadius: "12px",
              background: `url(${dogImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
          />
        </div>

        {/* 功能按钮区域 */}
        <div
          style={{
            padding: "0 40px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            alignItems: "center",
          }}
        >
          {/* 声音情绪识别按钮 */}
          <Button
            onClick={handleVoiceAnalysis}
            style={{
              width: "200px",
              height: "50px",
              background: "linear-gradient(135deg, #d4994b 0%, #c8955a 100%)",
              border: "none",
              borderRadius: "25px",
              fontSize: "16px",
              fontWeight: "bold",
              color: "white",
              boxShadow: "0 4px 12px rgba(212, 153, 75, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            声音情绪识别
          </Button>

          {/* 视觉行为分析按钮 */}
          <Button
            onClick={handleVisualAnalysis}
            style={{
              width: "200px",
              height: "50px",
              background: "linear-gradient(135deg, #d4994b 0%, #c8955a 100%)",
              border: "none",
              borderRadius: "25px",
              fontSize: "16px",
              fontWeight: "bold",
              color: "white",
              boxShadow: "0 4px 12px rgba(212, 153, 75, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            视觉行为分析
          </Button>
        </div>

        {/* 功能介绍 */}
        <div
          style={{
            padding: "60px 30px 40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #e9ecef",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "12px",
              }}
            >
              🏥 健康监测功能
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#666",
                lineHeight: "1.6",
                textAlign: "left",
              }}
            >
              • <strong>声音情绪识别</strong>
              ：通过分析宠物的叫声、呼吸声等音频信号，判断宠物的情绪状态和健康状况
              <br />
              <br />• <strong>视觉行为分析</strong>
              ：通过观察宠物的行为模式、姿态变化等视觉信息，评估宠物的活跃度和健康指标
              <br />
              <br />• 定期监测有助于及早发现宠物健康问题
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
