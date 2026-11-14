import {
  type LyricLine,
  parseLrcLike,
  parseTTML,
  stringifyLrcLike,
  stringifySPL,
} from '@applemusic-like-lyrics/lyric'
import type {
  EmbeddedLyric,
  LyricFormat,
  LyricInput,
  PreparedLyric,
  StructuredLyric,
} from '@/types/lyrics'

export function detectLyricFormat(content: string, filename = ''): LyricFormat {
  const extension = filename.split('.').pop()?.toLowerCase()
  if (extension === 'ttml' || /<(?:\w+:)?tt(?:\s|>)/.test(content)) return 'ttml'
  if (
    extension === 'elrc' ||
    /<\d+:\d{2}(?:\.\d+)?>/.test(content) ||
    /^\s*\[\d+:\d{2}(?:\.\d+)?\][^\n[]+\[\d+:\d{2}/m.test(content)
  )
    return 'elrc'
  if (extension === 'lrc' || /^\s*\[\d+:\d{2}(?:[.:]\d+)?\]/m.test(content)) return 'lrc'
  return 'text'
}

const formatTime = (milliseconds: number) => {
  const value = Math.max(0, Math.round(milliseconds))
  const minutes = String(Math.floor(value / 60000)).padStart(2, '0')
  const seconds = String(Math.floor((value % 60000) / 1000)).padStart(2, '0')
  return `${minutes}:${seconds}.${String(value % 1000).padStart(3, '0')}`
}

function parse(format: LyricFormat, content: string): LyricLine[] {
  const lines = format === 'ttml' ? parseTTML(content).lines : parseLrcLike(content).lines
  return lines
    .filter((line) => !line.isBG && Number.isFinite(line.startTime) && line.startTime >= 0)
    .sort((a, b) => a.startTime - b.startTime)
}

export function prepareLyrics(input: LyricInput): PreparedLyric {
  const content = input.content
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .trim()
  if (!content) throw new Error('请填写歌词内容。')
  if (content.length > 100000) throw new Error('歌词内容不能超过 100000 个字符。')
  const document: StructuredLyric = {
    displayTitle: input.name,
    lang: input.language || 'und',
    kind: input.kind,
    synced: input.format !== 'text',
    line: [],
  }
  let lrc = content
  if (input.format === 'text') {
    document.line = content.split('\n').map((value) => ({ value }))
  } else {
    const lines = parse(input.format, content)
    if (!lines.length) throw new Error('没有读到有效的同步歌词，请检查歌词格式和时间标签。')
    document.line = lines.map((line) => ({
      start: Math.round(line.startTime),
      ...(Number.isFinite(line.endTime) && line.endTime >= line.startTime
        ? { end: Math.round(line.endTime) }
        : {}),
      value: line.words
        .map((word) => word.word)
        .join('')
        .trim(),
    }))
    lrc = stringifyLrcLike(lines, {
      mode: 'plain',
      auxiliaryLines: {
        translation: { enabled: false },
        romanization: { enabled: false },
        backgroundVocal: { enabled: false },
      },
    })
  }
  return { ...input, content, source_format: input.format, lrc, structured: [document] }
}

export function prepareEmbeddedLyrics(lyrics: EmbeddedLyric[], filename: string): PreparedLyric[] {
  const versions: PreparedLyric[] = []
  for (const [index, original] of lyrics.entries()) {
    let content = original.text || original.syncText?.map((line) => line.text).join('\n') || ''
    const timed = (original.syncText || []).filter(
      (line): line is { timestamp: number; text: string } =>
        typeof line.timestamp === 'number' &&
        Number.isFinite(line.timestamp) &&
        line.timestamp >= 0,
    )
    const synchronized = original.timeStampFormat !== 1 && timed.length > 0
    if (synchronized) {
      content = timed.map((line) => `[${formatTime(line.timestamp)}]${line.text}`).join('\n')
    }
    if (!content.trim()) continue
    const format = original.format || detectLyricFormat(content)
    if (format === 'elrc' && synchronized) content = stringifySPL(parseLrcLike(content).lines)
    const prepared = prepareLyrics({
      name: `内嵌歌词 ${index + 1}`,
      format,
      kind: 'main',
      language: original.language || 'und',
      source: filename,
      content,
      is_default: versions.length === 0,
    })
    versions.push({
      ...prepared,
      source_format: synchronized ? 'sylt' : format,
      source_data: original,
    })
  }
  return versions
}
