import { callAIModel } from "../services/aiService.js";

// 声音分析接口
export const analyzeVoice = async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      duration,
      sampleCount,
      volumeStats,
      frequencyStats,
      behaviorStats
    } = req.body;

    console.log("收到详细声音分析请求:", {
      duration: duration || "未知",
      sampleCount: sampleCount || 0,
      volumeStats: volumeStats || {},
      frequencyStats: frequencyStats || {},
      behaviorStats: behaviorStats || {},
      timestamp: new Date().toISOString()
    });

    // 构建专业的声音分析prompt，基于详细音频特征
    const voiceAnalysisPrompt = `
作为一名专业的宠物行为分析师和动物心理学家，请分析以下详细的宠物声音特征数据：

=== 录音基础信息 ===
- 录音时长: ${duration || '未知'}秒
- 采样点数: ${sampleCount || 0}个
- 数据质量: ${sampleCount > 100 ? '高质量' : sampleCount > 50 ? '中等质量' : '较低质量'}

=== 音量特征分析 ===
- 最大音量: ${volumeStats?.max || '未知'}
- 平均音量: ${volumeStats?.avg || '未知'}
- 最小音量: ${volumeStats?.min || '未知'}
- 音量方差: ${volumeStats?.variance || '未知'} (数值越大表示音量变化越剧烈)
- 音量范围: ${volumeStats?.range || '未知'} (最大值-最小值)

=== 频率特征分析 ===
- 主导频率: ${frequencyStats?.dominantFreq || '未知'}Hz
- 频率稳定性: ${frequencyStats?.stability || '未知'} (数值越小表示频率越稳定)
- 低频能量比例: ${frequencyStats?.distribution?.low || '0'}% (20-250Hz，通常与低沉呼噜声相关)
- 中频能量比例: ${frequencyStats?.distribution?.mid || '0'}% (250-4000Hz，通常与正常叫声相关)
- 高频能量比例: ${frequencyStats?.distribution?.high || '0'}% (4000Hz+，通常与尖叫、焦虑相关)

=== 行为模式分析 ===
- 静默比例: ${behaviorStats?.silenceRatio || '0'}% (静默时间占比)
- 静默时段: ${behaviorStats?.silencePeriods || 0}次
- 音量变化模式: ${behaviorStats?.volumePattern || '未知'}

基于以上专业数据，请进行深度分析并返回JSON格式结果。分析要点：
1. 高频能量比例高(>40%) = 更可能焦虑/惊怒
2. 低频能量比例高(>50%) = 更可能平静/满足
3. 音量方差大(>20) = 情绪波动剧烈
4. 频率稳定性差(>100) = 情绪不稳定
5. 静默比例高(>30%) = 可能疲惫或不适
6. 音量变化模式 = 直接反映情绪状态

返回格式：
{
  "emotions": [
    {"emotion": "平静", "percentage": 数值, "color": "#27AE60", "description": "基于数据的具体描述"},
    {"emotion": "焦虑", "percentage": 数值, "color": "#F39C12", "description": "基于数据的具体描述"},
    {"emotion": "悲伤", "percentage": 数值, "color": "#4A90E2", "description": "基于数据的具体描述"},
    {"emotion": "不安", "percentage": 数值, "color": "#9B59B6", "description": "基于数据的具体描述"},
    {"emotion": "惊怒", "percentage": 数值, "color": "#E74C3C", "description": "基于数据的具体描述"}
    // 确保5种情绪，百分比总和为100%，颜色使用上述固定色值
  ],
  "summary": "基于具体数据特征的专业分析总结，要提及关键的数值发现",
  "recommendations": [
    "基于数据特征的具体建议",
    // 3-4条专业建议
  ]
}

请根据实际数据特征进行个性化分析，不要使用模板化回答。
`;

    const aiResponse = await callAIModel(voiceAnalysisPrompt);
    const duration_ms = Date.now() - startTime;

    console.log(`声音分析AI请求完成，耗时: ${duration_ms}ms`);

    // 处理AI服务响应格式
    let reply, usage;
    if (typeof aiResponse === 'string') {
      reply = aiResponse;
      usage = null;
    } else {
      reply = aiResponse.content;
      usage = aiResponse.usage;
    }

    // 尝试解析AI返回的JSON结果
    let analysisResult;
    try {
      // 清理AI返回的内容，移除可能的markdown格式
      const cleanedReply = reply.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanedReply);
    } catch (parseError) {
      console.error("AI返回的JSON解析失败:", parseError);
      // 如果解析失败，返回默认的分析结果
      analysisResult = {
        emotions: [
          {"emotion": "平静", "percentage": 30, "color": "#27AE60", "description": "声音平稳，节奏规律"},
          {"emotion": "焦虑", "percentage": 25, "color": "#F39C12", "description": "声音节奏较快，音调偏高"},
          {"emotion": "悲伤", "percentage": 20, "color": "#4A90E2", "description": "检测到低沉、缓慢的声音特征"},
          {"emotion": "不安", "percentage": 15, "color": "#9B59B6", "description": "声音频率略有波动"},
          {"emotion": "惊怒", "percentage": 10, "color": "#E74C3C", "description": "短暂的高频声音爆发"}
        ],
        summary: "AI分析过程中遇到技术问题，返回标准分析结果。建议重新录制进行分析。",
        recommendations: [
          "观察宠物的日常行为模式，结合声音分析判断",
          "如情绪异常持续，建议咨询专业兽医",
          "保持宠物生活环境的稳定和舒适",
          "定期进行声音监测，建立健康档案"
        ]
      };
    }

    res.json({
      success: true,
      data: analysisResult,
      duration: duration_ms,
      aiModel: "智能分析",
      tokens: usage ? {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0
      } : null
    });

  } catch (err) {
    const duration_ms = Date.now() - startTime;
    console.error("声音分析错误:", err);

    res.status(500).json({
      success: false,
      error: "声音分析失败",
      message: err.message,
      duration: duration_ms
    });
  }
};

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

    const aiResponse = await callAIModel(prompt, imageUrl);
    const duration = Date.now() - startTime;

    console.log(`AI请求完成，耗时: ${duration}ms`);

    // 处理AI服务响应格式
    let reply, usage;
    if (typeof aiResponse === 'string') {
      // 向后兼容：如果返回的是字符串（错误情况或API Key未配置）
      reply = aiResponse;
      usage = null;
    } else {
      // 正常情况：返回包含content和usage的对象
      reply = aiResponse.content;
      usage = aiResponse.usage;
    }

    // 格式化tokens使用信息
    const tokensInfo = usage ? {
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0
    } : null;

    console.log('Tokens使用情况:', tokensInfo);

    res.json({
      reply,
      duration,
      tokens: tokensInfo
    });

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
