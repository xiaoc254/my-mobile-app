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

      // 使用新的压缩工具
      const compressedDataUrl = await compressImage(file, {
        quality: 0.7,
        maxWidth: 800,
        maxHeight: 800,
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
          const hostname = window.location.hostname;
          return `http://${hostname}:3000/api/ai`;
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
        }}
      >
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            className: "text-sm",
          }}
        />
        {/* 顶部导航 - 专业设计 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between h-[60px] z-10 shadow-sm w-full overflow-hidden">
          <div className="flex items-center gap-3 w-full min-w-0">
            <button
              onClick={() => navigate("/")}
              className="text-gray-700 text-xl font-medium hover:text-gray-900 transition-colors"
            >
              ←
            </button>
            <div className="flex-1 text-center">
              <h1 className="font-semibold text-gray-900 text-lg">
                宠物AI分析
              </h1>
              <div className="text-xs text-gray-500 -mt-1">172.20.10.2</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-sm">
                <img
                  src="https://via.placeholder.com/32/e6e6e6/999999?text=🐶"
                  alt="用户头像"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">用户</div>
            </div>
          </div>
        </div>

        {/* 聊天内容 */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-4 smooth-scroll bg-gray-50 chat-content-area w-full"
          style={{
            paddingBottom:
              messages.length > 0
                ? imagePreviews.length > 0
                  ? "200px"
                  : "160px"
                : "20px",
            maxWidth: "100%",
          }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center min-h-full">
              <div className="text-6xl mb-4">🐕</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                欢迎使用宠物AI分析
              </h2>
              <p className="text-gray-600 text-base px-8 leading-relaxed">
                请描述您的宠物情况，我将为您提供专业分析
              </p>
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
                    "flex items-start mb-6",
                    msg.role === "user"
                      ? "flex-row justify-end pr-4"
                      : "flex-row justify-start pl-4"
                  )}
                >
                  {/* AI头像 - 在左侧 */}
                  {msg.role === "ai" && (
                    <div className="flex flex-col items-center mr-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg flex-shrink-0 shadow-md overflow-hidden">
                        <img
                          src="https://via.placeholder.com/48/cccccc/666666?text=AI"
                          alt="AI头像"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        宠物训练师
                      </div>
                    </div>
                  )}

                  {/* 消息容器 */}
                  <div
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end mr-3" : "items-start"
                    }`}
                  >
                    {/* 消息气泡 */}
                    <div
                      className={`relative px-4 py-3 rounded-2xl max-w-[85%] min-w-[120px] shadow-md ${
                        msg.role === "user"
                          ? "bg-yellow-400 text-black rounded-tr-md bubble-user"
                          : "bg-white text-gray-800 rounded-tl-md bubble-ai border border-gray-200"
                      }`}
                    >
                      {/* 消息状态指示器 */}
                      {msg.role === "user" && (
                        <div className="absolute -bottom-1 -right-1">
                          {msg.status === "sending" && (
                            <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
                          )}
                          {msg.status === "sent" && (
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          )}
                          {msg.status === "error" && (
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      )}

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
                          className={`text-base leading-relaxed block break-words ${
                            msg.role === "user"
                              ? "text-black font-medium"
                              : "text-gray-800"
                          }`}
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {msg.text}
                        </p>
                      )}
                    </div>

                    {/* 时间戳 */}
                    <div
                      className={clsx(
                        "text-xs mt-2 px-1 text-gray-500",
                        msg.role === "user" ? "text-right" : "text-left"
                      )}
                    >
                      {formatMessageTime(msg.timestamp)}
                    </div>
                  </div>

                  {/* 用户头像 - 在右侧 */}
                  {msg.role === "user" && (
                    <div className="flex flex-col items-center ml-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg flex-shrink-0 shadow-md overflow-hidden">
                        <img
                          src="https://via.placeholder.com/48/e6e6e6/999999?text=🐶"
                          alt="用户头像"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1">用户</div>
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
                className="flex items-start mb-6 flex-row justify-start pl-4"
              >
                <div className="flex flex-col items-center mr-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg flex-shrink-0 shadow-md overflow-hidden animate-pulse">
                    <img
                      src="https://via.placeholder.com/48/cccccc/666666?text=AI"
                      alt="AI头像"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">宠物训练师</div>
                </div>
                <div>
                  <div className="bg-white text-gray-800 rounded-2xl rounded-tl-md px-4 py-3 shadow-md border border-gray-200 bubble-ai min-w-[120px]">
                    <div className="flex space-x-2 items-center">
                      <span className="text-gray-700 text-sm mr-2">
                        正在思考
                      </span>
                      <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.15s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
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
          className="fixed left-0 right-0 mobile-input-container bg-white border-t border-gray-200 z-50
                      px-4 py-2 shadow-sm w-full overflow-hidden"
          style={{
            bottom: "0",
            overscrollBehavior: "none",
            paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))",
            paddingTop: "0.5rem",
            maxWidth: "100vw",
          }}
        >
          <div className="relative z-10">
            {/* 多图片预览区域 */}
            {imagePreviews.length > 0 && (
              <div className="mb-4 max-h-44 overflow-y-auto bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex flex-wrap gap-3 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative inline-block group">
                      {preview === "loading" ? (
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center animate-pulse">
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
                              className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border border-gray-300 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
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

            {/* 输入框和按钮的现代化布局 */}
            <div className="flex items-end gap-3 w-full max-w-full min-w-0">
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

              {/* 输入框容器 - 按钮在右侧 */}
              <div className="flex-1 min-w-0 max-w-full bg-gray-100 rounded-2xl border border-gray-300 focus-within:border-blue-400 transition-colors duration-200 relative overflow-hidden">
                <div className="flex items-end">
                  {/* 文本输入区域 */}
                  <div className="flex-1 min-w-0 max-w-full">
                    <TextareaAutosize
                      ref={textareaRef}
                      className="w-full bg-transparent border-none py-3 pl-4 pr-20 text-base
                                 focus:outline-none placeholder-gray-500 rounded-2xl resize-none
                                 max-h-32 leading-relaxed"
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

                  {/* 右侧按钮组 */}
                  <div className="flex items-center gap-1 pr-2 pb-2">
                    {/* 相册选择按钮 */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700
                                 w-8 h-8 rounded-full flex items-center justify-center
                                 transition-all duration-200"
                      title="从相册选择"
                    >
                      <span className="text-sm">🖼️</span>
                    </motion.button>

                    {/* 相机拍照按钮 (移动端) */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        document.getElementById("camera-input")?.click()
                      }
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700
                                 w-8 h-8 rounded-full flex items-center justify-center
                                 transition-all duration-200 lg:hidden"
                      title="拍照"
                    >
                      <span className="text-sm">📷</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* 发送按钮 - 独立在外 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={clsx(
                  "w-11 h-11 rounded-full font-bold text-base transition-all duration-200 flex items-center justify-center flex-shrink-0",
                  (input.trim() || selectedImages.length > 0) &&
                    !imagePreviews.includes("loading")
                    ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
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
    </PhotoProvider>
  );
}
