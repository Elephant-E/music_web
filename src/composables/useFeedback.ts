import { ref, shallowRef } from 'vue'

export const notification = ref<{ text: string; error: boolean } | null>(null)
export const notificationTarget = shallowRef<HTMLElement | string>('body')
const dialogs: HTMLDialogElement[] = []

export function registerFeedbackDialog(dialog: HTMLDialogElement) {
  // Feedback must stay inside the active modal, which makes the rest of the page inert.
  unregisterFeedbackDialog(dialog)
  dialogs.push(dialog)
  notificationTarget.value = dialog
}

export function unregisterFeedbackDialog(dialog: HTMLDialogElement) {
  const index = dialogs.indexOf(dialog)
  if (index !== -1) dialogs.splice(index, 1)
  notificationTarget.value = dialogs.at(-1) || 'body'
}

let timer: ReturnType<typeof setTimeout>
export function notify(text: string, error = false) {
  clearTimeout(timer)
  notification.value = { text, error }
  timer = setTimeout(() => (notification.value = null), error ? 9000 : 4500)
}
export function report(error: unknown) {
  notify(error instanceof Error ? error.message : '操作失败，请稍后重试。', true)
}
export function useAction() {
  const busy = ref(false)
  async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
    if (busy.value) return
    busy.value = true
    try {
      return await action()
    } catch (e) {
      report(e)
    } finally {
      busy.value = false
    }
  }
  return { busy, run }
}
