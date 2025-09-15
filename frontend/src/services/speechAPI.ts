import api from './api';

export interface SpeechRecognitionOptions {
  language?: string;
  format?: string;
  sampleRate?: number;
  deviceId?: string;
  autoChat?: boolean;
}

export interface SpeechRecognitionResult {
  success: boolean;
  text?: string;
  confidence?: number;
  service?: string;
  duration?: number;
  error?: string;
  aiResponse?: {
    reply: string;
    tokens?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    duration?: number;
  };
}

export interface SpeechServiceInfo {
  success: boolean;
  serviceInfo?: {
    service: string;
    available: boolean;
    supportedFormats: string[];
    maxFileSize: string;
    recommendedFormat: string;
    recommendedSampleRate: number;
    features: string[];
  };
  error?: string;
}

/**
 * 语音识别 - Base64音频数据
 */
export const recognizeSpeechFromBase64 = async (
  audioData: string,
  options: SpeechRecognitionOptions = {}
): Promise<SpeechRecognitionResult> => {
  try {
    const response = await api.post<SpeechRecognitionResult>('/speech/recognize', {
      audioData,
      format: options.format || 'wav',
      sampleRate: options.sampleRate || 16000,
      language: options.language || 'zh',
      deviceId: options.deviceId,
      autoChat: options.autoChat || false
    });

    return response.data;
  } catch (error: any) {
    console.error('语音识别API调用失败:', error);

    return {
      success: false,
      error: error.response?.data?.error || error.message || '语音识别失败',
      service: 'unknown'
    };
  }
};

/**
 * 语音识别 - 上传音频文件
 */
export const recognizeSpeechFromFile = async (
  audioFile: File,
  options: SpeechRecognitionOptions = {}
): Promise<SpeechRecognitionResult> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', options.language || 'zh');
    formData.append('autoChat', String(options.autoChat || false));

    const response = await api.post<SpeechRecognitionResult>('/speech/recognize-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('音频文件识别API调用失败:', error);

    return {
      success: false,
      error: error.response?.data?.error || error.message || '音频文件识别失败',
      service: 'unknown'
    };
  }
};

/**
 * 获取语音识别服务信息
 */
export const getSpeechServiceInfo = async (): Promise<SpeechServiceInfo> => {
  try {
    const response = await api.get<SpeechServiceInfo>('/speech/service-info');
    return response.data;
  } catch (error: any) {
    console.error('获取语音服务信息失败:', error);

    return {
      success: false,
      error: error.response?.data?.error || error.message || '获取服务信息失败'
    };
  }
};

/**
 * 测试语音识别服务连接
 */
export const testSpeechService = async (): Promise<{ success: boolean; message?: string; error?: string; service?: string }> => {
  try {
    const response = await api.get('/speech/test');
    return response.data;
  } catch (error: any) {
    console.error('测试语音服务失败:', error);

    return {
      success: false,
      error: error.response?.data?.error || error.message || '测试语音服务失败'
    };
  }
};
