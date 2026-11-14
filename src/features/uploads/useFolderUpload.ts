import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { artworkType } from '@/utils/albumArtwork'
import { useSignStore } from '@/stores/sign'

export function useFolderUpload() {
  const sign = useSignStore()
  const open = ref(false)
  const audio = ref<File[]>([])
  const pictures = ref<{ file: File; url: string; selected: boolean }[]>([])
  const ignored = ref(0)
  const preview = ref<{ url: string; name: string }>()
  const selected = computed(() => pictures.value.filter((picture) => picture.selected))
  function clear() {
    for (const picture of pictures.value) URL.revokeObjectURL(picture.url)
    pictures.value = []
    audio.value = []
    preview.value = undefined
  }
  function show(files: File[], audioOnly: boolean) {
    clear()
    ignored.value = 0
    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase() || ''
      if (
        file.size &&
        sign.config?.audio_extensions.includes(extension) &&
        file.size <= sign.config.max_file_size
      )
        audio.value.push(file)
      else if (!audioOnly && file.size && sign.config?.cover_extensions.includes(extension)) {
        pictures.value.push({
          file,
          url: URL.createObjectURL(file),
          selected: artworkType(file.name) === 'cover',
        })
      } else ignored.value++
    }
    open.value = true
  }
  function remove(index: number) {
    if (index < 0) return
    const [picture] = pictures.value.splice(index, 1)
    if (!picture) return
    if (preview.value?.url === picture.url) preview.value = undefined
    URL.revokeObjectURL(picture.url)
  }
  function files() {
    return [...audio.value, ...selected.value.map((picture) => picture.file)]
  }
  watch(open, (value) => {
    if (!value) clear()
  })
  onBeforeUnmount(clear)
  return { open, audio, pictures, ignored, selected, preview, show, remove, files }
}
