import React, { useEffect } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

interface SpeechRecognitionButtonProps {
  onSpeechResult: (text: string) => void;
  disabled?: boolean;
  autoChat?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const SpeechRecognitionButton: React.FC<
  SpeechRecognitionButtonProps
> = ({
  onSpeechResult,
  disabled = false,
  autoChat = false,
  size = "md",
  className,
}) => {
  const {
    isRecording,
    isProcessing,
    audioLevel,
    recordingTime,
    recordAndRecognize,
    cleanup,
    isSupported,
    isBusy,
  } = useSpeechRecognition();

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // 处理点击事件
  const handleClick = async () => {
    if (disabled || !isSupported) return;

    try {
      if (isRecording) {
        // 如果正在录音，停止录音并识别
        console.log("停止录音并开始识别");
      } else {
        // 如果没有录音，开始录音
        console.log("开始录音");
      }

      const result = await recordAndRecognize({
        language: "zh",
        autoChat,
        onResult: onSpeechResult,
      });

      // 如果是录音结果，处理识别结果
      if (typeof result === "object" && result?.success && result?.text) {
        console.log("语音识别结果:", result.text);
      }
    } catch (error) {
      console.error("语音识别按钮处理错误:", error);
    }
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

    if (isRecording) {
      return "bg-red-500 hover:bg-red-600 text-white animate-pulse";
    }

    if (isProcessing) {
      return "bg-blue-500 text-white";
    }

    return "bg-gradient-to-br from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-gray-600 border border-purple-200";
  };

  // 获取按钮内容
  const getButtonContent = () => {
    if (!isSupported) {
      return <span className="text-xs">❌</span>;
    }

    if (isProcessing) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (isRecording) {
      return <span className="text-xs">⏹️</span>;
    }

    return <span className="text-xs">🎤</span>;
  };

  // 格式化录音时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative flex items-center">
      {/* 主按钮 */}
      <motion.button
        whileHover={!disabled && !isBusy ? { scale: 1.05 } : {}}
        whileTap={!disabled && !isBusy ? { scale: 0.95 } : {}}
        onClick={handleClick}
        disabled={disabled || !isSupported}
        className={clsx(
          getSizeClasses(),
          "rounded-full font-bold text-xs transition-all duration-200 flex items-center justify-center shadow-md relative overflow-hidden",
          getButtonClasses(),
          className
        )}
        title={
          !isSupported
            ? "浏览器不支持语音识别"
            : disabled
            ? "语音识别已禁用"
            : isRecording
            ? "点击停止录音"
            : isProcessing
            ? "正在识别中..."
            : "点击开始语音输入"
        }
      >
        {/* 音频可视化背景 */}
        {isRecording && (
          <motion.div
            className="absolute inset-0 bg-red-400 opacity-30 rounded-full"
            animate={{
              scale: [1, 1 + audioLevel / 200, 1],
            }}
            transition={{
              duration: 0.1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {getButtonContent()}
      </motion.button>

      {/* 录音状态指示器 */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="ml-2 flex items-center space-x-1"
        >
          {/* 录音时间 */}
          <span className="text-xs text-red-600 font-mono font-bold">
            {formatTime(recordingTime)}
          </span>

          {/* 音频波形可视化 */}
          <div className="flex items-center space-x-0.5">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-0.5 bg-red-500 rounded-full"
                animate={{
                  height: [2, Math.max(2, audioLevel / 10), 2],
                }}
                transition={{
                  duration: 0.1,
                  repeat: Infinity,
                  delay: i * 0.02,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* 处理状态指示器 */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="ml-2 flex items-center space-x-1"
        >
          <span className="text-xs text-blue-600 font-medium">识别中...</span>
          <div className="flex space-x-0.5">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-blue-500 rounded-full"
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
    </div>
  );
};
