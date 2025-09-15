# 🔍 智能宠物管理应用 - 功能实现详解

## 目录

- [用户认证系统](#用户认证系统)
- [AI 集成系统](#ai集成系统)
- [宠物管理系统](#宠物管理系统)
- [电商系统](#电商系统)
- [实时通信系统](#实时通信系统)
- [数据可视化系统](#数据可视化系统)
- [移动端优化](#移动端优化)

---

## 🔐 用户认证系统

### 1. 传统用户名密码登录

#### 技术架构

该功能采用 JWT（JSON Web Token）+ bcrypt 密码加密的经典认证方案，确保用户信息安全。

#### 前端实现详解

```typescript
// 前端登录表单处理
const handleLogin = async (username: string, password: string) => {
  try {
    // 1. 表单验证
    if (!username || !password) {
      throw new Error("用户名和密码不能为空");
    }

    // 2. 发送登录请求
    const response = await api.post("/auth/login", {
      username,
      password,
      loginField: "username", // 指定登录方式
    });

    // 3. 处理登录成功响应
    if (response.data.success) {
      const { token, user } = response.data.data;

      // 4. 存储认证信息到localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // 5. 更新全局认证状态
      setAuthState({
        isAuthenticated: true,
        user: user,
        token: token,
      });

      // 6. 跳转到首页
      navigate("/home");
    }
  } catch (error) {
    // 7. 错误处理和用户提示
    setErrorMessage(error.response?.data?.message || "登录失败");
  }
};
```

#### 后端实现详解

```javascript
// 用户登录控制器
export async function login(req, res) {
  const { username, password, loginField } = req.body;

  try {
    // 1. 智能用户查找 - 支持用户名、手机号、邮箱登录
    let user;
    if (loginField === "mobile") {
      user = await User.findOne({ mobile: username });
    } else if (loginField === "email") {
      user = await User.findOne({ email: username });
    } else {
      // 智能匹配：先尝试用户名，再尝试手机号和邮箱
      user = await User.findOne({ username });

      // 如果用户名不存在，且输入看起来像手机号
      if (!user && /^1[3-9]\d{9}$/.test(username)) {
        user = await User.findOne({ mobile: username });
      }

      // 如果还没找到，且输入看起来像邮箱
      if (!user && /@/.test(username)) {
        user = await User.findOne({ email: username });
      }
    }

    // 2. 用户存在性验证
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "账号不存在",
      });
    }

    // 3. 密码验证 - 使用bcrypt比较哈希密码
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "密码错误",
      });
    }

    // 4. 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 5. 生成JWT令牌
    const token = signToken({
      id: user._id,
      username: user.username,
    });

    // 6. 返回登录成功信息
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          mobile: user.mobile,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar,
          loginType: user.loginType,
          isVerified: user.isVerified,
          lastLoginAt: user.lastLoginAt,
        },
      },
      message: "登录成功",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
```

#### 密码安全实现

```javascript
// 用户模型中的密码处理
userSchema.pre("save", async function (next) {
  // 只有密码被修改时才重新加密
  if (!this.isModified("password")) return next();

  // 生成盐值，成本因子为10（2^10次迭代）
  const salt = await bcrypt.genSalt(10);

  // 使用盐值加密密码
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// 密码验证方法
userSchema.methods.matchPassword = async function (password) {
  // 比较明文密码和加密密码
  return await bcrypt.compare(password, this.password);
};
```

### 2. 短信验证码登录

#### 技术架构

短信验证码登录采用模拟实现（开发环境）+ 真实短信 API（生产环境）的双模式设计。

#### 验证码生成与管理

```typescript
// 前端验证码发送逻辑
const handleSendCode = async () => {
  if (!phoneNumber || countdown > 0) return;

  try {
    // 1. 手机号格式验证
    if (!/^1[3-9]\d{9}$/.test(phoneNumber)) {
      setLoginError("请输入正确的手机号");
      return;
    }

    // 2. 发送验证码请求
    const response = await api.post("/auth/send-sms", {
      mobile: phoneNumber,
    });

    if (response.data.success) {
      // 3. 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setLoginError("");
    }
  } catch (error) {
    // 4. 开发环境模拟验证码
    if (
      import.meta.env.DEV &&
      (error.response?.status === 404 || error.code === "ERR_NETWORK")
    ) {
      console.log("开发环境：使用模拟验证码");

      // 生成6位随机验证码
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      console.log("模拟验证码:", code);

      // 设置验证码5分钟有效期
      setTimeout(() => {
        setCodeExpired(true);
      }, 5 * 60 * 1000);

      setCountdown(60);
      setLoginError("");
    } else {
      setLoginError(error.response?.data?.message || "发送验证码失败");
    }
  }
};
```

#### 验证码验证与登录

```typescript
// 短信验证码登录处理
const handlePhoneSubmit = async () => {
  if (!phoneNumber || !verificationCode) return;

  try {
    // 1. 开发环境验证码校验
    if (import.meta.env.DEV && generatedCode) {
      if (verificationCode !== generatedCode) {
        setLoginError("验证码错误");
        return;
      }

      if (codeExpired) {
        setLoginError("验证码已过期，请重新获取");
        return;
      }
    }

    // 2. 发送登录验证请求
    const response = await api.post("/auth/sms-login", {
      mobile: phoneNumber,
      code: verificationCode,
    });

    if (response.data.success) {
      const { token, user } = response.data.data;

      // 3. 保存认证信息
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setLoginSuccess(true);

      // 4. 2秒后跳转
      setTimeout(() => {
        navigate("/home");
        window.location.reload(); // 刷新认证状态
      }, 2000);
    }
  } catch (error) {
    // 5. 错误处理
    setLoginError(error.response?.data?.message || "登录失败");
  }
};
```

### 3. 第三方登录集成

#### QQ 登录实现

```typescript
// QQ登录配置
const QQ_CONFIG = {
  appId: import.meta.env.VITE_QQ_APP_ID,
  redirectUri: `${window.location.origin}/auth-callback`,
  scope: "get_user_info",
  responseType: "code",
};

// QQ登录URL生成
const generateQQLoginUrl = () => {
  const params = new URLSearchParams({
    client_id: QQ_CONFIG.appId,
    redirect_uri: QQ_CONFIG.redirectUri,
    scope: QQ_CONFIG.scope,
    response_type: QQ_CONFIG.responseType,
    state: "qq_login_" + Date.now(), // 防CSRF攻击
  });

  return `https://graph.qq.com/oauth2.0/authorize?${params.toString()}`;
};

// 发起QQ登录
const handleQQLogin = () => {
  const loginUrl = generateQQLoginUrl();
  window.location.href = loginUrl;
};
```

#### 第三方登录回调处理

```typescript
// 统一回调处理组件
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");

        if (!code) {
          throw new Error("缺少授权码");
        }

        // 1. 验证state参数防止CSRF攻击
        if (!state || !state.includes("_login_")) {
          throw new Error("无效的状态参数");
        }

        // 2. 确定登录平台
        const platform = state.split("_")[0]; // qq, wechat, weibo

        // 3. 发送授权码到后端
        const response = await api.post("/auth/third-party-login", {
          platform,
          code,
          redirectUri: QQ_CONFIG.redirectUri,
        });

        if (response.data.success) {
          const { token, user } = response.data.data;

          // 4. 保存认证信息
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          setStatus("success");

          // 5. 跳转到首页
          setTimeout(() => {
            navigate("/home");
          }, 2000);
        }
      } catch (error) {
        console.error("第三方登录失败:", error);
        setStatus("error");
      }
    };

    handleCallback();
  }, [navigate]);

  // 6. 渲染不同状态的UI
  return (
    <div className="callback-container">
      {status === "loading" && <Loading text="正在处理登录..." />}
      {status === "success" && <Success text="登录成功，正在跳转..." />}
      {status === "error" && <Error text="登录失败，请重试" />}
    </div>
  );
};
```

### 4. JWT 令牌管理

#### JWT 生成与验证

```javascript
// JWT服务实现
import jwt from "jsonwebtoken";
import { config } from "../../env.config.js";

// 生成JWT令牌
export function signToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: "1h", // 1小时过期
    issuer: "pet-app", // 签发者
    audience: "pet-app-users", // 受众
  });
}

// 验证JWT令牌
export function verifyToken(token) {
  try {
    return jwt.verify(token, config.JWT_SECRET, {
      issuer: "pet-app",
      audience: "pet-app-users",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("令牌已过期");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("令牌无效");
    }
    throw error;
  }
}

// 刷新令牌
export function refreshToken(oldToken) {
  try {
    const decoded = jwt.verify(oldToken, config.JWT_SECRET, {
      ignoreExpiration: true, // 忽略过期时间验证
    });

    // 生成新令牌（移除过期时间字段）
    const { iat, exp, ...payload } = decoded;
    return signToken(payload);
  } catch (error) {
    throw new Error("令牌刷新失败");
  }
}
```

#### 认证中间件

```javascript
// 认证中间件实现
export async function authenticateToken(req, res, next) {
  try {
    // 1. 提取Authorization头
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "访问被拒绝：未提供访问令牌",
      });
    }

    // 2. 验证令牌
    const decoded = verifyToken(token);

    // 3. 检查用户是否仍然存在
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "用户不存在",
      });
    }

    // 4. 将用户信息附加到请求对象
    req.user = {
      id: decoded.id,
      username: decoded.username,
      fullUser: user,
    };

    next();
  } catch (err) {
    console.error("Token验证失败:", err.message);
    return res.status(401).json({
      success: false,
      message: "访问被拒绝：令牌无效或已过期",
    });
  }
}
```

#### 前端令牌自动管理

```typescript
// Axios请求拦截器 - 自动添加令牌
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Axios响应拦截器 - 处理令牌过期
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 如果是401错误且不是重试请求
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 尝试刷新令牌
        const oldToken = localStorage.getItem("token");
        if (oldToken) {
          const response = await api.post("/auth/refresh-token", {
            token: oldToken,
          });

          if (response.data.success) {
            const newToken = response.data.data.token;
            localStorage.setItem("token", newToken);

            // 重新发送原请求
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("令牌刷新失败:", refreshError);
      }

      // 刷新失败，清除本地存储并跳转登录
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
```

---

## 🤖 AI 集成系统

### 1. 多 AI 服务聚合架构

#### AI 服务配置管理

```javascript
// AI服务配置表
const AI_SERVICES = {
  // OpenAI服务配置
  openai: {
    type: "openai",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    maxRequests: 2, // 免费账户限制
    supportsVision: true,
    formatRequest: (messages, model) => ({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    }),
    formatHeaders: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "PetApp/1.0",
    }),
    parseResponse: (data) => ({
      content: data.choices[0].message.content,
      usage: data.usage || null,
      finishReason: data.choices[0].finish_reason,
    }),
  },

  // 智谱AI服务配置
  zhipu: {
    type: "zhipu",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    model: "glm-4v-plus",
    maxRequests: 30,
    supportsVision: true,
    formatRequest: (messages, model) => ({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      do_sample: true,
      stream: false,
    }),
    formatHeaders: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    parseResponse: (data) => ({
      content: data.choices[0].message.content,
      usage: data.usage || null,
    }),
  },

  // 其他AI服务配置...
};
```

#### 动态 AI 服务切换

```javascript
// 获取当前AI服务
const getCurrentAIService = () => {
  const serviceType = process.env.AI_SERVICE || "zhipu";
  const service = AI_SERVICES[serviceType];

  if (!service) {
    throw new Error(`不支持的AI服务: ${serviceType}`);
  }

  return service;
};

// AI服务健康检查
const checkAIServiceHealth = async (serviceType) => {
  const service = AI_SERVICES[serviceType];
  const apiKey = process.env[`${serviceType.toUpperCase()}_API_KEY`];

  if (!apiKey || apiKey === "your-api-key-here") {
    return false;
  }

  try {
    // 发送测试请求
    const testResponse = await fetch(service.baseUrl, {
      method: "POST",
      headers: service.formatHeaders(apiKey),
      body: JSON.stringify(
        service.formatRequest(
          [{ role: "user", content: "test" }],
          service.model
        )
      ),
    });

    return testResponse.ok;
  } catch (error) {
    return false;
  }
};

// 智能服务选择
const selectBestAIService = async () => {
  const services = Object.keys(AI_SERVICES);

  for (const serviceType of services) {
    const isHealthy = await checkAIServiceHealth(serviceType);
    if (isHealthy) {
      return serviceType;
    }
  }

  throw new Error("没有可用的AI服务");
};
```

### 2. 智能对话系统

#### 对话上下文管理

```typescript
// 对话存储接口
interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  images?: string[];
  timestamp: Date;
  status: "sending" | "sent" | "error";
  metadata?: {
    model?: string;
    usage?: any;
    processingTime?: number;
  };
}

// 对话状态管理（使用Zustand）
interface ChatStore {
  messages: ChatMessage[];
  isTyping: boolean;
  currentSession: string;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setTyping: (typing: boolean) => void;
  clearMessages: () => void;
  exportChat: () => string;
  importChat: (data: string) => void;
}

const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isTyping: false,
  currentSession: uuidv4(),

  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    }));
  },

  setTyping: (typing) => set({ isTyping: typing }),

  clearMessages: () =>
    set({
      messages: [],
      currentSession: uuidv4(),
    }),

  // 导出聊天记录为JSON
  exportChat: () => {
    const { messages, currentSession } = get();
    return JSON.stringify(
      {
        session: currentSession,
        messages,
        exportTime: new Date().toISOString(),
      },
      null,
      2
    );
  },

  // 导入聊天记录
  importChat: (data) => {
    try {
      const parsed = JSON.parse(data);
      set({
        messages: parsed.messages || [],
        currentSession: parsed.session || uuidv4(),
      });
    } catch (error) {
      console.error("导入聊天记录失败:", error);
    }
  },
}));
```

#### AI 对话处理流程

```typescript
// AI对话处理主函数
const handleAIChat = async (
  prompt: string,
  images: string[] = []
): Promise<void> => {
  const { addMessage, updateMessage, setTyping } = useChatStore.getState();

  // 1. 添加用户消息
  const userMessageId = uuidv4();
  addMessage({
    id: userMessageId,
    role: "user",
    content: prompt,
    images,
    status: "sending",
  });

  // 2. 开始AI思考状态
  setTyping(true);
  const startTime = Date.now();

  try {
    // 3. 构建消息上下文
    const messages = buildContextMessages(prompt, images);

    // 4. 调用AI服务
    const aiResponse = await callAIModel(messages);

    // 5. 计算处理时间
    const processingTime = Date.now() - startTime;

    // 6. 更新用户消息状态
    updateMessage(userMessageId, { status: "sent" });

    // 7. 添加AI回复
    addMessage({
      role: "ai",
      content: aiResponse.content,
      status: "sent",
      metadata: {
        model: aiResponse.model,
        usage: aiResponse.usage,
        processingTime,
      },
    });

    // 8. 保存对话到数据库
    await saveChatToDatabase(userMessageId, aiResponse);
  } catch (error) {
    // 9. 错误处理
    updateMessage(userMessageId, { status: "error" });

    addMessage({
      role: "ai",
      content: `抱歉，AI服务暂时不可用：${error.message}`,
      status: "sent",
    });

    console.error("AI对话失败:", error);
  } finally {
    // 10. 结束思考状态
    setTyping(false);
  }
};

// 构建对话上下文
const buildContextMessages = (prompt: string, images: string[]) => {
  const { messages } = useChatStore.getState();

  // 获取最近10条消息作为上下文
  const recentMessages = messages.slice(-10).map((msg) => ({
    role: msg.role === "ai" ? "assistant" : "user",
    content: msg.content,
  }));

  // 构建当前消息
  const currentMessage =
    images.length > 0
      ? {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...images.map((image) => ({
              type: "image_url",
              image_url: { url: image },
            })),
          ],
        }
      : {
          role: "user",
          content: prompt,
        };

  return [...recentMessages, currentMessage];
};
```

### 3. 图像分析功能

#### 图像上传与预处理

```typescript
// 图像上传组件
const ImageUpload: React.FC<{
  onImageSelect: (images: string[]) => void;
  maxImages?: number;
}> = ({ onImageSelect, maxImages = 5 }) => {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (files: FileList) => {
    if (files.length === 0) return;

    setUploading(true);
    const processedImages: string[] = [];

    try {
      for (let i = 0; i < Math.min(files.length, maxImages); i++) {
        const file = files[i];

        // 1. 文件类型验证
        if (!file.type.startsWith("image/")) {
          Toast.show("只能上传图片文件");
          continue;
        }

        // 2. 文件大小验证
        if (file.size > 10 * 1024 * 1024) {
          // 10MB
          Toast.show("图片大小不能超过10MB");
          continue;
        }

        // 3. 图像压缩
        const compressedFile = await compressImage(file);

        // 4. 转换为Base64
        const base64 = await fileToBase64(compressedFile);

        // 5. 图像预处理
        const processedImage = await preprocessImage(base64);

        processedImages.push(processedImage);
      }

      const newImages = [...selectedImages, ...processedImages].slice(
        0,
        maxImages
      );

      setSelectedImages(newImages);
      onImageSelect(newImages);
    } catch (error) {
      console.error("图像处理失败:", error);
      Toast.show("图像处理失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  return <div className="image-upload">{/* 图像上传UI */}</div>;
};

// 图像压缩函数
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      mimeType: "image/jpeg",
      convertSize: 1000000, // 1MB以上才转换格式
      success: resolve,
      error: (error) => {
        console.error("图像压缩失败:", error);
        resolve(file); // 压缩失败时使用原文件
      },
    });
  });
};

// 图像预处理
const preprocessImage = async (base64: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      // 设置画布尺寸
      const maxSize = 1024;
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // 绘制图像
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 返回处理后的base64
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.src = base64;
  });
};
```

#### AI 图像分析实现

```javascript
// 后端图像分析API
export const analyzeImage = async (req, res) => {
  const startTime = Date.now();

  try {
    const { prompt, imageUrl, analysisType = "general" } = req.body;

    // 1. 验证输入
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "缺少图像数据",
      });
    }

    // 2. 构建专业分析提示词
    const analysisPrompt = buildImageAnalysisPrompt(prompt, analysisType);

    console.log("收到图像分析请求:", {
      analysisType,
      prompt: prompt || "通用分析",
      imageSize: imageUrl.length,
      timestamp: new Date().toISOString(),
    });

    // 3. 调用AI模型进行图像分析
    const aiResponse = await callAIModel(analysisPrompt, imageUrl);
    const processingTime = Date.now() - startTime;

    console.log(`图像分析完成，耗时: ${processingTime}ms`);

    // 4. 解析AI响应
    let analysisResult;
    if (typeof aiResponse === "string") {
      analysisResult = parseImageAnalysisResult(aiResponse);
    } else {
      analysisResult = parseImageAnalysisResult(aiResponse.content);
    }

    // 5. 返回分析结果
    res.json({
      success: true,
      data: {
        analysis: analysisResult,
        processingTime,
        model: getCurrentAIService().model,
        usage: aiResponse.usage || null,
      },
    });
  } catch (error) {
    console.error("图像分析失败:", error);
    res.status(500).json({
      success: false,
      message: "图像分析服务暂时不可用",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 构建图像分析提示词
const buildImageAnalysisPrompt = (userPrompt, analysisType) => {
  const basePrompts = {
    general: `
作为一名专业的宠物行为分析师，请仔细分析这张宠物图片。
请从以下角度进行分析：
1. 宠物种类、品种识别
2. 行为状态分析（活跃、休息、警觉等）
3. 健康状况观察（毛发、眼神、体态等）
4. 情绪状态判断（开心、紧张、疲惫等）
5. 环境因素分析
6. 饲养建议

请用专业但易懂的语言回答，并给出具体的观察依据。
    `,

    health: `
作为专业的宠物健康顾问，请重点分析图片中宠物的健康状况：
1. 眼部健康：眼神清澈度、是否有分泌物
2. 毛发状态：光泽度、密度、有无异常脱落
3. 皮肤状况：是否有红肿、皮疹等问题
4. 体态分析：体重是否正常、姿态是否自然
5. 精神状态：活力水平、反应敏捷度
6. 潜在健康风险提示
7. 日常护理建议

如发现任何异常，请建议就医检查。
    `,

    behavior: `
作为动物行为学专家，请分析图片中宠物的行为特征：
1. 当前行为识别（玩耍、探索、休息、警戒等）
2. 肢体语言解读（耳朵、尾巴、身体姿态）
3. 情绪状态评估
4. 社交行为表现
5. 环境适应性
6. 行为训练建议
7. 互动改善方案

请结合宠物心理学理论进行专业分析。
    `,
  };

  let finalPrompt = basePrompts[analysisType] || basePrompts.general;

  if (userPrompt) {
    finalPrompt += `\n\n用户特别关注：${userPrompt}`;
  }

  return finalPrompt;
};

// 解析图像分析结果
const parseImageAnalysisResult = (aiResponse) => {
  try {
    // 尝试解析JSON格式的结构化回答
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // 解析文本格式的回答
    const sections = aiResponse.split(/\d+\.\s+/).filter((s) => s.trim());

    return {
      summary: sections[0] || aiResponse.substring(0, 200),
      details: sections.slice(1).map((section, index) => ({
        title: `分析要点 ${index + 1}`,
        content: section.trim(),
      })),
      recommendations: extractRecommendations(aiResponse),
      confidence: calculateConfidence(aiResponse),
    };
  } catch (error) {
    return {
      summary: aiResponse,
      details: [],
      recommendations: [],
      confidence: 0.5,
    };
  }
};
```

### 4. 语音情绪分析

#### 音频特征提取

```typescript
// 音频分析组件
const VoiceAnalysis: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // 开始录音
  const startRecording = async () => {
    try {
      // 1. 获取麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // 2. 创建音频上下文
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // 3. 创建MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      const audioChunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        // 4. 处理录音数据
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const audioBuffer = await audioBlob.arrayBuffer();

        // 5. 音频特征提取
        const features = await extractAudioFeatures(audioBuffer);
        setAudioData(features.rawData);

        // 6. 发送到后端分析
        await analyzeVoiceEmotion(features);
      };

      // 开始录音
      mediaRecorderRef.current.start(100); // 每100ms收集一次数据
      setIsRecording(true);
    } catch (error) {
      console.error("录音启动失败:", error);
      Toast.show("无法访问麦克风，请检查权限设置");
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // 停止所有音频轨道
      mediaRecorderRef.current.stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  return <div className="voice-analysis">{/* 录音UI组件 */}</div>;
};

// 音频特征提取函数
const extractAudioFeatures = async (audioBuffer: ArrayBuffer) => {
  const audioContext = new AudioContext();
  const audioData = await audioContext.decodeAudioData(audioBuffer);

  // 获取音频原始数据
  const rawData = audioData.getChannelData(0);
  const sampleRate = audioData.sampleRate;
  const duration = audioData.duration;

  // 1. 音量特征提取
  const volumeFeatures = extractVolumeFeatures(rawData);

  // 2. 频率特征提取
  const frequencyFeatures = await extractFrequencyFeatures(rawData, sampleRate);

  // 3. 行为模式分析
  const behaviorFeatures = extractBehaviorFeatures(rawData, sampleRate);

  // 4. 时域特征
  const timeFeatures = extractTimeFeatures(rawData);

  return {
    rawData,
    duration,
    sampleCount: rawData.length,
    volumeStats: volumeFeatures,
    frequencyStats: frequencyFeatures,
    behaviorStats: behaviorFeatures,
    timeStats: timeFeatures,
  };
};

// 音量特征提取
const extractVolumeFeatures = (audioData: Float32Array) => {
  const amplitudes = Array.from(audioData).map(Math.abs);

  const max = Math.max(...amplitudes);
  const min = Math.min(...amplitudes);
  const avg = amplitudes.reduce((a, b) => a + b, 0) / amplitudes.length;

  // 计算方差
  const variance =
    amplitudes.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) /
    amplitudes.length;

  // 计算RMS（均方根）
  const rms = Math.sqrt(
    amplitudes.reduce((acc, val) => acc + val * val, 0) / amplitudes.length
  );

  return {
    max: max.toFixed(4),
    min: min.toFixed(4),
    avg: avg.toFixed(4),
    variance: variance.toFixed(4),
    range: (max - min).toFixed(4),
    rms: rms.toFixed(4),
  };
};

// 频率特征提取（使用FFT）
const extractFrequencyFeatures = async (
  audioData: Float32Array,
  sampleRate: number
) => {
  // 简化的FFT实现（实际项目中建议使用专业库如fft.js）
  const fftSize = 2048;
  const fftData = audioData.slice(0, fftSize);

  // 应用窗函数（汉明窗）
  const windowedData = applyHammingWindow(fftData);

  // 执行FFT
  const frequencyDomain = fft(windowedData);
  const magnitudes = frequencyDomain.map((complex) =>
    Math.sqrt(complex.real * complex.real + complex.imag * complex.imag)
  );

  // 频率分箱
  const nyquist = sampleRate / 2;
  const binSize = nyquist / (fftSize / 2);

  // 计算各频段能量分布
  const lowFreqEnd = Math.floor(250 / binSize); // 0-250Hz
  const midFreqEnd = Math.floor(4000 / binSize); // 250-4000Hz
  // 高频：4000Hz以上

  const lowEnergy = magnitudes.slice(0, lowFreqEnd).reduce((a, b) => a + b, 0);
  const midEnergy = magnitudes
    .slice(lowFreqEnd, midFreqEnd)
    .reduce((a, b) => a + b, 0);
  const highEnergy = magnitudes.slice(midFreqEnd).reduce((a, b) => a + b, 0);

  const totalEnergy = lowEnergy + midEnergy + highEnergy;

  // 寻找主导频率
  const maxMagnitudeIndex = magnitudes.indexOf(Math.max(...magnitudes));
  const dominantFreq = maxMagnitudeIndex * binSize;

  // 计算频率稳定性（相邻帧的频率变化）
  const stability = calculateFrequencyStability(magnitudes);

  return {
    dominantFreq: dominantFreq.toFixed(2),
    stability: stability.toFixed(2),
    distribution: {
      low: ((lowEnergy / totalEnergy) * 100).toFixed(1),
      mid: ((midEnergy / totalEnergy) * 100).toFixed(1),
      high: ((highEnergy / totalEnergy) * 100).toFixed(1),
    },
    spectralCentroid: calculateSpectralCentroid(magnitudes, binSize),
    spectralRolloff: calculateSpectralRolloff(magnitudes, binSize),
  };
};

// 行为模式特征提取
const extractBehaviorFeatures = (
  audioData: Float32Array,
  sampleRate: number
) => {
  // 1. 静默检测
  const silenceThreshold = 0.01;
  const frameDuration = 0.1; // 100ms帧
  const frameSize = Math.floor(sampleRate * frameDuration);

  let silentFrames = 0;
  let totalFrames = 0;
  const silencePeriods: Array<{ start: number; end: number }> = [];
  let inSilence = false;
  let silenceStart = 0;

  for (let i = 0; i < audioData.length; i += frameSize) {
    const frameData = audioData.slice(i, i + frameSize);
    const frameEnergy =
      frameData.reduce((acc, val) => acc + val * val, 0) / frameData.length;

    totalFrames++;

    if (frameEnergy < silenceThreshold) {
      silentFrames++;

      if (!inSilence) {
        inSilence = true;
        silenceStart = i / sampleRate;
      }
    } else {
      if (inSilence) {
        inSilence = false;
        silencePeriods.push({
          start: silenceStart,
          end: i / sampleRate,
        });
      }
    }
  }

  // 2. 音量变化模式分析
  const volumeChanges = analyzeVolumeChanges(audioData, frameSize);

  return {
    silenceRatio: ((silentFrames / totalFrames) * 100).toFixed(1),
    silencePeriods: silencePeriods.length,
    averageSilenceDuration:
      silencePeriods.length > 0
        ? (
            silencePeriods.reduce(
              (acc, period) => acc + (period.end - period.start),
              0
            ) / silencePeriods.length
          ).toFixed(2)
        : 0,
    volumeChangePattern: volumeChanges,
  };
};
```

#### 语音情绪分析后端实现

````javascript
// 语音情绪分析API
export const analyzeVoice = async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      duration,
      sampleCount,
      volumeStats,
      frequencyStats,
      behaviorStats,
    } = req.body;

    console.log("收到详细声音分析请求:", {
      duration: duration || "未知",
      sampleCount: sampleCount || 0,
      volumeStats: volumeStats || {},
      frequencyStats: frequencyStats || {},
      behaviorStats: behaviorStats || {},
    });

    // 构建专业的声音分析提示词
    const voiceAnalysisPrompt = buildVoiceAnalysisPrompt({
      duration,
      sampleCount,
      volumeStats,
      frequencyStats,
      behaviorStats,
    });

    // 调用AI模型分析
    const aiResponse = await callAIModel(voiceAnalysisPrompt);
    const processingTime = Date.now() - startTime;

    console.log(`声音分析AI请求完成，耗时: ${processingTime}ms`);

    // 解析AI返回的分析结果
    const analysisResult = parseVoiceAnalysisResult(aiResponse);

    // 添加技术分析数据
    const enhancedResult = enhanceWithTechnicalAnalysis(analysisResult, {
      volumeStats,
      frequencyStats,
      behaviorStats,
    });

    res.json({
      success: true,
      data: {
        ...enhancedResult,
        processingTime,
        technicalData: {
          duration,
          sampleCount,
          volumeStats,
          frequencyStats,
          behaviorStats,
        },
      },
    });
  } catch (error) {
    console.error("声音分析失败:", error);
    res.status(500).json({
      success: false,
      message: "声音分析服务暂时不可用",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 构建语音分析提示词
const buildVoiceAnalysisPrompt = (audioFeatures) => {
  const { duration, sampleCount, volumeStats, frequencyStats, behaviorStats } =
    audioFeatures;

  return `
作为一名专业的宠物行为分析师和动物心理学家，请分析以下详细的宠物声音特征数据：

=== 录音基础信息 ===
- 录音时长: ${duration || "未知"}秒
- 采样点数: ${sampleCount || 0}个
- 数据质量: ${
    sampleCount > 100 ? "高质量" : sampleCount > 50 ? "中等质量" : "较低质量"
  }

=== 音量特征分析 ===
- 最大音量: ${volumeStats?.max || "未知"}
- 平均音量: ${volumeStats?.avg || "未知"}
- 最小音量: ${volumeStats?.min || "未知"}
- 音量方差: ${volumeStats?.variance || "未知"} (数值越大表示音量变化越剧烈)
- 音量范围: ${volumeStats?.range || "未知"} (最大值-最小值)
- RMS音量: ${volumeStats?.rms || "未知"} (有效值)

=== 频率特征分析 ===
- 主导频率: ${frequencyStats?.dominantFreq || "未知"}Hz
- 频率稳定性: ${frequencyStats?.stability || "未知"} (数值越小表示频率越稳定)
- 低频能量比例: ${
    frequencyStats?.distribution?.low || "0"
  }% (20-250Hz，通常与低沉呼噜声相关)
- 中频能量比例: ${
    frequencyStats?.distribution?.mid || "0"
  }% (250-4000Hz，通常与正常叫声相关)
- 高频能量比例: ${
    frequencyStats?.distribution?.high || "0"
  }% (4000Hz+，通常与尖叫、焦虑相关)

=== 行为模式分析 ===
- 静默比例: ${behaviorStats?.silenceRatio || "0"}% (静默时间占比)
- 静默时段: ${behaviorStats?.silencePeriods || 0}次
- 平均静默时长: ${behaviorStats?.averageSilenceDuration || "0"}秒

基于以上专业数据，请进行深度分析并返回JSON格式结果。分析要点：
1. 高频能量比例高(>40%) = 更可能焦虑/惊怒
2. 低频能量比例高(>50%) = 更可能平静/满足
3. 音量方差大(>0.02) = 情绪波动剧烈
4. 频率稳定性差(>100) = 情绪不稳定
5. 静默比例高(>30%) = 可能疲惫或不适

返回格式：
{
  "emotions": [
    {"emotion": "平静", "percentage": 数值, "color": "#27AE60", "description": "基于数据的具体描述"},
    {"emotion": "焦虑", "percentage": 数值, "color": "#F39C12", "description": "基于数据的具体描述"},
    {"emotion": "悲伤", "percentage": 数值, "color": "#4A90E2", "description": "基于数据的具体描述"},
    {"emotion": "不安", "percentage": 数值, "color": "#9B59B6", "description": "基于数据的具体描述"},
    {"emotion": "惊怒", "percentage": 数值, "color": "#E74C3C", "description": "基于数据的具体描述"}
  ],
  "summary": "基于具体数据特征的专业分析总结，要提及关键的数值发现",
  "recommendations": [
    "基于数据特征的具体建议",
    "针对性的护理建议",
    "环境改善建议"
  ],
  "confidence": 0.85
}

请根据实际数据特征进行个性化分析，不要使用模板化回答。`;
};

// 解析语音分析结果
const parseVoiceAnalysisResult = (aiResponse) => {
  try {
    let reply;
    if (typeof aiResponse === "string") {
      reply = aiResponse;
    } else {
      reply = aiResponse.content;
    }

    // 清理AI返回的内容，移除可能的markdown格式
    const cleanedReply = reply
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // 尝试解析JSON
    const jsonMatch = cleanedReply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // 验证必要字段
      if (parsed.emotions && Array.isArray(parsed.emotions)) {
        // 确保情绪百分比总和为100%
        const totalPercentage = parsed.emotions.reduce(
          (sum, emotion) => sum + emotion.percentage,
          0
        );

        if (Math.abs(totalPercentage - 100) > 5) {
          // 重新归一化
          parsed.emotions = parsed.emotions.map((emotion) => ({
            ...emotion,
            percentage: Math.round(
              (emotion.percentage / totalPercentage) * 100
            ),
          }));
        }

        return parsed;
      }
    }

    // 如果JSON解析失败，返回默认结构
    return createDefaultAnalysisResult(cleanedReply);
  } catch (error) {
    console.error("解析语音分析结果失败:", error);
    return createDefaultAnalysisResult(
      typeof aiResponse === "string" ? aiResponse : aiResponse.content
    );
  }
};

// 创建默认分析结果
const createDefaultAnalysisResult = (content) => {
  return {
    emotions: [
      {
        emotion: "平静",
        percentage: 40,
        color: "#27AE60",
        description: "基于音频特征的一般性分析",
      },
      {
        emotion: "好奇",
        percentage: 30,
        color: "#3498DB",
        description: "表现出探索性行为",
      },
      {
        emotion: "警觉",
        percentage: 20,
        color: "#F39C12",
        description: "对环境保持关注",
      },
      {
        emotion: "其他",
        percentage: 10,
        color: "#95A5A6",
        description: "其他情绪状态",
      },
    ],
    summary: content.substring(0, 200) + "...",
    recommendations: [
      "继续观察宠物的行为变化",
      "保持良好的生活环境",
      "如有异常请及时就医",
    ],
    confidence: 0.7,
  };
};

// 技术分析增强
const enhanceWithTechnicalAnalysis = (analysisResult, technicalData) => {
  const { volumeStats, frequencyStats, behaviorStats } = technicalData;

  // 基于技术数据调整分析结果
  const adjustedEmotions = analysisResult.emotions.map((emotion) => {
    let adjustedPercentage = emotion.percentage;

    // 基于音量方差调整焦虑情绪
    if (emotion.emotion === "焦虑" && volumeStats?.variance) {
      const variance = parseFloat(volumeStats.variance);
      if (variance > 0.02) {
        adjustedPercentage = Math.min(adjustedPercentage + 15, 80);
      }
    }

    // 基于高频能量调整惊怒情绪
    if (emotion.emotion === "惊怒" && frequencyStats?.distribution?.high) {
      const highFreq = parseFloat(frequencyStats.distribution.high);
      if (highFreq > 40) {
        adjustedPercentage = Math.min(adjustedPercentage + 20, 70);
      }
    }

    // 基于静默比例调整平静情绪
    if (emotion.emotion === "平静" && behaviorStats?.silenceRatio) {
      const silenceRatio = parseFloat(behaviorStats.silenceRatio);
      if (silenceRatio > 50) {
        adjustedPercentage = Math.min(adjustedPercentage + 10, 90);
      }
    }

    return {
      ...emotion,
      percentage: Math.round(adjustedPercentage),
    };
  });

  // 重新归一化
  const totalAdjusted = adjustedEmotions.reduce(
    (sum, emotion) => sum + emotion.percentage,
    0
  );

  const normalizedEmotions = adjustedEmotions.map((emotion) => ({
    ...emotion,
    percentage: Math.round((emotion.percentage / totalAdjusted) * 100),
  }));

  return {
    ...analysisResult,
    emotions: normalizedEmotions,
    technicalInsights: generateTechnicalInsights(technicalData),
  };
};

// 生成技术洞察
const generateTechnicalInsights = (technicalData) => {
  const insights = [];
  const { volumeStats, frequencyStats, behaviorStats } = technicalData;

  // 音量分析洞察
  if (volumeStats?.variance && parseFloat(volumeStats.variance) > 0.02) {
    insights.push({
      category: "音量特征",
      finding: "检测到较大的音量变化",
      implication: "可能表示情绪波动或环境刺激反应",
    });
  }

  // 频率分析洞察
  if (
    frequencyStats?.distribution?.high &&
    parseFloat(frequencyStats.distribution.high) > 40
  ) {
    insights.push({
      category: "频率特征",
      finding: "高频能量占比较高",
      implication: "可能表示紧张、兴奋或警觉状态",
    });
  }

  // 行为模式洞察
  if (
    behaviorStats?.silenceRatio &&
    parseFloat(behaviorStats.silenceRatio) > 60
  ) {
    insights.push({
      category: "行为模式",
      finding: "静默时间占比较高",
      implication: "可能表示休息状态或低活跃度",
    });
  }

  return insights;
};
````

---

_这只是功能实现详解的第一部分，由于内容过多，我将继续为您详细说明其他核心功能的实现。每个功能都包含了从前端 UI 交互到后端数据处理的完整技术链路。_
