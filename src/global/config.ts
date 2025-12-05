import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';

// Application constants
// Mock服务器配置 - 开发环境使用本地fast_gin服务器
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
export const APP_NAME = 'Redux + React Router Demo';
export const VERSION = '1.0.0';

// Define the MenuItem type
export type MenuItem = {
    name: string;
    path?: string;
    icon?: React.ElementType;
    key: string;
    children?: MenuItem[];
};

// Define the nested menu items
export const MENU_ITEMS: MenuItem[] = [
    {
        name: 'Home',
        key: 'home',
        path: '/',
        icon: HomeIcon,
    },
    {
        name: 'State Management',
        key: 'state',
        path: '/state-demo',
        icon: MemoryIcon,
    },
    {
        name: 'Persistence',
        key: 'persistence',
        path: '/persistence-demo',
        icon: StorageIcon,
    },
];
