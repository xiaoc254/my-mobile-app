// services/api.ts
import axios from "axios";

// 动态获取 API 基础 URL
const getBaseURL = () => {
  // 开发环境判断
  if (import.meta.env.DEV) {
    // 开发环境走同源相对路径，让 Vite 代理转发到后端，
    // 这样内网穿透只需要暴露前端端口即可
    return '/api';
  }

  // 生产环境使用相对路径或配置的域名
  return import.meta.env.VITE_API_URL || "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000  // 增加超时时间到 30 秒，支持语音识别
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截器 - 处理401错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
