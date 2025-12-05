import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { store, persistor } from './store'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'; // Renamed MUI ThemeProvider
import getMuiTheme from './theme'; // Renamed theme import to avoid conflict with ThemeProvider
import { ThemeProvider as CustomThemeProvider, useTheme } from './hooks/useTheme'; // My custom ThemeProvider and useTheme hook
import 'normalize.css'
import './index.css'

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const App = () => {
  const { isDarkMode } = useTheme();
  const theme = getMuiTheme(isDarkMode ? 'dark' : 'light');

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </MuiThemeProvider>
  );
};

const rootElement = document.getElementById('app')!

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        {/* @ts-ignore */}
        <PersistGate loading={null} persistor={persistor}>
          <CustomThemeProvider> {/* My custom ThemeProvider */}
            <App /> {/* Render the App component here */}
          </CustomThemeProvider>
        </PersistGate>
      </Provider>
    </React.StrictMode>
  )
}
