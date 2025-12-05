import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';

// Application constants
export const API_BASE_URL = 'https://api.example.com';
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
