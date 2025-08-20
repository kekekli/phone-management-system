import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';
import type { ApiResponse } from '../types';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
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
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response;
      },
      (error) => {
        const { response, message: errorMessage } = error;

        if (response) {
          const { status, data } = response;
          
          switch (status) {
            case 401:
              // 未授权，清除本地存储并跳转到登录页
              localStorage.removeItem(STORAGE_KEYS.TOKEN);
              localStorage.removeItem(STORAGE_KEYS.USER);
              window.location.href = '/login';
              message.error('登录已过期，请重新登录');
              break;
            case 403:
              message.error('权限不足');
              break;
            case 404:
              message.error('请求的资源不存在');
              break;
            case 409:
              message.error(data?.error || '数据冲突');
              break;
            case 429:
              message.error('请求过于频繁，请稍后再试');
              break;
            case 500:
              message.error('服务器内部错误');
              break;
            default:
              message.error(data?.error || '请求失败');
          }
        } else if (errorMessage === 'Network Error') {
          message.error('网络连接失败，请检查网络设置');
        } else {
          message.error('请求超时，请稍后再试');
        }

        return Promise.reject(error);
      }
    );
  }

  // GET 请求
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  // POST 请求
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // PUT 请求
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // DELETE 请求
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // PATCH 请求
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;