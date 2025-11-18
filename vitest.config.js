import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: [
      'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}',
      'steps/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['src/frontend/**/*.ts'],
      exclude: ['src/frontend/**/*.test.ts', 'src/frontend/**/*.spec.ts'],
      reportsDirectory: './coverage'
    },
  },
});