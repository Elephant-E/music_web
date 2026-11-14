import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api, { setCsrfToken } from '@/utils/ky'
import type { ContributionConfig, User } from '@/types/session'

export const useSignStore = defineStore('sign', () => {
  const user = ref<User | null>(null)
  const config = ref<ContributionConfig | null>(null)
  const ready = ref(false)
  const signUrl = ref('')
  const loginError = ref('')
  const serverUrl = ref('/web/')
  const todbEnabled = ref(false)
  const isSignedIn = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const canModerate = computed(() => ['admin', 'edit'].includes(user.value?.role || ''))
  async function hydrate() {
    const r = await api.get('session').json<{
      user: User | null
      contribution: ContributionConfig
      sign_url: string
      login_error: string | null
      server_url: string
      todb_enabled: boolean
    }>()
    const { csrf_token } = await api.get('csrf-token').json<{ csrf_token: string }>()
    user.value = r.user
    config.value = r.contribution
    signUrl.value = r.sign_url
    loginError.value = r.login_error || ''
    serverUrl.value = r.server_url
    todbEnabled.value = r.todb_enabled
    setCsrfToken(csrf_token)
    ready.value = true
  }
  async function signOut() {
    await api.post('logout')
    user.value = null
    window.dispatchEvent(new Event('music-logout'))
    await hydrate()
  }
  async function acceptNotice() {
    const r = await api
      .post('notice/accept', { json: { accepted: true, version: config.value?.notice.version } })
      .json<{ user: User }>()
    user.value = r.user
  }
  return {
    user,
    config,
    ready,
    signUrl,
    loginError,
    serverUrl,
    todbEnabled,
    isSignedIn,
    isAdmin,
    canModerate,
    hydrate,
    signOut,
    acceptNotice,
  }
})
export default useSignStore
