import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface WebSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

interface SpeechRecognitionAPI extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  grammars: any;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognitionAPI, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognitionAPI, ev: Event) => any) | null;
  onend: ((this: SpeechRecognitionAPI, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognitionAPI, ev: any) => any) | null;
  onnomatch: ((this: SpeechRecognitionAPI, ev: any) => any) | null;
  onresult: ((this: SpeechRecognitionAPI, ev: any) => any) | null;
  onsoundstart: ((this: SpeechRecognitionAPI, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognitionAPI, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognitionAPI, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognitionAPI, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognitionAPI, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionAPI;
    webkitSpeechRecognition?: new () => SpeechRecognitionAPI;
  }
}

export const useWebSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionAPI | null>(null);
  const optionsRef = useRef<WebSpeechRecognitionOptions>({});
  const lastTranscriptRef = useRef<string>('');

  // 检查浏览器支持
  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // 初始化语音识别
  const initializeRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = optionsRef.current.continuous || false;
    recognition.interimResults = optionsRef.current.interimResults || true;
    recognition.lang = optionsRef.current.language || 'zh-CN';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('语音识别开始');
      setIsListening(true);
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      toast.success('开始语音识别', { duration: 1000 });
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += text;
        } else {
          interim += text;
        }
      }

      if (finalTranscript && finalTranscript !== lastTranscriptRef.current) {
        console.log('最终识别结果:', finalTranscript);
        lastTranscriptRef.current = finalTranscript;
        setTranscript(finalTranscript);
        optionsRef.current.onResult?.(finalTranscript);
        // 自动停止识别避免继续监听
        recognition.stop();
      }

      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      // 忽略aborted错误，这是正常的停止行为
      if (event.error === 'aborted') {
        console.log('语音识别被正常停止');
        return;
      }

      console.error('语音识别错误:', event.error);
      const errorMessage = getErrorMessage(event.error);
      setError(errorMessage);
      setIsListening(false);
      toast.error(errorMessage);
      optionsRef.current.onError?.(event.error);
    };

    recognition.onend = () => {
      console.log('语音识别结束');
      setIsListening(false);
      setInterimTranscript('');
      optionsRef.current.onEnd?.();
    };

    return recognition;
  }, [isSupported]);

  // 错误消息映射
  const getErrorMessage = (error: string): string => {
    const errorMessages: { [key: string]: string } = {
      'no-speech': '没有检测到语音，请重试',
      'audio-capture': '无法访问麦克风',
      'not-allowed': '请允许麦克风权限',
      'network': '网络错误，请检查网络连接',
      'not-supported': '浏览器不支持语音识别',
      'service-not-allowed': '语音识别服务不可用',
      'bad-grammar': '语法错误',
      'language-not-supported': '不支持的语言'
    };
    return errorMessages[error] || `语音识别错误: ${error}`;
  };

  // 开始监听
  const startListening = useCallback((options: WebSpeechRecognitionOptions = {}) => {
    if (!isSupported) {
      const error = '浏览器不支持语音识别';
      toast.error(error);
      return false;
    }

    if (isListening) {
      console.log('语音识别已在进行中');
      return false;
    }

    try {
      optionsRef.current = options;
      recognitionRef.current = initializeRecognition();

      if (recognitionRef.current) {
        recognitionRef.current.start();
        return true;
      }
      return false;
    } catch (error) {
      console.error('启动语音识别失败:', error);
      const errorMessage = '启动语音识别失败';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [isSupported, isListening, initializeRecognition]);

  // 停止监听
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      return true;
    }
    return false;
  }, [isListening]);

  // 切换监听状态
  const toggleListening = useCallback((options: WebSpeechRecognitionOptions = {}) => {
    if (isListening) {
      return stopListening();
    } else {
      return startListening(options);
    }
  }, [isListening, startListening, stopListening]);

  // 重置状态
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    lastTranscriptRef.current = '';
  }, []);

  // 清理资源
  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setError(null);
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // 状态
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,

    // 方法
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    cleanup,

    // 计算属性
    hasTranscript: transcript.length > 0,
    fullTranscript: transcript + interimTranscript
  };
};
