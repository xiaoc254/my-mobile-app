// authAPI.ts - 认证相关API服务
import api from './api';

// 认证相关的类型定义
export interface LoginCredentials {
  username: string;
  password: string;
  loginField?: 'username' | 'mobile' | 'email';
}

export interface RegisterData {
  username: string;
  password: string;
  confirmPassword?: string;
  mobile?: string;
  email?: string;
  loginType?: 'username' | 'mobile' | 'email' | 'qq' | 'wechat';
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      mobile?: string;
      email?: string;
      nickname?: string;
      avatar?: string;
      loginType?: string;
      isVerified?: boolean;
      lastLoginAt?: string;
    };
  };
  message: string;
}

export interface User {
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

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
}

// 认证API类
class AuthAPI {
  /**
   * 用户登录
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);

      if (response.data.success && response.data.data.token) {
        // 保存token和用户信息到localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error: any) {
      // 处理错误响应
      if (error.response?.data) {
        throw new Error(error.response.data.message || '登录失败');
      }
      throw new Error('网络连接失败，请检查网络设置');
    }
  }

  /**
   * 用户注册
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // 移除确认密码字段（后端不需要）
      const { confirmPassword, ...registerData } = userData;

      const response = await api.post<AuthResponse>('/auth/register', registerData);

      if (response.data.success && response.data.data.token) {
        // 保存token和用户信息到localStorage
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(error.response.data.message || '注册失败');
      }
      throw new Error('网络连接失败，请检查网络设置');
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<{ user: User }>('/auth/me');
      return response.data.user;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token无效，清除本地存储
        this.logout();
        throw new Error('登录已过期，请重新登录');
      }
      throw new Error('获取用户信息失败');
    }
  }

  /**
   * 获取用户资料
   */
  async getProfile(): Promise<User> {
    try {
      const response = await api.get<User>('/auth/profile');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.logout();
        throw new Error('登录已过期，请重新登录');
      }
      throw new Error('获取用户资料失败');
    }
  }

  /**
   * 更新用户资料
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put<User>('/auth/profile', userData);

      // 更新本地存储的用户信息
      const currentUser = this.getStoredUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.logout();
        throw new Error('登录已过期，请重新登录');
      }
      throw new Error('更新用户资料失败');
    }
  }

  /**
   * 修改密码
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put('/auth/password', {
        oldPassword,
        newPassword
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        if (error.response.data.message === '旧密码错误') {
          throw new Error('旧密码错误');
        }
        this.logout();
        throw new Error('登录已过期，请重新登录');
      }
      throw new Error('修改密码失败');
    }
  }

  /**
   * 退出登录
   */
  async logout(): Promise<void> {
    try {
      // 调用后端退出接口（可选）
      await api.post('/auth/logout');
    } catch (error) {
      // 即使后端调用失败，也要清除本地存储
      console.warn('后端退出接口调用失败:', error);
    } finally {
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  /**
   * 获取存储的token
   */
  getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * 获取存储的用户信息
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('解析用户信息失败:', error);
      return null;
    }
  }

  /**
   * 验证token有效性
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// 导出单例实例
const authAPI = new AuthAPI();
export default authAPI;

// 同时导出类，方便测试时mock
export { AuthAPI };
