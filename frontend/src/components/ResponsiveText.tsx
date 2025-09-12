// ResponsiveText.tsx - 响应式文本组件
import React, { type CSSProperties, type ReactNode } from "react";
import { useResponsive, createResponsiveStyles } from "../hooks/useResponsive";

interface ResponsiveTextProps {
  children: ReactNode;
  variant?: "title" | "subtitle" | "body" | "caption";
  color?: string;
  align?: "left" | "center" | "right";
  weight?: "normal" | "medium" | "bold";
  className?: string;
  style?: CSSProperties;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = "body",
  color = "inherit",
  align = "left",
  weight = "normal",
  className = "",
  style = {},
  as: Component = "div",
}) => {
  const responsive = useResponsive();
  const styles = createResponsiveStyles(responsive);

  const getTextStyle = (): CSSProperties => {
    let baseStyle: CSSProperties = {};

    switch (variant) {
      case "title":
        baseStyle = styles.title;
        break;
      case "subtitle":
        baseStyle = styles.subtitle;
        break;
      case "body":
        baseStyle = styles.text;
        break;
      case "caption":
        baseStyle = {
          fontSize: responsive.isMobile ? "12px" : "14px",
          lineHeight: responsive.isMobile ? "16px" : "18px",
          color: "#666",
        };
        break;
    }

    const weightMap = {
      normal: "400",
      medium: "500",
      bold: "600",
    };

    return {
      ...baseStyle,
      color,
      textAlign: align,
      fontWeight: weightMap[weight],
      marginTop: 0,
      marginRight: 0,
      marginLeft: 0,
      marginBottom: 0,
      ...style,
    };
  };

  return (
    <Component
      className={`responsive-text ${className}`}
      style={getTextStyle()}
    >
      {children}
    </Component>
  );
};

export default ResponsiveText;
