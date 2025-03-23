import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env': {
      VUE_APP_SOCKET_HOST: JSON.stringify('localhost'),
      VUE_APP_SOCKET_PORT: JSON.stringify('3000'),
    },
  },
})
