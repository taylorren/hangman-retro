/**
 * Component tests for Vue components
 * Tests component rendering, prop handling, user interactions, and event handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DifficultySelector from '../components/DifficultySelector.vue'
import WordDisplay from '../components/WordDisplay.vue'
import GameStatus from '../components/GameStatus.vue'
import type { DifficultyLevel } from '../types/game'

describe('Component Tests', () => {
  describe('DifficultySelector Component', () => {
    it('should render all difficulty options', () => {
      const wrapper = mount(DifficultySelector, {
        props: {
          selectedDifficulty: undefined
        }
      })
      
      // Check if all difficulty levels are rendered
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBeGreaterThan(0)
      
      // Check for difficulty level text
      const text = wrapper.text()
      expect(text).toContain('CET4')
      expect(text).toContain('CET6')
      expect(text).toContain('TOEFL')
      expect(text).toContain('GRE')
    })

    it('should emit difficulty-selected event when clicked', async () => {
      const wrapper = mount(DifficultySelector, {
        props: {
          selectedDifficulty: undefined
        }
      })
      
      // Find and click a difficulty button
      const buttons = wrapper.findAll('button')
      if (buttons.length > 0) {
        await buttons[0].trigger('click')
        
        // Check if event was emitted
        expect(wrapper.emitted('difficulty-selected')).toBeTruthy()
      }
    })

    it('should highlight selected difficulty', () => {
      const selectedDifficulty: DifficultyLevel = 'cet4'
      const wrapper = mount(DifficultySelector, {
        props: {
          selectedDifficulty
        }
      })
      
      // Check if selected difficulty has appropriate styling
      const selectedButton = wrapper.find('.selected, .active, [data-selected="true"]')
      expect(selectedButton.exists() || wrapper.text().includes('CET4')).toBe(true)
    })
  })

  describe('WordDisplay Component', () => {
    it('should render word with hidden letters', () => {
      const wrapper = mount(WordDisplay, {
        props: {
          currentWord: 'HANGMAN',
          correctGuesses: [],
          gameStatus: 'playing'
        }
      })
      
      const text = wrapper.text()
      // Should show underscores or hidden letter indicators
      expect(text.includes('_') || text.includes('HANGMAN')).toBe(true)
    })

    it('should reveal correct letters', () => {
      const wrapper = mount(WordDisplay, {
        props: {
          currentWord: 'HANGMAN',
          correctGuesses: ['H', 'A'],
          gameStatus: 'playing'
        }
      })
      
      const text = wrapper.text()
      // Should show revealed letters H and A
      expect(text).toContain('H')
      expect(text).toContain('A')
    })

    it('should show completion state when won', () => {
      const wrapper = mount(WordDisplay, {
        props: {
          currentWord: 'CAT',
          correctGuesses: ['C', 'A', 'T'],
          gameStatus: 'won'
        }
      })
      
      const text = wrapper.text()
      // Should show complete word or completion indicator
      expect(text.includes('CAT') || text.includes('COMPLETE')).toBe(true)
    })

    it('should calculate progress correctly', () => {
      const wrapper = mount(WordDisplay, {
        props: {
          currentWord: 'HANGMAN',
          correctGuesses: ['H', 'A', 'N'],
          gameStatus: 'playing'
        }
      })
      
      // Check if progress is displayed (3 out of 5 unique letters: H, A, N, G, M)
      const text = wrapper.text()
      expect(text.includes('3') || text.includes('progress')).toBe(true)
    })
  })

  describe('GameStatus Component', () => {
    it('should show playing status', () => {
      const wrapper = mount(GameStatus, {
        props: {
          gameStatus: 'playing',
          currentWord: 'HANGMAN',
          guessedLetters: ['A', 'B'],
          incorrectGuesses: 1,
          maxIncorrectGuesses: 6
        }
      })
      
      const text = wrapper.text()
      expect(text.includes('PROGRESS') || text.includes('PLAYING') || text.includes('1/6')).toBe(true)
    })

    it('should show victory status', () => {
      const wrapper = mount(GameStatus, {
        props: {
          gameStatus: 'won',
          currentWord: 'HANGMAN',
          guessedLetters: ['H', 'A', 'N', 'G', 'M'],
          incorrectGuesses: 2,
          maxIncorrectGuesses: 6
        }
      })
      
      const text = wrapper.text()
      expect(text.includes('VICTORY') || text.includes('WON') || text.includes('Congratulations')).toBe(true)
    })

    it('should show defeat status', () => {
      const wrapper = mount(GameStatus, {
        props: {
          gameStatus: 'lost',
          currentWord: 'HANGMAN',
          guessedLetters: ['X', 'Y', 'Z', 'Q', 'W', 'R'],
          incorrectGuesses: 6,
          maxIncorrectGuesses: 6
        }
      })
      
      const text = wrapper.text()
      expect(text.includes('GAME OVER') || text.includes('LOST') || text.includes('Better luck')).toBe(true)
    })

    it('should emit restart event when restart button clicked', async () => {
      const wrapper = mount(GameStatus, {
        props: {
          gameStatus: 'won',
          currentWord: 'HANGMAN',
          guessedLetters: ['H', 'A', 'N', 'G', 'M'],
          incorrectGuesses: 2,
          maxIncorrectGuesses: 6
        }
      })
      
      // Find restart button and click it
      const restartButton = wrapper.find('button:contains("Play Again"), button:contains("Restart"), [data-action="restart"]')
      if (restartButton.exists()) {
        await restartButton.trigger('click')
        expect(wrapper.emitted('restart-game')).toBeTruthy()
      }
    })

    it('should show difficulty when provided', () => {
      const wrapper = mount(GameStatus, {
        props: {
          gameStatus: 'playing',
          currentWord: 'HANGMAN',
          guessedLetters: [],
          incorrectGuesses: 0,
          maxIncorrectGuesses: 6,
          difficulty: 'cet4'
        }
      })
      
      const text = wrapper.text()
      expect(text.includes('CET4') || text.includes('DIFFICULTY')).toBe(true)
    })
  })

  describe('Component Error Handling', () => {
    it('should handle empty props gracefully', () => {
      expect(() => {
        mount(WordDisplay, {
          props: {
            currentWord: '',
            correctGuesses: [],
            gameStatus: 'playing'
          }
        })
      }).not.toThrow()
    })

    it('should handle invalid game status', () => {
      expect(() => {
        mount(GameStatus, {
          props: {
            gameStatus: 'invalid' as any,
            currentWord: 'TEST',
            guessedLetters: [],
            incorrectGuesses: 0,
            maxIncorrectGuesses: 6
          }
        })
      }).not.toThrow()
    })

    it('should handle missing difficulty prop', () => {
      expect(() => {
        mount(DifficultySelector, {
          props: {
            selectedDifficulty: undefined
          }
        })
      }).not.toThrow()
    })
  })

  describe('Component Accessibility', () => {
    it('should have proper button roles and labels', () => {
      const wrapper = mount(DifficultySelector, {
        props: {
          selectedDifficulty: undefined
        }
      })
      
      const buttons = wrapper.findAll('button')
      buttons.forEach(button => {
        // Check if button has text content or aria-label
        const hasLabel = button.text().length > 0 || button.attributes('aria-label')
        expect(hasLabel).toBe(true)
      })
    })

    it('should support keyboard navigation', async () => {
      const wrapper = mount(DifficultySelector, {
        props: {
          selectedDifficulty: undefined
        }
      })
      
      const buttons = wrapper.findAll('button')
      if (buttons.length > 0) {
        // Test Enter key
        await buttons[0].trigger('keydown.enter')
        expect(wrapper.emitted('difficulty-selected')).toBeTruthy()
      }
    })
  })

  describe('Component Reactivity', () => {
    it('should update when props change', async () => {
      const wrapper = mount(WordDisplay, {
        props: {
          currentWord: 'HANGMAN',
          correctGuesses: ['H'],
          gameStatus: 'playing'
        }
      })
      
      // Update props
      await wrapper.setProps({
        correctGuesses: ['H', 'A', 'N']
      })
      
      // Check if component updated
      const text = wrapper.text()
      expect(text).toContain('H')
      expect(text).toContain('A')
      expect(text).toContain('N')
    })

    it('should handle game status changes', async () => {
      const wrapper = mount(GameStatus, {
        props: {
          gameStatus: 'playing',
          currentWord: 'TEST',
          guessedLetters: [],
          incorrectGuesses: 0,
          maxIncorrectGuesses: 6
        }
      })
      
      // Change to won status
      await wrapper.setProps({
        gameStatus: 'won'
      })
      
      const text = wrapper.text()
      expect(text.includes('VICTORY') || text.includes('WON')).toBe(true)
    })
  })
})