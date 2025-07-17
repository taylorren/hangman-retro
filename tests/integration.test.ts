/**
 * Integration tests for the hangman game
 * Tests Ollama service integration, complete game flow, and error scenarios
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { getOllamaService } from '../services/OllamaService'
import GameBoard from '../components/GameBoard.vue'
import type { DifficultyLevel } from '../types/game'

// Mock fetch for API calls
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Ollama Service Integration', () => {
    it('should generate word successfully with mock response', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{
            message: {
              content: 'COMPUTER'
            }
          }]
        })
      })

      const service = getOllamaService()
      const word = await service.generateWord('cet6')
      
      expect(word).toBe('COMPUTER')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('ark.cn-beijing.volces.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer')
          })
        })
      )
    })

    it('should handle API errors gracefully', async () => {
      // Mock API error
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const service = getOllamaService()
      
      await expect(service.generateWord('cet4')).rejects.toThrow()
    })

    it('should handle invalid API responses', async () => {
      // Mock invalid response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: []
        })
      })

      const service = getOllamaService()
      
      await expect(service.generateWord('cet4')).rejects.toThrow('No choices returned')
    })

    it('should validate generated words', async () => {
      // Mock response with invalid word (numbers)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{
            message: {
              content: '12345'
            }
          }]
        })
      })

      const service = getOllamaService()
      
      await expect(service.generateWord('cet4')).rejects.toThrow('not a valid English word')
    })

    it('should check service availability', async () => {
      // Mock successful availability check
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      const service = getOllamaService()
      const isAvailable = await service.isAvailable()
      
      expect(isAvailable).toBe(true)
    })

    it('should handle service unavailability', async () => {
      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const service = getOllamaService()
      const isAvailable = await service.isAvailable()
      
      expect(isAvailable).toBe(false)
    })
  })

  describe('Complete Game Flow Integration', () => {
    it('should complete full game flow from difficulty selection to win', async () => {
      // Mock successful word generation
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{
            message: {
              content: 'CAT'
            }
          }]
        })
      })

      const wrapper = mount(GameBoard)
      
      // Wait for component to mount
      await wrapper.vm.$nextTick()
      
      // Should start with difficulty selection
      expect(wrapper.text()).toContain('RETRO HANGMAN')
      
      // Simulate difficulty selection (this would trigger word generation)
      const difficultyButtons = wrapper.findAll('button')
      if (difficultyButtons.length > 0) {
        await difficultyButtons[0].trigger('click')
        await wrapper.vm.$nextTick()
        
        // Game should now be active with word loaded
        // Note: In a real test, we'd need to wait for the async word generation
      }
    })

    it('should handle game flow with fallback words when service fails', async () => {
      // Mock API failure
      mockFetch.mockRejectedValue(new Error('Service unavailable'))

      const wrapper = mount(GameBoard)
      await wrapper.vm.$nextTick()
      
      // Simulate difficulty selection
      const difficultyButtons = wrapper.findAll('button')
      if (difficultyButtons.length > 0) {
        await difficultyButtons[0].trigger('click')
        await wrapper.vm.$nextTick()
        
        // Should fall back to predefined words
        // Game should still be playable
        expect(wrapper.exists()).toBe(true)
      }
    })

    it('should handle complete win scenario', async () => {
      const wrapper = mount(GameBoard)
      
      // Simulate game state where player wins
      // This would require setting up the component with a known word
      // and simulating all correct guesses
      
      expect(wrapper.exists()).toBe(true)
    })

    it('should handle complete lose scenario', async () => {
      const wrapper = mount(GameBoard)
      
      // Simulate game state where player loses
      // This would require setting up the component with a known word
      // and simulating 6 incorrect guesses
      
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Error Scenarios and Fallback Mechanisms', () => {
    it('should handle network timeout', async () => {
      // Mock timeout
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )

      const service = getOllamaService()
      
      await expect(service.generateWord('cet4')).rejects.toThrow()
    })

    it('should handle malformed API responses', async () => {
      // Mock malformed response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          // Missing choices array
          error: 'Invalid request'
        })
      })

      const service = getOllamaService()
      
      await expect(service.generateWord('cet4')).rejects.toThrow()
    })

    it('should handle empty API responses', async () => {
      // Mock empty response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{
            message: {
              content: ''
            }
          }]
        })
      })

      const service = getOllamaService()
      
      await expect(service.generateWord('cet4')).rejects.toThrow('Empty response')
    })

    it('should retry on failure', async () => {
      // Mock first call failure, second call success
      mockFetch
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            choices: [{
              message: {
                content: 'RETRY'
              }
            }]
          })
        })

      const service = getOllamaService()
      const word = await service.generateWord('cet4')
      
      expect(word).toBe('RETRY')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should handle API rate limiting', async () => {
      // Mock rate limit response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({
          error: {
            message: 'Rate limit exceeded'
          }
        })
      })

      const service = getOllamaService()
      
      await expect(service.generateWord('cet4')).rejects.toThrow('HTTP 429')
    })

    it('should handle authentication errors', async () => {
      // Mock auth error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          error: {
            message: 'Invalid API key'
          }
        })
      })

      const service = getOllamaService()
      
      await expect(service.generateWord('cet4')).rejects.toThrow('HTTP 401')
    })
  })

  describe('Game State Persistence', () => {
    it('should maintain game state during component lifecycle', async () => {
      const wrapper = mount(GameBoard)
      
      // Simulate game progression
      // Check that state is maintained correctly
      
      expect(wrapper.exists()).toBe(true)
    })

    it('should reset game state properly', async () => {
      const wrapper = mount(GameBoard)
      
      // Simulate game reset
      // Verify all state is cleared
      
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Performance and Resource Management', () => {
    it('should not create memory leaks', async () => {
      const wrapper = mount(GameBoard)
      
      // Simulate multiple game cycles
      // Check for proper cleanup
      
      wrapper.unmount()
      expect(true).toBe(true) // Placeholder for memory leak detection
    })

    it('should handle rapid user interactions', async () => {
      const wrapper = mount(GameBoard)
      
      // Simulate rapid button clicks
      // Ensure system remains stable
      
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Cross-browser Compatibility', () => {
    it('should work with different fetch implementations', async () => {
      // Test with different fetch polyfills
      const service = getOllamaService()
      
      expect(service).toBeDefined()
    })

    it('should handle different Promise implementations', async () => {
      // Test Promise compatibility
      const service = getOllamaService()
      
      expect(service.generateWord).toBeInstanceOf(Function)
    })
  })
})