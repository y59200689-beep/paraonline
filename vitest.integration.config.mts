import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/integration/**/*.integration.ts'],
    exclude: ['node_modules/**', '.next/**'],
    globalSetup: ['./tests/integration/global-setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
