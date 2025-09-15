import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button, Card } from "antd-mobile";
import { isMobileDevice, getMobileDebugInfo } from "../utils/mobileUtils";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class MobileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("📱 移动端错误边界捕获:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const debugInfo = getMobileDebugInfo();

      return (
        <div
          style={{
            padding: "20px",
            minHeight: "100vh",
            backgroundColor: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Card style={{ maxWidth: "400px", width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>😵</div>
              <h2 style={{ margin: "0 0 16px 0", color: "#ff4757" }}>
                应用出现错误
              </h2>
              <p style={{ color: "#666", marginBottom: "20px" }}>
                抱歉，应用遇到了一些问题。请尝试刷新页面或重新启动应用。
              </p>

              <div
                style={{ display: "flex", gap: "12px", marginBottom: "20px" }}
              >
                <Button
                  color="primary"
                  onClick={this.handleRetry}
                  style={{ flex: 1 }}
                >
                  重试
                </Button>
                <Button
                  color="default"
                  onClick={this.handleReload}
                  style={{ flex: 1 }}
                >
                  刷新页面
                </Button>
              </div>

              {isMobileDevice() && (
                <details
                  style={{ textAlign: "left", fontSize: "12px", color: "#999" }}
                >
                  <summary style={{ cursor: "pointer", marginBottom: "8px" }}>
                    调试信息 (点击展开)
                  </summary>
                  <pre
                    style={{
                      background: "#f8f8f8",
                      padding: "8px",
                      borderRadius: "4px",
                      overflow: "auto",
                      fontSize: "10px",
                    }}
                  >
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                  {this.state.error && (
                    <div style={{ marginTop: "8px" }}>
                      <strong>错误信息:</strong>
                      <pre
                        style={{
                          background: "#ffebee",
                          padding: "8px",
                          borderRadius: "4px",
                          overflow: "auto",
                          fontSize: "10px",
                          color: "#c62828",
                        }}
                      >
                        {this.state.error.toString()}
                      </pre>
                    </div>
                  )}
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MobileErrorBoundary;
