import { createFileRoute } from '@tanstack/react-router'
import Services from '../pages/Services'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const Route = createFileRoute('/services')({
  component: () => (
    <ProtectedRoute>
      <Services />
    </ProtectedRoute>
  ),
})