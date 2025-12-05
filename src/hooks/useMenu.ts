import { useMemo } from 'react';
import menuConfig from '../data/menu.json';
import { MenuConfig, MenuItem, SettingsTab } from '../types/menu';

export const useMenu = () => {
  const config = menuConfig as MenuConfig;

  const mainMenu = useMemo(() => config.mainMenu, []);
  const settingsTabs = useMemo(() => config.settingsTabs, []);

  // 根据 ID 获取菜单项
  const getMenuItemById = (id: string): MenuItem | undefined => {
    return mainMenu.find(item => item.id === id);
  };

  // 根据路径获取菜单项
  const getMenuItemByPath = (path: string): MenuItem | undefined => {
    return mainMenu.find(item => item.path === path);
  };

  // 根据 ID 获取设置标签
  const getSettingsTabById = (id: string): SettingsTab | undefined => {
    return settingsTabs.find(tab => tab.id === id);
  };

  return {
    mainMenu,
    settingsTabs,
    getMenuItemById,
    getMenuItemByPath,
    getSettingsTabById,
  };
};
