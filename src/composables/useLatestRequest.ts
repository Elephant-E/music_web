import { onScopeDispose } from 'vue'

// Each resource owns one request: starting another request invalidates the previous result.
export function useLatestRequest() {
  let current: AbortController | undefined

  function cancel() {
    current?.abort()
  }

  function start() {
    cancel()
    current = new AbortController()
    return current.signal
  }

  onScopeDispose(cancel)
  return { start, cancel }
}
