import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 对于不需要认证的页面，即使正在加载也允许访问
  if (isLoading && requireAuth) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        加载中...
      </div>
    );
  }

  // 如果需要认证但用户未登录，重定向到登录页
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果已登录但访问登录页，重定向到首页
  if (isAuthenticated && location.pathname === "/login") {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
