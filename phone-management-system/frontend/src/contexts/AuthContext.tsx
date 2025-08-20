import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { message } from 'antd';
import { authService } from '../services/authService';
import type { User, LoginRequest } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: string | string[]) => boolean;
  isAdmin: boolean;
  isManagerOrAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化时检查本地存储的用户信息
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authService.getStoredUser();
      const token = authService.getToken();

      if (storedUser && token) {
        try {
          // 验证token有效性并获取最新用户信息
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('验证用户信息失败:', error);
          // token无效，清除本地存储
          await authService.logout();
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setLoading(true);
      const authResponse = await authService.login(credentials);
      setUser(authResponse.user);
      message.success('登录成功');
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      message.success('退出成功');
    } catch (error) {
      console.error('退出失败:', error);
      // 即使退出失败，也要清除本地状态
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      // 如果刷新失败，可能是token过期，执行退出登录
      await logout();
    }
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const isManagerOrAdmin = (): boolean => {
    return hasRole(['admin', 'manager']);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    hasRole,
    isAdmin: isAdmin(),
    isManagerOrAdmin: isManagerOrAdmin()
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};