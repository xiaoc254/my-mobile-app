import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar, Button, Toast, List } from "antd-mobile";

export default function MobileMediaTest() {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<{
    https: boolean | null;
    userMedia: boolean | null;
    microphone: boolean | null;
    camera: boolean | null;
  }>({
    https: null,
    userMedia: null,
    microphone: null,
    camera: null,
  });

  // 检测HTTPS环境
  const testHTTPS = () => {
    const isSecure =
      window.isSecureContext ||
      location.protocol === "https:" ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1";

    setTestResults((prev) => ({ ...prev, https: isSecure }));

    if (isSecure) {
      Toast.show({ content: "✅ HTTPS环境检测通过", position: "center" });
    } else {
      Toast.show({
        content: "❌ 需要HTTPS环境",
        position: "center",
        duration: 3000,
      });
    }
  };

  // 检测getUserMedia支持
  const testGetUserMedia = () => {
    const supported = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );

    setTestResults((prev) => ({ ...prev, userMedia: supported }));

    if (supported) {
      Toast.show({ content: "✅ 浏览器支持媒体设备访问", position: "center" });
    } else {
      Toast.show({
        content: "❌ 浏览器不支持媒体设备访问",
        position: "center",
        duration: 3000,
      });
    }
  };

  // 测试麦克风权限
  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });

      // 立即停止流
      stream.getTracks().forEach((track) => track.stop());

      setTestResults((prev) => ({ ...prev, microphone: true }));
      Toast.show({ content: "✅ 麦克风权限获取成功", position: "center" });
    } catch (error: any) {
      console.error("麦克风测试失败:", error);
      setTestResults((prev) => ({ ...prev, microphone: false }));

      let message = "❌ 麦克风权限测试失败";
      if (error.name === "NotAllowedError") {
        message = "❌ 麦克风权限被拒绝";
      } else if (error.name === "NotFoundError") {
        message = "❌ 未找到麦克风设备";
      }

      Toast.show({ content: message, position: "center", duration: 3000 });
    }
  };

  // 测试摄像头权限
  const testCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        },
      });

      // 立即停止流
      stream.getTracks().forEach((track) => track.stop());

      setTestResults((prev) => ({ ...prev, camera: true }));
      Toast.show({ content: "✅ 摄像头权限获取成功", position: "center" });
    } catch (error: any) {
      console.error("摄像头测试失败:", error);
      setTestResults((prev) => ({ ...prev, camera: false }));

      let message = "❌ 摄像头权限测试失败";
      if (error.name === "NotAllowedError") {
        message = "❌ 摄像头权限被拒绝";
      } else if (error.name === "NotFoundError") {
        message = "❌ 未找到摄像头设备";
      }

      Toast.show({ content: message, position: "center", duration: 3000 });
    }
  };

  // 运行所有测试
  const runAllTests = async () => {
    Toast.show({ content: "开始运行全部测试...", position: "center" });

    // 重置结果
    setTestResults({
      https: null,
      userMedia: null,
      microphone: null,
      camera: null,
    });

    // 按顺序运行测试
    testHTTPS();

    setTimeout(() => {
      testGetUserMedia();
    }, 500);

    setTimeout(async () => {
      await testMicrophone();
    }, 1000);

    setTimeout(async () => {
      await testCamera();
    }, 1500);
  };

  // 获取状态图标
  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return "⏳";
    return status ? "✅" : "❌";
  };

  // 获取状态文字
  const getStatusText = (status: boolean | null) => {
    if (status === null) return "未测试";
    return status ? "通过" : "失败";
  };

  // 获取状态颜色
  const getStatusColor = (status: boolean | null) => {
    if (status === null) return "#666";
    return status ? "#27AE60" : "#E74C3C";
  };

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* 顶部导航栏 */}
      <NavBar
        back="返回"
        onBack={() => navigate(-1)}
        style={{
          backgroundColor: "#fff",
          color: "#333",
        }}
      >
        移动端媒体权限测试
      </NavBar>

      {/* 页面内容 */}
      <div style={{ padding: "20px", paddingBottom: "60px" }}>
        {/* 说明卡片 */}
        <div
          style={{
            backgroundColor: "#e3f2fd",
            borderRadius: "12px",
            padding: "15px",
            marginBottom: "20px",
            border: "1px solid #bbdefb",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#1565c0",
              marginBottom: "8px",
            }}
          >
            📋 测试说明
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#0d47a1",
              lineHeight: "1.5",
            }}
          >
            此测试工具帮助您检测移动设备的媒体权限状态，包括HTTPS环境、浏览器支持、麦克风和摄像头权限。如果某项测试失败，请根据提示进行相应的权限设置。
          </div>
        </div>

        {/* 测试按钮 */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <Button
            onClick={runAllTests}
            style={{
              width: "200px",
              height: "45px",
              background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
              border: "none",
              borderRadius: "22px",
              fontSize: "16px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            🔍 开始全部测试
          </Button>
        </div>

        {/* 测试结果 */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <List>
            <List.Item
              prefix={
                <span style={{ fontSize: "18px" }}>
                  {getStatusIcon(testResults.https)}
                </span>
              }
              description="检查当前环境是否为HTTPS"
              extra={
                <Button
                  size="mini"
                  onClick={testHTTPS}
                  style={{
                    background:
                      "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)",
                    color: "white",
                    border: "none",
                  }}
                >
                  测试
                </Button>
              }
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "10px" }}>HTTPS环境</span>
                <span
                  style={{
                    fontSize: "12px",
                    color: getStatusColor(testResults.https),
                    fontWeight: "bold",
                  }}
                >
                  {getStatusText(testResults.https)}
                </span>
              </div>
            </List.Item>

            <List.Item
              prefix={
                <span style={{ fontSize: "18px" }}>
                  {getStatusIcon(testResults.userMedia)}
                </span>
              }
              description="检查浏览器是否支持getUserMedia"
              extra={
                <Button
                  size="mini"
                  onClick={testGetUserMedia}
                  style={{
                    background:
                      "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)",
                    color: "white",
                    border: "none",
                  }}
                >
                  测试
                </Button>
              }
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "10px" }}>浏览器支持</span>
                <span
                  style={{
                    fontSize: "12px",
                    color: getStatusColor(testResults.userMedia),
                    fontWeight: "bold",
                  }}
                >
                  {getStatusText(testResults.userMedia)}
                </span>
              </div>
            </List.Item>

            <List.Item
              prefix={
                <span style={{ fontSize: "18px" }}>
                  {getStatusIcon(testResults.microphone)}
                </span>
              }
              description="测试麦克风权限是否可用"
              extra={
                <Button
                  size="mini"
                  onClick={testMicrophone}
                  style={{
                    background:
                      "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                    color: "white",
                    border: "none",
                  }}
                >
                  测试
                </Button>
              }
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "10px" }}>麦克风权限</span>
                <span
                  style={{
                    fontSize: "12px",
                    color: getStatusColor(testResults.microphone),
                    fontWeight: "bold",
                  }}
                >
                  {getStatusText(testResults.microphone)}
                </span>
              </div>
            </List.Item>

            <List.Item
              prefix={
                <span style={{ fontSize: "18px" }}>
                  {getStatusIcon(testResults.camera)}
                </span>
              }
              description="测试摄像头权限是否可用"
              extra={
                <Button
                  size="mini"
                  onClick={testCamera}
                  style={{
                    background:
                      "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
                    color: "white",
                    border: "none",
                  }}
                >
                  测试
                </Button>
              }
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "10px" }}>摄像头权限</span>
                <span
                  style={{
                    fontSize: "12px",
                    color: getStatusColor(testResults.camera),
                    fontWeight: "bold",
                  }}
                >
                  {getStatusText(testResults.camera)}
                </span>
              </div>
            </List.Item>
          </List>
        </div>

        {/* 权限设置指南 */}
        <div
          style={{
            backgroundColor: "#fff3cd",
            borderRadius: "12px",
            padding: "15px",
            border: "1px solid #ffeaa7",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#d68910",
              marginBottom: "10px",
            }}
          >
            🛠️ 权限设置指南
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#8e5a00",
              lineHeight: "1.6",
            }}
          >
            <strong>如果测试失败，请尝试以下方法：</strong>
            <br />
            <br />
            <strong>📱 Android Chrome：</strong>
            <br />
            1. 点击地址栏左侧的锁形图标
            <br />
            2. 选择"网站设置"
            <br />
            3. 将麦克风和摄像头设置为"允许"
            <br />
            <br />
            <strong>🍎 iOS Safari：</strong>
            <br />
            1. 进入系统设置 → Safari → 摄像头/麦克风
            <br />
            2. 选择"询问"或"允许"
            <br />
            3. 刷新页面重新测试
            <br />
            <br />
            <strong>💻 桌面浏览器：</strong>
            <br />
            确保使用HTTPS连接，点击地址栏权限图标进行设置
          </div>
        </div>
      </div>
    </div>
  );
}
