import React from 'react';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleColorMode: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = React.useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    return savedMode || 'auto';
  });
  const [systemPrefersDark, setSystemPrefersDark] = React.useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const applyTheme = React.useCallback((mode: ThemeMode, prefersDark: boolean) => {
    const isDark = (mode === 'dark') || (mode === 'auto' && prefersDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    setSystemPrefersDark(mediaQuery.matches); // Initial check

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    applyTheme(themeMode, systemPrefersDark);
  }, [themeMode, systemPrefersDark, applyTheme]);

  const isDarkMode = React.useMemo(() => {
    return (themeMode === 'dark') || (themeMode === 'auto' && systemPrefersDark);
  }, [themeMode, systemPrefersDark]);

  const toggleColorMode = React.useCallback(() => {
    setThemeModeState((prevMode) => {
      // Toggle between light and dark directly, skipping auto for manual toggle
      return prevMode === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const setThemeMode = React.useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
  }, []);

  const value = React.useMemo(() => ({
    themeMode,
    isDarkMode,
    setThemeMode,
    toggleColorMode,
  }), [themeMode, isDarkMode, setThemeMode, toggleColorMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};