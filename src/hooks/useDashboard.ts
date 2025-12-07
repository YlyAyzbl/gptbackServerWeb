import { useApiCall } from './useApiCall';
import apiService from '../api/apiService';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  icon: string;
  color: {
    light: string;
    dark: string;
  };
  backgroundColor: {
    light: string;
    dark: string;
  };
  textColor: {
    light: string;
    dark: string;
  };
  stats: {
    requests: string;
    tokens: string;
    percentage: string;
  };
}

export interface DashboardStat {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
  iconColorClass: string;
  iconBgClass: string;
}

export interface TrendData {
  date: string;
  requests: number;
  tokens: number;
}

export interface DashboardData {
  stats: DashboardStat[];
  trendData: TrendData[];
  models: AIModel[];
  chartColors: string[];
}

/**
 * Hook to fetch dashboard data from API
 */
export const useDashboard = () => {
  const { data, loading, error, fetch: refetch } = useApiCall<DashboardData>(
    () => apiService.getDashboardData(),
    true // auto-fetch on mount
  );

  return {
    dashboardStats: data?.stats || [],
    trendData: data?.trendData || [],
    models: data?.models || [],
    chartColors: data?.chartColors || [],
    loading,
    error,
    refetch,
  };
};
