/**
 * Test setup file for Vitest
 * Configures global test environment and mocks
 */

import { vi } from 'vitest'

// Mock environment variables
process.env.DOUBAO_API_KEY = 'test-api-key'
process.env.DOUBAO_MODEL_ENDPOINT = 'test-model'

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn()
}

// Setup DOM environment
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000'
  }
})

// Mock setTimeout and setInterval for testing
vi.stubGlobal('setTimeout', vi.fn((fn) => fn()))
vi.stubGlobal('setInterval', vi.fn((fn) => fn()))
vi.stubGlobal('clearTimeout', vi.fn())
vi.stubGlobal('clearInterval', vi.fn())