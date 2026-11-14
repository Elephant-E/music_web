import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(() => {
  return {
    plugins: [vue(), tailwindcss()],
    worker: { format: 'es' as const },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '^/upload(?:[/?]|$)': {
          target: 'http://127.0.0.1:4060',
          changeOrigin: false,
          xfwd: true,
          timeout: 0,
          proxyTimeout: 0,
        },
      },
    },
  }
})
