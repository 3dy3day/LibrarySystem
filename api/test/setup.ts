import { jest } from '@jest/globals';

// Setup global test environment
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'file:./test.db';
});

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log during tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch globally for all tests
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Increase timeout for integration tests
jest.setTimeout(30000);
