import { useNavigate } from "react-router-dom";
import { NavBar } from "antd-mobile";

export default function VisualAnalysisResult() {
  const navigate = useNavigate();

  // 行为颜色映射
  const getBehaviorColor = (behavior: string) => {
    const colorMap: { [key: string]: string } = {
      活跃: "#27AE60", // 绿色
      休息: "#3498DB", // 蓝色
      警觉: "#F39C12", // 橙色
      玩耍: "#E74C3C", // 红色
      觅食: "#9B59B6", // 紫色
      探索: "#1ABC9C", // 青绿色
      社交: "#E67E22", // 深橙色
      梳理: "#95A5A6", // 灰色
      睡眠: "#34495E", // 深灰色
      异常: "#C0392B", // 深红色
    };

    // 精确匹配
    if (colorMap[behavior]) {
      return colorMap[behavior];
    }

    // 模糊匹配
    for (const [key, color] of Object.entries(colorMap)) {
      if (behavior.includes(key) || key.includes(behavior)) {
        return color;
      }
    }

    // 默认颜色
    const defaultColors = [
      "#3498DB",
      "#E67E22",
      "#9B59B6",
      "#E74C3C",
      "#27AE60",
    ];
    return defaultColors[behavior.length % defaultColors.length];
  };

  // 从localStorage获取AI分析结果，如果没有则使用默认数据
  const getAnalysisResults = () => {
    try {
      const savedResult = localStorage.getItem("visualAnalysisResult");
      if (savedResult) {
        const parsedResult = JSON.parse(savedResult);
        console.log("使用AI视觉分析结果:", parsedResult);

        // 为AI返回的行为数据自动分配颜色
        if (parsedResult.behaviors && Array.isArray(parsedResult.behaviors)) {
          parsedResult.behaviors = parsedResult.behaviors.map(
            (behavior: any) => ({
              ...behavior,
              color: behavior.color || getBehaviorColor(behavior.behavior),
            })
          );
        }

        return parsedResult;
      }
    } catch (error) {
      console.error("解析视觉分析结果失败:", error);
    }

    // 默认数据（当无法获取AI结果时）
    console.log("使用默认视觉分析结果");
    return {
      behaviors: [
        {
          behavior: "活跃",
          percentage: 35,
          color: "#27AE60", // 绿色
          description: "宠物表现出较高的活动水平",
        },
        {
          behavior: "休息",
          percentage: 30,
          color: "#3498DB", // 蓝色
          description: "观察到正常的休息行为",
        },
        {
          behavior: "警觉",
          percentage: 20,
          color: "#F39C12", // 橙色
          description: "对环境保持适度警觉",
        },
        {
          behavior: "玩耍",
          percentage: 10,
          color: "#E74C3C", // 红色
          description: "少量玩耍行为",
        },
        {
          behavior: "觅食",
          percentage: 5,
          color: "#9B59B6", // 紫色
          description: "轻微的觅食行为",
        },
      ],
      summary:
        "从视频分析来看，宠物整体表现健康活跃，行为模式正常。活跃度较高，说明精神状态良好，休息时间充足，警觉性适中。建议继续保持当前的生活环境和照顾方式。",
      recommendations: [
        "继续提供充足的活动空间",
        "定期观察宠物的行为变化",
        "保持规律的作息时间",
        "如发现异常行为，及时咨询兽医",
      ],
    };
  };

  const analysisData = getAnalysisResults();
  const analysisResults = analysisData.behaviors || [];
  const summaryText =
    analysisData.summary ||
    "从视频分析来看，宠物整体表现健康活跃，行为模式正常。建议继续保持当前的生活环境和照顾方式。";
  const recommendations = analysisData.recommendations || [
    "继续提供充足的活动空间",
    "定期观察宠物的行为变化",
    "保持规律的作息时间",
    "如发现异常行为，及时咨询兽医",
  ];

  // 获取主要行为（百分比最高的）
  const dominantBehavior = analysisResults.reduce((prev: any, current: any) =>
    current.percentage > prev.percentage ? current : prev
  );

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
        视觉分析结果
      </NavBar>

      {/* 页面内容 */}
      <div style={{ padding: "20px", paddingBottom: "60px" }}>
        {/* 分析结果条形图 */}
        <div style={{ marginBottom: "40px" }}>
          {analysisResults.map((result: any, index: number) => (
            <div key={index} style={{ marginBottom: "12px" }}>
              {/* 条形图 */}
              <div
                style={{
                  width: `${Math.max(result.percentage * 2.8, 20)}%`, // 计算条形图宽度，最小20%
                  height: "45px",
                  backgroundColor: result.color,
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingLeft: "15px",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "15px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                {result.behavior} - {result.percentage}%
              </div>
            </div>
          ))}
        </div>

        {/* 分析总结 */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#3498DB",
              marginBottom: "15px",
            }}
          >
            📊 分析总结：
          </div>

          <div
            style={{
              fontSize: "15px",
              color: "#666",
              lineHeight: "1.6",
              textAlign: "justify",
            }}
          >
            {summaryText}
            <span
              style={{
                fontSize: "13px",
                color: "#999",
                marginLeft: "10px",
              }}
            >
              (本次分析由AI生成，注意甄别)
            </span>
          </div>

          {/* 详细建议 */}
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              borderLeft: "4px solid " + dominantBehavior.color,
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "8px",
              }}
            >
              🎯 主要行为：{dominantBehavior.behavior} (
              {dominantBehavior.percentage}%)
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#666",
                lineHeight: "1.4",
              }}
            >
              {dominantBehavior.description}
            </div>
          </div>

          {/* 建议措施 */}
          <div
            style={{
              marginTop: "15px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "8px",
              }}
            >
              💡 护理建议：
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#666",
                lineHeight: "1.5",
              }}
            >
              {recommendations.map((recommendation: string, index: number) => (
                <span key={index}>
                  • {recommendation}
                  {index < recommendations.length - 1 && <br />}
                </span>
              ))}
            </div>
          </div>

          {/* 健康指标卡片 */}
          <div
            style={{
              marginTop: "20px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div
              style={{
                backgroundColor: "#e8f5e8",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#27AE60",
                }}
              >
                活跃度
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#27AE60",
                  marginTop: "4px",
                }}
              >
                {analysisResults.find((r: any) => r.behavior === "活跃")
                  ?.percentage || 0}
                %
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#e8f4f8",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#3498DB",
                }}
              >
                休息度
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#3498DB",
                  marginTop: "4px",
                }}
              >
                {analysisResults.find((r: any) => r.behavior === "休息")
                  ?.percentage || 0}
                %
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
