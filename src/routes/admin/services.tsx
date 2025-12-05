import { createFileRoute } from '@tanstack/react-router'
import AdminServices from '../../pages/admin/AdminServices'
import { ProtectedRoute } from '../../components/ProtectedRoute'

export const Route = createFileRoute('/admin/services')({
  component: () => (
    <ProtectedRoute>
      <AdminServices />
    </ProtectedRoute>
  ),
})
