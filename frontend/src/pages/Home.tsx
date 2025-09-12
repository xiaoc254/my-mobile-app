import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, List } from "antd-mobile";
import api from "../services/api";
interface UserInfo {
  username: string;
  _id: string;
}

export default function Home() {
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

  return (
    <div style={{ padding: "20px", paddingBottom: "60px" }}>
      <Card>
        <h2 style={{ textAlign: "center", margin: "20px 0" }}>
          🏠 欢迎回来
        </h2>

        {userInfo ? (
          <List>
            <List.Item extra={userInfo.username}>用户名</List.Item>
            <List.Item extra="已登录">登录状态</List.Item>
            <List.Item extra={new Date().toLocaleDateString()}>最后登录</List.Item>
          </List>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p>请先登录以查看更多功能</p>
                                    <Button
              color="primary"
              onClick={() => navigate("/login")}
            >
              去登录
            </Button>
          </div>
        )}

        <div style={{ marginTop: "20px" }}>
                    <Button
            color="primary"
            block
            loading={loading}
            onClick={getUserInfo}
          >
            刷新信息
          </Button>
        </div>
      </Card>
      <button onClick={() => navigate("/ai")}>聊天</button>
    </div>
  );
}
