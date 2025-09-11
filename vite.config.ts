import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    port: 8127,
    open: '/index.html'
  }
})