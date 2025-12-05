export interface ModelColor {
  light: string;
  dark: string;
}

export interface ModelStats {
  requests: string;
  tokens: string;
  percentage: number;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  icon: string;
  color: ModelColor;
  backgroundColor: {
    light: string;
    dark: string;
  };
  textColor: {
    light: string;
    dark: string;
  };
  stats: ModelStats;
}

export interface ModelCategory {
  label: string;
  description: string;
}

export interface ModelsConfig {
  models: Model[];
  chartColors: string[];
  categories: Record<string, ModelCategory>;
}
