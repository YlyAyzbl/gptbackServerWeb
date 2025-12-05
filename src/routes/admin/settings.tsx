import { createFileRoute } from '@tanstack/react-router'
import AdminSettings from '../../pages/admin/AdminSettings'
import { ProtectedRoute } from '../../components/ProtectedRoute'

export const Route = createFileRoute('/admin/settings')({
  component: () => (
    <ProtectedRoute>
      <AdminSettings />
    </ProtectedRoute>
  ),
})
