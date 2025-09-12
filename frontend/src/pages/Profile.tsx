import { useNavigate } from "react-router-dom";
import { Button, Toast, Card, List } from "antd-mobile";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    Toast.show({ content: "退出成功", position: "center" });
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  if (!user) {
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
          <h3 style={{ margin: "10px 0" }}>{user?.username || "用户"}</h3>
        </div>

        <List>
          <List.Item extra={user?.username || "-"}>用户名</List.Item>
          <List.Item extra={user?.email || "-"}>邮箱</List.Item>
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
