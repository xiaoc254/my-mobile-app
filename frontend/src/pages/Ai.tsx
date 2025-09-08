import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  image?: string;
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 格式化时间显示
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) {
      // 小于1分钟
      return "刚刚";
    } else if (diff < 3600000) {
      // 小于1小时
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) {
      // 小于1天
      return date.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // 生成唯一ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // 处理图片选择 - 支持多张图片
  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith("image/")) {
        alert("请选择图片文件");
        event.target.value = ""; // 清除无效选择
        return;
      }

      // 检查文件大小 (10MB，压缩前允许更大)
      if (file.size > 10 * 1024 * 1024) {
        alert("图片大小不能超过10MB");
        event.target.value = ""; // 清除无效选择
        return;
      }

      // 检查图片数量限制
      if (selectedImages.length >= 5) {
        alert("最多只能选择5张图片");
        event.target.value = "";
        return;
      }

      try {
        // 显示加载状态
        setImagePreviews((prev) => [...prev, "loading"]);

        // 压缩图片
        const compressedDataUrl = await compressImage(file);

        // 添加到图片数组
        setSelectedImages((prev) => [...prev, file]);
        setImagePreviews((prev) => {
          const newPreviews = [...prev];
          const loadingIndex = newPreviews.lastIndexOf("loading");
          if (loadingIndex !== -1) {
            newPreviews[loadingIndex] = compressedDataUrl;
          }
          return newPreviews;
        });

        // 重置文件输入，允许重新选择同一文件
        event.target.value = "";
      } catch (error) {
        console.error("图片处理失败:", error);
        alert("图片处理失败，请重试");
        // 移除加载状态
        setImagePreviews((prev) => {
          const newPreviews = [...prev];
          const loadingIndex = newPreviews.lastIndexOf("loading");
          if (loadingIndex !== -1) {
            newPreviews.splice(loadingIndex, 1);
          }
          return newPreviews;
        });
        event.target.value = "";
      }
    }
  };

  // 删除指定的图片
  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // 清除所有图片
  const handleClearAllImages = () => {
    setSelectedImages([]);
    setImagePreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 压缩图片 - 针对移动端大幅优化
  const compressImage = (
    file: File,
    maxWidth = 400, // 减小到400px
    quality = 0.6 // 降低质量到60%
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // 计算压缩后的尺寸，确保不超过400px
        let { width, height } = img;

        // 如果图片太大，按比例缩放
        if (width > maxWidth || height > maxWidth) {
          const ratio = Math.min(maxWidth / width, maxWidth / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // 绘制压缩后的图片
        ctx?.drawImage(img, 0, 0, width, height);

        // 转换为base64，使用更低的质量
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

        // 检查压缩后大小，如果还是太大就进一步压缩
        const sizeInKB = (compressedDataUrl.length * 0.75) / 1024;
        console.log(`压缩后图片大小: ${sizeInKB.toFixed(2)}KB`);

        if (sizeInKB > 200) {
          // 如果超过200KB，进一步压缩
          const lowerQuality = Math.max(0.3, quality - 0.2);
          const furtherCompressed = canvas.toDataURL(
            "image/jpeg",
            lowerQuality
          );
          resolve(furtherCompressed);
        } else {
          resolve(compressedDataUrl);
        }
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleSend = async () => {
    if (!input && selectedImages.length === 0) return;

    // 防止重复发送
    if (imagePreviews.includes("loading")) {
      alert("图片正在处理中，请稍候...");
      return;
    }

    // 准备用户消息 - 支持多张图片
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      text: input || (selectedImages.length > 0 ? "请分析这些图片" : ""),
      image: selectedImages.length > 0 ? imagePreviews[0] : undefined, // 显示第一张图片
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);

    // 显示AI正在打字
    setIsTyping(true);

    // 立即清除输入状态，确保能够继续输入
    setInput("");

    // 临时保存图片状态，用于API调用
    const currentImages = [...selectedImages];
    const currentImagePreviews = [...imagePreviews];

    // 立即清除图片选择，让用户可以继续操作
    setSelectedImages([]);
    setImagePreviews([]);

    try {
      // 动态获取 API URL
      const getApiUrl = () => {
        if (import.meta.env.DEV) {
          const hostname = window.location.hostname;
          return `http://${hostname}:3000/api/ai`;
        }
        return "/api/ai";
      };

      // 准备请求数据 - 支持多张图片
      let requestBody: any = { prompt: userMessage.text };

      // 如果有图片，发送所有图片
      if (currentImages.length > 0 && currentImagePreviews.length > 0) {
        // 可以发送第一张图片，或者将多张图片合并处理
        requestBody.imageUrl = currentImagePreviews[0];
        // 如果后端支持多图片，可以这样发送：
        // requestBody.images = currentImagePreviews.filter(preview => preview !== "loading");
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
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "sent" } : msg
        )
      );

      // 延迟一下让AI回复更自然 (2-3秒随机延迟)
      const thinkingTime = Math.random() * 1000 + 2000; // 2-3秒
      setTimeout(() => {
        setIsTyping(false);
        setMessages((m) => [
          ...m,
          {
            id: generateId(),
            role: "ai",
            text: data.reply,
            timestamp: new Date(),
            status: "sent",
          },
        ]);
        // 确保AI回复后滚动到底部
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }, thinkingTime);
    } catch (error) {
      console.error("AI API 调用失败:", error);
      setIsTyping(false);

      // 更新用户消息状态为错误
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "error" } : msg
        )
      );

      setMessages((m) => [
        ...m,
        {
          id: generateId(),
          role: "ai",
          text: "抱歉，AI 服务暂时不可用，请稍后再试。",
          timestamp: new Date(),
          status: "sent",
        },
      ]);
      // 确保错误消息也能被看到
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden chat-container">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-semibold text-gray-900 text-base">
              AI宠物专家
            </h1>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              在线服务
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2"></div>
      </div>

      {/* 聊天内容 */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-3 smooth-scroll"
        style={{
          paddingBottom: imagePreviews.length > 0 ? "220px" : "160px",
        }} /* 为TabBar+输入框预留空间，确保AI回复可见 */
      >
        {messages.length === 0 ? (
          <div className="flex flex-col h-full items-center justify-center text-center"></div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              } items-end gap-2`}
            >
              {/* AI头像 */}
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold mb-1">
                  🤖
                </div>
              )}

              {/* 消息容器 */}
              <div
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* 消息气泡 */}
                <div
                  className={`relative p-3 rounded-2xl max-w-[75%] sm:max-w-sm md:max-w-md shadow-lg chat-bubble-tail slide-in-${
                    msg.role === "user" ? "right" : "left"
                  } ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-green-400 to-green-500 text-white rounded-br-sm chat-bubble-user"
                      : "bg-gradient-to-r from-gray-50 to-white border border-gray-200 text-gray-800 rounded-bl-sm chat-bubble-ai"
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
                    <div className="mb-3 block">
                      <img
                        src={msg.image}
                        alt="上传的图片"
                        className="w-full max-w-48 h-auto rounded-lg border cursor-pointer shadow-sm block"
                        onClick={() => {
                          // 移动端点击图片放大预览
                          const modal = document.createElement("div");
                          modal.className =
                            "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
                          modal.innerHTML = `
                          <div class="relative max-w-full max-h-full p-4">
                            <img src="${msg.image}" class="max-w-full max-h-full rounded-lg" />
                            <button class="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center text-black font-bold">×</button>
                          </div>
                        `;
                          modal.onclick = () =>
                            document.body.removeChild(modal);
                          document.body.appendChild(modal);
                        }}
                      />
                    </div>
                  )}

                  {msg.text && (
                    <p
                      className={`text-sm md:text-base leading-relaxed block ${
                        msg.role === "user" ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {msg.text}
                    </p>
                  )}
                </div>

                {/* 时间戳 */}
                <div
                  className={`text-xs text-gray-500 mt-1 px-1 ${
                    msg.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </div>
              </div>

              {/* 用户头像 */}
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold mb-1">
                  👤
                </div>
              )}
            </div>
          ))
        )}

        {/* AI正在打字动画 */}
        {isTyping && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold mb-1">
              🤖
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl rounded-bl-sm p-3 shadow-lg chat-bubble-tail chat-bubble-ai slide-in-left">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* 滚动锚点 */}
        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入栏 - 固定在TabBar上方，铺满屏幕 */}
      <div
        className="fixed left-0 right-0 mobile-input-container bg-white border-t border-gray-200 z-50
                      px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4
                      shadow-lg backdrop-blur-sm w-full"
        style={{ bottom: "50px" }} /* TabBar高度约50px */
      >
        {/* 多图片预览区域 */}
        {imagePreviews.length > 0 && (
          <div className="mb-3 max-h-32 overflow-y-auto">
            <div className="flex flex-wrap gap-2 mb-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative inline-block">
                  {preview === "loading" ? (
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-lg border flex items-center justify-center">
                      <div className="text-xs text-gray-500">处理中...</div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={preview}
                        alt={`预览图片 ${index + 1}`}
                        className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border shadow-sm cursor-pointer"
                        onClick={() => {
                          // 点击预览图片放大
                          const modal = document.createElement("div");
                          modal.className =
                            "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
                          modal.innerHTML = `
                            <div class="relative max-w-full max-h-full p-4">
                              <img src="${preview}" class="max-w-full max-h-full rounded-lg" />
                              <button class="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center text-black font-bold">×</button>
                            </div>
                          `;
                          modal.onclick = () =>
                            document.body.removeChild(modal);
                          document.body.appendChild(modal);
                        }}
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs hover:bg-red-600 active:bg-red-700 shadow-lg"
                        title={`删除图片 ${index + 1}`}
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            {/* 清除所有图片按钮 */}
            {imagePreviews.length > 1 && (
              <button
                onClick={handleClearAllImages}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors"
              >
                清除所有图片
              </button>
            )}
          </div>
        )}

        {/* 全屏宽度的输入框布局 - 所有按钮都在输入框内 */}
        <div className="w-full relative bg-gray-50 rounded-xl border border-gray-200 min-w-0">
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
          {/* 文本输入框 - 右侧留出按钮位置 */}
          <input
            className="w-full bg-transparent border-none py-2.5 sm:py-3 pl-3 sm:pl-4 pr-20 sm:pr-24 md:pr-28 text-sm sm:text-base
                       focus:outline-none placeholder-gray-500 min-h-[40px] sm:min-h-[44px] rounded-xl"
            placeholder={
              selectedImages.length > 0 && !imagePreviews.includes("loading")
                ? "描述图片内容（可选）..."
                : "请输入内容..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={imagePreviews.includes("loading")}
          />

          {/* 按钮组 - 全部在输入框右内侧 */}
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {/* 相册选择按钮 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-600
                         w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center
                         transition-colors touch-manipulation"
              title="从相册选择"
            >
              <span className="text-sm sm:text-base">📁</span>
            </button>

            {/* 相机拍照按钮 (移动端) */}
            <button
              onClick={() => document.getElementById("camera-input")?.click()}
              className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-600
                         w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center
                         transition-colors lg:hidden touch-manipulation"
              title="拍照"
            >
              <span className="text-sm sm:text-base">📷</span>
            </button>

            {/* 发送按钮 */}
            <button
              className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full text-white font-medium
                          transition-all touch-manipulation flex items-center justify-center ${
                            (input.trim() || selectedImages.length > 0) &&
                            !imagePreviews.includes("loading")
                              ? "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 active:scale-95 shadow-md"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
              onClick={handleSend}
              disabled={
                (!input.trim() && selectedImages.length === 0) ||
                imagePreviews.includes("loading")
              }
            >
              <span className="text-xs sm:text-sm">↗</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
