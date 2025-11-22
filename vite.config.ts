import { defineConfig } from 'vite'
import { exec } from 'child_process'
import { promisify } from 'util'
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const execAsync = promisify(exec)

function docsGeneratorPlugin() {
  let timeout = null
  let isGenerating = false

  function getTimestamp() {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  function formatPath(filePath: string) {
    return filePath.replace(process.cwd() + '/', '')
  }

  return {
    name: 'docs-generator',
    async handleHotUpdate({ file, server }) {
      if (file.includes('/steps/') && file.endsWith('.ts') && !file.includes('/lib/')) {
        if (isGenerating) {
          return
        }

        clearTimeout(timeout)
        timeout = setTimeout(async () => {
          const timestamp = getTimestamp()
          const relativePath = formatPath(file)
          console.log(`\x1b[90m${timestamp} \x1b[36m[vite]\x1b[0m \x1b[32m${relativePath} changed, regenerating docs...\x1b[0m`)
          isGenerating = true
          try {
            await execAsync('npm run docs:generate')
            const newTimestamp = getTimestamp()
            console.log(`\x1b[90m${newTimestamp} \x1b[36m[vite]\x1b[0m docs regenerated.`)
            server.ws.send({ type: 'full-reload' })
          } catch (error) {
            const newTimestamp = getTimestamp()
            console.error(`\x1b[90m${newTimestamp} \x1b[36m[vite] \x1b[31merror regenerating docs\x1b[0m`)
            console.error(error)
          } finally {
            isGenerating = false
          }
        }, 1000)
      }
    }
  }
}

function copyStepsPlugin() {
  return {
    name: 'copy-steps',
    closeBundle() {
      const stepsDir = 'steps'
      const distStepsDir = join('dist', 'steps')

      if (!existsSync(distStepsDir)) {
        mkdirSync(distStepsDir, { recursive: true })
      }

      const files = readdirSync(stepsDir)
      files.forEach(file => {
        if (file.endsWith('.ts')) {
          copyFileSync(join(stepsDir, file), join(distStepsDir, file))
        }
      })

      console.log(`\x1b[36m[vite]\x1b[0m Copied ${files.filter(f => f.endsWith('.ts')).length} TypeScript files from steps/ to dist/steps/`)
    }
  }
}

export default defineConfig({
  root: '.',
  base: process.env.BASE_URL || '/',
  server: {
    port: 8127,
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
        'plugin-preview-pr': './plugin-preview-pr.html'
      }
    }
  },
  plugins: [docsGeneratorPlugin(), copyStepsPlugin()]
})