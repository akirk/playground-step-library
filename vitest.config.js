import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}',
      'steps/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'
    ],
  },
});