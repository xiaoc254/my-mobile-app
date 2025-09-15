import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { recognizeSpeechFromBase64 } from '../services/speechAPI';

interface SpeechRecognitionOptions {
  language?: string;
  autoChat?: boolean;
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
}

interface SpeechRecognitionResult {
  success: boolean;
  text?: string;
  confidence?: number;
  service?: string;
  duration?: number;
  aiResponse?: {
    reply: string;
    tokens?: any;
    duration?: number;
  };
}

export const useSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // 获取音频电平
  const updateAudioLevel = useCallback(() => {
    try {
      if (analyserRef.current && isRecording) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // 计算平均音量
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(Math.min(100, (average / 128) * 100));
      }

      if (isRecording) {
        animationRef.current = requestAnimationFrame(updateAudioLevel);
      }
    } catch (error) {
      console.warn('音频电平更新失败:', error);
      // 如果音频可视化失败，设置默认值
      setAudioLevel(50);
      if (isRecording) {
        animationRef.current = requestAnimationFrame(updateAudioLevel);
      }
    }
  }, [isRecording]);

  // 开始录音
  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      console.log('开始请求麦克风权限...');

      // 请求麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // 创建音频上下文用于可视化
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);
      } catch (audioError) {
        console.warn('音频可视化初始化失败，但录音功能正常:', audioError);
        // 即使音频可视化失败，录音功能仍然可以正常工作
      }

      // 创建MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

        mediaRecorder.onstop = () => {
          console.log('录音停止');
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
          // 清理资源
          setIsRecording(false);
          setAudioLevel(0);
        };

      // 开始录音
      mediaRecorder.start(100); // 每100ms收集一次数据
      setIsRecording(true);
      setRecordingTime(0);
      setAudioLevel(0);

      // 开始音频可视化
      updateAudioLevel();

      // 开始计时
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      console.log('录音开始成功');
      toast.success('开始录音');
      return true;

    } catch (error) {
      console.error('开始录音失败:', error);

      let errorMessage = '无法访问麦克风';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = '请允许麦克风权限';
        } else if (error.name === 'NotFoundError') {
          errorMessage = '未找到麦克风设备';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = '浏览器不支持录音功能';
        }
      }

      toast.error(errorMessage);
      return false;
    }
  }, [updateAudioLevel]);

  // 停止录音
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    try {
      if (!mediaRecorderRef.current || !isRecording) {
        return null;
      }

      return new Promise((resolve) => {
        const mediaRecorder = mediaRecorderRef.current!;

        mediaRecorder.onstop = () => {
          // 创建音频Blob
          const audioBlob = new Blob(chunksRef.current, {
            type: mediaRecorder.mimeType
          });

          console.log('录音完成，音频大小:', Math.round(audioBlob.size / 1024), 'KB');
          resolve(audioBlob);
        };

        // 停止录音
        mediaRecorder.stop();
        setIsRecording(false);

        // 清理资源
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close().catch(console.error);
          audioContextRef.current = null;
        }

        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }

        setAudioLevel(0);
        toast.success(`录音完成 (${recordingTime}秒)`);
      });

    } catch (error) {
      console.error('停止录音失败:', error);
      toast.error('停止录音失败');
      return null;
    }
  }, [isRecording, recordingTime]);

  // 识别语音
  const recognizeSpeech = useCallback(async (
    audioBlob: Blob,
    options: SpeechRecognitionOptions = {}
  ): Promise<SpeechRecognitionResult | null> => {
    try {
      setIsProcessing(true);
      toast.loading('正在识别语音...', { id: 'speech-recognition' });

      // 转换为Base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // 推断音频格式
      let format = 'wav';
      if (audioBlob.type.includes('webm')) {
        format = 'webm';
      } else if (audioBlob.type.includes('mp4')) {
        format = 'm4a';
      }

      // 使用API服务进行识别
      const result = await recognizeSpeechFromBase64(base64Audio, {
        format: format,
        sampleRate: 16000,
        language: options.language || 'zh',
        autoChat: options.autoChat || false
      });

      if (result.success && result.text) {
        toast.success(`识别成功: ${result.text}`, { id: 'speech-recognition' });
        options.onResult?.(result.text);

        // 如果有AI回复也显示
        if (result.aiResponse?.reply) {
          toast.success('AI已自动回复', { duration: 2000 });
        }
      } else {
        toast.error(result.error || '识别失败', { id: 'speech-recognition' });
        options.onError?.(result.error || '识别失败');
      }

      return result;

    } catch (error) {
      console.error('语音识别失败:', error);
      const errorMessage = error instanceof Error ? error.message : '识别失败';
      toast.error(errorMessage, { id: 'speech-recognition' });
      options.onError?.(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // 一键录音识别
  const recordAndRecognize = useCallback(async (options: SpeechRecognitionOptions = {}) => {
    if (isRecording) {
      // 停止录音并识别
      const audioBlob = await stopRecording();
      if (audioBlob) {
        return await recognizeSpeech(audioBlob, options);
      }
    } else {
      // 开始录音
      return await startRecording();
    }
    return null;
  }, [isRecording, stopRecording, recognizeSpeech, startRecording]);

  // 清理资源
  const cleanup = useCallback(() => {
    try {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }

      setIsRecording(false);
      setIsProcessing(false);
      setAudioLevel(0);
      setRecordingTime(0);
    } catch (error) {
      console.error('清理资源时出错:', error);
    }
  }, [isRecording]);

  return {
    // 状态
    isRecording,
    isProcessing,
    audioLevel,
    recordingTime,

    // 方法
    startRecording,
    stopRecording,
    recognizeSpeech,
    recordAndRecognize,
    cleanup,

    // 工具状态
    isSupported: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
    isBusy: isRecording || isProcessing
  };
};
