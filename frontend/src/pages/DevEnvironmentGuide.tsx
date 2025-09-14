import { useNavigate } from "react-router-dom";
import { NavBar, Button, Toast } from "antd-mobile";

export default function DevEnvironmentGuide() {
  const navigate = useNavigate();

  // 检测当前环境信息
  const getCurrentEnvironment = () => {
    const isSecureContext =
      window.isSecureContext ||
      location.protocol === "https:" ||
      location.hostname === "localhost" ||
      location.hostname === "127.0.0.1";
    const isLocalNetwork = location.hostname.match(/^192\.168\.|^172\.|^10\./);
    const currentUrl = `${location.protocol}//${location.host}`;

    return {
      isSecureContext,
      isLocalNetwork,
      currentUrl,
      hostname: location.hostname,
      protocol: location.protocol,
      port: location.port || "默认端口",
    };
  };

  const env = getCurrentEnvironment();

  // 复制文本到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        Toast.show({ content: "✅ 已复制到剪贴板", position: "center" });
      })
      .catch(() => {
        Toast.show({ content: "❌ 复制失败", position: "center" });
      });
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
        开发环境配置指南
      </NavBar>

      {/* 页面内容 */}
      <div style={{ padding: "20px", paddingBottom: "60px" }}>
        {/* 当前环境状态 */}
        <div
          style={{
            backgroundColor: env.isSecureContext ? "#e8f5e8" : "#ffebee",
            borderRadius: "12px",
            padding: "15px",
            marginBottom: "20px",
            border: env.isSecureContext
              ? "1px solid #4caf50"
              : "1px solid #f44336",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: env.isSecureContext ? "#2e7d32" : "#d32f2f",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {env.isSecureContext ? "✅ 安全环境" : "⚠️ 非安全环境"}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: env.isSecureContext ? "#2e7d32" : "#d32f2f",
              lineHeight: "1.5",
            }}
          >
            <strong>当前访问地址：</strong> {env.currentUrl}
            <br />
            <strong>协议：</strong> {env.protocol}
            <br />
            <strong>主机：</strong> {env.hostname}
            <br />
            <strong>端口：</strong> {env.port}
            <br />
            <strong>安全上下文：</strong> {env.isSecureContext ? "是" : "否"}
          </div>
        </div>

        {/* 解决方案 */}
        {!env.isSecureContext && (
          <div
            style={{
              backgroundColor: "#fff3cd",
              borderRadius: "12px",
              padding: "15px",
              marginBottom: "20px",
              border: "1px solid #ffeaa7",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                color: "#d68910",
                marginBottom: "12px",
              }}
            >
              🛠️ 解决方案
            </div>

            {env.isLocalNetwork ? (
              <div
                style={{
                  fontSize: "13px",
                  color: "#8e5a00",
                  lineHeight: "1.6",
                }}
              >
                <strong>检测到局域网IP地址，请使用以下方式之一：</strong>
                <br />
                <br />

                <div style={{ marginBottom: "15px" }}>
                  <strong>方法1：使用localhost</strong>
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "8px",
                      borderRadius: "4px",
                      marginTop: "5px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>localhost:5173</span>
                    <Button
                      size="mini"
                      onClick={() => copyToClipboard("http://localhost:5173")}
                      style={{
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        fontSize: "10px",
                      }}
                    >
                      复制
                    </Button>
                  </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <strong>方法2：配置Vite HTTPS (推荐)</strong>
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "8px",
                      borderRadius: "4px",
                      marginTop: "5px",
                      fontFamily: "monospace",
                      fontSize: "11px",
                    }}
                  >
                    修改 vite.config.ts：
                    <br />
                    export default defineConfig({`{`}
                    <br />
                    &nbsp;&nbsp;server: {`{`}
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;https: true,
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;host: '0.0.0.0'
                    <br />
                    &nbsp;&nbsp;{`}`}
                    <br />
                    {`}`})
                  </div>
                  <Button
                    size="small"
                    onClick={() =>
                      copyToClipboard(`export default defineConfig({
  server: {
    https: true,
    host: '0.0.0.0'
  }
})`)
                    }
                    style={{
                      background: "#28a745",
                      color: "white",
                      border: "none",
                      fontSize: "11px",
                      marginTop: "5px",
                    }}
                  >
                    复制配置代码
                  </Button>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <strong>方法3：使用ngrok</strong>
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "8px",
                      borderRadius: "4px",
                      marginTop: "5px",
                      fontFamily: "monospace",
                      fontSize: "12px",
                    }}
                  >
                    1. 安装: npm install -g ngrok
                    <br />
                    2. 运行: ngrok http 5173
                    <br />
                    3. 使用提供的HTTPS链接访问
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  fontSize: "13px",
                  color: "#8e5a00",
                  lineHeight: "1.6",
                }}
              >
                <strong>请确保在HTTPS环境下访问应用</strong>
                <br />
                现代浏览器要求在安全上下文中才能访问摄像头和麦克风。
              </div>
            )}
          </div>
        )}

        {/* 快速操作按钮 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <Button
            onClick={() => navigate("/mobile-media-test")}
            style={{
              background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
              border: "none",
              color: "white",
              height: "45px",
              borderRadius: "22px",
            }}
          >
            🔍 进行环境和权限测试
          </Button>

          {env.isLocalNetwork && (
            <Button
              onClick={() => {
                const localhostUrl = `http://localhost:${env.port}`;
                copyToClipboard(localhostUrl);
                Toast.show({
                  content: `建议在新标签页打开: ${localhostUrl}`,
                  position: "center",
                  duration: 4000,
                });
              }}
              style={{
                background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                border: "none",
                color: "white",
                height: "40px",
                borderRadius: "20px",
              }}
            >
              📋 复制localhost地址
            </Button>
          )}

          <Button
            onClick={() => navigate("/voice-analysis")}
            style={{
              background: env.isSecureContext
                ? "linear-gradient(135deg, #d4994b 0%, #c8955a 100%)"
                : "linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)",
              border: "none",
              color: "white",
              height: "40px",
              borderRadius: "20px",
              opacity: env.isSecureContext ? 1 : 0.7,
            }}
            disabled={!env.isSecureContext}
          >
            🎤 {env.isSecureContext ? "返回声音分析" : "需要安全环境"}
          </Button>
        </div>

        {/* 技术说明 */}
        <div
          style={{
            backgroundColor: "#e3f2fd",
            borderRadius: "12px",
            padding: "15px",
            marginTop: "20px",
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
            📚 技术说明
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#0d47a1",
              lineHeight: "1.6",
            }}
          >
            <strong>为什么需要HTTPS？</strong>
            <br />
            出于安全考虑，现代浏览器只允许在安全上下文（HTTPS、localhost）中访问敏感的设备权限，如摄像头和麦克风。
            <br />
            <br />
            <strong>localhost为什么可以？</strong>
            <br />
            浏览器将localhost和127.0.0.1视为安全的本地环境，因此允许在HTTP协议下访问设备权限。
            <br />
            <br />
            <strong>局域网IP为什么不行？</strong>
            <br />
            局域网IP（如192.168.x.x、172.x.x.x等）被视为不安全的网络环境，必须使用HTTPS才能访问设备权限。
          </div>
        </div>
      </div>
    </div>
  );
}
