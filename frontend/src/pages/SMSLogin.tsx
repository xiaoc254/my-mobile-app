// SMSLogin.tsx - 手机号验证码登录页面
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Toast } from "antd-mobile";
import { useResponsive, createResponsiveStyles } from "../hooks/useResponsive";
import smsService from "../services/smsService";

export default function SMSLogin() {
  const navigate = useNavigate();
  const responsive = useResponsive();
  const styles = createResponsiveStyles(responsive);

  const [step, setStep] = useState<"input" | "verify">("input"); // 步骤：输入手机号 或 验证码
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async () => {
    if (!smsService.validateMobile(mobile)) {
      Toast.show("请输入有效的手机号");
      return;
    }

    setLoading(true);
    try {
      const result = await smsService.sendVerificationCode(mobile);

      if (result.success) {
        Toast.show("验证码发送成功，请查收短信");
        setIsCodeSent(true);
        setCountdown(60); // 60秒倒计时
        setStep("verify"); // 切换到验证码输入步骤
      } else {
        Toast.show(result.message || "发送失败");
      }
    } catch (error) {
      Toast.show("发送失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 验证验证码
  const handleVerifyCode = async () => {
    if (!code.trim()) {
      Toast.show("请输入验证码");
      return;
    }

    if (code.length !== 6) {
      Toast.show("请输入6位验证码");
      return;
    }

    setLoading(true);
    try {
      const result = await smsService.verifyCode(mobile, code);

      if (result.success) {
        Toast.show("验证成功");
        // 这里可以保存用户信息到localStorage
        localStorage.setItem("userId", mobile);
        localStorage.setItem("username", mobile);
        localStorage.setItem("token", "sms_token_" + Date.now());

        // 跳转到首页
        navigate("/");
      } else {
        Toast.show(result.message || "验证失败");
        if (result.remainingAttempts !== undefined) {
          Toast.show(`剩余尝试次数：${result.remainingAttempts}`);
        }
      }
    } catch (error) {
      Toast.show("验证失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 重新发送验证码
  const handleResendCode = () => {
    if (countdown > 0) return;
    handleSendCode();
  };

  // 返回上一步
  const handleBack = () => {
    setStep("input");
    setCode("");
    setIsCodeSent(false);
    setCountdown(0);
  };

  return (
    <div
      style={{
        ...styles.pageContainer,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: responsive.isMobile ? "90%" : "400px",
          padding: responsive.isMobile ? "20px" : "30px",
        }}
      >
        {/* 卡片容器 */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: responsive.isMobile ? "30px 20px" : "40px 30px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* 标题 */}
          <div
            style={{
              textAlign: "center",
              marginBottom: responsive.isMobile ? "30px" : "40px",
            }}
          >
            <h1
              style={{
                fontSize: responsive.isMobile ? "24px" : "28px",
                fontWeight: "700",
                color: "#333",
                margin: "0 0 8px 0",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {step === "input" ? "手机号登录" : "验证码验证"}
            </h1>
            <p
              style={{
                fontSize: responsive.isMobile ? "14px" : "16px",
                color: "#666",
                margin: 0,
              }}
            >
              {step === "input"
                ? "请输入您的手机号码"
                : `验证码已发送至 ${smsService.formatMobile(mobile)}`}
            </p>
          </div>

          {step === "input" ? (
            // 手机号输入步骤
            <div>
              <div style={{ marginBottom: "20px" }}>
                <Input
                  type="tel"
                  placeholder="请输入手机号"
                  value={mobile}
                  onChange={setMobile}
                  maxLength={11}
                  style={{
                    fontSize: responsive.isMobile ? "16px" : "18px",
                    height: responsive.isMobile ? "48px" : "52px",
                    borderRadius: "12px",
                    border: "2px solid #f0f0f0",
                    textAlign: "center",
                  }}
                />
              </div>

              <Button
                color="primary"
                block
                loading={loading}
                onClick={handleSendCode}
                disabled={!smsService.validateMobile(mobile)}
                style={{
                  height: responsive.isMobile ? "48px" : "52px",
                  fontSize: responsive.isMobile ? "16px" : "18px",
                  fontWeight: "600",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                }}
              >
                发送验证码
              </Button>

              {/* 提示信息 */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "12px",
                  backgroundColor: "#f0f9ff",
                  borderRadius: "8px",
                  border: "1px solid #bae6fd",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#0369a1",
                    lineHeight: "1.5",
                    textAlign: "center",
                  }}
                >
                  我们将向您的手机号发送验证码，请确保手机号正确
                </div>
              </div>
            </div>
          ) : (
            // 验证码输入步骤
            <div>
              <div style={{ marginBottom: "20px" }}>
                <Input
                  type="text"
                  placeholder="请输入6位验证码"
                  value={code}
                  onChange={setCode}
                  maxLength={6}
                  style={{
                    fontSize: responsive.isMobile ? "16px" : "18px",
                    height: responsive.isMobile ? "48px" : "52px",
                    borderRadius: "12px",
                    border: "2px solid #f0f0f0",
                    textAlign: "center",
                    letterSpacing: "2px",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <Button
                  color="primary"
                  block
                  loading={loading}
                  onClick={handleVerifyCode}
                  disabled={!code.trim() || code.length !== 6}
                  style={{
                    height: responsive.isMobile ? "48px" : "52px",
                    fontSize: responsive.isMobile ? "16px" : "18px",
                    fontWeight: "600",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                  }}
                >
                  立即登录
                </Button>

                <Button
                  color="default"
                  onClick={handleResendCode}
                  disabled={countdown > 0}
                  style={{
                    height: responsive.isMobile ? "48px" : "52px",
                    fontSize: responsive.isMobile ? "14px" : "16px",
                    borderRadius: "12px",
                    opacity: countdown > 0 ? 0.6 : 1,
                    minWidth: "100px",
                  }}
                >
                  {countdown > 0 ? `${countdown}s后重发` : "重新发送"}
                </Button>
              </div>

              {/* 返回按钮 */}
              <div style={{ textAlign: "center" }}>
                <Button
                  color="default"
                  fill="none"
                  onClick={handleBack}
                  style={{
                    fontSize: "14px",
                    color: "#999",
                  }}
                >
                  返回修改手机号
                </Button>
              </div>

              {/* 提示信息 */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "12px",
                  backgroundColor: "#f0f9ff",
                  borderRadius: "8px",
                  border: "1px solid #bae6fd",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "#0369a1",
                    lineHeight: "1.5",
                    textAlign: "center",
                  }}
                >
                  <div>• 验证码60秒内有效</div>
                  <div>• 请勿将验证码泄露给他人</div>
                  <div>• 如未收到，请检查短信拦截</div>
                </div>
              </div>
            </div>
          )}

          {/* 底部链接 */}
          <div
            style={{
              textAlign: "center",
              marginTop: "30px",
              paddingTop: "20px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Button
              color="default"
              fill="none"
              onClick={() => navigate("/login")}
              style={{
                fontSize: "14px",
                color: "#999",
              }}
            >
              使用密码登录
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
