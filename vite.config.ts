import { defineConfig } from 'vite'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

function docsGeneratorPlugin() {
  let timeout = null
  let isGenerating = false

  return {
    name: 'docs-generator',
    async handleHotUpdate({ file, server }) {
      if (file.includes('/steps/') && file.endsWith('.ts') && !file.includes('/lib/')) {
        if (isGenerating) {
          return
        }

        clearTimeout(timeout)
        timeout = setTimeout(async () => {
          console.log('📚 Regenerating docs...')
          isGenerating = true
          try {
            await execAsync('npm run docs:generate')
            console.log('✅ Docs regenerated')
            server.ws.send({ type: 'full-reload' })
          } catch (error) {
            console.error('❌ Failed to regenerate docs:', error)
          } finally {
            isGenerating = false
          }
        }, 1000)
      }
    }
  }
}

export default defineConfig({
  root: '.',
  server: {
    port: 8127,
    open: '/index.html'
  },
  plugins: [docsGeneratorPlugin()]
})