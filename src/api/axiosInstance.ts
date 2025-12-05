import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../global/config';

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 响应数据接口
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

// 请求拦截器 - 添加认证token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    console.error('请求配置错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理响应数据和错误
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message, data } = response.data;

    // 成功响应 (code === 200 或 201)
    if (code === 200 || code === 201) {
      return Promise.resolve(response.data);
    }

    // 业务逻辑错误
    const error = new Error(message || '请求失败') as AxiosError & { code: number };
    error.code = code;
    return Promise.reject(error);
  },
  (error: AxiosError<ApiResponse>) => {
    // 处理不同的HTTP错误
    if (error.response) {
      const { status, data } = error.response;

      // 401 未授权 - 跳转到登录页
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(new Error('登录已过期，请重新登录'));
      }

      // 403 禁止访问
      if (status === 403) {
        return Promise.reject(new Error('您没有权限访问此资源'));
      }

      // 404 未找到
      if (status === 404) {
        return Promise.reject(new Error('请求的资源不存在'));
      }

      // 500 服务器错误
      if (status === 500) {
        return Promise.reject(new Error('服务器错误，请稍后重试'));
      }

      // 其他错误
      return Promise.reject(
        new Error(data?.message || `请求失败 (${status})`)
      );
    }

    // 网络错误
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请稍后重试'));
    }

    if (error.code === 'ERR_NETWORK') {
      return Promise.reject(new Error('网络连接失败，请检查您的网络'));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
