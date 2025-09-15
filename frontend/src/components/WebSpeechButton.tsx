import React, { useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useWebSpeechRecognition } from "../hooks/useWebSpeechRecognition";

interface WebSpeechButtonProps {
  onSpeechResult: (text: string) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  placeholder?: string;
}

export const WebSpeechButton: React.FC<WebSpeechButtonProps> = ({
  onSpeechResult,
  disabled = false,
  size = "md",
  className,
  placeholder = "点击开始语音输入",
}) => {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    toggleListening,
    resetTranscript,
    cleanup,
  } = useWebSpeechRecognition();

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const lastProcessedRef = useRef<string>("");

  // 当有最终识别结果时调用回调
  const handleSpeechResult = useCallback(
    (text: string) => {
      if (text && text !== lastProcessedRef.current) {
        console.log("触发语音结果回调:", text);
        lastProcessedRef.current = text;
        onSpeechResult(text);
        // 延迟清理transcript避免重复触发
        setTimeout(() => {
          resetTranscript();
          lastProcessedRef.current = "";
        }, 1000);
      }
    },
    [onSpeechResult, resetTranscript]
  );

  useEffect(() => {
    if (transcript) {
      handleSpeechResult(transcript);
    }
  }, [transcript, handleSpeechResult]);

  // 处理点击事件
  const handleClick = async () => {
    if (disabled || !isSupported) return;

    toggleListening({
      language: "zh-CN",
      continuous: false,
      interimResults: true,
      onResult: (text) => {
        console.log("语音识别结果:", text);
      },
      onError: (error) => {
        // 忽略 aborted 错误，这是正常的停止行为
        if (error !== "aborted") {
          console.error("语音识别错误:", error);
        }
      },
    });
  };

  // 获取按钮尺寸
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-8 h-8";
      default:
        return "w-5 h-5";
    }
  };

  // 获取按钮状态样式
  const getButtonClasses = () => {
    if (!isSupported) {
      return "bg-gray-300 cursor-not-allowed text-gray-500";
    }

    if (disabled) {
      return "bg-gray-300 cursor-not-allowed text-gray-500";
    }

    if (isListening) {
      return "bg-red-500 hover:bg-red-600 text-white animate-pulse";
    }

    if (error) {
      return "bg-orange-500 hover:bg-orange-600 text-white";
    }

    return "bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-gray-600 border border-purple-200";
  };

  // 获取按钮内容
  const getButtonContent = () => {
    if (!isSupported) {
      return <span className="text-xs">❌</span>;
    }

    if (error) {
      return <span className="text-xs">⚠️</span>;
    }

    if (isListening) {
      return <span className="text-xs">⏹️</span>;
    }

    return <span className="text-xs">🎤</span>;
  };

  // 获取按钮标题
  const getButtonTitle = () => {
    if (!isSupported) {
      return "浏览器不支持语音识别";
    }

    if (disabled) {
      return "语音识别已禁用";
    }

    if (error) {
      return `错误: ${error}`;
    }

    if (isListening) {
      return "点击停止语音识别";
    }

    return placeholder;
  };

  return (
    <div className="relative flex items-center">
      {/* 主按钮 */}
      <motion.button
        whileHover={!disabled && isSupported ? { scale: 1.05 } : {}}
        whileTap={!disabled && isSupported ? { scale: 0.95 } : {}}
        onClick={handleClick}
        disabled={disabled || !isSupported}
        className={clsx(
          getSizeClasses(),
          "rounded-full font-bold text-xs transition-all duration-200 flex items-center justify-center shadow-md relative overflow-hidden",
          getButtonClasses(),
          className
        )}
        title={getButtonTitle()}
      >
        {/* 监听动画背景 */}
        {isListening && (
          <motion.div
            className="absolute inset-0 bg-red-400 opacity-30 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {getButtonContent()}
      </motion.button>

      {/* 实时识别结果显示 */}
      <AnimatePresence>
        {isListening && interimTranscript && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.8 }}
            className="ml-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg max-w-48 overflow-hidden"
          >
            <span className="text-xs text-blue-800 font-medium">
              {interimTranscript.length > 20
                ? interimTranscript.substring(0, 20) + "..."
                : interimTranscript}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 监听状态指示器 */}
      <AnimatePresence>
        {isListening && !interimTranscript && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="ml-2 flex items-center space-x-1"
          >
            <span className="text-xs text-red-600 font-medium">
              正在监听...
            </span>
            <div className="flex space-x-0.5">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 h-1 bg-red-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 错误状态显示 */}
      <AnimatePresence>
        {error && !isListening && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="ml-2 px-2 py-1 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700 max-w-48"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
