// ResponsiveContainer.tsx - 响应式容器组件
import React, { type CSSProperties, type ReactNode } from "react";
import { useResponsive, createResponsiveStyles } from "../hooks/useResponsive";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  type?: "page" | "container" | "card";
  padding?: boolean;
  maxWidth?: boolean;
  center?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = "",
  style = {},
  type = "container",
  padding = true,
  maxWidth = true,
  center = true,
}) => {
  const responsive = useResponsive();
  const styles = createResponsiveStyles(responsive);

  const getContainerStyle = (): CSSProperties => {
    let baseStyle: CSSProperties = {};

    switch (type) {
      case "page":
        baseStyle = {
          ...styles.pageContainer,
          minHeight: "100vh",
          width: "100%",
        };
        break;
      case "card":
        baseStyle = {
          ...styles.card,
          backgroundColor: "white",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          border: "1px solid #f0f0f0",
        };
        break;
      case "container":
      default:
        baseStyle = styles.container;
        break;
    }

    // 可选属性控制
    if (!padding) {
      baseStyle.padding = 0;
    }
    if (!maxWidth) {
      baseStyle.maxWidth = "none";
    }
    if (!center) {
      baseStyle.margin = 0;
    }

    return {
      ...baseStyle,
      ...style,
    };
  };

  return (
    <div
      className={`responsive-container ${className}`}
      style={getContainerStyle()}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;
