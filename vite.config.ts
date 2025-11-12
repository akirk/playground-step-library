import { defineConfig } from 'vite'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

function docsGeneratorPlugin() {
  return {
    name: 'docs-generator',
    async handleHotUpdate({ file, server }) {
      if (file.includes('/steps/') && file.endsWith('.ts')) {
        console.log('📚 Step file changed, regenerating docs...')
        try {
          await execAsync('npm run docs:generate')
          console.log('✅ Docs regenerated')
          server.ws.send({ type: 'full-reload' })
        } catch (error) {
          console.error('❌ Failed to regenerate docs:', error)
        }
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