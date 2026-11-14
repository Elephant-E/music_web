import { useSignStore } from '@/stores/sign'

export const fileUrl = (id: string) => `/api/file/${useSignStore().user?.id}/${id}`
