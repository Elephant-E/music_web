import type { User } from './session'

export interface Activity {
  id: number | string
  user_id: number
  user: User
  action: string
  entity_type: string
  entity_id: string
  title: string
  reason: string | null
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  created_at: string
}
export interface Message {
  id: number
  title: string
  body: string
  link: string | null
  read_at: string | null
  created_at: string
}
