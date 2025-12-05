import { createFileRoute } from '@tanstack/react-router'
import AdminSupport from '../../pages/admin/AdminSupport'

export const Route = createFileRoute('/admin/support')({
  component: AdminSupport,
})
