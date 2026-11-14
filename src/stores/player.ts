import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getCatalogItem } from '@/features/catalog/api'
import { useSignStore } from './sign'
import { report } from '@/composables/useFeedback'
import type { AudioFile } from '@/types/uploads'
import type { Entity } from '@/types/catalog'
import { fileUrl } from '@/utils/file'

export const usePlayerStore = defineStore('player', () => {
  const sign = useSignStore()
  const audio = new Audio()
  const file = ref<AudioFile | null>(null)
  const song = ref<Entity | null>(null)
  const playing = ref(false)
  const time = ref(0)
  const length = ref(0)
  const volume = ref(0.8)
  const collapsed = ref(false)
  const available = computed(() => !!file.value)
  audio.preload = 'metadata'
  audio.addEventListener('timeupdate', () => (time.value = audio.currentTime))
  audio.addEventListener(
    'durationchange',
    () => (length.value = Number.isFinite(audio.duration) ? audio.duration : 0),
  )
  audio.addEventListener('play', () => (playing.value = true))
  audio.addEventListener('pause', () => (playing.value = false))
  audio.addEventListener('error', () => {
    playing.value = false
    report(new Error('浏览器无法播放这份音频，请切换音质。'))
  })
  function supported(f: AudioFile) {
    return !!audio.canPlayType(f.mime_type)
  }
  async function play(f: AudioFile, s: Entity) {
    if (file.value?.id === f.id) {
      await toggle()
      return
    }
    audio.pause()
    file.value = f
    song.value = s
    time.value = 0
    length.value = f.duration
    audio.src = fileUrl(f.id)
    audio.volume = volume.value
    try {
      await audio.play()
    } catch (e) {
      report(e)
    }
    if ('mediaSession' in navigator)
      navigator.mediaSession.metadata = new MediaMetadata({
        title: s.name,
        artist: s.artists?.map((a) => a.name).join(' / ') || '跃律',
        album: s.albums?.[0]?.name || '',
      })
  }
  async function playSong(s: Entity) {
    try {
      const full = s.files ? s : (await getCatalogItem('songs', s.id)).item
      const files = full.files || []
      const selected =
        files.find((f) => f.quality === sign.user?.quality && f.is_default) ||
        files.find((f) => f.quality === sign.user?.quality) ||
        files.find((f) => f.is_default) ||
        files[0]
      if (!selected) throw new Error('这首歌还没有音频，请先上传。')
      await play(selected, full)
    } catch (e) {
      report(e)
    }
  }
  async function toggle() {
    if (!file.value) return
    if (playing.value) audio.pause()
    else
      try {
        await audio.play()
      } catch (e) {
        report(e)
      }
  }
  function seek(value: number) {
    if (Number.isFinite(value))
      audio.currentTime = Math.min(Math.max(value, 0), length.value || value)
  }
  function setVolume(value: number) {
    volume.value = value
    audio.volume = value
  }
  function close() {
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
    file.value = null
    song.value = null
    time.value = 0
    length.value = 0
  }
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => void toggle())
    navigator.mediaSession.setActionHandler('pause', () => audio.pause())
    navigator.mediaSession.setActionHandler('seekto', (d) => seek(d.seekTime || 0))
    navigator.mediaSession.setActionHandler('seekbackward', () => seek(time.value - 10))
    navigator.mediaSession.setActionHandler('seekforward', () => seek(time.value + 10))
  }
  return {
    file,
    song,
    playing,
    time,
    length,
    volume,
    collapsed,
    available,
    play,
    playSong,
    toggle,
    seek,
    setVolume,
    close,
    supported,
  }
})
