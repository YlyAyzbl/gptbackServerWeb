import { createFileRoute } from '@tanstack/react-router'
import AiTokenUsage from '../pages/AiTokenUsage'

export const Route = createFileRoute('/ai-tokens')({
  component: AiTokenUsage,
})
