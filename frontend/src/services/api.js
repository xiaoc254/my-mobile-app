import axios from 'axios';

// 配置axios基础设置
const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // 可以在这里添加跳转到登录页的逻辑
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 宠物相关API
export const petAPI = {
  // 添加宠物
  addPet: async (petData) => {
    try {
      const response = await apiClient.post('/pets', petData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 获取用户所有宠物
  getPets: async () => {
    try {
      const response = await apiClient.get('/pets');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 获取单个宠物详情
  getPetById: async (petId) => {
    try {
      const response = await apiClient.get(`/pets/${petId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 更新宠物信息
  updatePet: async (petId, updateData) => {
    try {
      const response = await apiClient.put(`/pets/${petId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 删除宠物
  deletePet: async (petId) => {
    try {
      const response = await apiClient.delete(`/pets/${petId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// 用户认证相关API
export const authAPI = {
  // 登录
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // 注册
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default apiClient;
