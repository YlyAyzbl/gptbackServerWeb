import { createFileRoute } from '@tanstack/react-router'
import Announcements from '../pages/Announcements'

export const Route = createFileRoute('/announcements')({
  component: Announcements,
})