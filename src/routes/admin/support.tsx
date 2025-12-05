import { createFileRoute } from '@tanstack/react-router'
import AdminSupport from '../../pages/admin/AdminSupport'
import { ProtectedRoute } from '../../components/ProtectedRoute'

export const Route = createFileRoute('/admin/support')({
  component: () => (
    <ProtectedRoute>
      <AdminSupport />
    </ProtectedRoute>
  ),
})
