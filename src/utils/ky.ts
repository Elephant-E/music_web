import ky from 'ky'
let csrf = ''
export function setCsrfToken(value: string) {
  csrf = value
}
const api = ky.create({
  prefixUrl: '/api',
  credentials: 'same-origin',
  retry: 0,
  timeout: 30_000,
  headers: { Accept: 'application/json' },
  hooks: {
    beforeRequest: [
      (request) => {
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && csrf)
          request.headers.set('X-CSRF-TOKEN', csrf)
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        if (response.status === 401) window.dispatchEvent(new Event('session-expired'))
      },
    ],
    beforeError: [
      async (error) => {
        const body = (await error.response
          .clone()
          .json()
          .catch(() => null)) as { message?: string } | null
        error.message =
          body?.message ||
          (error.response.status === 419
            ? '页面已过期，请刷新后重试。'
            : `请求失败（${error.response.status}）`)
        return error
      },
    ],
  },
})
export { ky }
export default api
