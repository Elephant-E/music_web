import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/utils/ky'
import type { CatalogType, Entity } from '@/types/catalog'
import type { Page } from '@/types/common'
import { report } from '@/composables/useFeedback'
import { useLatestRequest } from '@/composables/useLatestRequest'
import { catalogReturnTo } from '@/router'
import { getCatalogItem, getCatalogPage } from './api'

export function useEntityDetail() {
  const route = useRoute()
  // App keys detail views by path, so each instance owns one entity.
  const type = route.meta.type as CatalogType
  const id = String(route.params.id)
  const backTo = catalogReturnTo(type)
  const item = ref<Entity>()
  const songs = ref<Entity[]>([])
  const page = ref(1)
  const total = ref(0)
  const songPageSize = ref(24)
  const busy = ref(true)
  const error = ref('')
  const editable = ref(false)
  const detailRequest = useLatestRequest()
  const songsRequest = useLatestRequest()

  async function loadSongs() {
    const signal = songsRequest.start()
    try {
      const params: Record<string, string | number> = { page: page.value, page_size: 24 }
      if (type === 'albums') params.album_id = id
      if (type === 'artists') params.artist_id = id
      if (type === 'libraries') params.library_id = id
      const result =
        type === 'playlists'
          ? await api
              .get(`playlists/${id}/songs`, { searchParams: params, signal })
              .json<Page<Entity>>()
          : await getCatalogPage('songs', params, signal)
      if (signal.aborted) return
      songs.value = result.items
      total.value = result.total
      songPageSize.value = result.page_size
    } catch (error) {
      if (!signal.aborted) report(error)
    }
  }

  async function load() {
    const signal = detailRequest.start()
    busy.value = true
    error.value = ''
    try {
      const result = await getCatalogItem(type, id, signal)
      if (signal.aborted) return
      item.value = result.item
      editable.value = result.can_edit ?? true
      if (type !== 'songs') await loadSongs()
    } catch (cause) {
      if (!signal.aborted)
        error.value = cause instanceof Error ? cause.message : '无法加载资料，请重试。'
    } finally {
      if (!signal.aborted) busy.value = false
    }
  }

  onMounted(load)
  return {
    type,
    id,
    backTo,
    item,
    songs,
    page,
    total,
    songPageSize,
    busy,
    error,
    editable,
    load,
    loadSongs,
  }
}
