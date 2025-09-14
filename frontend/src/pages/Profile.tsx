import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Toast, Card, List } from "antd-mobile";
import api from "../services/api";

interface UserInfo {
  id?: string;
  _id?: string;
  username: string;
  mobile?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  loginType?: string;
  isVerified?: boolean;
  lastLoginAt?: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUserInfo(userData);
      } catch (error) {
        console.error("解析用户信息失败:", error);
      }
    }

    // 如果有token，尝试从后端获取最新用户信息
    if (token) {
      getUserInfo();
    }
  }, []);

  const getUserInfo = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/profile");
      if (res.data) {
        setUserInfo(res.data);
        // 更新localStorage中的用户信息
        localStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch (e) {
      console.error("获取用户信息失败", e);
      // 如果获取失败，保持使用localStorage中的信息
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("后端退出登录失败:", e);
    } finally {
      // 无论后端是否成功，都清除本地数据
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUserInfo(null);
      Toast.show({ content: "退出成功", position: "center" });
      setTimeout(() => {
        navigate("/login");
        // 刷新页面以确保AuthContext更新
        window.location.reload();
      }, 1000);
    }
  };

  if (!userInfo && !loading) {
    return (
      <div
        style={{ padding: "20px", textAlign: "center", paddingBottom: "60px" }}
      >
        <Card>
          <p>请先登录</p>
          <Button color="primary" onClick={() => navigate("/login")}>
            去登录
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", paddingBottom: "60px" }}>
      <Card>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              fontSize: "24px",
              color: "#666",
            }}
          >
            👤
          </div>
          <h3 style={{ margin: "10px 0" }}>
            {userInfo?.nickname || userInfo?.username || "用户"}
          </h3>
          {userInfo?.isVerified && (
            <span style={{ color: "#52c41a", fontSize: "12px" }}>
              ✅ 已验证
            </span>
          )}
        </div>

        <List>
          <List.Item extra={userInfo?.username || "-"}>用户名</List.Item>
          {userInfo?.mobile && (
            <List.Item extra={userInfo.mobile}>手机号</List.Item>
          )}
          {userInfo?.email && (
            <List.Item extra={userInfo.email}>邮箱</List.Item>
          )}
          <List.Item
            extra={userInfo?.loginType === "sms" ? "短信登录" : "普通登录"}
          >
            登录方式
          </List.Item>
          {userInfo?.lastLoginAt && (
            <List.Item extra={new Date(userInfo.lastLoginAt).toLocaleString()}>
              最后登录
            </List.Item>
          )}
          <List.Item extra="已登录">登录状态</List.Item>
        </List>

        <div style={{ marginTop: "30px" }}>
          <Button color="danger" block onClick={handleLogout}>
            退出登录
          </Button>
        </div>
      </Card>
    </div>
  );
}
