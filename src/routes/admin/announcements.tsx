import { createFileRoute } from '@tanstack/react-router'
import AdminAnnouncements from '../../pages/admin/AdminAnnouncements'
import { ProtectedRoute } from '../../components/ProtectedRoute'

export const Route = createFileRoute('/admin/announcements')({
  component: () => (
    <ProtectedRoute>
      <AdminAnnouncements />
    </ProtectedRoute>
  ),
})
