import express from 'express';
import {
  recognizeSpeechFromBase64,
  recognizeSpeechFromFile,
  getSpeechServiceInfo,
  testSpeechService,
  uploadAudio
} from '../controllers/speechController.js';

const router = express.Router();

/**
 * @route POST /api/speech/recognize
 * @desc 语音识别 - Base64音频数据
 * @body {
 *   audioData: string,     // Base64格式的音频数据
 *   format?: string,       // 音频格式 (wav, mp3, m4a等)
 *   sampleRate?: number,   // 采样率 (默认16000)
 *   language?: string,     // 语言 (zh, en等)
 *   deviceId?: string,     // 设备ID
 *   autoChat?: boolean     // 是否自动发送到AI聊天
 * }
 */
router.post('/recognize', recognizeSpeechFromBase64);

/**
 * @route POST /api/speech/recognize-file
 * @desc 语音识别 - 上传音频文件
 * @formData audio: File   // 音频文件
 * @formData language?: string // 语言
 * @formData autoChat?: boolean // 是否自动发送到AI聊天
 */
router.post('/recognize-file', uploadAudio, recognizeSpeechFromFile);

/**
 * @route GET /api/speech/service-info
 * @desc 获取语音识别服务信息
 */
router.get('/service-info', getSpeechServiceInfo);

/**
 * @route GET /api/speech/test
 * @desc 测试语音识别服务连接
 */
router.get('/test', testSpeechService);

export default router;
