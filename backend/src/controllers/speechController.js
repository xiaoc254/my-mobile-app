import { recognizeSpeech, getSupportedFormats, checkSpeechServiceStatus } from '../services/speechRecognitionService.js';
import { callAIModel } from '../services/aiService.js';
import multer from 'multer';
import path from 'path';

// 配置multer用于音频文件上传
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB限制
  },
  fileFilter: (req, file, cb) => {
    // 检查音频文件类型
    const allowedMimes = [
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/mpeg',
      'audio/mp3',
      'audio/mp4',
      'audio/m4a',
      'audio/aac',
      'audio/ogg',
      'audio/webm',
      'audio/flac',
      'audio/x-flac'
    ];

    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(wav|mp3|m4a|aac|ogg|webm|flac)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的音频格式，请使用 WAV、MP3、M4A、AAC、OGG、WEBM 或 FLAC 格式'), false);
    }
  }
});

/**
 * 语音识别接口 - 处理Base64音频数据
 */
export const recognizeSpeechFromBase64 = async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      audioData,
      format = 'wav',
      sampleRate = 16000,
      language = 'zh',
      deviceId,
      autoChat = false  // 是否自动发送到AI聊天
    } = req.body;

    if (!audioData) {
      return res.status(400).json({
        success: false,
        error: '缺少音频数据',
        message: '请提供Base64格式的音频数据'
      });
    }

    console.log('收到语音识别请求:', {
      format,
      sampleRate,
      language,
      audioLength: audioData.length,
      autoChat,
      timestamp: new Date().toISOString()
    });

    // 调用语音识别服务
    const recognitionResult = await recognizeSpeech(audioData, {
      format,
      sampleRate,
      language,
      deviceId
    });

    const duration_ms = Date.now() - startTime;

    if (!recognitionResult.success) {
      console.error('语音识别失败:', recognitionResult.error);
      return res.status(500).json({
        success: false,
        error: '语音识别失败',
        details: recognitionResult.error,
        service: recognitionResult.service,
        duration: duration_ms
      });
    }

    console.log(`语音识别成功: "${recognitionResult.text}" (服务: ${recognitionResult.service}, 耗时: ${duration_ms}ms)`);

    const response = {
      success: true,
      text: recognitionResult.text,
      confidence: recognitionResult.confidence,
      service: recognitionResult.service,
      duration: duration_ms,
      timestamp: new Date().toISOString()
    };

    // 如果启用了自动聊天，将识别结果发送给AI
    if (autoChat && recognitionResult.text && recognitionResult.text.trim()) {
      try {
        console.log('启用自动聊天，发送给AI:', recognitionResult.text);

        const aiPrompt = `用户通过语音说了："${recognitionResult.text}"。请根据这个语音内容，为宠物主人提供专业的回答和建议。`;

        const aiResponse = await callAIModel(aiPrompt);

        // 处理AI响应
        let aiReply, aiUsage;
        if (typeof aiResponse === 'string') {
          aiReply = aiResponse;
          aiUsage = null;
        } else {
          aiReply = aiResponse.content;
          aiUsage = aiResponse.usage;
        }

        response.aiResponse = {
          reply: aiReply,
          tokens: aiUsage ? {
            promptTokens: aiUsage.prompt_tokens || 0,
            completionTokens: aiUsage.completion_tokens || 0,
            totalTokens: aiUsage.total_tokens || 0
          } : null,
          duration: Date.now() - startTime - duration_ms
        };

        console.log('AI自动回复完成');
      } catch (aiError) {
        console.error('AI自动回复失败:', aiError);
        response.aiResponse = {
          error: 'AI回复失败',
          details: aiError.message
        };
      }
    }

    res.json(response);

  } catch (error) {
    const duration_ms = Date.now() - startTime;
    console.error('语音识别控制器错误:', error);

    res.status(500).json({
      success: false,
      error: '语音识别服务错误',
      message: error.message,
      duration: duration_ms
    });
  }
};

/**
 * 语音识别接口 - 处理上传的音频文件
 */
export const recognizeSpeechFromFile = async (req, res) => {
  const startTime = Date.now();

  try {
    const audioFile = req.file;
    const {
      language = 'zh',
      autoChat = false
    } = req.body;

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        error: '缺少音频文件',
        message: '请上传音频文件'
      });
    }

    console.log('收到音频文件识别请求:', {
      filename: audioFile.originalname,
      size: `${(audioFile.size / 1024).toFixed(1)}KB`,
      mimetype: audioFile.mimetype,
      language,
      autoChat,
      timestamp: new Date().toISOString()
    });

    // 将音频文件转换为Base64
    const audioBase64 = audioFile.buffer.toString('base64');

    // 推断音频格式
    let format = 'wav';
    if (audioFile.mimetype.includes('mp3') || audioFile.originalname.endsWith('.mp3')) {
      format = 'mp3';
    } else if (audioFile.mimetype.includes('m4a') || audioFile.originalname.endsWith('.m4a')) {
      format = 'm4a';
    } else if (audioFile.mimetype.includes('aac') || audioFile.originalname.endsWith('.aac')) {
      format = 'aac';
    } else if (audioFile.mimetype.includes('ogg') || audioFile.originalname.endsWith('.ogg')) {
      format = 'ogg';
    } else if (audioFile.mimetype.includes('flac') || audioFile.originalname.endsWith('.flac')) {
      format = 'flac';
    }

    // 调用语音识别服务
    const recognitionResult = await recognizeSpeech(audioBase64, {
      format,
      sampleRate: 16000, // 默认采样率
      language
    });

    const duration_ms = Date.now() - startTime;

    if (!recognitionResult.success) {
      console.error('语音识别失败:', recognitionResult.error);
      return res.status(500).json({
        success: false,
        error: '语音识别失败',
        details: recognitionResult.error,
        service: recognitionResult.service,
        duration: duration_ms,
        fileInfo: {
          name: audioFile.originalname,
          size: audioFile.size,
          type: audioFile.mimetype
        }
      });
    }

    console.log(`语音识别成功: "${recognitionResult.text}" (服务: ${recognitionResult.service}, 耗时: ${duration_ms}ms)`);

    const response = {
      success: true,
      text: recognitionResult.text,
      confidence: recognitionResult.confidence,
      service: recognitionResult.service,
      duration: duration_ms,
      fileInfo: {
        name: audioFile.originalname,
        size: audioFile.size,
        type: audioFile.mimetype,
        format: format
      },
      timestamp: new Date().toISOString()
    };

    // 如果启用了自动聊天，将识别结果发送给AI
    if (autoChat && recognitionResult.text && recognitionResult.text.trim()) {
      try {
        console.log('启用自动聊天，发送给AI:', recognitionResult.text);

        const aiPrompt = `用户通过语音说了："${recognitionResult.text}"。请根据这个语音内容，为宠物主人提供专业的回答和建议。`;

        const aiResponse = await callAIModel(aiPrompt);

        // 处理AI响应
        let aiReply, aiUsage;
        if (typeof aiResponse === 'string') {
          aiReply = aiResponse;
          aiUsage = null;
        } else {
          aiReply = aiResponse.content;
          aiUsage = aiResponse.usage;
        }

        response.aiResponse = {
          reply: aiReply,
          tokens: aiUsage ? {
            promptTokens: aiUsage.prompt_tokens || 0,
            completionTokens: aiUsage.completion_tokens || 0,
            totalTokens: aiUsage.total_tokens || 0
          } : null,
          duration: Date.now() - startTime - duration_ms
        };

        console.log('AI自动回复完成');
      } catch (aiError) {
        console.error('AI自动回复失败:', aiError);
        response.aiResponse = {
          error: 'AI回复失败',
          details: aiError.message
        };
      }
    }

    res.json(response);

  } catch (error) {
    const duration_ms = Date.now() - startTime;
    console.error('音频文件识别错误:', error);

    res.status(500).json({
      success: false,
      error: '音频文件识别失败',
      message: error.message,
      duration: duration_ms
    });
  }
};

/**
 * 获取语音识别服务信息
 */
export const getSpeechServiceInfo = async (req, res) => {
  try {
    const [formats, status] = await Promise.all([
      getSupportedFormats(),
      checkSpeechServiceStatus()
    ]);

    res.json({
      success: true,
      serviceInfo: {
        ...status,
        supportedFormats: formats.formats,
        maxFileSize: formats.maxSizeMB + 'MB',
        recommendedFormat: 'wav',
        recommendedSampleRate: 16000,
        features: [
          '实时语音识别',
          'AI智能对话集成',
          '多格式音频支持',
          '高精度识别',
          '中英文混合识别'
        ]
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('获取语音服务信息失败:', error);
    res.status(500).json({
      success: false,
      error: '获取服务信息失败',
      message: error.message
    });
  }
};

/**
 * 测试语音识别服务连接
 */
export const testSpeechService = async (req, res) => {
  try {
    const status = await checkSpeechServiceStatus();

    if (status.available) {
      res.json({
        success: true,
        message: `语音识别服务 (${status.service}) 连接正常`,
        service: status.service,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        success: false,
        error: `语音识别服务 (${status.service}) 不可用`,
        details: status.error,
        service: status.service,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('测试语音服务失败:', error);
    res.status(500).json({
      success: false,
      error: '测试语音服务失败',
      message: error.message
    });
  }
};

// 导出multer中间件
export const uploadAudio = upload.single('audio');
