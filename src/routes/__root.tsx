import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import DashboardLayout from '../components/DashboardLayout'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {isAuthPage ? (
        <Outlet />
      ) : (
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      )}
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
