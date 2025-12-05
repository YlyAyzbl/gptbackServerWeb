import { createFileRoute } from '@tanstack/react-router'
import AiTokenUsage from '../pages/AiTokenUsage'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const Route = createFileRoute('/ai-tokens')({
  component: () => (
    <ProtectedRoute>
      <AiTokenUsage />
    </ProtectedRoute>
  ),
})
