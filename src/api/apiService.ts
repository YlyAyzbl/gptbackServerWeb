import axiosInstance, { ApiResponse } from './axiosInstance';

// 认证相关接口
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  code?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

// 用户管理接口
export interface UsersResponse {
  users: User[];
  total: number;
}

export interface UserRequest {
  name: string;
  email: string;
  role: string;
  status: string;
}

// 其他数据接口
export interface DashboardData {
  stats: Array<{
    id: string;
    title: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: string;
    iconColorClass: string;
    iconBgClass: string;
  }>;
  trendData: Array<{
    date: string;
    requests: number;
    tokens: number;
  }>;
  models: any[];
  chartColors: string[];
}

export interface Service {
  id: number;
  name: string;
  description: string;
  status: string;
  uptime: string;
  icon: string;
  bg: string;
}

export interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created: string;
  category: string;
}

// API Service 类
class ApiService {
  // ==================== 认证相关 ====================

  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      '/api/login',
      credentials
    );
    return response;
  }

  // ==================== 用户管理 ====================

  /**
   * 获取用户列表
   */
  async getUsers(): Promise<ApiResponse<UsersResponse>> {
    return axiosInstance.get('/api/users');
  }

  /**
   * 获取单个用户
   */
  async getUserById(id: number): Promise<ApiResponse<User>> {
    return axiosInstance.get(`/api/users/${id}`);
  }

  /**
   * 创建用户
   */
  async createUser(user: UserRequest): Promise<ApiResponse<User>> {
    return axiosInstance.post('/api/users', user);
  }

  /**
   * 更新用户
   */
  async updateUser(id: number, user: UserRequest): Promise<ApiResponse<User>> {
    return axiosInstance.put(`/api/users/${id}`, user);
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return axiosInstance.delete(`/api/users/${id}`);
  }

  // ==================== 仪表板 ====================

  /**
   * 获取仪表板数据
   */
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    return axiosInstance.get('/api/dashboard');
  }

  // ==================== 服务 ====================

  /**
   * 获取服务列表
   */
  async getServices(): Promise<ApiResponse<{ services: Service[]; total: number }>> {
    return axiosInstance.get('/api/services');
  }

  // ==================== 工单 ====================

  /**
   * 获取工单列表
   */
  async getTickets(): Promise<ApiResponse<{ tickets: Ticket[]; total: number }>> {
    return axiosInstance.get('/api/tickets');
  }

  // ==================== Token使用 ====================

  /**
   * 获取Token使用数据
   */
  async getTokenUsage(): Promise<ApiResponse<{ data: Array<{ name: string; value: number }> }>> {
    return axiosInstance.get('/api/token-usage');
  }

  // ==================== 健康检查 ====================

  /**
   * 健康检查
   */
  async healthCheck(): Promise<string> {
    return axiosInstance.get('/api/test');
  }
}

// 创建单例实例
export default new ApiService();
