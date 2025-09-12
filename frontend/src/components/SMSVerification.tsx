// SMSVerification.tsx - 短信验证码组件
import React, { useState, useEffect } from "react";
import { Button, Input, Toast } from "antd-mobile";
import { useResponsive } from "../hooks/useResponsive";
import smsService from "../services/smsService";

interface SMSVerificationProps {
  mobile: string;
  onSuccess: (mobile: string) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
}

export const SMSVerification: React.FC<SMSVerificationProps> = ({
  mobile,
  onSuccess,
  onCancel,
  title = "短信验证",
  description = "请输入发送到您手机号的验证码",
}) => {
  const responsive = useResponsive();
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
        Toast.show("验证码发送成功");
        setIsCodeSent(true);
        setCountdown(60); // 60秒倒计时
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
        onSuccess(mobile);
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

  return (
    <div
      style={{
        padding: responsive.isMobile ? "20px" : "30px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      {/* 标题 */}
      <div
        style={{
          textAlign: "center",
          marginBottom: responsive.isMobile ? "20px" : "30px",
        }}
      >
        <h2
          style={{
            fontSize: responsive.isMobile ? "20px" : "24px",
            fontWeight: "600",
            color: "#333",
            margin: "0 0 8px 0",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: responsive.isMobile ? "14px" : "16px",
            color: "#666",
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>

      {/* 手机号显示 */}
      <div
        style={{
          textAlign: "center",
          marginBottom: responsive.isMobile ? "20px" : "30px",
          padding: responsive.isMobile ? "12px" : "16px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            fontSize: responsive.isMobile ? "14px" : "16px",
            color: "#666",
            marginBottom: "4px",
          }}
        >
          验证码已发送至
        </div>
        <div
          style={{
            fontSize: responsive.isMobile ? "16px" : "18px",
            fontWeight: "600",
            color: "#333",
          }}
        >
          {smsService.formatMobile(mobile)}
        </div>
      </div>

      {/* 验证码输入 */}
      <div style={{ marginBottom: responsive.isMobile ? "20px" : "30px" }}>
        <Input
          type="text"
          placeholder="请输入6位验证码"
          value={code}
          onChange={setCode}
          maxLength={6}
          style={{
            fontSize: responsive.isMobile ? "16px" : "18px",
            textAlign: "center",
            letterSpacing: "2px",
          }}
        />
      </div>

      {/* 按钮组 */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          flexDirection: responsive.isMobile ? "column" : "row",
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
          }}
        >
          验证
        </Button>

        <Button
          color="default"
          block
          onClick={handleResendCode}
          disabled={countdown > 0}
          style={{
            height: responsive.isMobile ? "48px" : "52px",
            fontSize: responsive.isMobile ? "16px" : "18px",
            opacity: countdown > 0 ? 0.6 : 1,
          }}
        >
          {countdown > 0 ? `${countdown}s后重发` : "重新发送"}
        </Button>
      </div>

      {/* 取消按钮 */}
      {onCancel && (
        <div
          style={{
            textAlign: "center",
            marginTop: responsive.isMobile ? "16px" : "20px",
          }}
        >
          <Button
            color="default"
            fill="none"
            onClick={onCancel}
            style={{
              fontSize: responsive.isMobile ? "14px" : "16px",
              color: "#999",
            }}
          >
            取消
          </Button>
        </div>
      )}

      {/* 提示信息 */}
      <div
        style={{
          marginTop: responsive.isMobile ? "16px" : "20px",
          padding: responsive.isMobile ? "12px" : "16px",
          backgroundColor: "#f0f9ff",
          borderRadius: "8px",
          border: "1px solid #bae6fd",
        }}
      >
        <div
          style={{
            fontSize: responsive.isMobile ? "12px" : "14px",
            color: "#0369a1",
            lineHeight: "1.5",
          }}
        >
          <div>• 验证码60秒内有效</div>
          <div>• 请勿将验证码泄露给他人</div>
          <div>• 如未收到，请检查短信拦截</div>
        </div>
      </div>
    </div>
  );
};

export default SMSVerification;
