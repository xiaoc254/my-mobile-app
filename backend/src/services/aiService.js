import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

/**
 * 调用 OpenAI 多模态模型（文本 + 图片）
 * @param {string} prompt 用户输入文本
 * @param {string} imageUrl 图片 URL（可选，如果传入则分析图片）
 */
export const callAIModel = async (prompt, imageUrl = null) => {
  try {
    console.log("API Key存在:", !!process.env.OPENAI_API_KEY);
    console.log("API Key前缀:", process.env.OPENAI_API_KEY?.substring(0, 10));

    // 使用环境变量配置代理（可为空，不使用代理）
    const proxy = process.env.PROXY || null;
    const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;

    // 超时控制（30秒）
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // 构造 messages 数组
    const messages = [{ role: "user", content: prompt }];
    if (imageUrl) {
      messages.push({ role: "user", name: "image", image_url: imageUrl });
    }

    // 调用 OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini", // 可替换为多模态模型
        messages
      }),
      signal: controller.signal,
      agent
    });

    clearTimeout(timeoutId);

    console.log("API 响应状态:", response.status);
    const data = await response.json();
    console.log("API 响应数据:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(`OpenAI API 错误 (${response.status}): ${JSON.stringify(data)}`);
    }
    if (!data.choices || data.choices.length === 0) {
      throw new Error(`API 响应格式错误: ${JSON.stringify(data)}`);
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error("AI 服务详细错误:", error);

    // 检查是否是 API Key 缺失错误
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.log("OPENAI_API_KEY 未配置，返回提示信息");
      return "请配置您的 OpenAI API Key 在 .env 文件中。";
    }

    // 网络错误或超时时返回备用响应
    if (error.name === 'AbortError' || error.code === 'ETIMEDOUT' || error.type === 'system') {
      console.log("网络超时，返回备用响应");
      return `感谢您的提问："${prompt}"。由于网络连接问题，我暂时无法连接到AI服务。请检查网络连接或稍后再试。`;
    }

    // API 错误处理
    if (error.message.includes('401')) {
      return "API 密钥验证失败，请检查您的 OpenAI API Key 是否正确。";
    }

    if (error.message.includes('429')) {
      return "API 调用频率超限，请稍后再试。";
    }

    throw error;
  }
};
