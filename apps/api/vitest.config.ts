import { defineConfig } from 'vitest/config';

const github = Boolean(process.env.GITHUB_ACTIONS);

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 30_000,
    hookTimeout: 30_000,
    reporters: github ? ['verbose', 'github-actions'] : ['verbose'],
  },
});
