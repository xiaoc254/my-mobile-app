import { useNavigate } from "react-router-dom";
import { useResponsive } from "../hooks/useResponsive";
import ResponsiveContainer from "../components/ResponsiveContainer";
import ResponsiveText from "../components/ResponsiveText";
// import ResponsiveButton from '../components/ResponsiveButton';

export default function Welcome() {
  const navigate = useNavigate();
  const responsive = useResponsive();

  const handleStartJourney = () => {
    console.log("点击开启智能宠物养护之旅按钮");
    console.log("准备导航到 /home 页面");
    navigate("/home");
  };

  return (
    <div
      style={{
        minHeight: "70vh",
        backgroundColor: "white",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 顶部金色装饰区域 */}
      <div
        style={{
          width: "100%",
          height: responsive.isMobile
            ? "180px"
            : responsive.isTablet
            ? "220px"
            : "240px",
          backgroundColor: "#8B6914",
          borderRadius: "50%",
          marginTop: responsive.isMobile
            ? "-80px"
            : responsive.isTablet
            ? "-100px"
            : "-110px",
          position: "relative",
          zIndex: 1,
        }}
      />

      {/* 主要内容区域 */}
      <ResponsiveContainer
        type="page"
        style={{
          backgroundColor: "white",
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginTop: responsive.isMobile
            ? "-60px"
            : responsive.isTablet
            ? "-80px"
            : "-100px",
          zIndex: 2,
        }}
      >
        {/* 欢迎文本区域 */}
        <div
          style={{
            textAlign: "center",
            marginTop: responsive.isMobile
              ? "80px"
              : responsive.isTablet
              ? "100px"
              : "120px",
            marginBottom: responsive.isMobile
              ? "30px"
              : responsive.isTablet
              ? "40px"
              : "50px",
          }}
        >
          <ResponsiveText
            variant="title"
            align="center"
            weight="bold"
            style={{
              marginBottom: responsive.isMobile ? "16px" : "24px",
              color: "#2c3e50",
            }}
          >
            🐾 智能宠物养护
          </ResponsiveText>

          <ResponsiveText
            variant="subtitle"
            align="center"
            color="#7f8c8d"
            style={{ marginBottom: responsive.isMobile ? "8px" : "12px" }}
          >
            让科技为爱宠生活添彩
          </ResponsiveText>

          <ResponsiveText variant="body" align="center" color="#95a5a6">
            个性化养护方案 • 健康监测 • 智能提醒
          </ResponsiveText>
        </div>

        {/* 主要行动按钮 */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: responsive.isMobile
              ? "30px"
              : responsive.isTablet
              ? "40px"
              : "50px",
          }}
        >
          <button
            onClick={handleStartJourney}
            style={{
              backgroundColor: "#FFD700",
              color: "#2c3e50",
              border: "none",
              borderRadius: responsive.isMobile ? "20px" : "25px",
              padding: responsive.isMobile
                ? "12px 24px"
                : responsive.isTablet
                ? "14px 28px"
                : "16px 32px",
              boxShadow: "0 8px 24px rgba(255, 215, 0, 0.4)",
              minWidth: responsive.isMobile
                ? "280px"
                : responsive.isTablet
                ? "320px"
                : "360px",
              fontSize: responsive.isMobile
                ? "16px"
                : responsive.isTablet
                ? "18px"
                : "20px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              minHeight: responsive.isMobile ? "48px" : "52px",
            }}
            onMouseOver={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = "#FFC107";
              target.style.transform = "translateY(-2px)";
              target.style.boxShadow = "0 12px 32px rgba(255, 215, 0, 0.5)";
            }}
            onMouseOut={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = "#FFD700";
              target.style.transform = "translateY(0)";
              target.style.boxShadow = "0 8px 24px rgba(255, 215, 0, 0.4)";
            }}
          >
            <span>开启智能宠物养护之旅</span>
            <span>⚡</span>
          </button>
        </div>

        {/* 宠物照片背景区域 */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: responsive.isMobile
              ? "250px"
              : responsive.isTablet
              ? "280px"
              : "300px",
            borderRadius: responsive.isMobile
              ? "20px 20px 0 0"
              : "24px 24px 0 0",
            overflow: "hidden",
            boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <img
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
            src="https://img95.699pic.com/photo/60018/5254.jpg_wh860.jpg"
            alt="可爱的金毛犬"
            onError={(e) => {
              // 图片加载失败时的备用方案
              const target = e.currentTarget as HTMLImageElement;
              target.src =
                "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
            }}
          />

          {/* 渐变遮罩 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
              zIndex: 1,
            }}
          />

          {/* 底部文字 */}
          <div
            style={{
              position: "absolute",
              bottom: responsive.isMobile ? "20px" : "30px",
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
              width: "90%",
              maxWidth: responsive.isMobile
                ? "280px"
                : responsive.isTablet
                ? "320px"
                : "400px",
              zIndex: 2,
            }}
          >
            <div
              style={{
                color: "white",
                fontSize: responsive.isMobile
                  ? "14px"
                  : responsive.isTablet
                  ? "16px"
                  : "18px",
                fontWeight: "500",
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
                lineHeight: responsive.isMobile ? "1.4" : "1.5",
                textAlign: "center",
              }}
            >
              与千万宠物家庭一起，开启智能养护新时代
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}
