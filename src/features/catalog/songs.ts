import api from '@/utils/ky'
import type { CatalogType, Entity } from '@/types/catalog'
import type { Page } from '@/types/common'
import { getCatalogPage } from './api'
import { MAX_PAGE_SIZE } from './limits'

/** 详情页按实体类型筛选曲目：专辑 / 歌手 / 媒体库各用不同参数 */
export function songFilter(type: CatalogType, id: string) {
  const filter: Record<string, string | number> = {}
  if (type === 'albums') filter.album_id = id
  if (type === 'artists') filter.artist_id = id
  if (type === 'libraries') filter.library_id = id
  return filter
}

/** 取详情页的一页曲目：歌单走 playlists/{id}/songs，其余走 catalog/songs */
export function getSongPage(
  type: CatalogType,
  id: string,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<Page<Entity>> {
  const params = { ...songFilter(type, id), page, page_size: pageSize }
  return type === 'playlists'
    ? api.get(`playlists/${id}/songs`, { searchParams: params, signal }).json<Page<Entity>>()
    : getCatalogPage('songs', params, signal)
}

/** 接口形状不对时给出可读错误，而不是让 undefined 冒进模板 */
export function assertPage(page: Page<Entity> | null | undefined): Page<Entity> {
  if (!page || !Array.isArray(page.items) || !Number.isFinite(Number(page.total)))
    throw new Error('曲目接口返回的数据格式异常，请稍后重试。')
  return page
}

/**
 * 翻页取某张专辑 / 歌单的全部曲目，最多 limit 首。
 * 页大小固定用后端上限，避免出现「请求一次拿全量」这种越界写法。
 */
export async function getAllSongs(
  type: CatalogType,
  id: string,
  limit: number,
): Promise<{ items: Entity[]; total: number }> {
  const items: Entity[] = []
  let total = Infinity
  for (let page = 1; items.length < limit && items.length < total; page += 1) {
    const result = assertPage(await getSongPage(type, id, page, MAX_PAGE_SIZE))
    total = Number(result.total)
    if (!result.items.length) break
    items.push(...result.items)
  }
  return { items: items.slice(0, limit), total }
}
