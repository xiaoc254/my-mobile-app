import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Toast, List } from "antd-mobile";
import api from "../services/api";
import catImg from "../image/cat.jpg";
import dogImg from "../image/dog.jpg";

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

  const menuItems = [
    {
      icon: "🐾",
      title: "联系客服",
      onClick: () => {
        Toast.show({ content: "客服功能开发中", position: "center" });
      },
    },
    {
      icon: "🛒",
      title: "商场订单管理",
      onClick: () => {
        navigate("/order-management");
      },
    },
    {
      icon: "🏥",
      title: "AI问诊",
      onClick: () => {
        navigate("/ai");
      },
    },
    {
      icon: "⚙️",
      title: "账号设置",
      onClick: () => {
        Toast.show({ content: "设置功能开发中", position: "center" });
      },
    },
  ];

  if (!userInfo && !loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        {/* Header Background */}
        <div
          style={{
            height: "240px",
            background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${dogImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div style={{ textAlign: "center", color: "white" }}>
            <p style={{ fontSize: "18px", margin: 0 }}>请先登录</p>
            <Button
              color="primary"
              onClick={() => navigate("/login")}
              style={{ marginTop: "20px" }}
            >
              去登录
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        paddingBottom: "60px",
      }}
    >
      {/* Header Background */}
      <div
        style={{
          height: "240px",
          background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${dogImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      />

      {/* Avatar Section */}
      <div
        style={{
          position: "relative",
          marginTop: "-80px",
          textAlign: "center",
          paddingBottom: "40px",
        }}
      >
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: `url(${catImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            margin: "0 auto",
            border: "4px solid white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        />
      </div>

      {/* Menu Items */}
      <div
        style={{
          backgroundColor: "white",
          margin: "0 20px",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <List>
          {menuItems.map((item, index) => (
            <List.Item
              key={index}
              prefix={
                <span style={{ fontSize: "20px", marginRight: "12px" }}>
                  {item.icon}
                </span>
              }
              arrow
              onClick={item.onClick}
              style={{
                padding: "16px 20px",
                fontSize: "16px",
                borderBottom:
                  index < menuItems.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              {item.title}
            </List.Item>
          ))}
        </List>
      </div>

      {/* Logout Button */}
      <div style={{ margin: "40px 20px 0" }}>
        <Button
          color="danger"
          block
          onClick={handleLogout}
          style={{
            height: "48px",
            borderRadius: "12px",
            fontSize: "16px",
          }}
        >
          退出登录
        </Button>
      </div>
    </div>
  );
}
