import React, { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Home,
  Wrench,
  HeadphonesIcon,
  Megaphone,
  Settings,
  Menu,
  Moon,
  Sun,
  Shield,
  Users
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useMenu } from '../hooks/useMenu';
import { cn } from '../lib/utils';
import { Drawer } from '@mui/material';

// Icon mapping for menu items
const menuIconMap: Record<string, React.ReactNode> = {
  'home': <Home className="w-5 h-5" />,
  'layout-dashboard': <LayoutDashboard className="w-5 h-5" />,
  'wrench': <Wrench className="w-5 h-5" />,
  'headphones': <HeadphonesIcon className="w-5 h-5" />,
  'megaphone': <Megaphone className="w-5 h-5" />,
  'settings': <Settings className="w-5 h-5" />,
  'shield': <Shield className="w-5 h-5" />,
  'users': <Users className="w-5 h-5" />,
};

const drawerWidth = 260;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { themeMode, toggleColorMode } = useTheme();
  const { mainMenu, adminMenu } = useMenu();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getThemeIcon = () => {
    if (themeMode === 'dark') return <Moon className="w-5 h-5" />;
    return <Sun className="w-5 h-5" />;
  };

  const isAdmin = location.pathname.startsWith('/admin');
  const currentMenu = isAdmin ? adminMenu : mainMenu;

  // Transform menu items with icons
  const menuItems = currentMenu.map(item => ({
    text: item.text,
    icon: menuIconMap[item.icon],
    path: item.path,
  }));

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-xl border-r border-border text-card-foreground">
      {/* Brand Header */}
      <div className="flex flex-col items-start px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-500 opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">88code</h1>
        </div>
        <p className="text-xs text-muted-foreground font-medium pl-1">
          {isAdmin ? '管理后台' : 'AI 编码中转站'}
        </p>
      </div>

      {/* Menu Label */}
      <div className="px-6 py-2 mb-2">
        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-70">
          {isAdmin ? 'Admin Menu' : 'Main Menu'}
        </h3>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          // Accurate Active Logic
          const isActive = item.path === '/dashboard' || item.path === '/admin'
            ? location.pathname === item.path
            : item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.text}
              to={item.path === '/dashboard' ? '/dashboard' : item.path}
              className="relative group block"
            >
              {isActive ? (
                /* Active State with SVG Border Beam */
                <div className="relative rounded-xl overflow-hidden group">
                  {/* SVG Border Beam */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 rounded-xl overflow-visible">
                    <defs>
                      <linearGradient id={`gradient-${item.text}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <rect
                      x="1" y="1"
                      width="calc(100% - 2px)"
                      height="calc(100% - 2px)"
                      rx="10"
                      fill="none"
                      stroke={`url(#gradient-${item.text})`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      pathLength="100"
                      className="animate-border-travel opacity-100"
                      strokeDasharray="12 38 12 38"
                      filter="drop-shadow(0 0 3px rgba(139, 92, 246, 0.6))"
                    />
                  </svg>

                  {/* Content Container (Slightly smaller or just padded) */}
                  <div className="relative flex items-center gap-3 px-3 py-2.5 bg-primary/5 text-foreground transition-all z-0">
                    <span className="text-primary relative z-10">
                      {item.icon}
                    </span>
                    <span className="font-bold tracking-wide relative z-10 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                      {item.text}
                    </span>
                    {/* Inner Glow */}
                    <div className="absolute inset-0 bg-primary/5 blur-md" />
                  </div>
                </div>
              ) : (
                /* Inactive State */
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 border border-transparent hover:border-border/50">
                  <span className="group-hover:text-primary transition-colors duration-300">
                    {item.icon}
                  </span>
                  {item.text}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin Back Link */}
      {isAdmin && (
        <div className="px-4 py-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 border border-transparent hover:border-border/50"
          >
            <span className="group-hover:text-primary transition-colors duration-300">
              <Home className="w-5 h-5" />
            </span>
            返回主菜单
          </Link>
        </div>
      )}

      {/* Footer User Info */}
      <div className="p-4 border-t border-border bg-black/5 dark:bg-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-background">
            U
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">User</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            border: 'none',
            backgroundColor: 'transparent'
          },
        }}
        PaperProps={{ className: "bg-transparent shadow-none" }}
      >
        <SidebarContent />
      </Drawer>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-[260px]">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:pl-[260px] transition-all duration-300">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 w-full h-16 bg-background/60 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-4 sm:px-6 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={handleDrawerToggle}
              className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Dynamic Title */}
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="h-6 w-[1px] bg-border mx-2 hidden lg:block" />
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                {(() => {
                  const currentPath = location.pathname;
                  if (currentPath === '/') return 'Home';
                  // Format path: /services -> Services
                  return currentPath.split('/').filter(Boolean).map(segment =>
                    segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : ''
                  ).join(' / ');
                })()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleColorMode}
              className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300 active:scale-95"
            >
              {getThemeIcon()}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}