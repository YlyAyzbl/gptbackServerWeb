import { createFileRoute } from '@tanstack/react-router'
import DashboardHome from '../pages/DashboardHome'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <ProtectedRoute>
      <DashboardHome />
    </ProtectedRoute>
  ),
})