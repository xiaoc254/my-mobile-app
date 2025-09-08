import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

// 限流器配置
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) { // 默认每分钟10次
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async waitForAvailability() {
    const now = Date.now();
    // 清理过期的请求记录
    this.requests = this.requests.filter(timestamp => now - timestamp < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      // 计算需要等待的时间
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest) + 100; // 额外100ms缓冲
      console.log(`限流触发，等待 ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForAvailability(); // 递归检查
    }

    this.requests.push(now);
  }
}

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 基础延迟1秒
  maxDelay: 30000, // 最大延迟30秒
  retryableErrors: [429, 500, 502, 503, 504] // 可重试的HTTP状态码
};

// 创建全局限流器实例
const rateLimiter = new RateLimiter(8, 60000); // 每分钟8次请求

/**
 * 指数退避延迟
 * @param {number} attempt 当前重试次数（从0开始）
 * @returns {number} 延迟毫秒数
 */
const getRetryDelay = (attempt) => {
  const delay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000; // 添加随机抖动
  return Math.min(delay + jitter, RETRY_CONFIG.maxDelay);
};

/**
 * 调用 OpenAI 多模态模型（文本 + 图片）带重试机制
 * @param {string} prompt 用户输入文本
 * @param {string} imageUrl 图片 URL（可选，如果传入则分析图片）
 */
export const callAIModel = async (prompt, imageUrl = null) => {
  try {
    // 检查API Key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-openai-api-key-here') {
      console.log("OPENAI_API_KEY 未配置，返回提示信息");
      return "请配置您的 OpenAI API Key 在 .env 文件中。";
    }

    console.log("API Key存在:", !!process.env.OPENAI_API_KEY);
    console.log("API Key前缀:", process.env.OPENAI_API_KEY?.substring(0, 10));

    // 使用环境变量配置代理（可为空，不使用代理）
    const proxy = process.env.PROXY || null;
    const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;

    // 构造 messages 数组
    let messages;
    if (imageUrl) {
      // 如果有图片，使用多模态格式
      messages = [{
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl
            }
          }
        ]
      }];
    } else {
      // 只有文本的普通格式
      messages = [{ role: "user", content: prompt }];
    }

    // 带重试机制的API调用
    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        console.log(`API调用尝试 ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}`);

        // 限流检查
        await rateLimiter.waitForAvailability();

        // 超时控制（30秒）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        // 调用 OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || "gpt-4o-mini",
            messages,
            temperature: 0.7,
            max_tokens: 2000
          }),
          signal: controller.signal,
          agent
        });

        clearTimeout(timeoutId);

        console.log(`API 响应状态 (尝试 ${attempt + 1}):`, response.status);

        // 处理响应
        if (response.ok) {
          const data = await response.json();
          console.log("API 响应成功");

          if (!data.choices || data.choices.length === 0) {
            throw new Error(`API 响应格式错误: ${JSON.stringify(data)}`);
          }

          return data.choices[0].message.content;
        }

        // 检查是否为可重试的错误
        if (RETRY_CONFIG.retryableErrors.includes(response.status)) {
          const errorData = await response.json().catch(() => ({}));
          console.log(`可重试错误 ${response.status}:`, errorData);

          if (attempt === RETRY_CONFIG.maxRetries) {
            // 最后一次尝试失败
            throw new Error(`API调用失败 (${response.status}): ${JSON.stringify(errorData)}`);
          }

          const delay = getRetryDelay(attempt);
          console.log(`等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          // 不可重试的错误，直接抛出
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API调用失败 (${response.status}): ${JSON.stringify(errorData)}`);
        }

      } catch (error) {
        console.error(`尝试 ${attempt + 1} 失败:`, error.message);

        // 网络错误或超时也进行重试
        if ((error.name === 'AbortError' || error.code === 'ETIMEDOUT' || error.type === 'system')
            && attempt < RETRY_CONFIG.maxRetries) {
          const delay = getRetryDelay(attempt);
          console.log(`网络错误，等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // 最后一次尝试或不可重试的错误
        if (attempt === RETRY_CONFIG.maxRetries) {
          throw error;
        }
      }
    }

    // 如果所有重试都失败了（这个位置实际上不应该达到）
    throw new Error("所有API调用尝试都失败了");

  } catch (error) {
    console.error("AI 服务整体错误:", error);

    // 网络错误或超时时返回用户友好的消息
    if (error.name === 'AbortError' || error.code === 'ETIMEDOUT' || error.type === 'system') {
      return `感谢您的提问："${prompt}"。由于网络连接问题，我暂时无法连接到AI服务。请检查网络连接或稍后再试。`;
    }

    // API 错误处理
    if (error.message.includes('401')) {
      return "API 密钥验证失败，请检查您的 OpenAI API Key 是否正确。";
    }

    if (error.message.includes('429')) {
      return "API 调用频率超限，请稍后再试。系统已自动重试但仍然失败。";
    }

    // 其他错误抛出以便控制器处理
    throw error;
  }
};
