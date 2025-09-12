// SimpleLogin.tsx - 简化的登录组件
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Toast, Form } from "antd-mobile";
import { useAuth } from "../context/AuthContext";
import { useResponsive, createResponsiveStyles } from "../hooks/useResponsive";
import ResponsiveContainer from "./ResponsiveContainer";
import ResponsiveText from "./ResponsiveText";

interface LoginFormData {
  username: string;
  password: string;
  mobile?: string;
  email?: string;
}

const SimpleLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuth();
  const responsive = useResponsive();
  const styles = createResponsiveStyles(responsive);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
    mobile: "",
    email: "",
  });

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.username.trim()) {
      Toast.show("请输入用户名");
      return;
    }

    if (!formData.password.trim()) {
      Toast.show("请输入密码");
      return;
    }

    if (formData.password.length < 6) {
      Toast.show("密码至少6位");
      return;
    }

    try {
      if (isLoginMode) {
        // 智能判断登录字段类型
        let loginField: "username" | "mobile" | "email" = "username";
        if (/^1[3-9]\d{9}$/.test(formData.username)) {
          loginField = "mobile";
        } else if (/@/.test(formData.username)) {
          loginField = "email";
        }

        await login(formData.username, formData.password);
        Toast.show("登录成功");
        navigate("/home");
      } else {
        // 注册时需要验证手机号格式
        if (formData.mobile && !/^1[3-9]\d{9}$/.test(formData.mobile)) {
          Toast.show("请输入正确的手机号");
          return;
        }

        if (formData.email && !/@/.test(formData.email)) {
          Toast.show("请输入正确的邮箱");
          return;
        }

        await register(formData.username, formData.password);
        Toast.show("注册成功");
        navigate("/home");
      }
    } catch (error: any) {
      Toast.show(error.message || (isLoginMode ? "登录失败" : "注册失败"));
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({ username: "", password: "", mobile: "", email: "" });
  };

  return (
    <ResponsiveContainer
      type="page"
      style={{
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
        {/* 主卡片 */}
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
          {/* 标题区域 */}
          <div
            style={{
              textAlign: "center",
              marginBottom: responsive.isMobile ? "30px" : "40px",
            }}
          >
            <ResponsiveText
              variant="title"
              align="center"
              weight="bold"
              style={{
                marginBottom: responsive.isMobile ? "8px" : "12px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              🐾 智能宠物养护
            </ResponsiveText>
            <ResponsiveText
              variant="subtitle"
              align="center"
              color="#666"
              style={{ marginBottom: responsive.isMobile ? "8px" : "12px" }}
            >
              {isLoginMode ? "欢迎回来" : "创建新账户"}
            </ResponsiveText>
            <ResponsiveText variant="body" align="center" color="#999">
              {isLoginMode
                ? "支持用户名/手机号/邮箱登录"
                : "注册账户开始您的养宠之旅"}
            </ResponsiveText>
          </div>

          {/* 表单区域 */}
          <Form>
            <Form.Item>
              <Input
                placeholder={
                  isLoginMode ? "用户名/手机号/邮箱" : "请输入用户名"
                }
                value={formData.username}
                onChange={(value) => handleInputChange("username", value)}
                style={{
                  fontSize: responsive.isMobile ? "16px" : "18px",
                  height: responsive.isMobile ? "48px" : "52px",
                  borderRadius: "12px",
                  border: "2px solid #f0f0f0",
                  backgroundColor: "#fafafa",
                }}
              />
            </Form.Item>

            {/* 注册模式下显示手机号和邮箱输入框 */}
            {!isLoginMode && (
              <>
                <Form.Item>
                  <Input
                    placeholder="请输入手机号（可选）"
                    value={formData.mobile}
                    onChange={(value) => handleInputChange("mobile", value)}
                    style={{
                      fontSize: responsive.isMobile ? "16px" : "18px",
                      height: responsive.isMobile ? "48px" : "52px",
                      borderRadius: "12px",
                      border: "2px solid #f0f0f0",
                      backgroundColor: "#fafafa",
                    }}
                  />
                </Form.Item>

                <Form.Item>
                  <Input
                    placeholder="请输入邮箱（可选）"
                    value={formData.email}
                    onChange={(value) => handleInputChange("email", value)}
                    style={{
                      fontSize: responsive.isMobile ? "16px" : "18px",
                      height: responsive.isMobile ? "48px" : "52px",
                      borderRadius: "12px",
                      border: "2px solid #f0f0f0",
                      backgroundColor: "#fafafa",
                    }}
                  />
                </Form.Item>
              </>
            )}

            <Form.Item>
              <Input
                type="password"
                placeholder="请输入密码"
                value={formData.password}
                onChange={(value) => handleInputChange("password", value)}
                style={{
                  fontSize: responsive.isMobile ? "16px" : "18px",
                  height: responsive.isMobile ? "48px" : "52px",
                  borderRadius: "12px",
                  border: "2px solid #f0f0f0",
                  backgroundColor: "#fafafa",
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: "24px" }}>
              <Button
                color="primary"
                size="large"
                block
                onClick={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
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
                {isLoading
                  ? isLoginMode
                    ? "登录中..."
                    : "注册中..."
                  : isLoginMode
                  ? "立即登录"
                  : "立即注册"}
              </Button>
            </Form.Item>
          </Form>

          {/* 切换模式 */}
          <div
            style={{
              textAlign: "center",
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <ResponsiveText variant="body" color="#666" align="center">
              {isLoginMode ? "还没有账户？" : "已有账户？"}
              <Button
                fill="none"
                color="primary"
                onClick={toggleMode}
                style={{
                  fontSize: "14px",
                  marginLeft: "8px",
                  padding: "0 8px",
                  height: "auto",
                  lineHeight: "1.4",
                }}
              >
                {isLoginMode ? "立即注册" : "立即登录"}
              </Button>
            </ResponsiveText>
          </div>

          {/* 其他登录方式 */}
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            <ResponsiveText
              variant="caption"
              color="#999"
              align="center"
              style={{ marginBottom: "16px" }}
            >
              或使用其他方式登录
            </ResponsiveText>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
              }}
            >
              <Button
                color="default"
                size="small"
                onClick={() => navigate("/sms-login")}
                style={{
                  fontSize: "12px",
                  borderRadius: "20px",
                  padding: "8px 16px",
                }}
              >
                📱 短信登录
              </Button>
              <Button
                color="default"
                size="small"
                onClick={() => navigate("/auth-debug")}
                style={{
                  fontSize: "12px",
                  borderRadius: "20px",
                  padding: "8px 16px",
                }}
              >
                🐧 QQ登录
              </Button>
            </div>
          </div>

          {/* 返回首页 */}
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            <Button
              fill="none"
              color="default"
              onClick={() => navigate("/")}
              style={{
                fontSize: "12px",
                color: "#999",
              }}
            >
              ← 返回首页
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
};

export default SimpleLogin;
