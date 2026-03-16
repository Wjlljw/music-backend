import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        'node_modules/',
        'coverage/',
        '**/*.test.js',
        'src/config/database.js',
        'vitest.setup.js'
      ]
    }
  }
});
