import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import baimg from "../Image/1.png";
import { authService } from "../services/authService";
import {
  platformInfo,
  qqConfig,
  getDeviceInfo,
  validateQQAppId,
} from "../config/thirdPartyAuth";
import axios from "axios";
import { WechatOutlined } from "@ant-design/icons";
import api from "../services/api";

// 声明微信登录回调接口返回数据类型
interface WxLoginResponse {
  url: string;
  [key: string]: any; // 允许其他未知字段
}

// 预加载图片以确保快速显示
const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
  return img;
};

// 预加载背景图片
preloadImage(baimg);

// 响应式断点
const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1200,
};

// 获取当前屏幕类型
const getScreenType = (width: number) => {
  if (width < breakpoints.mobile) return "mobile";
  if (width < breakpoints.tablet) return "tablet";
  if (width < breakpoints.desktop) return "desktop";
  return "largeDesktop";
};

export default function Login() {
  const navigate = useNavigate();
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showQQModal, setShowQQModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [codeExpired, setCodeExpired] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [screenType, setScreenType] = useState("desktop");

  // 监听屏幕尺寸变化
  useEffect(() => {
    const handleResize = () => {
      setScreenType(getScreenType(window.innerWidth));
    };

    // 初始化
    handleResize();

    // 添加监听器
    window.addEventListener("resize", handleResize);

    // 清理监听器
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = () => {
    setShowLoginOptions(true);
  };

  const handlePhoneLogin = () => {
    setShowPhoneModal(true);
  };

  const handleCloseModal = () => {
    setShowPhoneModal(false);
    setPhoneNumber("");
    setVerificationCode("");
    setGeneratedCode("");
    setCountdown(0);
    setCodeExpired(false);
    setLoginError("");
    setLoginSuccess(false);
  };

  const handleCloseQQModal = () => {
    setShowQQModal(false);
  };

  const generateRandomCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleSendCode = async () => {
    if (phoneNumber && countdown === 0) {
      try {
        setLoginError("");

        // 调用后端API发送验证码
        const response = await api.post("/auth/send-sms", {
          mobile: phoneNumber,
        });

        if (response.data.success) {
          // 模拟验证码（实际应用中不应该返回给前端）
          const code = generateRandomCode();
          setGeneratedCode(code);
          console.log("模拟验证码:", code); // 仅用于开发调试

          setCodeExpired(false);
          setCountdown(60);

          // 60秒后验证码失效
          const expireCodeTimer = setTimeout(() => {
            setCodeExpired(true);
            setGeneratedCode("");
          }, 60000);

          // 开始倒计时
          const countdownTimer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownTimer);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => {
            clearTimeout(expireCodeTimer);
            clearInterval(countdownTimer);
          };
        } else {
          setLoginError(response.data.message || "发送验证码失败");
        }
      } catch (error: any) {
        if (import.meta.env.DEV) {
          console.error("发送验证码失败:", error);
        }
        setLoginError(
          error.response?.data?.message || "发送验证码失败，请稍后重试"
        );

        // 如果后端还没实现，使用模拟验证码 (仅开发环境)
        if (
          import.meta.env.DEV &&
          (error.response?.status === 404 || error.code === "ERR_NETWORK")
        ) {
          console.log("开发环境：后端API未实现，使用模拟验证码");
          const code = generateRandomCode();
          setGeneratedCode(code);
          console.log("开发环境模拟验证码:", code);
          setCodeExpired(false);
          setCountdown(60);
          setLoginError("");
        }
      }
    }
  };

  const handlePhoneSubmit = async () => {
    if (phoneNumber && verificationCode) {
      try {
        setLoginError("");

        // 调用后端API进行短信验证登录
        const response = await api.post("/auth/sms-login", {
          mobile: phoneNumber,
          code: verificationCode,
        });

        if (response.data.success) {
          const { token, user } = response.data.data;

          // 使用AuthContext保存登录状态
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          setLoginSuccess(true);
          if (import.meta.env.DEV) {
            console.log("手机号登录成功:", { phoneNumber, user });
          }

          // 显示成功状态2秒后跳转到home页面
          setTimeout(() => {
            handleCloseModal();
            navigate("/home");
            // 刷新页面以确保AuthContext更新
            window.location.reload();
          }, 2000);
        } else {
          setLoginError(response.data.message || "登录失败");
          setLoginSuccess(false);
        }
      } catch (error: any) {
        console.error("手机号登录失败:", error);

        // 如果后端还没实现SMS登录，使用模拟验证
        if (error.response?.status === 404 || error.code === "ERR_NETWORK") {
          console.log("后端SMS登录API未实现，使用模拟验证");

          // 检查验证码是否已失效
          if (codeExpired || !generatedCode) {
            setLoginError("验证码已失效，请重新获取");
            setLoginSuccess(false);
            return;
          }

          // 验证验证码是否正确
          if (verificationCode === generatedCode) {
            // 创建模拟用户数据
            const mockUser = {
              id: Date.now().toString(),
              username: phoneNumber,
              mobile: phoneNumber,
              nickname: `用户${phoneNumber.slice(-4)}`,
              loginType: "sms",
              isVerified: true,
              lastLoginAt: new Date().toISOString(),
            };

            const mockToken = `mock_token_${Date.now()}`;

            // 保存到localStorage
            localStorage.setItem("token", mockToken);
            localStorage.setItem("user", JSON.stringify(mockUser));

            setLoginError("");
            setLoginSuccess(true);
            console.log("模拟手机号登录成功:", { phoneNumber, user: mockUser });

            // 显示成功状态2秒后跳转到home页面
            setTimeout(() => {
              handleCloseModal();
              navigate("/home");
              // 刷新页面以确保AuthContext更新
              window.location.reload();
            }, 2000);
          } else {
            setLoginError("验证码错误，请重新输入");
            setLoginSuccess(false);
            console.log("验证码错误:", {
              input: verificationCode,
              correct: generatedCode,
            });
          }
        } else {
          setLoginError(error.response?.data?.message || "登录失败，请重试");
          setLoginSuccess(false);
        }
      }
    }
  };

  const handleOtherPhoneLogin = () => {
    console.log("其它手机号登录");
    // 这里可以添加其它手机号登录的逻辑
    // 暂时也跳转到home页面作为演示
    navigate("/home");
  };

  const handleThirdPartyLogin = (platform: "qq" | "wechat" | "weibo") => {
    if (platform === "qq") {
      // QQ登录弹出模态框
      setShowQQModal(true);
    } else if (platform === "wechat") {
      // 微信登录使用WechatLogin组件处理
      console.log("微信登录由WechatLogin组件处理");
    } else {
      // 其他平台直接跳转
      try {
        console.log(`正在启动${platformInfo[platform].name}登录...`);
        authService.initiateThirdPartyLogin(platform);
      } catch (error) {
        console.error("第三方登录启动失败:", error);
        navigate("/home");
      }
    }
  };

  const handleWechatLogin = async (): Promise<void> => {
    // 清除 baseURL（或设置为其他值）
    axios.defaults.baseURL = "";
    try {
      const response = await axios.get<WxLoginResponse>("/api", {
        params: {
          act: "login",
          appid: "3822", // 自己去官网申请
          appkey: "93154ff118b16b5371aa260e35ba49cd", // 自己去官网申请
          type: "wx",
          redirect_uri: "http://127.0.0.1:5173/home", // 回调地址
        },
      });
      sessionStorage.setItem("longtermToken", "hhhhnxsm");
      window.open(response.data.url, "_self"); // 打开第三方登录页面
    } catch (error) {
      console.error("微信登录请求失败:", error);
      // Toast.show({
      //   icon: 'fail',
      //   content: '登录请求失败，请重试',
      //   duration: 2000
      // });
      alert("登录请求失败，请重试");
    }
  };

  const handleQQLoginConfirm = () => {
    try {
      console.log("正在启动QQ登录...");

      // 先关闭模态框
      handleCloseQQModal();

      // 延迟一下再跳转，让用户看到模态框关闭的动画
      setTimeout(() => {
        authService.initiateThirdPartyLogin("qq");
      }, 300);
    } catch (error) {
      console.error("QQ登录启动失败:", error);
      handleCloseQQModal();
      // 如果QQ登录配置有问题，暂时跳转到home页面作为演示
      navigate("/home");
    }
  };

  // 响应式样式函数
  const getResponsiveStyles = () => {
    const isMobile = screenType === "mobile";
    const isTablet = screenType === "tablet";

    return {
      container: {
        padding: isMobile ? "15px" : isTablet ? "20px" : "20px",
        paddingBottom: isMobile ? "80px" : isTablet ? "100px" : "140px",
        minHeight: "100vh",
      },
      avatar: {
        width: isMobile ? "80px" : isTablet ? "100px" : "120px",
        height: isMobile ? "80px" : isTablet ? "100px" : "120px",
        marginBottom: isMobile ? "25px" : isTablet ? "30px" : "40px",
      },
      loginButton: {
        padding: isMobile ? "12px 30px" : isTablet ? "14px 35px" : "15px 40px",
        fontSize: isMobile ? "16px" : isTablet ? "17px" : "18px",
        minWidth: isMobile ? "100px" : isTablet ? "110px" : "120px",
        marginBottom: isMobile ? "40px" : isTablet ? "50px" : "60px",
      },
      optionButton: {
        padding: isMobile ? "12px 25px" : isTablet ? "14px 28px" : "15px 30px",
        fontSize: isMobile ? "14px" : isTablet ? "15px" : "16px",
        minWidth: isMobile ? "160px" : isTablet ? "180px" : "200px",
      },
      thirdPartyIcon: {
        width: isMobile ? "40px" : isTablet ? "45px" : "50px",
        height: isMobile ? "40px" : isTablet ? "45px" : "50px",
        fontSize: isMobile ? "18px" : isTablet ? "20px" : "24px",
      },
      thirdPartyContainer: {
        gap: isMobile ? "15px" : isTablet ? "20px" : "25px",
        marginBottom: isMobile ? "20px" : isTablet ? "30px" : "40px",
      },
      bottomApp: {
        bottom: isMobile ? "40px" : isTablet ? "60px" : "80px",
        padding: isMobile ? "8px 20px" : isTablet ? "10px 25px" : "12px 30px",
        fontSize: isMobile ? "14px" : isTablet ? "15px" : "16px",
      },
    };
  };

  const styles = getResponsiveStyles();

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: `
         linear-gradient(135deg, rgba(184, 134, 11, 0.15) 0%, rgba(255, 215, 0, 0.1) 50%, rgba(184, 134, 11, 0.15) 100%),
         url(${baimg})
       `,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundAttachment: screenType === "mobile" ? "scroll" : "fixed",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        ...styles.container,
        // 添加高清显示优化
        imageRendering: "crisp-edges",
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
        // 添加轻微的滤镜增强效果
        filter: "contrast(1.08) brightness(1.05) saturate(1.15)",
        // 确保高分辨率屏幕的清晰度
        WebkitTransform: "translateZ(0)",
        transform: "translateZ(0)",
        // 添加视口单位支持
        minHeight: screenType === "mobile" ? "100dvh" : "100vh",
      }}
    >
      {/* 装饰性背景元素 */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "10%",
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          background:
            "linear-gradient(45deg, rgba(255, 215, 0, 0.2), rgba(184, 134, 11, 0.1))",
          animation: "float 6s ease-in-out infinite",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "15%",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background:
            "linear-gradient(45deg, rgba(184, 134, 11, 0.15), rgba(255, 215, 0, 0.1))",
          animation: "float 4s ease-in-out infinite reverse",
          zIndex: 1,
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "30%",
          left: "5%",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background:
            "linear-gradient(45deg, rgba(255, 215, 0, 0.1), rgba(184, 134, 11, 0.2))",
          animation: "float 5s ease-in-out infinite",
          zIndex: 1,
        }}
      />

      {/* 猫咪头像 */}
      <div
        style={{
          ...styles.avatar,
          borderRadius: "50%",
          overflow: "hidden",
          border:
            screenType === "mobile"
              ? "4px solid rgba(255, 255, 255, 0.9)"
              : "5px solid rgba(255, 255, 255, 0.9)",
          boxShadow: `
          0 20px 40px rgba(0, 0, 0, 0.2),
          0 10px 20px rgba(184, 134, 11, 0.1),
          inset 0 0 0 1px rgba(255, 215, 0, 0.2)
        `,
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          zIndex: 10,
          animation: "avatarPulse 3s ease-in-out infinite",
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&crop=face"
          alt="猫咪头像"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {!showLoginOptions ? (
        // 初始登录按钮
        <button
          onClick={handleLogin}
          style={{
            background: "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)",
            color: "#2c3e50",
            border: "none",
            borderRadius: screenType === "mobile" ? "25px" : "30px",
            ...styles.loginButton,
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: `
              0 8px 25px rgba(255, 215, 0, 0.4),
              0 4px 15px rgba(184, 134, 11, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            zIndex: 10,
            overflow: "hidden",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
          }}
          onMouseOver={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.background =
              "linear-gradient(135deg, #FFC107 0%, #9A7209 100%)";
            target.style.transform = "translateY(-3px) scale(1.02)";
            target.style.boxShadow = `
              0 12px 35px rgba(255, 215, 0, 0.5),
              0 6px 25px rgba(184, 134, 11, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.3)
            `;
          }}
          onMouseOut={(e) => {
            const target = e.target as HTMLButtonElement;
            target.style.background =
              "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)";
            target.style.transform = "translateY(0) scale(1)";
            target.style.boxShadow = `
              0 8px 25px rgba(255, 215, 0, 0.4),
              0 4px 15px rgba(184, 134, 11, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `;
          }}
        >
          登录
        </button>
      ) : (
        // 登录选项界面
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: screenType === "mobile" ? "12px" : "15px",
            marginBottom: screenType === "mobile" ? "40px" : "60px",
          }}
        >
          {/* 手机号码一键登录 */}
          <button
            onClick={handlePhoneLogin}
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)",
              color: "#2c3e50",
              border: "1px solid rgba(255, 215, 0, 0.3)",
              borderRadius: screenType === "mobile" ? "20px" : "25px",
              ...styles.optionButton,
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: `
                0 8px 25px rgba(0, 0, 0, 0.1),
                0 4px 15px rgba(255, 215, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.8)
              `,
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              backdropFilter: "blur(20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseOver={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background =
                "linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)";
              target.style.transform = "translateY(-2px) scale(1.02)";
              target.style.boxShadow = `
                0 12px 35px rgba(0, 0, 0, 0.15),
                0 6px 25px rgba(255, 215, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.9)
              `;
            }}
            onMouseOut={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.background =
                "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%)";
              target.style.transform = "translateY(0) scale(1)";
              target.style.boxShadow = `
                0 8px 25px rgba(0, 0, 0, 0.1),
                0 4px 15px rgba(255, 215, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.8)
              `;
            }}
          >
            📱 手机号码一键登录
          </button>

          {/* 其它手机号登录 */}
          <button
            onClick={handleOtherPhoneLogin}
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)",
              color: "#2c3e50",
              border: "1px solid rgba(184, 134, 11, 0.3)",
              borderRadius: screenType === "mobile" ? "20px" : "25px",
              ...styles.optionButton,
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: `
                0 6px 20px rgba(0, 0, 0, 0.08),
                0 3px 12px rgba(184, 134, 11, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.7)
              `,
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              backdropFilter: "blur(15px)",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseOver={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = "rgba(139, 115, 85, 1)";
              target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = "rgba(139, 115, 85, 0.8)";
              target.style.transform = "translateY(0)";
            }}
          >
            其它手机号登录
          </button>
        </div>
      )}

      {showLoginOptions && (
        <>
          {/* 其它方式登录 - 固定在底部 */}
          <div
            style={{
              position: "absolute",
              bottom:
                screenType === "mobile"
                  ? "80px"
                  : screenType === "tablet"
                  ? "100px"
                  : "120px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* 其它方式登录文字 */}
            <div
              style={{
                color: "white",
                fontSize: screenType === "mobile" ? "13px" : "14px",
                marginBottom: screenType === "mobile" ? "15px" : "20px",
                textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              其它方式登录
            </div>

            {/* 第三方登录图标 */}
            <div
              style={{
                display: "flex",
                ...styles.thirdPartyContainer,
              }}
            >
              {/* 微信 */}
              <div
                onClick={handleWechatLogin}
                style={{
                  ...styles.thirdPartyIcon,
                  background:
                    "linear-gradient(135deg, #07C160 0%, #05A050 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: "none",
                  boxShadow:
                    "0 8px 25px rgba(7, 193, 96, 0.4), 0 4px 15px rgba(7, 193, 96, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                  fontSize: "24px",
                }}
                onMouseOut={(e) => {
                  const target = e.target as HTMLDivElement;
                  target.style.transform = "scale(1) translateY(0)";
                  target.style.background =
                    "linear-gradient(135deg, #07C160 0%, #05A050 100%)";
                  target.style.boxShadow =
                    "0 8px 25px rgba(7, 193, 96, 0.4), 0 4px 15px rgba(7, 193, 96, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
                }}
              >
                <WechatOutlined className="wechat-icon" />
              </div>

              {/* QQ */}
              <div
                onClick={() => handleThirdPartyLogin("qq")}
                style={{
                  ...styles.thirdPartyIcon,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #1296DB 0%, #0E7BB8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: `
                  0 8px 25px rgba(18, 150, 219, 0.4),
                  0 4px 15px rgba(18, 150, 219, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseOver={(e) => {
                  const target = e.target as HTMLDivElement;
                  target.style.transform = "scale(1.1)";
                  target.style.boxShadow = "0 6px 20px rgba(18, 150, 219, 0.4)";
                }}
                onMouseOut={(e) => {
                  const target = e.target as HTMLDivElement;
                  target.style.transform = "scale(1)";
                  target.style.boxShadow = "0 4px 15px rgba(18, 150, 219, 0.3)";
                }}
              >
                🐧
              </div>

              {/* 微博 */}
              <div
                onClick={() => handleThirdPartyLogin("weibo")}
                style={{
                  ...styles.thirdPartyIcon,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #E6162D 0%, #C01428 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: `
                  0 8px 25px rgba(230, 22, 45, 0.4),
                  0 4px 15px rgba(230, 22, 45, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseOut={(e) => {
                  const target = e.target as HTMLDivElement;
                  target.style.transform = "scale(1)";
                  target.style.boxShadow = "0 4px 15px rgba(230, 22, 45, 0.3)";
                }}
              >
                📺
              </div>
            </div>
          </div>
        </>
      )}

      {!showLoginOptions && (
        <>
          {/* 底部应用名称 */}
          <div
            style={{
              position: "absolute",
              ...styles.bottomApp,
              backgroundColor: "rgba(139, 69, 19, 0.8)",
              color: "white",
              borderRadius: screenType === "mobile" ? "15px" : "20px",
              fontWeight: "500",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
            }}
          >
            宠物智能养育App
          </div>

          {/* 装饰性的小图标 */}
          <div
            style={{
              position: "absolute",
              top: screenType === "mobile" ? "40px" : "60px",
              right: screenType === "mobile" ? "20px" : "30px",
              fontSize: screenType === "mobile" ? "20px" : "24px",
              opacity: 0.6,
            }}
          >
            🐾
          </div>

          <div
            style={{
              position: "absolute",
              bottom:
                screenType === "mobile"
                  ? "140px"
                  : screenType === "tablet"
                  ? "170px"
                  : "200px",
              left: screenType === "mobile" ? "20px" : "30px",
              fontSize: screenType === "mobile" ? "16px" : "20px",
              opacity: 0.5,
            }}
          >
            🐱
          </div>
        </>
      )}

      {/* 手机号登录模态框 */}
      {showPhoneModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)",
              borderRadius: "25px",
              padding: "40px 35px",
              width: screenType === "mobile" ? "90%" : "85%",
              maxWidth: "420px",
              minHeight: "400px",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: `
              0 25px 80px rgba(0, 0, 0, 0.3),
              0 15px 40px rgba(184, 134, 11, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `,
              position: "relative",
              margin: "20px",
              backdropFilter: "blur(20px)",
              display: "flex",
              flexDirection: "column",
              border: "1px solid rgba(255, 215, 0, 0.2)",
              animation: "scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={handleCloseModal}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6))",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                fontSize: "20px",
                cursor: "pointer",
                color: "#666",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
              }}
              onMouseOver={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background =
                  "linear-gradient(135deg, #ff6b6b, #ee5a52)";
                target.style.color = "white";
                target.style.transform = "scale(1.1)";
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background =
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6))";
                target.style.color = "#666";
                target.style.transform = "scale(1)";
              }}
            >
              ×
            </button>

            {/* 标题 */}
            <div style={{ textAlign: "center", marginBottom: "35px" }}>
              <div
                style={{
                  fontSize: "48px",
                  marginBottom: "16px",
                  background: "linear-gradient(135deg, #FFD700, #B8860B)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                📱
              </div>
              <h2
                style={{
                  margin: 0,
                  color: "#2c3e50",
                  fontSize: screenType === "mobile" ? "20px" : "24px",
                  fontWeight: "700",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                手机号登录
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#7f8c8d",
                  fontSize: "14px",
                  fontWeight: "400",
                }}
              >
                请输入您的手机号码获取验证码
              </p>

              {/* 验证码已发送提示 */}
              {generatedCode && !codeExpired && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px 16px",
                    backgroundColor: "rgba(74, 144, 226, 0.1)",
                    border: "2px solid rgba(74, 144, 226, 0.3)",
                    borderRadius: "12px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      margin: "0",
                      fontSize: "14px",
                      color: "#4a90e2",
                      fontWeight: "500",
                    }}
                  >
                    ✅ 验证码已发送到您的手机，请查收短信
                  </p>
                </div>
              )}

              {/* 验证码失效提示 */}
              {codeExpired && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "16px 20px",
                    background:
                      "linear-gradient(135deg, rgba(255, 77, 79, 0.08) 0%, rgba(255, 77, 79, 0.12) 100%)",
                    border: "1px solid rgba(255, 77, 79, 0.25)",
                    borderRadius: "16px",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* 装饰性背景 */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-50%",
                      right: "-50%",
                      width: "200%",
                      height: "200%",
                      background:
                        "radial-gradient(circle, rgba(255, 77, 79, 0.05) 0%, transparent 70%)",
                      animation: "float 3s ease-in-out infinite reverse",
                    }}
                  />

                  <div
                    style={{
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "18px",
                          animation: "bounce 1.5s infinite",
                        }}
                      >
                        ⏰
                      </span>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#ff4d4f",
                          fontWeight: "600",
                        }}
                      >
                        验证码已失效
                      </p>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#ff7875",
                        lineHeight: "1.4",
                      }}
                    >
                      请重新获取验证码
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 手机号输入框 */}
            <div style={{ marginBottom: "20px" }}>
              <input
                type="tel"
                placeholder="请输入手机号"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={{
                  width: "100%",
                  padding: "18px 20px",
                  border: "2px solid #e8e8e8",
                  borderRadius: "15px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = "#FFD700";
                  (e.target as HTMLInputElement).style.background =
                    "rgba(255, 255, 255, 0.95)";
                  (e.target as HTMLInputElement).style.boxShadow =
                    "0 0 0 3px rgba(255, 215, 0, 0.15)";
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = "#e8e8e8";
                  (e.target as HTMLInputElement).style.background =
                    "rgba(255, 255, 255, 0.8)";
                  (e.target as HTMLInputElement).style.boxShadow = "none";
                }}
              />
            </div>

            {/* 验证码输入框和发送按钮 */}
            <div
              style={{
                display: "flex",
                gap: screenType === "mobile" ? "6px" : "10px",
                marginBottom: "30px",
                alignItems: "center",
                width: "100%",
              }}
            >
              <input
                type="text"
                placeholder="请输入验证码"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value);
                  // 清除错误提示
                  if (loginError) {
                    setLoginError("");
                  }
                }}
                style={{
                  flex: "1 1 auto",
                  minWidth: 0,
                  padding: "18px 20px",
                  border: "2px solid #e8e8e8",
                  borderRadius: "15px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                  background: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = "#FFD700";
                  (e.target as HTMLInputElement).style.background =
                    "rgba(255, 255, 255, 0.95)";
                  (e.target as HTMLInputElement).style.boxShadow =
                    "0 0 0 3px rgba(255, 215, 0, 0.15)";
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = "#e8e8e8";
                  (e.target as HTMLInputElement).style.background =
                    "rgba(255, 255, 255, 0.8)";
                  (e.target as HTMLInputElement).style.boxShadow = "none";
                }}
              />
              <button
                onClick={handleSendCode}
                disabled={!phoneNumber || countdown > 0}
                style={{
                  padding: "18px 16px",
                  background:
                    phoneNumber && countdown === 0
                      ? "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)"
                      : "linear-gradient(135deg, #e0e0e0, #d0d0d0)",
                  color: phoneNumber && countdown === 0 ? "#2c3e50" : "#999",
                  border: "none",
                  borderRadius: "15px",
                  fontSize: screenType === "mobile" ? "12px" : "13px",
                  fontWeight: "600",
                  cursor:
                    phoneNumber && countdown === 0 ? "pointer" : "not-allowed",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                  minWidth: screenType === "mobile" ? "90px" : "110px",
                  maxWidth: screenType === "mobile" ? "120px" : "140px",
                  width: "fit-content",
                  flexShrink: 0,
                  textAlign: "center",
                  overflow: "visible",
                  boxSizing: "border-box",
                  boxShadow:
                    phoneNumber && countdown === 0
                      ? "0 4px 15px rgba(255, 215, 0, 0.3)"
                      : "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
                onMouseOver={(e) => {
                  if (phoneNumber && countdown === 0) {
                    (e.target as HTMLButtonElement).style.background =
                      "linear-gradient(135deg, #FFC107, #9A7209)";
                    (e.target as HTMLButtonElement).style.transform =
                      "translateY(-1px)";
                  }
                }}
                onMouseOut={(e) => {
                  if (phoneNumber && countdown === 0) {
                    (e.target as HTMLButtonElement).style.background =
                      "linear-gradient(135deg, #FFD700, #B8860B)";
                    (e.target as HTMLButtonElement).style.transform =
                      "translateY(0)";
                  }
                }}
              >
                {countdown > 0
                  ? `${countdown}s后重发`
                  : screenType === "mobile"
                  ? "获取验证码"
                  : "发送验证码"}
              </button>
            </div>

            {/* 错误提示 */}
            {loginError && (
              <div
                style={{
                  marginBottom: "15px",
                  padding: "12px 16px",
                  backgroundColor: "rgba(255, 77, 79, 0.1)",
                  border: "2px solid rgba(255, 77, 79, 0.3)",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    color: "#ff4d4f",
                    fontWeight: "500",
                  }}
                >
                  ❌ {loginError}
                </p>
              </div>
            )}

            {/* 成功提示 */}
            {loginSuccess && (
              <div
                style={{
                  marginBottom: "15px",
                  padding: "16px 20px",
                  background:
                    "linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(82, 196, 26, 0.15) 100%)",
                  border: "1px solid rgba(82, 196, 26, 0.3)",
                  borderRadius: "16px",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* 装饰性背景 */}
                <div
                  style={{
                    position: "absolute",
                    top: "-50%",
                    left: "-50%",
                    width: "200%",
                    height: "200%",
                    background:
                      "radial-gradient(circle, rgba(82, 196, 26, 0.08) 0%, transparent 70%)",
                    animation: "float 2s ease-in-out infinite",
                  }}
                />

                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "18px",
                        animation: "bounce 1s infinite",
                      }}
                    >
                      ✅
                    </span>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        color: "#52c41a",
                        fontWeight: "600",
                      }}
                    >
                      登录成功！
                    </p>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: "#73d13d",
                      lineHeight: "1.4",
                    }}
                  >
                    正在跳转到首页...
                  </p>
                </div>
              </div>
            )}

            {/* 登录按钮 */}
            <button
              onClick={handlePhoneSubmit}
              disabled={!phoneNumber || !verificationCode || loginSuccess}
              style={{
                width: "100%",
                padding: "18px",
                background:
                  phoneNumber && verificationCode && !loginSuccess
                    ? "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)"
                    : loginSuccess
                    ? "linear-gradient(135deg, #52c41a, #389e0d)"
                    : "linear-gradient(135deg, #e0e0e0, #d0d0d0)",
                color: phoneNumber && verificationCode ? "#2c3e50" : "#999",
                border: "none",
                borderRadius: "15px",
                fontSize: "18px",
                fontWeight: "700",
                cursor:
                  phoneNumber && verificationCode && !loginSuccess
                    ? "pointer"
                    : "not-allowed",
                transition: "all 0.3s ease",
                marginBottom: "25px",
                boxShadow:
                  phoneNumber && verificationCode && !loginSuccess
                    ? "0 8px 25px rgba(255, 215, 0, 0.4)"
                    : loginSuccess
                    ? "0 8px 25px rgba(82, 196, 26, 0.4)"
                    : "0 4px 15px rgba(0, 0, 0, 0.1)",
                textShadow:
                  phoneNumber && verificationCode
                    ? "0 1px 2px rgba(0, 0, 0, 0.1)"
                    : "none",
              }}
              onMouseOver={(e) => {
                if (phoneNumber && verificationCode && !loginSuccess) {
                  (e.target as HTMLButtonElement).style.background =
                    "linear-gradient(135deg, #FFC107, #9A7209)";
                  (e.target as HTMLButtonElement).style.transform =
                    "translateY(-2px)";
                  (e.target as HTMLButtonElement).style.boxShadow =
                    "0 12px 35px rgba(255, 215, 0, 0.5)";
                }
              }}
              onMouseOut={(e) => {
                if (phoneNumber && verificationCode && !loginSuccess) {
                  (e.target as HTMLButtonElement).style.background =
                    "linear-gradient(135deg, #FFD700, #B8860B)";
                  (e.target as HTMLButtonElement).style.transform =
                    "translateY(0)";
                  (e.target as HTMLButtonElement).style.boxShadow =
                    "0 8px 25px rgba(255, 215, 0, 0.4)";
                }
              }}
            >
              {loginSuccess ? "✅ 登录成功" : "立即登录"}
            </button>

            {/* 提示文字 */}
            <p
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#95a5a6",
                lineHeight: "1.5",
                margin: 0,
              }}
            >
              登录即表示同意
              <span style={{ color: "#FFD700", cursor: "pointer" }}>
                《用户协议》
              </span>
              和
              <span style={{ color: "#FFD700", cursor: "pointer" }}>
                《隐私政策》
              </span>
            </p>
          </div>
        </div>
      )}

      {/* QQ登录模态框 */}
      {showQQModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)",
              borderRadius: "25px",
              padding: "40px 35px",
              width: screenType === "mobile" ? "90%" : "85%",
              maxWidth: "380px",
              minHeight: "400px",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: `
              0 25px 80px rgba(0, 0, 0, 0.3),
              0 15px 40px rgba(18, 150, 219, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `,
              position: "relative",
              margin: "20px",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(18, 150, 219, 0.2)",
              animation: "scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={handleCloseQQModal}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6))",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                fontSize: "20px",
                cursor: "pointer",
                color: "#666",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
              }}
              onMouseOver={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background =
                  "linear-gradient(135deg, #ff6b6b, #ee5a52)";
                target.style.color = "white";
                target.style.transform = "scale(1.1)";
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background =
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6))";
                target.style.color = "#666";
                target.style.transform = "scale(1)";
              }}
            >
              ×
            </button>

            {/* QQ登录标题 */}
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <div
                style={{
                  fontSize: "64px",
                  marginBottom: "16px",
                  background: "linear-gradient(135deg, #1296DB, #0E7BB8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "bounce 2s infinite",
                }}
              >
                🐧
              </div>
              <h2
                style={{
                  margin: 0,
                  color: "#2c3e50",
                  fontSize: screenType === "mobile" ? "20px" : "24px",
                  fontWeight: "700",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                QQ登录
              </h2>
              <p
                style={{
                  margin: "8px 0 0 0",
                  color: "#7f8c8d",
                  fontSize: "14px",
                  fontWeight: "400",
                }}
              >
                使用您的QQ账号快速登录
              </p>
            </div>

            {/* QQ登录说明 */}
            <div
              style={{
                padding: "20px",
                background:
                  "linear-gradient(135deg, rgba(18, 150, 219, 0.05) 0%, rgba(18, 150, 219, 0.1) 100%)",
                borderRadius: "16px",
                marginBottom: "25px",
                border: "1px solid rgba(18, 150, 219, 0.15)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1296DB, #0E7BB8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                  }}
                >
                  {getDeviceInfo().isDesktop ? "💻" : "📱"}
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "#2c3e50",
                      fontWeight: "600",
                    }}
                  >
                    智能登录
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      color: "#7f8c8d",
                    }}
                  >
                    {getDeviceInfo().isDesktop
                      ? "电脑端QQ网页版登录"
                      : "手机端QQ客户端登录"}
                  </p>
                </div>
              </div>

              <ul
                style={{
                  margin: 0,
                  padding: "0 0 0 16px",
                  fontSize: "12px",
                  color: "#666",
                  lineHeight: "1.6",
                }}
              >
                {getDeviceInfo().isDesktop ? (
                  <>
                    <li>🖥️ 在新窗口打开QQ登录</li>
                    <li>🔒 安全的网页版授权</li>
                    <li>⚡ 快速便捷登录体验</li>
                  </>
                ) : (
                  <>
                    <li>📱 优先唤起QQ手机客户端</li>
                    <li>🔄 自动回退到网页版</li>
                    <li>⚡ 一键快速登录体验</li>
                  </>
                )}
              </ul>
            </div>

            {/* 调试信息 */}
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "rgba(255, 193, 7, 0.1)",
                border: "1px solid rgba(255, 193, 7, 0.3)",
                borderRadius: "12px",
                marginBottom: "20px",
                fontSize: "11px",
                color: "#B8860B",
              }}
            >
              <p style={{ margin: "0 0 4px 0", fontWeight: "600" }}>
                🔧 调试信息：
              </p>
              <p style={{ margin: "0 0 2px 0" }}>
                设备类型: {getDeviceInfo().isDesktop ? "电脑端" : "移动端"}
              </p>
              <p style={{ margin: "0 0 2px 0" }}>
                APP ID: {qqConfig.appId}
                <span
                  style={{
                    color: validateQQAppId(qqConfig.appId)
                      ? "#28a745"
                      : "#dc3545",
                    marginLeft: "8px",
                    fontSize: "10px",
                  }}
                >
                  {validateQQAppId(qqConfig.appId) ? "✓ 有效" : "✗ 无效"}
                </span>
              </p>
              <p style={{ margin: "0 0 2px 0" }}>
                回调地址: {qqConfig.redirectUri}
              </p>
              <p style={{ margin: 0 }}>权限范围: {qqConfig.scope}</p>
            </div>

            {/* 登录按钮 */}
            <button
              onClick={handleQQLoginConfirm}
              style={{
                width: "100%",
                padding: "18px",
                background: "linear-gradient(135deg, #1296DB 0%, #0E7BB8 100%)",
                color: "white",
                border: "none",
                borderRadius: "15px",
                fontSize: "18px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s ease",
                marginBottom: "15px",
                boxShadow: "0 8px 25px rgba(18, 150, 219, 0.4)",
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                minHeight: "56px",
                flexShrink: 0,
              }}
              onMouseOver={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background =
                  "linear-gradient(135deg, #40A9FF, #1296DB)";
                target.style.transform = "translateY(-2px)";
                target.style.boxShadow = "0 12px 35px rgba(18, 150, 219, 0.5)";
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background =
                  "linear-gradient(135deg, #1296DB, #0E7BB8)";
                target.style.transform = "translateY(0)";
                target.style.boxShadow = "0 8px 25px rgba(18, 150, 219, 0.4)";
              }}
            >
              <span>{getDeviceInfo().isDesktop ? "💻" : "📱"}</span>
              <span>
                {getDeviceInfo().isDesktop ? "电脑端QQ登录" : "手机端QQ登录"}
              </span>
            </button>

            {/* 取消按钮 */}
            <button
              onClick={handleCloseQQModal}
              style={{
                width: "100%",
                padding: "16px",
                background: "transparent",
                color: "#999",
                border: "1px solid #e8e8e8",
                borderRadius: "15px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.3s ease",
                minHeight: "48px",
                flexShrink: 0,
              }}
              onMouseOver={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = "#f5f5f5";
                target.style.color = "#666";
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.backgroundColor = "transparent";
                target.style.color = "#999";
              }}
            >
              取消
            </button>

            {/* 提示文字 */}
            <p
              style={{
                textAlign: "center",
                fontSize: "11px",
                color: "#95a5a6",
                lineHeight: "1.5",
                margin: "16px 0 0 0",
              }}
            >
              登录即表示同意
              <span style={{ color: "#1296DB", cursor: "pointer" }}>
                《用户协议》
              </span>
              和
              <span style={{ color: "#1296DB", cursor: "pointer" }}>
                《隐私政策》
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
