import { createTheme, ThemeOptions } from '@mui/material/styles';

// Basic theme to keep ThemeProvider working without errors
// We rely on Tailwind for actual styling now
const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
        primary: { main: '#3b82f6' },
        background: { default: '#ffffff', paper: '#ffffff' },
      }
      : {
        primary: { main: '#3b82f6' },
        background: { default: '#0f172a', paper: '#1e293b' },
      }),
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const muiTheme = (mode: 'light' | 'dark') => createTheme(getDesignTokens(mode));

export default muiTheme;