import { useState, useEffect } from "react";
import { Button, Card, List, Space, Toast } from "antd-mobile";
import api from "../services/api";

interface DebugInfo {
  hasToken: boolean;
  tokenPreview: string;
  tokenValid: boolean;
  userInfo: any;
  lastError: string;
}

export default function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    hasToken: false,
    tokenPreview: "",
    tokenValid: false,
    userInfo: null,
    lastError: ""
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkTokenStatus();
  }, []);

  const checkTokenStatus = () => {
    const token = localStorage.getItem("token");
    setDebugInfo(prev => ({
      ...prev,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 30)}...` : "无token",
      tokenValid: false,
      userInfo: null,
      lastError: ""
    }));
  };

  const testToken = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/profile");
      setDebugInfo(prev => ({
        ...prev,
        tokenValid: true,
        userInfo: res.data,
        lastError: ""
      }));
      Toast.show("Token验证成功！");
    } catch (error: any) {
      setDebugInfo(prev => ({
        ...prev,
        tokenValid: false,
        userInfo: null,
        lastError: error.response?.data?.message || error.message || "未知错误"
      }));
      Toast.show(`Token验证失败: ${error.response?.status}`);
    } finally {
      setLoading(false);
    }
  };

  const clearToken = () => {
    localStorage.removeItem("token");
    checkTokenStatus();
    Toast.show("Token已清除");
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      // 使用测试账号登录
      const res = await api.post("/auth/login", {
        username: "testuser",
        password: "testpass"
      });
      
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        checkTokenStatus();
        Toast.show("登录成功！");
      }
    } catch (error: any) {
      Toast.show(`登录失败: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", background: "#f5f5f5", minHeight: "100vh" }}>
      <Card style={{ marginBottom: "20px" }}>
        <h2>🔧 认证调试工具</h2>
        <p>用于调试和测试认证流程</p>
      </Card>

      <Card style={{ marginBottom: "20px" }}>
        <h3>当前状态</h3>
        <List>
          <List.Item extra={debugInfo.hasToken ? "✅" : "❌"}>
            本地Token
          </List.Item>
          <List.Item extra={debugInfo.tokenPreview}>
            Token预览
          </List.Item>
          <List.Item extra={debugInfo.tokenValid ? "✅" : "❌"}>
            Token有效性
          </List.Item>
          <List.Item extra={debugInfo.userInfo?.username || "无"}>
            用户信息
          </List.Item>
          <List.Item extra={debugInfo.lastError || "无"}>
            最后错误
          </List.Item>
        </List>
      </Card>

      <Card style={{ marginBottom: "20px" }}>
        <h3>操作</h3>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button 
            color="primary" 
            block 
            loading={loading}
            onClick={testToken}
            disabled={!debugInfo.hasToken}
          >
            测试Token
          </Button>
          
          <Button 
            color="success" 
            block 
            loading={loading}
            onClick={testLogin}
          >
            测试登录
          </Button>
          
          <Button 
            color="danger" 
            block 
            onClick={clearToken}
          >
            清除Token
          </Button>
          
          <Button 
            color="default" 
            block 
            onClick={checkTokenStatus}
          >
            刷新状态
          </Button>
        </Space>
      </Card>

      {debugInfo.userInfo && (
        <Card>
          <h3>用户信息详情</h3>
          <pre style={{ 
            background: "#f0f0f0", 
            padding: "10px", 
            borderRadius: "4px",
            fontSize: "12px",
            overflow: "auto"
          }}>
            {JSON.stringify(debugInfo.userInfo, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
