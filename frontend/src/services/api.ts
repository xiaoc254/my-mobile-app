// services/api.ts
import axios from "axios";

// 动态获取 API 基础 URL
const getBaseURL = () => {
  // 开发环境判断
  if (import.meta.env.DEV) {
    // 获取当前窗口的 hostname，在移动设备上会是实际的 IP 地址
    const hostname = window.location.hostname;
    return `http://${hostname}:3000/api`;
  }

  // 生产环境使用相对路径或配置的域名
  return import.meta.env.VITE_API_URL || "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000  // 增加超时时间到 10 秒
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
