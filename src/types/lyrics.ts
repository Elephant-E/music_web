export type LyricFormat = 'text' | 'lrc' | 'elrc' | 'ttml'
export type LyricKind = 'main' | 'translation' | 'pronunciation'
export interface StructuredLyric {
  displayTitle: string
  lang: string
  kind: LyricKind
  synced: boolean
  line: { start?: number; end?: number; value: string }[]
}
export interface LyricInput {
  name: string
  format: LyricFormat
  kind: LyricKind
  language: string
  source: string
  content: string
  is_default: boolean
}
export interface PreparedLyric extends LyricInput {
  lrc: string
  structured: StructuredLyric[]
  source_format: string
  source_data?: EmbeddedLyric | null
}
export interface EmbeddedLyric {
  text?: string
  language?: string
  format?: LyricFormat
  timeStampFormat?: number
  syncText?: { timestamp?: number; text: string }[]
}
export interface LyricVersion {
  id: string
  name: string
  format: LyricFormat
  kind: LyricKind
  language: string
  source: string
  source_format: string
  source_file_id: string | null
  content: string
  lrc: string
  is_default: boolean
  user_id: number
  created_at: string
  updated_at: string
}
