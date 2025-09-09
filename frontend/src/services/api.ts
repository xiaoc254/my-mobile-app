// services/api.ts
import axios from "axios";

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// 商品相关API
export const productAPI = {
  // 获取所有商品
  getProducts: () => api.get('/products'),

  // 根据ID获取商品
  getProductById: (id: string) => api.get(`/products/${id}`),

  // 创建商品
  createProduct: (productData: any) => api.post('/products', productData),

  // 更新商品
  updateProduct: (id: string, productData: any) => api.put(`/products/${id}`, productData),

  // 删除商品
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
};

// 订单相关API
export const orderAPI = {
  // 获取用户订单列表
  getOrders: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/orders', { params }),

  // 根据ID获取订单详情
  getOrderById: (id: string) => api.get(`/orders/${id}`),

  // 创建订单
  createOrder: (orderData: {
    items: Array<{
      productId: string;
      quantity: number;
      spec?: string;
    }>;
    shippingAddress: {
      name: string;
      phone: string;
      address: string;
      city: string;
      province: string;
      postalCode: string;
    };
    paymentMethod?: string;
    remark?: string;
  }) => api.post('/orders', orderData),

  // 更新订单状态
  updateOrderStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }),

  // 取消订单
  cancelOrder: (id: string) => api.put(`/orders/${id}/cancel`),
};

export default api;
