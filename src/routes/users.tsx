import { createFileRoute } from '@tanstack/react-router'
import UserManagement from '../pages/UserManagement'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const Route = createFileRoute('/users')({
  component: () => (
    <ProtectedRoute>
      <UserManagement />
    </ProtectedRoute>
  ),
})
