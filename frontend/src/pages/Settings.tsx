import { useState } from "react";
import { Button, Input, Toast, Card, List, Switch } from "antd-mobile";
import api from "../services/api";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      Toast.show({ content: "请输入用户名", position: "center" });
      return;
    }

    try {
      await api.put("/auth/profile", { username });
      Toast.show({ content: "用户名更新成功", position: "center" });
      setUsername("");
    } catch (e) {
      Toast.show({ content: "更新失败", position: "center" });
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword.trim() || !password.trim()) {
      Toast.show({ content: "请填写完整的密码信息", position: "center" });
      return;
    }

    try {
      await api.put("/auth/password", {
        oldPassword,
        newPassword: password
      });
      Toast.show({ content: "密码修改成功", position: "center" });
      setOldPassword("");
      setPassword("");
    } catch (e) {
      Toast.show({ content: "密码修改失败", position: "center" });
    }
  };

  return (
    <div style={{ padding: "20px", paddingBottom: "60px" }}>
      <Card title="个人信息" style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ marginBottom: "8px", color: "#666" }}>新用户名</div>
          <Input
            placeholder="请输入新用户名"
            value={username}
            onChange={setUsername}
          />
        </div>
        <div style={{ marginTop: "15px" }}>
          <Button color="primary" block onClick={handleUpdateProfile}>
            更新用户名
          </Button>
        </div>
      </Card>

      <Card title="密码设置" style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ marginBottom: "8px", color: "#666" }}>旧密码</div>
          <Input
            type="password"
            placeholder="请输入旧密码"
            value={oldPassword}
            onChange={setOldPassword}
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ marginBottom: "8px", color: "#666" }}>新密码</div>
          <Input
            type="password"
            placeholder="请输入新密码"
            value={password}
            onChange={setPassword}
          />
        </div>
        <div style={{ marginTop: "15px" }}>
          <Button color="primary" block onClick={handleChangePassword}>
            修改密码
          </Button>
        </div>
      </Card>

      <Card title="应用设置" style={{ marginBottom: "20px" }}>
        <List>
          <List.Item extra={
            <Switch
              checked={darkMode}
              onChange={setDarkMode}
            />
          }>深色模式</List.Item>
          <List.Item extra={
            <Switch
              checked={notifications}
              onChange={setNotifications}
            />
          }>消息通知</List.Item>
        </List>
      </Card>

      <Card title="其他">
        <List>
          <List.Item extra="1.0.0">版本号</List.Item>
          <List.Item clickable onClick={() => {
            localStorage.clear();
            Toast.show({ content: "缓存已清除", position: "center" });
          }}>清除缓存</List.Item>
        </List>
      </Card>
    </div>
  );
}
