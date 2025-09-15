import React, { useState, useEffect } from "react";
import { Button, Card, Toast } from "antd-mobile";
import { checkNetworkStatus, getMobileDebugInfo } from "../utils/mobileUtils";

interface NetworkStatusProps {
  onRetry?: () => void;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ onRetry }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isChecking, setIsChecking] = useState(false);
  const [apiStatus, setApiStatus] = useState<boolean | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 检查API连接
    checkAPIStatus();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const checkAPIStatus = async () => {
    setIsChecking(true);
    const status = await checkNetworkStatus();
    setApiStatus(status);
    setIsChecking(false);
  };

  const handleRetry = async () => {
    await checkAPIStatus();
    if (onRetry) {
      onRetry();
    }
  };

  const showDebugInfo = () => {
    const debugInfo = getMobileDebugInfo();
    Toast.show({
      content: (
        <div style={{ textAlign: "left", fontSize: "12px" }}>
          <div>
            <strong>调试信息:</strong>
          </div>
          <div>当前URL: {debugInfo.currentURL}</div>
          <div>主机: {debugInfo.hostname}</div>
          <div>协议: {debugInfo.protocol}</div>
          <div>网络: {debugInfo.connection}</div>
          <div>移动端: {debugInfo.isMobile ? "是" : "否"}</div>
        </div>
      ),
      duration: 5000,
    });
  };

  if (!isOnline) {
    return (
      <Card style={{ margin: "16px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📡</div>
        <h3>网络连接中断</h3>
        <p>请检查您的网络连接</p>
        <Button color="primary" onClick={handleRetry} loading={isChecking}>
          重新连接
        </Button>
      </Card>
    );
  }

  if (apiStatus === false) {
    return (
      <Card style={{ margin: "16px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
        <h3>服务器连接失败</h3>
        <p>无法连接到服务器，请稍后重试</p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <Button color="primary" onClick={handleRetry} loading={isChecking}>
            重试连接
          </Button>
          <Button color="default" onClick={showDebugInfo}>
            调试信息
          </Button>
        </div>
      </Card>
    );
  }

  return null;
};

export default NetworkStatus;
