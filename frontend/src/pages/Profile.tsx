import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Toast, Card, List } from "antd-mobile";
import api from "../services/api";

interface UserInfo {
  username: string;
  _id: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getUserInfo();
    }
  }, []);

  const getUserInfo = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/profile");
      setUserInfo(res.data);
    } catch (e) {
      console.error("获取用户信息失败", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      setUserInfo(null);
      Toast.show({ content: "退出成功", position: "center" });
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (e) {
      localStorage.removeItem("token");
      Toast.show({ content: "退出成功", position: "center" });
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    }
  };

  if (!userInfo && !loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center", paddingBottom: "60px" }}>
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
                    <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            fontSize: "24px",
            color: "#666"
          }}>
            👤
          </div>
          <h3 style={{ margin: "10px 0" }}>
            {userInfo?.username || "用户"}
          </h3>
        </div>

        <List>
          <List.Item extra={userInfo?.username || "-"}>用户名</List.Item>
          <List.Item extra={new Date().toLocaleDateString()}>注册时间</List.Item>
          <List.Item extra="已登录">登录状态</List.Item>
        </List>

        <div style={{ marginTop: "30px" }}>
                    <Button
            color="danger"
            block
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </div>
      </Card>
    </div>
  );
}
