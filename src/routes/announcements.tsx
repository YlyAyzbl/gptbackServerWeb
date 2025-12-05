import { createFileRoute } from '@tanstack/react-router'
import Announcements from '../pages/Announcements'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const Route = createFileRoute('/announcements')({
  component: () => (
    <ProtectedRoute>
      <Announcements />
    </ProtectedRoute>
  ),
})