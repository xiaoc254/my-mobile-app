// QQ登录详细调试工具
import React, { useState } from "react";
import {
  qqConfig,
  getDeviceInfo,
  validateQQAppId,
  createMobileQQLoginUrl,
  generateAuthUrl,
} from "../config/thirdPartyAuth";

const QQLoginDebugger: React.FC = () => {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const deviceInfo = getDeviceInfo();
  const isValidAppId = validateQQAppId(qqConfig.appId);

  // 测试QQ互联API连通性
  const testQQConnectivity = async () => {
    setIsLoading(true);
    setTestResult("正在测试QQ互联API连通性...\n");

    try {
      // 测试1: 检查QQ互联域名是否可访问
      const testUrl = "https://graph.qq.com/oauth2.0/authorize";
      setTestResult((prev) => prev + `测试1: 检查QQ互联域名访问...\n`);

      await fetch(testUrl + "?test=1", {
        method: "HEAD",
        mode: "no-cors", // 避免CORS问题
      });

      setTestResult((prev) => prev + `✅ QQ互联域名可访问\n`);

      // 测试2: 生成并验证登录URL
      const loginUrl = deviceInfo.isDesktop
        ? generateAuthUrl("qq")
        : createMobileQQLoginUrl();
      setTestResult((prev) => prev + `\n测试2: 生成的登录URL:\n${loginUrl}\n`);

      // 测试3: 检查URL参数
      const url = new URL(loginUrl);
      const params = {
        response_type: url.searchParams.get("response_type"),
        client_id: url.searchParams.get("client_id"),
        redirect_uri: url.searchParams.get("redirect_uri"),
        scope: url.searchParams.get("scope"),
        state: url.searchParams.get("state"),
        display: url.searchParams.get("display"),
      };

      setTestResult((prev) => prev + `\n测试3: URL参数检查:\n`);
      Object.entries(params).forEach(([key, value]) => {
        const status = value ? "✅" : "❌";
        setTestResult(
          (prev) => prev + `${status} ${key}: ${value || "缺失"}\n`
        );
      });

      // 测试4: APP ID格式验证
      setTestResult((prev) => prev + `\n测试4: APP ID验证:\n`);
      setTestResult((prev) => prev + `APP ID: ${qqConfig.appId}\n`);
      setTestResult((prev) => prev + `长度: ${qqConfig.appId.length}位\n`);
      setTestResult(
        (prev) => prev + `格式: ${isValidAppId ? "✅ 有效" : "❌ 无效"}\n`
      );
      setTestResult(
        (prev) =>
          prev +
          `是否全数字: ${/^\d+$/.test(qqConfig.appId) ? "✅ 是" : "❌ 否"}\n`
      );

      // 测试5: 回调地址检查
      setTestResult((prev) => prev + `\n测试5: 回调地址检查:\n`);
      setTestResult((prev) => prev + `回调地址: ${qqConfig.redirectUri}\n`);
      setTestResult(
        (prev) =>
          prev +
          `是否HTTPS: ${
            qqConfig.redirectUri.startsWith("https")
              ? "✅ 是"
              : "⚠️ 否（生产环境建议使用HTTPS）"
          }\n`
      );
    } catch (error) {
      setTestResult(
        (prev) =>
          prev +
          `\n❌ 测试失败: ${
            error instanceof Error ? error.message : "未知错误"
          }\n`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 测试不同的APP ID配置
  const testWithOfficialAppId = () => {
    const officialTestAppId = "102807192"; // QQ互联官方测试APP ID
    const testUrl = `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${officialTestAppId}&redirect_uri=${encodeURIComponent(
      qqConfig.redirectUri
    )}&scope=get_user_info&state=test&display=mobile`;

    setTestResult(
      `使用QQ互联官方测试APP ID进行测试:\n\nAPP ID: ${officialTestAppId}\n测试URL:\n${testUrl}\n\n点击下方按钮在新窗口测试此URL:`
    );

    return testUrl;
  };

  // 直接测试当前配置
  const testCurrentConfig = () => {
    const currentUrl = deviceInfo.isDesktop
      ? generateAuthUrl("qq")
      : createMobileQQLoginUrl();
    window.open(currentUrl, "_blank", "width=800,height=600");
  };

  const testOfficialConfig = () => {
    const officialUrl = testWithOfficialAppId();
    window.open(officialUrl, "_blank", "width=800,height=600");
  };

  return (
    <div
      style={{
        padding: "20px",
        margin: "20px",
        border: "2px solid #1296DB",
        borderRadius: "10px",
        backgroundColor: "#f8f9fa",
        fontFamily: "monospace",
      }}
    >
      <h2 style={{ color: "#1296DB", marginBottom: "20px" }}>
        🔍 QQ登录问题诊断工具
      </h2>

      {/* 当前配置信息 */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
          border: "1px solid #ddd",
        }}
      >
        <h3>📋 当前配置信息</h3>
        <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
          <p>
            <strong>APP ID:</strong> {qqConfig.appId}{" "}
            {isValidAppId ? "✅" : "❌"}
          </p>
          <p>
            <strong>APP Key:</strong> {qqConfig.appKey}
          </p>
          <p>
            <strong>回调地址:</strong> {qqConfig.redirectUri}
          </p>
          <p>
            <strong>权限范围:</strong> {qqConfig.scope}
          </p>
          <p>
            <strong>设备类型:</strong>{" "}
            {deviceInfo.isDesktop ? "桌面端" : "移动端"}
          </p>
          <p>
            <strong>User Agent:</strong>{" "}
            {deviceInfo.userAgent.substring(0, 100)}...
          </p>
        </div>
      </div>

      {/* 常见问题说明 */}
      <div
        style={{
          backgroundColor: "#fff3cd",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
          border: "1px solid #ffeaa7",
        }}
      >
        <h3>⚠️ "客户端ID非法"常见原因</h3>
        <ul style={{ fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
          <li>
            <strong>APP ID未在QQ互联平台注册</strong> - 需要在connect.qq.com申请
          </li>
          <li>
            <strong>回调域名未配置</strong> - 需要在平台添加回调域名
          </li>
          <li>
            <strong>APP状态异常</strong> - 应用可能被暂停或审核中
          </li>
          <li>
            <strong>网络问题</strong> - 防火墙或代理阻止访问
          </li>
          <li>
            <strong>参数错误</strong> - URL参数格式不正确
          </li>
        </ul>
      </div>

      {/* 测试按钮 */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={testQQConnectivity}
          disabled={isLoading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#1296DB",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isLoading ? "not-allowed" : "pointer",
            marginRight: "10px",
          }}
        >
          {isLoading ? "🔄 测试中..." : "🔍 运行诊断测试"}
        </button>

        <button
          onClick={testCurrentConfig}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          🚀 测试当前配置
        </button>

        <button
          onClick={testOfficialConfig}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ffc107",
            color: "#212529",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          🧪 测试官方APP ID
        </button>
      </div>

      {/* 测试结果 */}
      {testResult && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            borderRadius: "5px",
            border: "1px solid #dee2e6",
            fontSize: "12px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          <h4>📊 测试结果:</h4>
          {testResult}
        </div>
      )}

      {/* 解决方案建议 */}
      <div
        style={{
          backgroundColor: "#d4edda",
          padding: "15px",
          borderRadius: "5px",
          marginTop: "20px",
          border: "1px solid #c3e6cb",
        }}
      >
        <h3>💡 解决方案建议</h3>
        <ol style={{ fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
          <li>
            <strong>申请正式APP ID:</strong> 访问{" "}
            <a
              href="https://connect.qq.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              QQ互联开放平台
            </a>
          </li>
          <li>
            <strong>配置回调域名:</strong> 在应用管理中添加您的域名
          </li>
          <li>
            <strong>检查应用状态:</strong> 确保应用已通过审核且状态正常
          </li>
          <li>
            <strong>使用HTTPS:</strong> 生产环境建议使用HTTPS回调地址
          </li>
          <li>
            <strong>测试网络:</strong> 确保能正常访问QQ互联API
          </li>
        </ol>
      </div>
    </div>
  );
};

export default QQLoginDebugger;
