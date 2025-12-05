import { createFileRoute } from '@tanstack/react-router'
import AdminAnnouncements from '../../pages/admin/AdminAnnouncements'

export const Route = createFileRoute('/admin/announcements')({
  component: AdminAnnouncements,
})
