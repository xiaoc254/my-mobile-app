import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import api from "../services/api";

interface User {
  id: string;
  username: string;
  mobile?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  loginType?: string;
  isVerified?: boolean;
  lastLoginAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 检查是否已认证
  const isAuthenticated = !!user && !!token;

  // 初始化时检查本地存储的token
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          // 验证token是否仍然有效，但不阻塞初始化过程
          checkAuth().catch(() => {
            // 静默处理错误，不影响用户体验
            console.log("Token validation failed, but continuing...");
          });
        } catch (error) {
          // Token无效，清除本地存储
          console.log("Failed to parse saved auth data:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      }
      // 确保加载状态及时结束，不阻塞导航
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // 检查认证状态
  const checkAuth = async () => {
    try {
      // 设置超时避免长时间等待
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

      const response = await api.get("/auth/me", {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    } catch (error: any) {
      console.log("Auth check failed:", error.message);
      // 只有在明确的401错误时才登出，其他错误（如网络错误）不强制登出
      if (error.response?.status === 401) {
        logout();
      }
      // 对于网络错误等，保持现有状态，不强制登出
    }
  };

  // 登录
  const login = async (username: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { username, password });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;

        setToken(newToken);
        setUser(userData);
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        throw new Error(response.data.message || "登录失败");
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "登录失败");
    }
  };

  // 注册
  const register = async (username: string, password: string) => {
    try {
      const response = await api.post("/auth/register", { username, password });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data;

        setToken(newToken);
        setUser(userData);
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        throw new Error(response.data.message || "注册失败");
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "注册失败");
    }
  };

  // 登出
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
