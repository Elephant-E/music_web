import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { CatalogType, Entity } from '@/types/catalog'
import { report } from '@/composables/useFeedback'
import { useLatestRequest } from '@/composables/useLatestRequest'
import { catalogReturnTo } from '@/router'
import { getCatalogItem } from './api'
import { DETAIL_SONG_PAGE_SIZE } from './limits'
import { assertPage, getSongPage } from './songs'

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
      const result = assertPage(
        await getSongPage(type, id, page.value, DETAIL_SONG_PAGE_SIZE, signal),
      )
      if (signal.aborted) return
      songs.value = result.items
      total.value = Number(result.total)
      songPageSize.value = Number(result.page_size) || DETAIL_SONG_PAGE_SIZE
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
