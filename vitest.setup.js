import { vi } from 'vitest';

// Mock 所有需要在模块加载前 mock 的依赖

vi.mock('dotenv', () => ({
  config: vi.fn()
}));

vi.mock('mysql2/promise', () => ({
  default: {
    createPool: vi.fn(() => ({
      execute: vi.fn(),
      getConnection: vi.fn()
    }))
  }
}));
