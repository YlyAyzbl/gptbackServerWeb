import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import DashboardLayout from '../components/DashboardLayout'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <DashboardLayout>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </DashboardLayout>
  );
}
