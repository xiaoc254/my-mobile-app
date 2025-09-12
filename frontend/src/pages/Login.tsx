import { Button, Input, Toast } from "antd-mobile";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 获取重定向路径
  const from = (location.state as any)?.from?.pathname || "/";

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({ content: "请输入用户名和密码", position: "center" });
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      Toast.show({ content: "登录成功", position: "center" });
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (error: any) {
      Toast.show({ content: error.message || "登录失败", position: "center" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({ content: "请输入用户名和密码", position: "center" });
      return;
    }

    if (password.length < 6) {
      Toast.show({ content: "密码至少需要6位", position: "center" });
      return;
    }

    setIsLoading(true);
    try {
      await register(username, password);
      Toast.show({ content: "注册成功", position: "center" });
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (error: any) {
      Toast.show({ content: error.message || "注册失败", position: "center" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", paddingBottom: "60px" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h2>🔐 用户登录</h2>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ marginBottom: "8px", color: "#666", fontSize: "16px" }}>
          用户名
        </div>
        <Input
          placeholder="请输入用户名"
          value={username}
          onChange={setUsername}
        />
      </div>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ marginBottom: "8px", color: "#666", fontSize: "16px" }}>
          密码
        </div>
        <Input
          type="password"
          placeholder="请输入密码"
          value={password}
          onChange={setPassword}
        />
      </div>

      <div style={{ marginTop: "30px" }}>
        <Button
          color="primary"
          block
          onClick={handleLogin}
          loading={isLoading}
          disabled={isLoading}
        >
          登录
        </Button>
        <Button
          block
          style={{ marginTop: "10px" }}
          onClick={handleRegister}
          loading={isLoading}
          disabled={isLoading}
        >
          注册新账户
        </Button>
      </div>
    </div>
  );
}
