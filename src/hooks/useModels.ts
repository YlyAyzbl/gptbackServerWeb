import { useMemo } from 'react';
import modelsConfig from '../data/models.json';
import { ModelsConfig, Model } from '../types/models';

export const useModels = () => {
  const config = modelsConfig as ModelsConfig;

  const models = useMemo(() => config.models, []);

  const chartColors = useMemo(() => config.chartColors, []);

  const categories = useMemo(() => config.categories, []);

  // 根据分类获取模型
  const getModelsByCategory = (categoryId: string): Model[] => {
    return models.filter(model => model.category === categoryId);
  };

  // 根据 provider 获取模型
  const getModelsByProvider = (provider: string): Model[] => {
    return models.filter(model => model.provider === provider);
  };

  // 根据 ID 获取单个模型
  const getModelById = (id: string): Model | undefined => {
    return models.find(model => model.id === id);
  };

  // 获取所有 provider
  const getProviders = (): string[] => {
    return Array.from(new Set(models.map(model => model.provider)));
  };

  return {
    models,
    chartColors,
    categories,
    getModelsByCategory,
    getModelsByProvider,
    getModelById,
    getProviders,
  };
};
