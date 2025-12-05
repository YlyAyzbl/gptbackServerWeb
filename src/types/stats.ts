export interface StatCard {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
  iconColorClass: string;
  iconBgClass: string;
}

export interface StatsConfig {
  dashboardStats: StatCard[];
}
