import { createFileRoute } from '@tanstack/react-router'
import Support from '../pages/Support'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const Route = createFileRoute('/support')({
  component: () => (
    <ProtectedRoute>
      <Support />
    </ProtectedRoute>
  ),
})