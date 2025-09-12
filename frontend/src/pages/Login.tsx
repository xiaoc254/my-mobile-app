import { Button, Input, Toast } from "antd-mobile";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      Toast.show({ content: "登录成功", position: "center" });
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (e) {
      Toast.show({ content: "登录失败", position: "center" });
    }
  };

  const handleRegister = async () => {
    try {
      const res = await api.post("/auth/register", { username, password });
      localStorage.setItem("token", res.data.token);
      Toast.show({ content: "注册成功", position: "center" });
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (e) {
      Toast.show({ content: "注册失败", position: "center" });
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
        <Button color="primary" block onClick={handleLogin}>
          登录
        </Button>
        <Button block style={{ marginTop: "10px" }} onClick={handleRegister}>
          注册新账户
        </Button>
      </div>
    </div>
  );
}
