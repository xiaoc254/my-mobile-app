import { useNavigate } from "react-router-dom";
import { NavBar } from "antd-mobile";

export default function VoiceAnalysisResult() {
  const navigate = useNavigate();

  // 情绪颜色映射
  const getEmotionColor = (emotion: string) => {
    const colorMap: { [key: string]: string } = {
      平静: "#27AE60", // 绿色
      焦虑: "#F39C12", // 橙色
      悲伤: "#4A90E2", // 蓝色
      不安: "#9B59B6", // 紫色
      惊怒: "#E74C3C", // 红色
      愤怒: "#E74C3C", // 红色
      开心: "#2ECC71", // 浅绿色
      兴奋: "#FF6B6B", // 粉红色
      恐惧: "#95A5A6", // 灰色
      满足: "#1ABC9C", // 青绿色
    };

    // 精确匹配
    if (colorMap[emotion]) {
      return colorMap[emotion];
    }

    // 模糊匹配
    for (const [key, color] of Object.entries(colorMap)) {
      if (emotion.includes(key) || key.includes(emotion)) {
        return color;
      }
    }

    // 默认颜色（如果都不匹配）
    const defaultColors = [
      "#3498DB",
      "#E67E22",
      "#9B59B6",
      "#E74C3C",
      "#27AE60",
    ];
    return defaultColors[emotion.length % defaultColors.length];
  };

  // 从localStorage获取AI分析结果，如果没有则使用默认数据
  const getAnalysisResults = () => {
    try {
      const savedResult = localStorage.getItem("voiceAnalysisResult");
      if (savedResult) {
        const parsedResult = JSON.parse(savedResult);
        console.log("使用AI分析结果:", parsedResult);

        // 为AI返回的情绪数据自动分配颜色
        if (parsedResult.emotions && Array.isArray(parsedResult.emotions)) {
          parsedResult.emotions = parsedResult.emotions.map((emotion: any) => ({
            ...emotion,
            color: emotion.color || getEmotionColor(emotion.emotion),
          }));
        }

        return parsedResult;
      }
    } catch (error) {
      console.error("解析分析结果失败:", error);
    }

    // 默认数据（当无法获取AI结果时）
    console.log("使用默认分析结果");
    return {
      emotions: [
        {
          emotion: "悲伤",
          percentage: 20,
          color: "#4A90E2", // 蓝色
          description: "检测到低沉、缓慢的声音特征",
        },
        {
          emotion: "不安",
          percentage: 15,
          color: "#9B59B6", // 紫色
          description: "声音频率略有波动",
        },
        {
          emotion: "焦虑",
          percentage: 25,
          color: "#F39C12", // 橙色
          description: "声音节奏较快，音调偏高",
        },
        {
          emotion: "惊怒",
          percentage: 10,
          color: "#E74C3C", // 红色
          description: "短暂的高频声音爆发",
        },
        {
          emotion: "平静",
          percentage: 30,
          color: "#27AE60", // 绿色
          description: "声音平稳，节奏规律",
        },
      ],
      summary:
        "综上分析此宠物平静和焦虑占比最重，其它情绪皆有并不多。此情绪并没有什么大碍，可留意宠物环境对宠物的影响，以及可以结合宠物动作进行准确分析。",
      recommendations: [
        "观察宠物的日常行为模式，结合声音分析判断",
        "如情绪异常持续，建议咨询专业兽医",
        "保持宠物生活环境的稳定和舒适",
        "定期进行声音监测，建立健康档案",
      ],
    };
  };

  const analysisData = getAnalysisResults();
  const analysisResults = analysisData.emotions || [];
  const summaryText =
    analysisData.summary ||
    "综上分析此宠物平静和焦虑占比最重，其它情绪皆有并不多。此情绪并没有什么大碍，可留意宠物环境对宠物的影响，以及可以结合宠物动作进行准确分析。";
  const recommendations = analysisData.recommendations || [
    "观察宠物的日常行为模式，结合声音分析判断",
    "如情绪异常持续，建议咨询专业兽医",
    "保持宠物生活环境的稳定和舒适",
    "定期进行声音监测，建立健康档案",
  ];

  // 获取主要情绪（百分比最高的）
  const dominantEmotion = analysisResults.reduce((prev: any, current: any) =>
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
        声音分析
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
                  width: `${Math.max(result.percentage * 3.2, 25)}%`, // 计算条形图宽度，最小25%
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
                {result.emotion} - {result.percentage}%
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
              color: "#F39C12",
              marginBottom: "15px",
            }}
          >
            总结：
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
              borderLeft: "4px solid " + dominantEmotion.color,
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
              🎯 主要情绪：{dominantEmotion.emotion} (
              {dominantEmotion.percentage}%)
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#666",
                lineHeight: "1.4",
              }}
            >
              {dominantEmotion.description}
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
              💡 建议措施：
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
        </div>
      </div>
    </div>
  );
}
