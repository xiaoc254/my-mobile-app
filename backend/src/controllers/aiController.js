import { callAIModel } from "../services/aiService.js";

export const getAIResponse = async (req, res) => {
  const startTime = Date.now();

  try {
    const { prompt, imageUrl } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "缺少 prompt 参数" });
    }

    console.log("收到AI请求:", {
      prompt: prompt.substring(0, 50) + "...",
      hasImage: !!imageUrl,
      timestamp: new Date().toISOString()
    });

    const reply = await callAIModel(prompt, imageUrl);
    const duration = Date.now() - startTime;

    console.log(`AI请求完成，耗时: ${duration}ms`);
    res.json({ reply, duration });

  } catch (err) {
    const duration = Date.now() - startTime;
    console.error("AI控制器错误:", {
      error: err.message,
      duration,
      timestamp: new Date().toISOString()
    });

    // 根据错误类型返回不同的响应
    if (err.message.includes('401')) {
      return res.status(401).json({
        error: "API 密钥验证失败，请检查您的 OpenAI API Key 是否正确。",
        duration
      });
    }

    if (err.message.includes('429')) {
      return res.status(429).json({
        error: "API 调用频率超限，请稍后再试。系统已自动重试但仍然失败。",
        duration
      });
    }

    if (err.message.includes('网络') || err.name === 'AbortError') {
      return res.status(503).json({
        error: "网络连接问题，请检查网络连接或稍后再试。",
        duration
      });
    }

    // 默认错误响应
    res.status(500).json({
      error: "AI 服务暂时不可用，请稍后再试。",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      duration
    });
  }
};
