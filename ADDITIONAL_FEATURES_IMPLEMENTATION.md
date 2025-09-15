# 🔍 智能宠物管理应用 - 功能实现详解（续）

## 🌐 实时通信系统

### 1. WebSocket 集成实现

#### Socket.io 客户端配置

```typescript
// Socket 连接管理
class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.connect();
  }

  // 建立连接
  private connect() {
    try {
      this.socket = io(this.getSocketUrl(), {
        transports: ["websocket", "polling"],
        timeout: 20000,
        auth: {
          token: localStorage.getItem("token"),
        },
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error("Socket 连接失败:", error);
      this.handleReconnect();
    }
  }

  // 获取 Socket URL
  private getSocketUrl(): string {
    if (import.meta.env.DEV) {
      return "http://localhost:3000";
    }
    return window.location.origin;
  }

  // 设置事件处理器
  private setupEventHandlers() {
    if (!this.socket) return;

    // 连接成功
    this.socket.on("connect", () => {
      console.log("Socket 连接成功:", this.socket?.id);
      this.reconnectAttempts = 0;

      // 触发连接成功事件
      this.emit("connected", { socketId: this.socket?.id });
    });

    // 连接断开
    this.socket.on("disconnect", (reason) => {
      console.log("Socket 连接断开:", reason);

      if (reason === "io server disconnect") {
        // 服务器主动断开，需要重新连接
        this.socket?.connect();
      }

      this.emit("disconnected", { reason });
    });

    // 连接错误
    this.socket.on("connect_error", (error) => {
      console.error("Socket 连接错误:", error);
      this.handleReconnect();
    });

    // 认证错误
    this.socket.on("auth_error", (error) => {
      console.error("Socket 认证错误:", error);

      // 清除过期 token 并重新登录
      localStorage.removeItem("token");
      window.location.href = "/login";
    });

    // 新消息
    this.socket.on("new_message", (message) => {
      this.emit("new_message", message);
    });

    // 用户状态更新
    this.socket.on("user_status_update", (data) => {
      this.emit("user_status_update", data);
    });

    // 任务提醒
    this.socket.on("task_reminder", (reminder) => {
      this.emit("task_reminder", reminder);
    });

    // 系统通知
    this.socket.on("system_notification", (notification) => {
      this.emit("system_notification", notification);
    });
  }

  // 处理重连
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;

      setTimeout(() => {
        console.log(
          `尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        );
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error("Socket 重连失败，已达到最大重试次数");
      this.emit("connection_failed", {
        maxAttempts: this.maxReconnectAttempts,
      });
    }
  }

  // 发送消息
  public send(event: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error("Socket 未连接"));
        return;
      }

      this.socket.emit(event, data, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.message || "Socket 请求失败"));
        }
      });
    });
  }

  // 监听事件
  public on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  // 移除事件监听
  public off(event: string, callback?: Function) {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  // 触发事件
  private emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`事件处理器错误 (${event}):`, error);
        }
      });
    }
  }

  // 获取连接状态
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // 断开连接
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }
}

// 全局 Socket 管理器实例
export const socketManager = new SocketManager();
```

### 2. 实时聊天系统

#### 聊天组件实现

```typescript
// 聊天消息接口
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId?: string;
  roomId?: string;
  content: string;
  type: "text" | "image" | "file" | "system";
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read" | "failed";
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    imageWidth?: number;
    imageHeight?: number;
  };
}

// 聊天室组件
const ChatRoom: React.FC<{
  roomId: string;
  currentUserId: string;
}> = ({ roomId, currentUserId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 加载历史消息
    loadHistoryMessages();

    // 监听新消息
    socketManager.on("new_message", handleNewMessage);

    // 监听消息状态更新
    socketManager.on("message_status_update", handleMessageStatusUpdate);

    // 监听用户输入状态
    socketManager.on("user_typing", handleUserTyping);

    // 监听用户停止输入
    socketManager.on("user_stop_typing", handleUserStopTyping);

    return () => {
      socketManager.off("new_message", handleNewMessage);
      socketManager.off("message_status_update", handleMessageStatusUpdate);
      socketManager.off("user_typing", handleUserTyping);
      socketManager.off("user_stop_typing", handleUserStopTyping);
    };
  }, [roomId]);

  // 滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 加载历史消息
  const loadHistoryMessages = async (before?: string) => {
    try {
      setIsLoading(true);

      const response = await api.get(`/chat/rooms/${roomId}/messages`, {
        params: {
          limit: 20,
          before,
        },
      });

      if (response.data.success) {
        const historyMessages = response.data.data;

        if (before) {
          // 加载更早的消息（向上滚动）
          setMessages((prev) => [...historyMessages, ...prev]);
        } else {
          // 首次加载
          setMessages(historyMessages);
        }

        setHasMore(historyMessages.length === 20);
      }
    } catch (error) {
      console.error("加载消息失败:", error);
      Toast.show("加载消息失败");
    } finally {
      setIsLoading(false);
    }
  };

  // 处理新消息
  const handleNewMessage = (message: ChatMessage) => {
    if (message.roomId === roomId) {
      setMessages((prev) => [...prev, message]);

      // 如果不是自己发的消息，标记为已读
      if (message.senderId !== currentUserId) {
        markMessageAsRead(message.id);
      }
    }
  };

  // 处理消息状态更新
  const handleMessageStatusUpdate = (data: {
    messageId: string;
    status: ChatMessage["status"];
  }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === data.messageId ? { ...msg, status: data.status } : msg
      )
    );
  };

  // 处理用户输入状态
  const handleUserTyping = (data: { userId: string; userName: string }) => {
    if (data.userId !== currentUserId) {
      setTypingUsers((prev) =>
        prev.includes(data.userName) ? prev : [...prev, data.userName]
      );
    }
  };

  // 处理用户停止输入
  const handleUserStopTyping = (data: { userId: string; userName: string }) => {
    setTypingUsers((prev) => prev.filter((name) => name !== data.userName));
  };

  // 发送文本消息
  const sendTextMessage = async () => {
    if (!inputValue.trim()) return;

    const messageId = `msg_${Date.now()}_${Math.random()}`;
    const tempMessage: ChatMessage = {
      id: messageId,
      senderId: currentUserId,
      senderName: "我",
      senderAvatar: "",
      roomId,
      content: inputValue.trim(),
      type: "text",
      timestamp: new Date(),
      status: "sending",
    };

    // 立即添加到消息列表
    setMessages((prev) => [...prev, tempMessage]);
    setInputValue("");

    try {
      // 发送到服务器
      const response = await socketManager.send("send_message", {
        roomId,
        content: tempMessage.content,
        type: "text",
        tempId: messageId,
      });

      // 更新消息 ID 和状态
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, id: response.id, status: "sent" }
            : msg
        )
      );
    } catch (error) {
      console.error("发送消息失败:", error);

      // 标记消息发送失败
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, status: "failed" } : msg
        )
      );

      Toast.show("发送失败，请重试");
    }
  };

  // 发送图片消息
  const sendImageMessage = async (file: File) => {
    try {
      // 压缩图片
      const compressedFile = await compressImage(file);

      // 转换为 base64
      const base64 = await fileToBase64(compressedFile);

      // 获取图片尺寸
      const { width, height } = await getImageDimensions(base64);

      const messageId = `msg_${Date.now()}_${Math.random()}`;
      const tempMessage: ChatMessage = {
        id: messageId,
        senderId: currentUserId,
        senderName: "我",
        senderAvatar: "",
        roomId,
        content: base64,
        type: "image",
        timestamp: new Date(),
        status: "sending",
        metadata: {
          imageWidth: width,
          imageHeight: height,
          fileName: file.name,
          fileSize: compressedFile.size,
          mimeType: compressedFile.type,
        },
      };

      setMessages((prev) => [...prev, tempMessage]);

      // 发送到服务器
      const response = await socketManager.send("send_message", {
        roomId,
        content: base64,
        type: "image",
        metadata: tempMessage.metadata,
        tempId: messageId,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, id: response.id, status: "sent" }
            : msg
        )
      );
    } catch (error) {
      console.error("发送图片失败:", error);
      Toast.show("发送图片失败");
    }
  };

  // 处理输入变化
  const handleInputChange = (value: string) => {
    setInputValue(value);

    // 发送输入状态
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      socketManager.send("start_typing", { roomId });

      // 3秒后自动停止输入状态
      setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          socketManager.send("stop_typing", { roomId });
        }
      }, 3000);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      socketManager.send("stop_typing", { roomId });
    }
  };

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 标记消息为已读
  const markMessageAsRead = async (messageId: string) => {
    try {
      await socketManager.send("mark_message_read", {
        messageId,
        roomId,
      });
    } catch (error) {
      console.error("标记消息已读失败:", error);
    }
  };

  return (
    <div className="chat-room">
      {/* 消息列表 */}
      <div className="messages-container">
        {/* 加载更多按钮 */}
        {hasMore && (
          <div className="load-more">
            <Button
              type="default"
              size="small"
              loading={isLoading}
              onClick={() => loadHistoryMessages(messages[0]?.id)}
            >
              加载更多消息
            </Button>
          </div>
        )}

        {/* 消息列表 */}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
            onRetry={() => {
              if (message.status === "failed") {
                // 重新发送消息
                if (message.type === "text") {
                  // 重发文本消息逻辑
                } else if (message.type === "image") {
                  // 重发图片消息逻辑
                }
              }
            }}
          />
        ))}

        {/* 输入状态指示器 */}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <span>{typingUsers.join(", ")} 正在输入...</span>
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="input-area">
        <div className="input-controls">
          <Button
            type="default"
            icon={<PictureOutlined />}
            onClick={() => fileInputRef.current?.click()}
          >
            图片
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                sendImageMessage(file);
              }
            }}
          />
        </div>

        <div className="input-wrapper">
          <TextArea
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="输入消息..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                sendTextMessage();
              }
            }}
          />

          <Button
            type="primary"
            disabled={!inputValue.trim()}
            onClick={sendTextMessage}
            style={{ marginLeft: 8 }}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

// 消息气泡组件
const MessageBubble: React.FC<{
  message: ChatMessage;
  isOwn: boolean;
  onRetry: () => void;
}> = ({ message, isOwn, onRetry }) => {
  return (
    <div className={`message-bubble ${isOwn ? "own" : "other"}`}>
      {/* 头像 */}
      {!isOwn && (
        <Avatar src={message.senderAvatar} size={32} className="message-avatar">
          {message.senderName?.[0]}
        </Avatar>
      )}

      <div className="message-content">
        {/* 发送者名称 */}
        {!isOwn && <div className="sender-name">{message.senderName}</div>}

        {/* 消息内容 */}
        <div className="message-body">
          {message.type === "text" && (
            <div className="text-message">{message.content}</div>
          )}

          {message.type === "image" && (
            <div className="image-message">
              <Image
                src={message.content}
                width={Math.min(message.metadata?.imageWidth || 200, 200)}
                height={Math.min(message.metadata?.imageHeight || 200, 200)}
                style={{ borderRadius: 8 }}
              />
            </div>
          )}

          {message.type === "system" && (
            <div className="system-message">{message.content}</div>
          )}
        </div>

        {/* 消息状态和时间 */}
        <div className="message-meta">
          <span className="message-time">
            {formatMessageTime(message.timestamp)}
          </span>

          {isOwn && (
            <span className={`message-status ${message.status}`}>
              {getStatusIcon(message.status)}
            </span>
          )}

          {/* 重试按钮 */}
          {message.status === "failed" && (
            <Button type="link" size="small" danger onClick={onRetry}>
              重试
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// 格式化消息时间
const formatMessageTime = (timestamp: Date): string => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();

  if (diff < 60000) {
    // 1分钟内
    return "刚刚";
  } else if (diff < 3600000) {
    // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`;
  } else if (diff < 86400000) {
    // 24小时内
    return timestamp.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return timestamp.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

// 获取状态图标
const getStatusIcon = (status: ChatMessage["status"]): string => {
  switch (status) {
    case "sending":
      return "⏳";
    case "sent":
      return "✓";
    case "delivered":
      return "✓✓";
    case "read":
      return "✓✓";
    case "failed":
      return "❌";
    default:
      return "";
  }
};
```

---

## 📊 数据可视化系统

### 1. 健康数据图表

#### 体重变化趋势图

```typescript
// 体重趋势图组件
const WeightTrendChart: React.FC<{
  petId: string;
  timeRange: "week" | "month" | "quarter" | "year";
}> = ({ petId, timeRange }) => {
  const [data, setData] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);

  useEffect(() => {
    loadWeightData();
  }, [petId, timeRange]);

  const loadWeightData = async () => {
    try {
      setLoading(true);

      const endDate = new Date();
      const startDate = new Date();

      // 计算时间范围
      switch (timeRange) {
        case "week":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const response = await api.get(`/pets/${petId}/weight-records`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      if (response.data.success) {
        const records = response.data.data;
        setData(records);

        // 获取目标体重
        if (records.length > 0) {
          setTargetWeight(records[0].targetWeight);
        }
      }
    } catch (error) {
      console.error("加载体重数据失败:", error);
      Toast.show("加载数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 处理数据格式
  const chartData = data.map((record) => ({
    date: formatChartDate(record.recordDate, timeRange),
    weight: record.weight,
    targetWeight: record.targetWeight,
    timestamp: record.recordDate,
  }));

  // 计算统计信息
  const statistics = useMemo(() => {
    if (data.length === 0) return null;

    const weights = data.map((r) => r.weight);
    const currentWeight = weights[weights.length - 1];
    const previousWeight = weights[weights.length - 2];
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;

    const weightChange = previousWeight ? currentWeight - previousWeight : 0;
    const changePercent = previousWeight
      ? (weightChange / previousWeight) * 100
      : 0;

    return {
      current: currentWeight,
      change: weightChange,
      changePercent,
      min: minWeight,
      max: maxWeight,
      average: avgWeight,
      target: targetWeight,
    };
  }, [data, targetWeight]);

  if (loading) {
    return (
      <Card title="体重趋势" loading>
        <div style={{ height: 300 }} />
      </Card>
    );
  }

  return (
    <Card
      title="体重趋势"
      extra={
        <Select
          value={timeRange}
          onChange={(value) => {
            // 触发时间范围变化
          }}
          size="small"
        >
          <Option value="week">最近一周</Option>
          <Option value="month">最近一月</Option>
          <Option value="quarter">最近三月</Option>
          <Option value="year">最近一年</Option>
        </Select>
      }
    >
      {/* 统计信息 */}
      {statistics && (
        <div className="weight-statistics">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="当前体重"
                value={statistics.current}
                suffix="kg"
                precision={1}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="变化"
                value={statistics.change}
                suffix="kg"
                precision={1}
                valueStyle={{
                  color:
                    statistics.change > 0
                      ? "#cf1322"
                      : statistics.change < 0
                      ? "#3f8600"
                      : "#666",
                }}
                prefix={
                  statistics.change > 0 ? (
                    <ArrowUpOutlined />
                  ) : statistics.change < 0 ? (
                    <ArrowDownOutlined />
                  ) : null
                }
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="平均体重"
                value={statistics.average}
                suffix="kg"
                precision={1}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="目标体重"
                value={statistics.target || 0}
                suffix="kg"
                precision={1}
              />
            </Col>
          </Row>
        </div>
      )}

      {/* 图表 */}
      <div style={{ marginTop: 16 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis
              domain={["dataMin - 0.5", "dataMax + 0.5"]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value, name) => [
                `${value} kg`,
                name === "weight" ? "实际体重" : "目标体重",
              ]}
              labelFormatter={(label) => `日期: ${label}`}
            />
            <Legend />

            {/* 实际体重线 */}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#1890ff"
              strokeWidth={2}
              dot={{ fill: "#1890ff", r: 4 }}
              name="实际体重"
              connectNulls={false}
            />

            {/* 目标体重线 */}
            {targetWeight && (
              <Line
                type="monotone"
                dataKey="targetWeight"
                stroke="#52c41a"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="目标体重"
              />
            )}

            {/* 参考区域 */}
            <ReferenceLine
              y={statistics?.target}
              stroke="#52c41a"
              strokeDasharray="3 3"
              label="目标"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 健康建议 */}
      {statistics && (
        <HealthAdvice
          currentWeight={statistics.current}
          targetWeight={statistics.target}
          changePercent={statistics.changePercent}
        />
      )}
    </Card>
  );
};

// 健康建议组件
const HealthAdvice: React.FC<{
  currentWeight: number;
  targetWeight: number | null;
  changePercent: number;
}> = ({ currentWeight, targetWeight, changePercent }) => {
  const getAdvice = () => {
    if (!targetWeight) {
      return {
        type: "info",
        title: "建议设置目标体重",
        content: "请咨询兽医，为您的宠物设置合适的目标体重范围。",
      };
    }

    const difference = currentWeight - targetWeight;
    const percentDiff = (difference / targetWeight) * 100;

    if (Math.abs(percentDiff) <= 5) {
      return {
        type: "success",
        title: "体重正常",
        content: "您的宠物体重在健康范围内，请继续保持良好的饮食和运动习惯。",
      };
    } else if (percentDiff > 5) {
      return {
        type: "warning",
        title: "体重偏重",
        content: "建议减少高热量食物，增加运动量。如有疑虑请咨询兽医。",
      };
    } else {
      return {
        type: "error",
        title: "体重偏轻",
        content: "建议增加营养摄入，如果持续偏轻请及时就医检查。",
      };
    }
  };

  const advice = getAdvice();

  return (
    <Alert
      message={advice.title}
      description={advice.content}
      type={advice.type as any}
      showIcon
      style={{ marginTop: 16 }}
      action={
        <Button size="small" type="link">
          查看详细建议
        </Button>
      }
    />
  );
};
```

### 2. 活动数据分析

#### 运动量统计图表

```typescript
// 运动量统计组件
const ActivityChart: React.FC<{
  petId: string;
  period: "daily" | "weekly" | "monthly";
}> = ({ petId, period }) => {
  const [data, setData] = useState<ActivityRecord[]>([]);
  const [goals, setGoals] = useState<ActivityGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivityData();
  }, [petId, period]);

  const loadActivityData = async () => {
    try {
      setLoading(true);

      const [activityResponse, goalsResponse] = await Promise.all([
        api.get(`/pets/${petId}/activity-records`, {
          params: { period, limit: 30 },
        }),
        api.get(`/pets/${petId}/activity-goals`),
      ]);

      if (activityResponse.data.success) {
        setData(activityResponse.data.data);
      }

      if (goalsResponse.data.success) {
        setGoals(goalsResponse.data.data);
      }
    } catch (error) {
      console.error("加载活动数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 处理图表数据
  const chartData = data.map((record) => {
    const date = formatChartDate(record.date, period);
    const goal = goals.find((g) => g.activityType === record.activityType);

    return {
      date,
      duration: record.duration,
      goal: goal?.targetDuration || 0,
      activityType: record.activityType,
      calories: record.estimatedCalories,
      completion: goal ? (record.duration / goal.targetDuration) * 100 : 0,
    };
  });

  // 按活动类型分组
  const groupedData = chartData.reduce((acc, record) => {
    if (!acc[record.activityType]) {
      acc[record.activityType] = [];
    }
    acc[record.activityType].push(record);
    return acc;
  }, {} as Record<string, typeof chartData>);

  if (loading) {
    return <Card title="活动统计" loading />;
  }

  return (
    <Card title="活动统计">
      <Tabs defaultActiveKey="overview">
        <TabPane tab="总览" key="overview">
          <ActivityOverview data={chartData} goals={goals} />
        </TabPane>

        <TabPane tab="运动时长" key="duration">
          <DurationChart data={chartData} />
        </TabPane>

        <TabPane tab="完成率" key="completion">
          <CompletionChart data={chartData} />
        </TabPane>

        <TabPane tab="热量消耗" key="calories">
          <CaloriesChart data={chartData} />
        </TabPane>
      </Tabs>
    </Card>
  );
};

// 活动总览组件
const ActivityOverview: React.FC<{
  data: any[];
  goals: ActivityGoal[];
}> = ({ data, goals }) => {
  const stats = useMemo(() => {
    const totalDuration = data.reduce(
      (sum, record) => sum + record.duration,
      0
    );
    const totalCalories = data.reduce(
      (sum, record) => sum + record.calories,
      0
    );
    const averageCompletion =
      data.reduce((sum, record) => sum + record.completion, 0) / data.length;
    const activeDays = new Set(data.map((record) => record.date)).size;

    return {
      totalDuration,
      totalCalories,
      averageCompletion: isNaN(averageCompletion) ? 0 : averageCompletion,
      activeDays,
    };
  }, [data]);

  return (
    <div className="activity-overview">
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="总运动时长"
            value={stats.totalDuration}
            suffix="分钟"
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="总热量消耗"
            value={stats.totalCalories}
            suffix="卡路里"
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="平均完成率"
            value={stats.averageCompletion}
            suffix="%"
            precision={1}
          />
        </Col>
        <Col span={6}>
          <Statistic title="活跃天数" value={stats.activeDays} suffix="天" />
        </Col>
      </Row>

      {/* 目标完成情况 */}
      <div style={{ marginTop: 24 }}>
        <h4>目标完成情况</h4>
        {goals.map((goal) => {
          const relevantData = data.filter(
            (d) => d.activityType === goal.activityType
          );
          const totalDuration = relevantData.reduce(
            (sum, d) => sum + d.duration,
            0
          );
          const targetDuration = goal.targetDuration * relevantData.length;
          const completion =
            targetDuration > 0 ? (totalDuration / targetDuration) * 100 : 0;

          return (
            <div key={goal.id} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span>{getActivityTypeLabel(goal.activityType)}</span>
                <span>{completion.toFixed(1)}%</span>
              </div>
              <Progress
                percent={completion}
                status={
                  completion >= 100
                    ? "success"
                    : completion >= 80
                    ? "active"
                    : "normal"
                }
                strokeColor={
                  completion >= 100
                    ? "#52c41a"
                    : completion >= 80
                    ? "#1890ff"
                    : "#faad14"
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 时长图表组件
const DurationChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="duration" fill="#1890ff" name="实际时长" />
        <Bar dataKey="goal" fill="#52c41a" name="目标时长" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// 完成率图表组件
const CompletionChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 150]} />
        <Tooltip formatter={(value) => [`${value}%`, "完成率"]} />
        <ReferenceLine y={100} stroke="#52c41a" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="completion"
          stroke="#1890ff"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// 热量图表组件
const CaloriesChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="calories"
          stroke="#ff7300"
          fill="#ff7300"
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
```

---

_继续为您详细说明移动端优化和其他功能的实现..._
