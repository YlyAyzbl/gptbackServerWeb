export interface MenuItem {
  id: string;
  text: string;
  icon: string;
  path: string;
}

export interface SettingsTab {
  id: string;
  label: string;
  icon: string;
}

export interface MenuConfig {
  mainMenu: MenuItem[];
  settingsTabs: SettingsTab[];
}
