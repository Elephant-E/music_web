import type { Quality } from './catalog'

export interface User {
  id: number
  username: string
  pseudonym: string | null
  avatar: string | null
  role: 'user' | 'edit' | 'admin'
  quality: Quality
  notice_version: string | null
  size_upload: number
}
export interface PlaybackLibrarySettings {
  libraries: { id: number; name: string }[]
  library_ids: number[]
}
export interface ContributionConfig {
  max_file_size: number
  max_cover_size: number
  chunk_size: number
  max_chunk_size: number
  audio_extensions: string[]
  cover_extensions: string[]
  quality_labels: Record<Quality, string>
  notice: { version: string; text: string }
}
