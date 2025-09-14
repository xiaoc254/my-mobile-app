import { useNavigate } from "react-router-dom";
import { NavBar } from "antd-mobile";
import dogImg from "../image/dog.jpg";

export default function DogRecipe() {
  const navigate = useNavigate();

  const weeklyRecipe = [
    {
      day: "星期一",
      breakfast: "鸡蛋&牛奶",
      lunch: "牛肉&蔬菜",
      dinner: "鸡肉&狗粮",
    },
    {
      day: "星期二",
      breakfast: "鸡蛋&狗粮",
      lunch: "鱼肉&米饭",
      dinner: "鸡肉&蔬菜",
    },
    {
      day: "星期三",
      breakfast: "鸡肉&牛奶",
      lunch: "牛肉&狗粮",
      dinner: "羊肉&蔬菜",
    },
    {
      day: "星期四",
      breakfast: "羊肉&米饭",
      lunch: "鸡肉&蔬菜",
      dinner: "鱼肉&狗粮",
    },
    {
      day: "星期五",
      breakfast: "鱼肉&米饭",
      lunch: "鸡肝&狗粮",
      dinner: "鱼肉&蔬菜",
    },
    {
      day: "星期六",
      breakfast: "狗粮&鸡肉",
      lunch: "狗粮&牛肉",
      dinner: "狗粮&蔬菜",
    },
    {
      day: "星期日",
      breakfast: "鸡肝&牛奶",
      lunch: "鱼肉&狗粮",
      dinner: "牛肉&蔬菜",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(${dogImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* 顶部导航栏 */}
      <NavBar
        back="返回"
        onBack={() => navigate(-1)}
        style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          color: "#333",
          backdropFilter: "blur(10px)",
        }}
      >
        狗狗营养食物推荐
      </NavBar>

      {/* 页面内容 */}
      <div style={{ padding: "20px" }}>
        {/* 主标题 */}
        <div
          style={{
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "30px",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          狗狗营养食物推荐
        </div>

        {/* 食谱表格 */}
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* 表头 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              backgroundColor: "rgba(74, 144, 226, 0.1)",
              borderBottom: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                padding: "15px 10px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "16px",
                color: "#333",
              }}
            >
              日期
            </div>
            <div
              style={{
                padding: "15px 10px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "16px",
                color: "#333",
              }}
            >
              早餐
            </div>
            <div
              style={{
                padding: "15px 10px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "16px",
                color: "#333",
              }}
            >
              午餐
            </div>
            <div
              style={{
                padding: "15px 10px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "16px",
                color: "#333",
              }}
            >
              晚餐
            </div>
          </div>

          {/* 表格内容 */}
          {weeklyRecipe.map((recipe, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                borderBottom:
                  index < weeklyRecipe.length - 1
                    ? "1px solid rgba(0,0,0,0.05)"
                    : "none",
              }}
            >
              <div
                style={{
                  padding: "15px 8px",
                  textAlign: "center",
                  fontSize: "14px",
                  color: "#333",
                  fontWeight: "500",
                }}
              >
                {recipe.day}
              </div>
              <div
                style={{
                  padding: "15px 8px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#666",
                  lineHeight: "1.4",
                }}
              >
                {recipe.breakfast}
              </div>
              <div
                style={{
                  padding: "15px 8px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#666",
                  lineHeight: "1.4",
                }}
              >
                {recipe.lunch}
              </div>
              <div
                style={{
                  padding: "15px 8px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#666",
                  lineHeight: "1.4",
                }}
              >
                {recipe.dinner}
              </div>
            </div>
          ))}
        </div>

        {/* 温馨提示 */}
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "10px",
            }}
          >
            💡 温馨提示
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#666",
              lineHeight: "1.6",
            }}
          >
            • 请根据狗狗的年龄、体重和健康状况调整食量
            <br />
            • 新食物应逐渐添加，避免突然改变饮食
            <br />
            • 确保食物新鲜，避免给狗狗吃过期食品
            <br />• 如有疑问，请咨询专业兽医
          </div>
        </div>
      </div>
    </div>
  );
}
