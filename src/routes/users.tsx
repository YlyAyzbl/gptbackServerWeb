import { createFileRoute } from '@tanstack/react-router'
import UserManagement from '../pages/UserManagement'

export const Route = createFileRoute('/users')({
  component: UserManagement,
})
