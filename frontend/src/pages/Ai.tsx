import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoProvider, PhotoView } from "react-photo-view";
import TextareaAutosize from "react-textarea-autosize";
import { toast, Toaster } from "react-hot-toast";
import clsx from "clsx";
import "react-photo-view/dist/react-photo-view.css";

import { useChatStore } from "../store/chatStore";
import type { Message } from "../store/chatStore";
import { formatMessageTime } from "../utils/timeUtils";
import { compressImage } from "../utils/imageCompression";
import { WebSpeechButton } from "../components/WebSpeechButton";

export default function ChatPage() {
  const navigate = useNavigate();

  // Zustand store
  const {
    messages,
    isTyping,
    input,
    selectedImages,
    imagePreviews,
    addMessage,
    updateMessageStatus,
    setIsTyping,
    setInput,
    addImage,
    removeImage,
    clearImages,
  } = useChatStore();

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 智能滚动到底部，确保内容不被输入框遮挡
  const scrollToBottom = (force = false) => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;

      if (!force) {
        // 检查用户是否接近底部（距离底部小于200px）
        const isNearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          200;

        // 如果用户在查看历史消息（不在底部附近），则不自动滚动
        if (!isNearBottom && messages.length > 1) {
          return;
        }
      }

      // 延迟滚动，确保DOM更新完成
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    }
  };

  // 页面初始化时滚动到顶部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    // 只有在有新消息添加或AI正在打字时才滚动到底部
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  useEffect(() => {
    // AI开始打字时强制滚动到底部
    if (isTyping) {
      scrollToBottom(true);
    }
  }, [isTyping]);

  // 生成唯一ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // 处理图片选择 - 使用新的压缩工具
  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      event.target.value = "";
      return;
    }

    // 检查文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片大小不能超过10MB");
      event.target.value = "";
      return;
    }

    // 检查图片数量限制
    if (selectedImages.length >= 5) {
      toast.error("最多只能选择5张图片");
      event.target.value = "";
      return;
    }

    try {
      toast.loading("正在处理图片...", { id: "image-processing" });

      // 使用新的压缩工具 - 优化压缩参数以减少文件大小
      const compressedDataUrl = await compressImage(file, {
        quality: 0.5,
        maxWidth: 600,
        maxHeight: 600,
      });

      addImage(file, compressedDataUrl);
      toast.success("图片添加成功", { id: "image-processing" });

      // 重置文件输入
      event.target.value = "";
    } catch (error) {
      console.error("图片处理失败:", error);
      toast.error("图片处理失败，请重试", { id: "image-processing" });
      event.target.value = "";
    }
  };

  // 删除指定的图片
  const handleRemoveImage = (index: number) => {
    removeImage(index);
    toast.success("图片已删除");
  };

  // 清除所有图片
  const handleClearAllImages = () => {
    clearImages();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("已清除所有图片");
  };

  // 处理发送消息

  const handleSend = async () => {
    if (!input.trim() && selectedImages.length === 0) return;

    // 防止重复发送
    if (imagePreviews.includes("loading")) {
      toast.error("图片正在处理中，请稍候...");
      return;
    }

    // 准备用户消息
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      text: input.trim() || (selectedImages.length > 0 ? "请分析这些图片" : ""),
      image: selectedImages.length > 0 ? imagePreviews[0] : undefined,
      timestamp: new Date(),
      status: "sending",
    };

    // 添加到store
    addMessage(userMessage);

    // 用户发送消息后强制滚动到底部
    setTimeout(() => {
      scrollToBottom(true);
    }, 50);

    // 显示AI正在打字
    setIsTyping(true);

    // 临时保存状态用于API调用
    const currentInput = input.trim();
    const currentImages = [...selectedImages];
    const currentImagePreviews = [...imagePreviews];

    // 立即清除输入状态
    setInput("");
    clearImages();

    try {
      // 动态获取 API URL
      const getApiUrl = () => {
        if (import.meta.env.DEV) {
          // 开发环境走同源相对路径，交给 Vite 代理到后端
          return "/api/ai";
        }
        return "/api/ai";
      };

      // 准备请求数据
      let requestBody: any = { prompt: currentInput || userMessage.text };

      // 如果有图片，发送第一张图片
      if (currentImages.length > 0 && currentImagePreviews.length > 0) {
        requestBody.imageUrl = currentImagePreviews[0];
      }

      // 调用 AI API
      const res = await fetch(getApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // 更新用户消息状态
      updateMessageStatus(userMessage.id, "sent");

      // 延迟AI回复 (2-3秒随机延迟)
      const thinkingTime = Math.random() * 1000 + 2000;
      setTimeout(() => {
        setIsTyping(false);
        addMessage({
          id: generateId(),
          role: "ai",
          text: data.reply,
          timestamp: new Date(),
          status: "sent",
        });
        // 确保AI回复后滚动到底部
        setTimeout(() => {
          scrollToBottom(true);
        }, 50);
        toast.success("AI回复完成");
      }, thinkingTime);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("AI API 调用失败:", error);
      }
      setIsTyping(false);

      // 更新用户消息状态为错误
      updateMessageStatus(userMessage.id, "error");

      // 添加错误消息
      addMessage({
        id: generateId(),
        role: "ai",
        text: "抱歉，AI 服务暂时不可用，请稍后再试。",
        timestamp: new Date(),
        status: "sent",
      });

      toast.error("AI服务暂时不可用");
    }
  };

  return (
    <PhotoProvider>
      <div
        className="flex flex-col h-screen overflow-hidden chat-container"
        style={{
          background:
            "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)",
          overscrollBehavior: "none",
          WebkitOverflowScrolling: "touch",
          overflowX: "hidden",
          maxWidth: "100vw",
          width: "100vw",
          height: "100vh",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            className: "text-sm",
          }}
        />
        {/* 顶部导航 - 简洁设计 */}
        <div
          className="relative z-10 px-4 py-3 flex items-center justify-between shadow-xl"
          style={{
            background: "linear-gradient(90deg, #d97706 0%, #f59e0b 100%)",
            borderBottom: "3px solid #92400e",
          }}
        >
          <div className="flex items-center gap-3 w-full min-w-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/profile")}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-amber-800 hover:bg-amber-50 transition-all duration-300 shadow-lg border-2 border-amber-500"
            >
              <span className="text-lg">←</span>
            </motion.button>

            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                  <span className="text-sm">🤖</span>
                </div>
                <div>
                  <h1
                    className="font-bold tracking-wide"
                    style={{
                      color: "white",
                      fontSize: "16px",
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    AI智能助手
                  </h1>
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: "white",
                        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                        fontSize: "12px",
                      }}
                    >
                      在线服务
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <span className="text-sm">👤</span>
              </div>
              <div
                className="text-xs mt-1 font-semibold"
                style={{
                  color: "white",
                  textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  fontSize: "11px",
                }}
              >
                用户
              </div>
            </motion.div>
          </div>
        </div>

        {/* 聊天内容 */}
        <div
          ref={chatContainerRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-6 space-y-4 smooth-scroll chat-content-area w-full"
          style={{
            paddingBottom:
              messages.length > 0
                ? imagePreviews.length > 0
                  ? "140px"
                  : "120px"
                : "20px",
            maxWidth: "100%",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center min-h-full px-4 py-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative mb-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-orange-300 to-red-400 rounded-full p-4 shadow-2xl border-4 border-white animate-bounce">
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🤖</span>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-xl font-bold mb-2 leading-tight"
                style={{
                  color: "#1f2937",
                  textShadow: "0 2px 4px rgba(255,255,255,0.8)",
                  fontSize: "20px",
                }}
              >
                欢迎使用AI智能助手
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="px-4 leading-relaxed mb-6 max-w-xs font-medium"
                style={{
                  color: "#374151",
                  textShadow: "0 1px 3px rgba(255,255,255,0.9)",
                  fontSize: "15px",
                  lineHeight: "1.6",
                }}
              >
                我可以为您提供专业的宠物护理建议，支持文字、图片和语音交流
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-wrap justify-center gap-3"
              >
                <div
                  className="px-4 py-2 rounded-full border-2 border-white shadow-lg hover:scale-105 transition-transform font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
                    color: "white",
                    fontSize: "14px",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  📷 图片分析
                </div>
                <div
                  className="px-4 py-2 rounded-full border-2 border-white shadow-lg hover:scale-105 transition-transform font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
                    color: "white",
                    fontSize: "14px",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  🎤 语音对话
                </div>
                <div
                  className="px-4 py-2 rounded-full border-2 border-white shadow-lg hover:scale-105 transition-transform font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    fontSize: "14px",
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                >
                  💬 智能问答
                </div>
              </motion.div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={clsx(
                    "flex items-start mb-4",
                    msg.role === "user"
                      ? "flex-row justify-end pr-2"
                      : "flex-row justify-start pl-2"
                  )}
                >
                  {/* AI头像 - 在左侧 */}
                  {msg.role === "ai" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center mr-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                        <img
                          src="/ai_avater.png"
                          alt="AI头像"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* 消息容器 */}
                  <div
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end mr-1" : "items-start"
                    }`}
                  >
                    {/* 消息气泡 */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className={`relative px-4 py-3 rounded-3xl max-w-[80%] min-w-[60px] shadow-lg ${
                        msg.role === "user"
                          ? "text-white font-semibold"
                          : "shadow-xl"
                      }`}
                      style={{
                        background:
                          msg.role === "user"
                            ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
                            : "linear-gradient(135deg, #fde047 0%, #fb923c 100%)",
                        border:
                          msg.role === "ai" ? "3px solid #ea580c" : "none",
                        borderRadius:
                          msg.role === "user"
                            ? "24px 24px 8px 24px"
                            : "24px 24px 24px 8px",
                      }}
                    >
                      {msg.image && (
                        <div className="mb-4 block">
                          <PhotoView src={msg.image}>
                            <img
                              src={msg.image}
                              alt="上传的图片"
                              className="w-full max-w-52 h-auto rounded-lg border cursor-pointer shadow-sm block hover:shadow-md transition-shadow duration-200"
                            />
                          </PhotoView>
                        </div>
                      )}

                      {msg.text && (
                        <p
                          className={`leading-relaxed block break-words font-semibold ${
                            msg.role === "user" ? "text-white" : ""
                          }`}
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                            fontSize: "15px",
                            lineHeight: "1.7",
                            color: msg.role === "ai" ? "#1f2937" : "white",
                            fontWeight: "600",
                            textShadow:
                              msg.role === "ai"
                                ? "0 1px 2px rgba(0,0,0,0.1)"
                                : "0 1px 2px rgba(0,0,0,0.3)",
                          }}
                        >
                          {msg.text}
                        </p>
                      )}
                    </motion.div>

                    {/* 时间戳 */}
                    <div
                      className={clsx(
                        "text-xs mt-2 px-1 font-medium",
                        msg.role === "user" ? "text-right" : "text-left"
                      )}
                      style={{
                        color: "#4b5563",
                        textShadow: "0 1px 2px rgba(255,255,255,0.8)",
                        fontSize: "12px",
                      }}
                    >
                      {formatMessageTime(msg.timestamp)}
                    </div>
                  </div>

                  {/* 用户头像 - 在右侧 */}
                  {msg.role === "user" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center ml-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white/30">
                        <span className="text-white font-bold text-sm">👤</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* AI正在打字动画 */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-start mb-4 flex-row justify-start pl-2"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center mr-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                    <img
                      src="/ai_avater.png"
                      alt="AI头像"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
                <div>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="px-4 py-3 shadow-xl min-w-[120px]"
                    style={{
                      background:
                        "linear-gradient(135deg, #fde047 0%, #fb923c 100%)",
                      border: "3px solid #ea580c",
                      borderRadius: "24px 24px 24px 8px",
                    }}
                  >
                    <div className="flex space-x-1 items-center">
                      <span
                        className="text-sm mr-3 font-semibold"
                        style={{
                          color: "#1f2937",
                          textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                          fontSize: "14px",
                        }}
                      >
                        AI正在思考
                      </span>
                      <motion.div
                        className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0,
                        }}
                      ></motion.div>
                      <motion.div
                        className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                      ></motion.div>
                      <motion.div
                        className="w-2 h-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: 0.4,
                        }}
                      ></motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 滚动锚点 */}
          <div ref={messagesEndRef} />
        </div>

        {/* 底部输入栏 - 简洁设计 */}
        <div
          className="fixed left-0 right-0 mobile-input-container z-50 px-4 py-3 w-full overflow-hidden shadow-2xl"
          style={{
            bottom: "0",
            background: "linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)",
            borderTop: "4px solid #92400e",
            overscrollBehavior: "none",
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
            paddingTop: "0.75rem",
            maxWidth: "100vw",
          }}
        >
          <div className="relative z-10">
            {/* 多图片预览区域 */}
            {imagePreviews.length > 0 && (
              <div className="mb-3 max-h-28 overflow-y-auto bg-white rounded-xl p-3 border-2 border-orange-300 shadow-lg">
                <div className="flex flex-wrap gap-2 mb-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative inline-block group">
                      {preview === "loading" ? (
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center animate-pulse">
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                            处理中
                          </div>
                        </div>
                      ) : (
                        <>
                          <PhotoView src={preview}>
                            <img
                              src={preview}
                              alt={`预览图片 ${index + 1}`}
                              className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-gray-300 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                            />
                          </PhotoView>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-xs font-bold hover:from-red-600 hover:to-pink-600 shadow-lg transition-colors"
                            title={`删除图片 ${index + 1}`}
                          >
                            ×
                          </motion.button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                {/* 清除所有图片按钮 */}
                {imagePreviews.length > 1 && (
                  <button
                    onClick={handleClearAllImages}
                    className="text-sm text-gray-600 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <span>🗑️</span> 清除所有图片
                  </button>
                )}
              </div>
            )}

            {/* 输入框和按钮的嵌入式布局 */}
            <div className="w-full">
              {/* 隐藏的文件输入 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
                className="hidden"
                id="camera-input"
              />

              {/* 输入框容器 - 简洁设计 */}
              <div className="relative w-full bg-white rounded-2xl shadow-lg border-2 border-orange-300 overflow-hidden">
                <div className="flex items-end">
                  {/* 文本输入区域 */}
                  <div className="flex-1 min-w-0">
                    <TextareaAutosize
                      ref={textareaRef}
                      className="w-full bg-transparent border-0
                                 py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-0 focus:border-0 placeholder-gray-500 resize-none shadow-none
                                 max-h-16 leading-relaxed font-medium text-gray-800"
                      style={{ outline: "none", boxShadow: "none" }}
                      placeholder={
                        selectedImages.length > 0 &&
                        !imagePreviews.includes("loading")
                          ? "描述一下这些图片..."
                          : "输入消息或点击🎤开始语音对话..."
                      }
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      disabled={imagePreviews.includes("loading")}
                      minRows={1}
                      maxRows={4}
                    />
                  </div>

                  {/* 右侧按钮组 - 现代化设计 */}
                  <div className="flex items-center gap-2 pr-3 pb-2">
                    {/* 相册选择按钮 */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg animate-pulse"
                      style={{
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                        border: "2px solid white",
                      }}
                      title="从相册选择"
                    >
                      <span className="text-sm">🖼️</span>
                    </motion.button>

                    {/* 相机拍照按钮 (移动端) */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        document.getElementById("camera-input")?.click()
                      }
                      className="text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 lg:hidden shadow-lg animate-pulse"
                      style={{
                        background:
                          "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        border: "2px solid white",
                      }}
                      title="拍照"
                    >
                      <span className="text-sm">📷</span>
                    </motion.button>

                    {/* 语音识别按钮 */}
                    <WebSpeechButton
                      onSpeechResult={(text) => {
                        console.log("收到语音识别结果:", text);
                        if (text.trim()) {
                          // 直接创建用户消息并发送给AI
                          const userMessage = {
                            id: generateId(),
                            role: "user" as const,
                            text: text.trim(),
                            timestamp: new Date(),
                            status: "sending" as const,
                          };

                          // 添加用户消息到聊天记录
                          addMessage(userMessage);

                          // 强制滚动到底部
                          setTimeout(() => {
                            scrollToBottom(true);
                          }, 50);

                          // 显示AI正在打字
                          setIsTyping(true);

                          // 调用AI API
                          const callAI = async () => {
                            try {
                              const getApiUrl = () => {
                                if (import.meta.env.DEV) {
                                  return "/api/ai";
                                }
                                return "/api/ai";
                              };

                              const res = await fetch(getApiUrl(), {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ prompt: text.trim() }),
                              });

                              if (!res.ok) {
                                throw new Error(
                                  `HTTP error! status: ${res.status}`
                                );
                              }

                              const data = await res.json();

                              // 更新用户消息状态
                              updateMessageStatus(userMessage.id, "sent");

                              // 延迟AI回复
                              const thinkingTime = Math.random() * 1000 + 2000;
                              setTimeout(() => {
                                setIsTyping(false);
                                addMessage({
                                  id: generateId(),
                                  role: "ai" as const,
                                  text: data.reply,
                                  timestamp: new Date(),
                                  status: "sent" as const,
                                });
                                // AI回复后滚动到底部
                                setTimeout(() => {
                                  scrollToBottom(true);
                                }, 50);
                              }, thinkingTime);
                            } catch (error) {
                              console.error("AI API 调用失败:", error);
                              setIsTyping(false);
                              updateMessageStatus(userMessage.id, "error");

                              addMessage({
                                id: generateId(),
                                role: "ai" as const,
                                text: "抱歉，AI 服务暂时不可用，请稍后再试。",
                                timestamp: new Date(),
                                status: "sent" as const,
                              });
                            }
                          };

                          callAI();
                        }
                      }}
                      disabled={imagePreviews.includes("loading") || isTyping}
                      size="md"
                      placeholder="点击说话"
                    />

                    {/* 发送按钮 - 简洁设计 */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-8 h-8 rounded-full font-bold text-sm transition-all duration-200 flex items-center justify-center shadow-md ${
                        (input.trim() || selectedImages.length > 0) &&
                        !imagePreviews.includes("loading")
                          ? "animate-pulse"
                          : ""
                      }`}
                      style={{
                        background:
                          (input.trim() || selectedImages.length > 0) &&
                          !imagePreviews.includes("loading")
                            ? "linear-gradient(135deg, #ec4899 0%, #dc2626 100%)"
                            : "#d1d5db",
                        color:
                          (input.trim() || selectedImages.length > 0) &&
                          !imagePreviews.includes("loading")
                            ? "white"
                            : "#6b7280",
                        border:
                          (input.trim() || selectedImages.length > 0) &&
                          !imagePreviews.includes("loading")
                            ? "2px solid white"
                            : "none",
                        cursor:
                          (input.trim() || selectedImages.length > 0) &&
                          !imagePreviews.includes("loading")
                            ? "pointer"
                            : "not-allowed",
                      }}
                      onClick={handleSend}
                      disabled={
                        (!input.trim() && selectedImages.length === 0) ||
                        imagePreviews.includes("loading")
                      }
                    >
                      <span>→</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PhotoProvider>
  );
}
