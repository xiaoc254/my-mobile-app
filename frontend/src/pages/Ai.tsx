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
      console.error("AI API 调用失败:", error);
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
        className="flex flex-col h-screen overflow-hidden chat-container bg-gray-50"
        style={{
          overscrollBehavior: "none",
          WebkitOverflowScrolling: "touch",
          overflowX: "hidden",
          maxWidth: "100vw",
          width: "100%",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
        }}
      >
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            className: "text-sm",
          }}
        />
        {/* 顶部导航 - 移动端优化 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 px-1 py-1 flex items-center justify-between h-[40px] z-10 shadow-md w-full overflow-hidden">
          <div className="flex items-center gap-1 w-full min-w-0">
            <button
              onClick={() => navigate("/")}
              className="text-gray-700 text-sm font-medium hover:text-blue-600 transition-all duration-200 hover:scale-110"
            >
              ←
            </button>
            <div className="flex-1 text-center">
              <h1 className="font-bold text-gray-900 text-xs tracking-wide">
                🐶 AI助手
              </h1>
              <div className="text-xs text-blue-600 font-medium -mt-0.5">
                在线
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                <span className="text-xs">🐶</span>
              </div>
              <div className="text-xs text-gray-700 mt-0.5 font-medium">
                用户
              </div>
            </div>
          </div>
        </div>

        {/* 聊天内容 */}
        <div
          ref={chatContainerRef}
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-2 smooth-scroll bg-gradient-to-b from-gray-50 to-blue-50 chat-content-area w-full"
          style={{
            paddingBottom:
              messages.length > 0
                ? imagePreviews.length > 0
                  ? "140px"
                  : "120px"
                : "20px",
            maxWidth: "100%",
          }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center min-h-full px-1 py-2">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-3 mb-2 shadow-lg">
                <div className="text-lg">🐕</div>
              </div>
              <h2 className="text-sm font-bold text-gray-800 mb-1 leading-tight">
                欢迎使用AI助手
              </h2>
              <p className="text-gray-600 text-xs px-1 leading-relaxed mb-2">
                请描述您的问题，我将为您提供帮助
              </p>
              <div className="flex flex-wrap justify-center gap-1 text-xs text-gray-500">
                <span className="bg-blue-50 px-1 py-0.5 rounded-full text-xs">
                  📷 图片
                </span>
                <span className="bg-purple-50 px-1 py-0.5 rounded-full text-xs">
                  💬 问答
                </span>
                <span className="bg-green-50 px-1 py-0.5 rounded-full text-xs">
                  🐈 建议
                </span>
              </div>
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
                    <div className="flex items-center mr-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs flex-shrink-0 shadow-lg overflow-hidden">
                        <img
                          src="/ai_avater.png"
                          alt="AI头像"
                          style={{
                            width: 18,
                            height: 18,
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 消息容器 */}
                  <div
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end mr-1" : "items-start"
                    }`}
                  >
                    {/* 消息气泡 */}
                    <div
                      className={`relative px-3 py-2 rounded-2xl max-w-[75%] min-w-[60px] shadow-md ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md bubble-user"
                          : "bg-white text-gray-800 rounded-bl-md bubble-ai border border-gray-200"
                      }`}
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
                          className={`text-sm leading-relaxed block break-words ${
                            msg.role === "user"
                              ? "text-white font-medium"
                              : "text-gray-800"
                          }`}
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                            fontSize: "14px",
                            lineHeight: "1.5",
                          }}
                        >
                          {msg.text}
                        </p>
                      )}
                    </div>

                    {/* 时间戳 */}
                    <div
                      className={clsx(
                        "text-xs mt-1 px-1 text-gray-500",
                        msg.role === "user" ? "text-right" : "text-left"
                      )}
                    >
                      {formatMessageTime(msg.timestamp)}
                    </div>
                  </div>

                  {/* 用户头像 - 在右侧 */}
                  {msg.role === "user" && (
                    <div className="flex items-center ml-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-xs flex-shrink-0 shadow-lg overflow-hidden">
                        <span className="text-white font-bold text-sm">🐶</span>
                      </div>
                    </div>
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
                className="flex items-start mb-1 flex-row justify-start pl-0.5"
              >
                <div className="flex items-center mr-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs flex-shrink-0 shadow-lg overflow-hidden animate-pulse">
                    <img
                      src="/ai_avater.png"
                      alt="AI头像"
                      style={{
                        width: 18,
                        height: 18,
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md px-3 py-2 shadow-md border border-gray-200 bubble-ai min-w-[80px]">
                    <div className="flex space-x-1 items-center">
                      <span
                        className="text-gray-700 text-sm mr-2"
                        style={{ fontSize: "13px" }}
                      >
                        正在思考中...
                      </span>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.15s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.3s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 滚动锚点 */}
          <div ref={messagesEndRef} />
        </div>

        {/* 底部输入栏 - 简洁设计 */}
        <div
          className="fixed left-0 right-0 mobile-input-container bg-gradient-to-t from-white to-gray-50 z-50
                      px-2 py-1 w-full overflow-hidden shadow-lg"
          style={{
            bottom: "0",
            overscrollBehavior: "none",
            paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))",
            paddingTop: "0.25rem",
            maxWidth: "100vw",
          }}
        >
          <div className="relative z-10">
            {/* 多图片预览区域 */}
            {imagePreviews.length > 0 && (
              <div className="mb-2 max-h-28 overflow-y-auto bg-gray-50 rounded-lg p-2">
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

              {/* 输入框容器 - 美化对话气泡样式 */}
              <div
                className="relative w-full bg-white rounded-3xl shadow-xl border-2 border-blue-100 overflow-hidden"
                style={{ border: "none" }}
              >
                <div className="flex items-end">
                  {/* 文本输入区域 */}
                  <div className="flex-1 min-w-0">
                    <TextareaAutosize
                      ref={textareaRef}
                      className="w-full bg-transparent border-0
                                 py-1 pl-2 pr-12 text-xs focus:outline-none focus:ring-0 focus:border-0 placeholder-gray-400 resize-none shadow-none
                                 max-h-12 leading-relaxed font-medium"
                      style={{ outline: "none", boxShadow: "none" }}
                      placeholder={
                        selectedImages.length > 0 &&
                        !imagePreviews.includes("loading")
                          ? "描述一下这些图片..."
                          : "请输入您的问题..."
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

                  {/* 右侧按钮组 - 嵌入在输入框内 */}
                  <div className="flex items-center gap-0.5 pr-1 pb-0.5">
                    {/* 相册选择按钮 */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-gray-600
                                 w-5 h-5 rounded-full flex items-center justify-center
                                 transition-all duration-200 shadow-md border border-blue-200"
                      title="从相册选择"
                    >
                      <span className="text-xs">🖼️</span>
                    </motion.button>

                    {/* 相机拍照按钮 (移动端) */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        document.getElementById("camera-input")?.click()
                      }
                      className="bg-gradient-to-br from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 text-gray-600
                                 w-5 h-5 rounded-full flex items-center justify-center
                                 transition-all duration-200 lg:hidden shadow-md border border-green-200"
                      title="拍照"
                    >
                      <span className="text-xs">📷</span>
                    </motion.button>

                    {/* 发送按钮 - 嵌入在输入框内 */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={clsx(
                        "w-5 h-5 rounded-full font-bold text-xs transition-all duration-200 flex items-center justify-center shadow-lg",
                        (input.trim() || selectedImages.length > 0) &&
                          !imagePreviews.includes("loading")
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-gray-300 cursor-not-allowed text-gray-500"
                      )}
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
