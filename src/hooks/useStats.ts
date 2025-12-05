import { useMemo } from 'react';
import statsConfig from '../data/stats.json';
import { StatsConfig } from '../types/stats';

export const useStats = () => {
  const config = statsConfig as StatsConfig;

  const dashboardStats = useMemo(() => config.dashboardStats, []);

  return {
    dashboardStats,
  };
};
