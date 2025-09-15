import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { BosClient } from '@baiducloud/sdk';
import FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';

// 语音识别服务配置
const SPEECH_SERVICES = {
  // 百度语音识别
  baidu: {
    asrUrl: 'https://vop.baidu.com/server_api',
    tokenUrl: 'https://aip.baidubce.com/oauth/2.0/token',
    maxAudioSize: 60 * 1024 * 1024, // 60MB
    supportedFormats: ['pcm', 'wav', 'opus', 'speex', 'amr', 'm4a'],
    formatRequest: (audioData, token, options = {}) => ({
      format: options.format || 'wav',
      rate: options.sampleRate || 16000,
      channel: 1,
      cuid: options.deviceId || uuidv4(),
      token: token,
      speech: audioData,
      len: Buffer.from(audioData, 'base64').length
    }),
    formatHeaders: () => ({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    parseResponse: (data) => {
      if (data.err_no === 0 && data.result && data.result.length > 0) {
        return {
          success: true,
          text: data.result[0],
          confidence: data.corpus_no || 0.9,
          service: 'baidu'
        };
      }
      return {
        success: false,
        error: data.err_msg || '识别失败',
        errorCode: data.err_no,
        service: 'baidu'
      };
    }
  },

  // 阿里云语音识别
  aliyun: {
    asrUrl: 'https://nls-meta.cn-shanghai.aliyuncs.com',
    maxAudioSize: 100 * 1024 * 1024, // 100MB
    supportedFormats: ['pcm', 'wav', 'opus', 'speex', 'amr'],
    formatRequest: (audioData, accessToken, options = {}) => ({
      appkey: process.env.ALIYUN_NLS_APPKEY,
      format: options.format || 'wav',
      sample_rate: options.sampleRate || 16000,
      speech: audioData
    }),
    formatHeaders: (accessToken) => ({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    parseResponse: (data) => {
      if (data.status === 20000000 && data.result) {
        return {
          success: true,
          text: data.result,
          confidence: data.confidence || 0.9,
          service: 'aliyun'
        };
      }
      return {
        success: false,
        error: data.message || '识别失败',
        errorCode: data.status,
        service: 'aliyun'
      };
    }
  },

  // Azure 语音识别
  azure: {
    asrUrl: 'https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1',
    maxAudioSize: 100 * 1024 * 1024, // 100MB
    supportedFormats: ['wav', 'ogg', 'flac'],
    formatRequest: (audioData, subscriptionKey, options = {}) => ({
      language: options.language || 'zh-CN',
      format: 'detailed'
    }),
    formatHeaders: (subscriptionKey) => ({
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'audio/wav',
      'Accept': 'application/json'
    }),
    parseResponse: (data) => {
      if (data.RecognitionStatus === 'Success' && data.DisplayText) {
        return {
          success: true,
          text: data.DisplayText,
          confidence: data.Confidence || 0.9,
          service: 'azure'
        };
      }
      return {
        success: false,
        error: data.RecognitionStatus || '识别失败',
        errorCode: data.RecognitionStatus,
        service: 'azure'
      };
    }
  }
};

// 百度Token缓存
let baiduTokenCache = {
  token: null,
  expiresAt: 0
};

// 阿里云Token缓存
let aliyunTokenCache = {
  token: null,
  expiresAt: 0
};

/**
 * 获取百度语音识别Access Token
 */
async function getBaiduAccessToken() {
  try {
    // 检查缓存
    if (baiduTokenCache.token && Date.now() < baiduTokenCache.expiresAt) {
      return baiduTokenCache.token;
    }

    const apiKey = process.env.BAIDU_API_KEY;
    const secretKey = process.env.BAIDU_SECRET_KEY;

    if (!apiKey || !secretKey) {
      throw new Error('百度API Key 或 Secret Key 未配置');
    }

    const url = `${SPEECH_SERVICES.baidu.tokenUrl}?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!response.ok) {
      throw new Error(`获取百度Token失败: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`百度Token错误: ${data.error_description || data.error}`);
    }

    // 缓存token（提前5分钟过期）
    baiduTokenCache.token = data.access_token;
    baiduTokenCache.expiresAt = Date.now() + (data.expires_in - 300) * 1000;

    console.log('百度语音识别Token获取成功');
    return data.access_token;
  } catch (error) {
    console.error('获取百度语音识别Token失败:', error);
    throw error;
  }
}

/**
 * 获取阿里云语音识别Access Token
 */
async function getAliyunAccessToken() {
  try {
    // 检查缓存
    if (aliyunTokenCache.token && Date.now() < aliyunTokenCache.expiresAt) {
      return aliyunTokenCache.token;
    }

    const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
    const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;

    if (!accessKeyId || !accessKeySecret) {
      throw new Error('阿里云Access Key 未配置');
    }

    // 这里应该实现阿里云的签名认证逻辑
    // 为简化示例，返回一个模拟token
    const mockToken = 'aliyun_mock_token';

    // 缓存token
    aliyunTokenCache.token = mockToken;
    aliyunTokenCache.expiresAt = Date.now() + 3600 * 1000; // 1小时

    console.log('阿里云语音识别Token获取成功');
    return mockToken;
  } catch (error) {
    console.error('获取阿里云语音识别Token失败:', error);
    throw error;
  }
}

/**
 * 获取当前语音识别服务配置
 */
function getCurrentSpeechService() {
  const serviceType = process.env.SPEECH_SERVICE || 'baidu';
  const service = SPEECH_SERVICES[serviceType];

  if (!service) {
    throw new Error(`不支持的语音识别服务: ${serviceType}`);
  }

  return { ...service, type: serviceType };
}

/**
 * 验证音频格式和大小
 */
function validateAudioData(audioData, service) {
  if (!audioData) {
    throw new Error('音频数据不能为空');
  }

  // 检查Base64格式
  if (!audioData.match(/^[A-Za-z0-9+/=]+$/)) {
    throw new Error('音频数据必须是Base64格式');
  }

  // 检查文件大小
  const audioBuffer = Buffer.from(audioData, 'base64');
  if (audioBuffer.length > service.maxAudioSize) {
    throw new Error(`音频文件过大，最大支持 ${Math.round(service.maxAudioSize / 1024 / 1024)}MB`);
  }

  console.log(`音频验证通过: ${Math.round(audioBuffer.length / 1024)}KB`);
  return true;
}

/**
 * 百度语音识别
 */
async function recognizeSpeechBaidu(audioData, options = {}) {
  try {
    const service = SPEECH_SERVICES.baidu;
    validateAudioData(audioData, service);

    const token = await getBaiduAccessToken();
    const requestBody = service.formatRequest(audioData, token, options);
    const headers = service.formatHeaders();

    console.log('开始百度语音识别，音频长度:', requestBody.len);

    const response = await fetch(service.asrUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`百度语音识别API调用失败: ${response.status}`);
    }

    const data = await response.json();
    console.log('百度语音识别响应:', data);

    return service.parseResponse(data);
  } catch (error) {
    console.error('百度语音识别失败:', error);
    return {
      success: false,
      error: error.message,
      service: 'baidu'
    };
  }
}

/**
 * 阿里云语音识别
 */
async function recognizeSpeechAliyun(audioData, options = {}) {
  try {
    const service = SPEECH_SERVICES.aliyun;
    validateAudioData(audioData, service);

    const token = await getAliyunAccessToken();

    // 注意：这里是简化实现，实际需要根据阿里云API文档实现
    console.log('阿里云语音识别功能需要完整的SDK集成');

    return {
      success: false,
      error: '阿里云语音识别暂未完全集成，请使用百度语音识别',
      service: 'aliyun'
    };
  } catch (error) {
    console.error('阿里云语音识别失败:', error);
    return {
      success: false,
      error: error.message,
      service: 'aliyun'
    };
  }
}

/**
 * Azure语音识别
 */
async function recognizeSpeechAzure(audioData, options = {}) {
  try {
    const service = SPEECH_SERVICES.azure;
    validateAudioData(audioData, service);

    const subscriptionKey = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION || 'eastus';

    if (!subscriptionKey) {
      throw new Error('Azure语音识别密钥未配置');
    }

    const url = service.asrUrl.replace('{region}', region);
    const headers = service.formatHeaders(subscriptionKey);

    // 将Base64转换为二进制数据
    const audioBuffer = Buffer.from(audioData, 'base64');

    console.log('开始Azure语音识别，音频长度:', audioBuffer.length);

    const response = await fetch(`${url}?language=${options.language || 'zh-CN'}&format=detailed`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000'
      },
      body: audioBuffer
    });

    if (!response.ok) {
      throw new Error(`Azure语音识别API调用失败: ${response.status}`);
    }

    const data = await response.json();
    console.log('Azure语音识别响应:', data);

    return service.parseResponse(data);
  } catch (error) {
    console.error('Azure语音识别失败:', error);
    return {
      success: false,
      error: error.message,
      service: 'azure'
    };
  }
}

/**
 * 主语音识别函数 - 支持多服务切换
 */
export async function recognizeSpeech(audioData, options = {}) {
  try {
    const speechService = getCurrentSpeechService();
    console.log(`使用语音识别服务: ${speechService.type}`);

    let result;
    switch (speechService.type) {
      case 'baidu':
        result = await recognizeSpeechBaidu(audioData, options);
        break;
      case 'aliyun':
        result = await recognizeSpeechAliyun(audioData, options);
        break;
      case 'azure':
        result = await recognizeSpeechAzure(audioData, options);
        break;
      default:
        throw new Error(`不支持的语音识别服务: ${speechService.type}`);
    }

    // 添加通用信息
    result.timestamp = new Date().toISOString();
    result.options = options;

    return result;
  } catch (error) {
    console.error('语音识别服务错误:', error);
    return {
      success: false,
      error: error.message,
      service: 'unknown',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 获取支持的音频格式
 */
export function getSupportedFormats() {
  const speechService = getCurrentSpeechService();
  return {
    service: speechService.type,
    formats: speechService.supportedFormats,
    maxSize: speechService.maxAudioSize,
    maxSizeMB: Math.round(speechService.maxAudioSize / 1024 / 1024)
  };
}

/**
 * 检查语音识别服务状态
 */
export async function checkSpeechServiceStatus() {
  try {
    const speechService = getCurrentSpeechService();

    const status = {
      service: speechService.type,
      available: false,
      error: null
    };

    switch (speechService.type) {
      case 'baidu':
        try {
          await getBaiduAccessToken();
          status.available = true;
        } catch (error) {
          status.error = error.message;
        }
        break;
      case 'aliyun':
        try {
          await getAliyunAccessToken();
          status.available = true;
        } catch (error) {
          status.error = error.message;
        }
        break;
      case 'azure':
        const subscriptionKey = process.env.AZURE_SPEECH_KEY;
        if (subscriptionKey) {
          status.available = true;
        } else {
          status.error = 'Azure语音识别密钥未配置';
        }
        break;
    }

    return status;
  } catch (error) {
    return {
      service: 'unknown',
      available: false,
      error: error.message
    };
  }
}
