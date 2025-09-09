import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

// AI服务配置
const AI_SERVICES = {
  // OpenAI (海外) - 支持图片分析
  openai: {
    baseUrl: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini", // 支持视觉的模型
    maxRequests: 2, // 免费账户限制
    supportsVision: true, // 支持图片分析
    formatRequest: (messages, model) => ({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    }),
    formatHeaders: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }),
    parseResponse: (data) => ({
      content: data.choices[0].message.content,
      usage: data.usage || null
    })
  },

  // 智谱AI (ChatGLM) - 支持图片分析
  zhipu: {
    baseUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    model: "glm-4v-plus", // 支持视觉的多模态模型
    maxRequests: 30, // 更高的限制
    supportsVision: true, // 支持图片分析
    formatRequest: (messages, model) => ({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    }),
    formatHeaders: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }),
    parseResponse: (data) => ({
      content: data.choices[0].message.content,
      usage: data.usage || null
    })
  },

  // 通义千问 (阿里云) - 支持图片分析
  qwen: {
    baseUrl: "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
    model: "qwen-vl-plus", // 支持视觉的多模态模型
    maxRequests: 50,
    supportsVision: true, // 支持图片分析
    formatRequest: (messages, model) => ({
      model,
      input: { messages },
      parameters: {
        temperature: 0.7,
        max_tokens: 2000
      }
    }),
    formatHeaders: (apiKey) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }),
    parseResponse: (data) => ({
      content: data.output.choices[0].message.content,
      usage: data.usage || null
    })
  },

  // 百度文心一言 - 支持图片分析
  wenxin: {
    baseUrl: "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-4.0-vision-8k",
    model: "ERNIE-4.0-Vision-8K", // 支持视觉的多模态模型
    maxRequests: 60,
    supportsVision: true, // 支持图片分析
    formatRequest: (messages, model) => ({
      messages,
      temperature: 0.7,
      max_output_tokens: 2000
    }),
    formatHeaders: (apiKey) => ({
      "Content-Type": "application/json"
    }),
    parseResponse: (data) => ({
      content: data.result,
      usage: data.usage || null
    }),
    // 百度需要特殊的token获取
    requiresToken: true
  }
};

// 限流器配置
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async waitForAvailability() {
    const now = Date.now();
    this.requests = this.requests.filter(timestamp => now - timestamp < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest) + 100;
      console.log(`限流触发，等待 ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForAvailability();
    }

    this.requests.push(now);
  }
}

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  retryableErrors: [429, 500, 502, 503, 504]
};

// 获取当前AI服务配置
const getCurrentAIService = () => {
  const serviceType = process.env.AI_SERVICE || 'openai';
  const service = AI_SERVICES[serviceType];

  if (!service) {
    throw new Error(`不支持的AI服务: ${serviceType}`);
  }

  return { ...service, type: serviceType };
};

// 创建动态限流器
let rateLimiter;

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
 * 调用AI模型（支持多种国内外AI服务）
 * @param {string} prompt 用户输入文本
 * @param {string} imageUrl 图片 URL（可选，如果传入则分析图片）
 */
export const callAIModel = async (prompt, imageUrl = null) => {
  try {
    // 获取当前AI服务配置
    const aiService = getCurrentAIService();

    // 初始化对应的限流器
    if (!rateLimiter) {
      rateLimiter = new RateLimiter(aiService.maxRequests, 60000);
    }

    // 检查API Key
    const apiKeyName = `${aiService.type.toUpperCase()}_API_KEY`;
    const apiKey = process.env[apiKeyName];

    if (!apiKey || apiKey === 'your-api-key-here') {
      console.log(`${apiKeyName} 未配置，返回提示信息`);
      return `请配置您的 ${aiService.type} API Key 在 .env 文件中的 ${apiKeyName}。`;
    }

    console.log(`使用AI服务: ${aiService.type}`);
    console.log("API Key存在:", !!apiKey);
    console.log("API Key前缀:", apiKey?.substring(0, 10));

    // 使用环境变量配置代理（可为空，不使用代理）
    const proxy = process.env.PROXY || null;
    const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;

    // 构造 messages 数组
    let messages;
    if (imageUrl && aiService.supportsVision) {
      // 支持图片分析的AI服务（OpenAI、智谱AI、通义千问、百度文心）
      console.log(`${aiService.type} 支持图片分析，正在处理图片和文本`);
      messages = [{
        role: "user",
        content: [
          {
            type: "text",
            text: prompt || "请分析这张图片"
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
      if (imageUrl && !aiService.supportsVision) {
        console.log(`注意: ${aiService.type} 暂不支持图片分析，仅处理文本`);
        // 可以在这里添加图片描述到文本中
        messages[0].content += "\n\n(注：用户上传了图片，但当前AI服务不支持图片分析)";
      }
    }

    // 带重试机制的API调用
    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        console.log(`${aiService.type} API调用尝试 ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}`);

        // 限流检查
        await rateLimiter.waitForAvailability();

        // 超时控制（30秒）
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        // 格式化请求数据
        const requestBody = aiService.formatRequest(messages, aiService.model);
        const headers = aiService.formatHeaders(apiKey);

        // 调用AI API
        const response = await fetch(aiService.baseUrl, {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
          signal: controller.signal,
          agent
        });

        clearTimeout(timeoutId);

        console.log(`${aiService.type} API 响应状态 (尝试 ${attempt + 1}):`, response.status);

        // 处理响应
        if (response.ok) {
          const data = await response.json();
          console.log(`${aiService.type} API 响应成功`);

          try {
            const parsedResponse = aiService.parseResponse(data);
            console.log(`${aiService.type} API Tokens使用情况:`, parsedResponse.usage);
            return parsedResponse;
          } catch (parseError) {
            console.error("响应解析错误:", parseError);
            throw new Error(`API 响应格式错误: ${JSON.stringify(data)}`);
          }
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

    // 获取当前服务类型用于错误消息
    const aiService = getCurrentAIService();

    // 网络错误或超时时返回用户友好的消息
    if (error.name === 'AbortError' || error.code === 'ETIMEDOUT' || error.type === 'system') {
      return `感谢您的提问："${prompt}"。由于网络连接问题，我暂时无法连接到${aiService.type}服务。请检查网络连接或稍后再试。`;
    }

    // API 错误处理
    if (error.message.includes('401')) {
      return `API 密钥验证失败，请检查您的 ${aiService.type} API Key 是否正确。`;
    }

    if (error.message.includes('429')) {
      return `API 调用频率超限，请稍后再试。${aiService.type}服务系统已自动重试但仍然失败。`;
    }

    // 其他错误抛出以便控制器处理
    throw error;
  }
};
