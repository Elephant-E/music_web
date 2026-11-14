import api from '@/utils/ky'
import type { CatalogType, Entity } from '@/types/catalog'
import type { Page } from '@/types/common'

export function catalogPath(type: CatalogType, id?: string) {
  const collection = type === 'playlists' ? 'playlists' : `catalog/${type}`
  return id ? `${collection}/${id}` : collection
}

export function getCatalogPage(
  type: CatalogType,
  searchParams: Record<string, string | number>,
  signal?: AbortSignal,
) {
  return api.get(catalogPath(type), { searchParams, signal }).json<Page<Entity>>()
}

export function getCatalogItem(type: CatalogType, id: string, signal?: AbortSignal) {
  return api.get(catalogPath(type, id), { signal }).json<{ item: Entity; can_edit?: boolean }>()
}

export function saveCatalogItem(type: CatalogType, body: Record<string, unknown>, id?: string) {
  return api(catalogPath(type, id), { method: id ? 'PATCH' : 'POST', json: body }).json<{
    item: Entity
  }>()
}
