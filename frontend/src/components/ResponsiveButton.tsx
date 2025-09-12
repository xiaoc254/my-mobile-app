// ResponsiveButton.tsx - 响应式按钮组件
import React, {
  type CSSProperties,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { useResponsive, createResponsiveStyles } from "../hooks/useResponsive";

interface ResponsiveButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  variant = "primary",
  size = "medium",
  fullWidth = false,
  loading = false,
  icon,
  className = "",
  style = {},
  disabled,
  ...props
}) => {
  const responsive = useResponsive();
  const styles = createResponsiveStyles(responsive);

  const getButtonStyle = (): CSSProperties => {
    const baseStyle = { ...styles.button };

    // 尺寸调整
    if (size === "small") {
      baseStyle.padding = responsive.isMobile ? "8px 16px" : "10px 18px";
      baseStyle.fontSize = responsive.isMobile ? "12px" : "14px";
      baseStyle.minHeight = responsive.isMobile ? "36px" : "40px";
    } else if (size === "large") {
      baseStyle.padding = responsive.isMobile ? "16px 24px" : "20px 32px";
      baseStyle.fontSize = responsive.isMobile ? "16px" : "20px";
      baseStyle.minHeight = responsive.isMobile ? "52px" : "56px";
    }

    // 变体样式
    const variantStyles: Record<string, CSSProperties> = {
      primary: {
        backgroundColor: "#1677ff",
        color: "white",
        border: "none",
        boxShadow: "0 2px 8px rgba(22, 119, 255, 0.3)",
      },
      secondary: {
        backgroundColor: "#f5f5f5",
        color: "#333",
        border: "1px solid #d9d9d9",
      },
      outline: {
        backgroundColor: "transparent",
        color: "#1677ff",
        border: "1px solid #1677ff",
      },
      text: {
        backgroundColor: "transparent",
        color: "#1677ff",
        border: "none",
        boxShadow: "none",
      },
    };

    const finalStyle: CSSProperties = {
      ...baseStyle,
      ...variantStyles[variant],
      width: fullWidth ? "100%" : "auto",
      cursor: disabled || loading ? "not-allowed" : "pointer",
      opacity: disabled || loading ? 0.6 : 1,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: icon ? "8px" : "0",
      transition: "all 0.3s ease",
      fontWeight: "500",
      userSelect: "none",
      outline: "none",
      ...style,
    };

    return finalStyle;
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      const button = e.currentTarget;
      if (variant === "primary") {
        button.style.backgroundColor = "#4096ff";
        button.style.transform = "translateY(-1px)";
      } else if (variant === "secondary") {
        button.style.backgroundColor = "#e6f4ff";
      } else if (variant === "outline") {
        button.style.backgroundColor = "#f0f8ff";
      }
    }
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      const button = e.currentTarget;
      if (variant === "primary") {
        button.style.backgroundColor = "#1677ff";
        button.style.transform = "translateY(0)";
      } else if (variant === "secondary") {
        button.style.backgroundColor = "#f5f5f5";
      } else if (variant === "outline") {
        button.style.backgroundColor = "transparent";
      }
    }
  };

  return (
    <button
      className={`responsive-button ${className}`}
      style={getButtonStyle()}
      disabled={disabled || loading}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      {...props}
    >
      {loading && (
        <span
          style={{
            display: "inline-block",
            width: "16px",
            height: "16px",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      )}
      {icon && !loading && icon}
      {children}
    </button>
  );
};

export default ResponsiveButton;
