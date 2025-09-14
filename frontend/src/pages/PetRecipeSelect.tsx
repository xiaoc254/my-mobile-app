import { useNavigate } from "react-router-dom";
import { NavBar } from "antd-mobile";

export default function PetRecipeSelect() {
  const navigate = useNavigate();

  const petTypes = [
    {
      id: "dog",
      title: "汪星人",
      backgroundColor: "#4A90E2",
      icon: "🐕",
      onClick: () => {
        navigate("/dog-recipe");
      },
    },
    {
      id: "cat",
      title: "喵星人",
      backgroundColor: "#E67E22",
      icon: "🐱",
      onClick: () => {
        navigate("/cat-recipe");
      },
    },
    {
      id: "others",
      title: "其它星人",
      backgroundColor: "#9B59B6",
      icons: ["🦉", "🐿️", "🐠", "🐍"],
      onClick: () => {
        // 可以导航到其他宠物食谱页面
        console.log("选择了其它星人");
      },
    },
  ];

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
        科学食谱
      </NavBar>

      {/* 页面内容 */}
      <div style={{ padding: "20px" }}>
        {/* 副标题 */}
        <div
          style={{
            marginBottom: "30px",
            fontSize: "16px",
            color: "#666",
            textAlign: "left",
          }}
        >
          请选择您的宠物类型
        </div>

        {/* 宠物类型选择卡片 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* 汪星人和喵星人 - 并排显示 */}
          <div style={{ display: "flex", gap: "16px", height: "120px" }}>
            {petTypes.slice(0, 2).map((petType) => (
              <div
                key={petType.id}
                onClick={petType.onClick}
                style={{
                  flex: 1,
                  backgroundColor: petType.backgroundColor,
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>
                  {petType.icon}
                </div>
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {petType.title}
                </div>
              </div>
            ))}
          </div>

          {/* 其它星人 - 独占一行 */}
          <div
            onClick={petTypes[2].onClick}
            style={{
              backgroundColor: petTypes[2].backgroundColor,
              borderRadius: "12px",
              padding: "24px",
              color: "white",
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              height: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                }}
              >
                {petTypes[2].title}
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                {petTypes[2].icons?.map((icon, index) => (
                  <span key={index} style={{ fontSize: "24px" }}>
                    {icon}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
