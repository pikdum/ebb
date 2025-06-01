import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./renderer/vitest.setup.ts'], // Path relative to project root
    include: ['./renderer/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
});
