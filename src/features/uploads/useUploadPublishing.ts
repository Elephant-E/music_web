import type { ComputedRef } from 'vue'
import api from '@/utils/ky'
import { useSignStore } from '@/stores/sign'
import type { AudioFile, PublishData } from '@/types/uploads'
import type { UploadTask } from './model'

export function useUploadPublishing(tasks: ComputedRef<UploadTask[]>) {
  const sign = useSignStore()
  const publishing = new Set<string>()
  function published(task: UploadTask, result: { file: AudioFile; song_id: string }) {
    const related = tasks.value.filter((entry) => entry.file?.id === result.file.id)
    if (!related.includes(task)) related.push(task)
    for (const entry of related) {
      entry.file = { ...result.file, preview: entry.file?.preview, metadata: null }
      entry.songId = result.song_id
      entry.state = 'published'
      entry.error = ''
      entry.errorStage = undefined
      entry.pendingPublish = undefined
    }
  }
  async function publish(task: UploadTask, data: PublishData) {
    if (!task.file) throw new Error('文件还未解析完成。')
    task.pendingPublish = data
    task.error = ''
    publishing.add(task.id)
    task.state = 'publishing'
    try {
      const result = await api
        .post(`files/${task.file.id}/publish`, { json: data })
        .json<{ file: AudioFile; song_id: string }>()
      published(task, result)
      return result
    } catch (error) {
      task.state = 'ready'
      task.errorStage = 'publishing'
      task.error = error instanceof Error ? error.message : '加入曲库失败，请重试。'
      throw error
    } finally {
      publishing.delete(task.id)
    }
  }
  async function publishMany(items: { task: UploadTask; data: PublishData }[]) {
    const userId = sign.user?.id
    for (let offset = 0; offset < items.length; offset += 100) {
      if (!userId || sign.user?.id !== userId)
        throw new Error('登录状态已改变，请重新打开上传队列。')
      const batch = items
        .slice(offset, offset + 100)
        .filter((item) => item.task.state === 'ready' && item.task.file)
      if (!batch.length) continue
      batch.forEach(({ task, data }) => {
        publishing.add(task.id)
        task.state = 'publishing'
        task.error = ''
        task.pendingPublish = data
      })
      try {
        const response = await api
          .post('files/publish', {
            timeout: 120000,
            json: { items: batch.map(({ task, data }) => ({ ...data, file_id: task.file!.id })) },
          })
          .json<{ items: { file: AudioFile; song_id: string; album_id: string | null }[] }>()
        for (const result of response.items) {
          const entry = batch.find((item) => item.task.file?.id === result.file.id)
          if (entry) {
            published(entry.task, result)
          }
        }
      } catch (error) {
        batch.forEach(({ task }) => {
          task.state = 'ready'
          task.errorStage = 'publishing'
          task.error = error instanceof Error ? error.message : '批量入库失败。'
        })
        throw error
      } finally {
        batch.forEach(({ task }) => publishing.delete(task.id))
      }
    }
  }

  return { publishing, published, publish, publishMany }
}
