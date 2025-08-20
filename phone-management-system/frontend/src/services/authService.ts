import { apiClient } from './api';
import { STORAGE_KEYS } from '../utils/constants';
import type { LoginRequest, AuthResponse, User } from '../types';

export class AuthService {
  // 登录
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/api/v1/auth/login',
      credentials
    );
    
    if (response.success && response.data) {
      // 保存token和用户信息到本地存储
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      return response.data;
    }
    
    throw new Error(response.error || '登录失败');
  }

  // 退出登录
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch (error) {
      // 即使后端退出失败，前端也要清除本地存储
      console.error('退出登录失败:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/v1/auth/me');
    
    if (response.success && response.data) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data));
      return response.data;
    }
    
    throw new Error(response.error || '获取用户信息失败');
  }

  // 修改密码
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const response = await apiClient.post('/api/v1/auth/change-password', {
      oldPassword,
      newPassword
    });
    
    if (!response.success) {
      throw new Error(response.error || '密码修改失败');
    }
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return !!token;
  }

  // 获取本地存储的token
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  // 获取本地存储的用户信息
  getStoredUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('解析用户信息失败:', error);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    return null;
  }

  // 检查用户权限
  hasRole(roles: string | string[]): boolean {
    const user = this.getStoredUser();
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }

  // 检查是否为管理员
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // 检查是否为管理员或经理
  isManagerOrAdmin(): boolean {
    return this.hasRole(['admin', 'manager']);
  }
}

export const authService = new AuthService();
export default authService;