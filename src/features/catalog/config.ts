import type { CatalogType } from '@/types/catalog'
import { qualities } from '@/utils/format'
import { PAGE_SIZES } from './limits'

export const catalogTypes = ['songs', 'albums', 'artists', 'playlists', 'libraries'] as const

export const catalogLabels: Record<CatalogType, string> = {
  songs: '歌曲',
  albums: '专辑',
  artists: '歌手',
  playlists: '歌单',
  libraries: '媒体库',
}

export const catalogIntroductions: Record<CatalogType, string> = {
  libraries: '按用途整理音乐、有声内容与其他音频。',
  songs: '查看、试听和管理歌曲。',
  albums: '查看专辑、曲目和发行信息。',
  artists: '查看歌手和他们的歌曲、专辑。',
  playlists: '创建歌单，添加歌曲并调整顺序。',
}

export const qualityOptions = [
  { value: '', label: '所有音质' },
  ...Object.entries(qualities).map(([value, label]) => ({ value, label })),
]

export const sortOptions = [
  { value: 'latest', label: '最近加入' },
  { value: 'oldest', label: '最早加入' },
  { value: 'name', label: '按名称' },
]

export const pageOptions = PAGE_SIZES.map((value) => ({ value, label: `${value} 条 / 页` }))
