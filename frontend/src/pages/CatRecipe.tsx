import { useNavigate } from "react-router-dom";
import { NavBar } from "antd-mobile";
import catImg from "../image/cat.jpg";

export default function CatRecipe() {
  const navigate = useNavigate();

  const weeklyRecipe = [
    {
      day: "星期一",
      breakfast: "金枪鱼&猫粮",
      lunch: "鸡胸肉&胡萝卜",
      dinner: "三文鱼&猫粮",
    },
    {
      day: "星期二",
      breakfast: "鸡肝&猫粮",
      lunch: "牛肉丁&南瓜",
      dinner: "沙丁鱼&猫粮",
    },
    {
      day: "星期三",
      breakfast: "鸡蛋黄&猫粮",
      lunch: "鸭肉&西兰花",
      dinner: "鲑鱼&猫粮",
    },
    {
      day: "星期四",
      breakfast: "鸡胸肉&猫粮",
      lunch: "兔肉&胡萝卜",
      dinner: "金枪鱼&猫粮",
    },
    {
      day: "星期五",
      breakfast: "鲭鱼&猫粮",
      lunch: "牛肉&菠菜",
      dinner: "鸡肝&猫粮",
    },
    {
      day: "星期六",
      breakfast: "鸡蛋&猫粮",
      lunch: "鸭胗&南瓜",
      dinner: "三文鱼&猫粮",
    },
    {
      day: "星期日",
      breakfast: "沙丁鱼&猫粮",
      lunch: "鸡胸肉&西兰花",
      dinner: "鲑鱼&猫粮",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.85)), url(${catImg})`,
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
        猫猫营养食物推荐
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
          猫猫营养食物推荐
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
              backgroundColor: "rgba(230, 126, 34, 0.1)",
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
            🐱 猫咪喂养贴士
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#666",
              lineHeight: "1.6",
            }}
          >
            • 猫咪主要以高蛋白肉类为主，鱼类是优质蛋白来源
            <br />
            • 避免给猫咪吃洋葱、巧克力、葡萄等有毒食物
            <br />
            • 提供充足的新鲜饮用水，促进肾脏健康
            <br />
            • 定期更换食物种类，保证营养均衡
            <br />• 如有疑问，请咨询专业兽医
          </div>
        </div>
      </div>
    </div>
  );
}
