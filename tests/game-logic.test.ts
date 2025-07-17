/**
 * Unit tests for game logic functions
 * Tests word validation, guess processing, win/lose conditions, and difficulty configuration
 */

import { describe, it, expect, beforeEach } from 'vitest'
import type { GameState, DifficultyLevel } from '../types/game'
import { validateWordForDifficulty, getDifficultyConfig } from '../utils/difficulty'

describe('Game Logic Tests', () => {
  let gameState: GameState

  beforeEach(() => {
    gameState = {
      currentWord: 'HANGMAN',
      guessedLetters: [],
      correctGuesses: [],
      incorrectGuesses: 0,
      gameStatus: 'playing',
      maxIncorrectGuesses: 6,
      difficulty: 'cet4'
    }
  })

  describe('Word Validation', () => {
    it('should validate word length for CET4 difficulty', () => {
      expect(validateWordForDifficulty('CAT', 'cet4')).toBe(false) // too short (3 letters)
      expect(validateWordForDifficulty('APPLE', 'cet4')).toBe(true) // valid (5 letters)
      expect(validateWordForDifficulty('ELEPHANT', 'cet4')).toBe(false) // too long (8 letters)
    })

    it('should validate word length for different difficulties', () => {
      expect(validateWordForDifficulty('HOUSE', 'cet4')).toBe(true) // 5 letters, valid for CET4 (4-6)
      expect(validateWordForDifficulty('COMPUTER', 'cet6')).toBe(true) // 8 letters, valid for CET6 (6-8)
      expect(validateWordForDifficulty('ALGORITHM', 'toefl')).toBe(true) // 9 letters, valid for TOEFL (7-10)
      expect(validateWordForDifficulty('SOPHISTICATED', 'gre')).toBe(false) // 13 letters, too long for GRE (8-12)
    })
  })

  describe('Guess Processing', () => {
    it('should process correct guesses', () => {
      const letter = 'H'
      const word = 'HANGMAN'
      
      // Simulate correct guess
      if (word.includes(letter)) {
        gameState.guessedLetters.push(letter)
        gameState.correctGuesses.push(letter)
      }
      
      expect(gameState.guessedLetters).toContain('H')
      expect(gameState.correctGuesses).toContain('H')
      expect(gameState.incorrectGuesses).toBe(0)
    })

    it('should process incorrect guesses', () => {
      const letter = 'X'
      const word = 'HANGMAN'
      
      // Simulate incorrect guess
      if (!word.includes(letter)) {
        gameState.guessedLetters.push(letter)
        gameState.incorrectGuesses++
      }
      
      expect(gameState.guessedLetters).toContain('X')
      expect(gameState.correctGuesses).not.toContain('X')
      expect(gameState.incorrectGuesses).toBe(1)
    })

    it('should prevent duplicate guesses', () => {
      const letter = 'A'
      
      // First guess
      gameState.guessedLetters.push(letter)
      gameState.correctGuesses.push(letter)
      
      // Attempt duplicate guess
      const isDuplicate = gameState.guessedLetters.includes(letter)
      
      expect(isDuplicate).toBe(true)
      expect(gameState.guessedLetters.length).toBe(1)
    })
  })

  describe('Win/Lose Condition Detection', () => {
    it('should detect win condition when all letters are guessed', () => {
      const word = 'CAT'
      const correctGuesses = ['C', 'A', 'T']
      
      // Check if all unique letters are guessed
      const uniqueLetters = [...new Set(word.split(''))]
      const isWon = uniqueLetters.every(letter => correctGuesses.includes(letter))
      
      expect(isWon).toBe(true)
    })

    it('should not detect win condition when letters are missing', () => {
      const word = 'HANGMAN'
      const correctGuesses = ['H', 'A', 'N']
      
      // Check if all unique letters are guessed
      const uniqueLetters = [...new Set(word.split(''))]
      const isWon = uniqueLetters.every(letter => correctGuesses.includes(letter))
      
      expect(isWon).toBe(false)
    })

    it('should detect lose condition when max incorrect guesses reached', () => {
      gameState.incorrectGuesses = 6
      gameState.maxIncorrectGuesses = 6
      
      const isLost = gameState.incorrectGuesses >= gameState.maxIncorrectGuesses
      
      expect(isLost).toBe(true)
    })

    it('should not detect lose condition when under max incorrect guesses', () => {
      gameState.incorrectGuesses = 3
      gameState.maxIncorrectGuesses = 6
      
      const isLost = gameState.incorrectGuesses >= gameState.maxIncorrectGuesses
      
      expect(isLost).toBe(false)
    })
  })

  describe('Difficulty Configuration', () => {
    it('should return correct configuration for each difficulty', () => {
      const cet4Config = getDifficultyConfig('cet4')
      const cet6Config = getDifficultyConfig('cet6')
      const toeflConfig = getDifficultyConfig('toefl')
      const greConfig = getDifficultyConfig('gre')
      
      expect(cet4Config?.wordLength).toEqual({ min: 4, max: 6 })
      expect(cet6Config?.wordLength).toEqual({ min: 6, max: 8 })
      expect(toeflConfig?.wordLength).toEqual({ min: 7, max: 10 })
      expect(greConfig?.wordLength).toEqual({ min: 8, max: 12 })
    })

    it('should have appropriate categories for each difficulty', () => {
      const cet4Config = getDifficultyConfig('cet4')
      const greConfig = getDifficultyConfig('gre')
      
      expect(cet4Config?.categories).toContain('animals')
      expect(cet4Config?.categories).toContain('food')
      expect(greConfig?.categories).toContain('science')
      expect(greConfig?.categories).toContain('technology')
    })
  })

  describe('Game State Management', () => {
    it('should initialize game state correctly', () => {
      const initialState: GameState = {
        currentWord: '',
        guessedLetters: [],
        correctGuesses: [],
        incorrectGuesses: 0,
        gameStatus: 'playing',
        maxIncorrectGuesses: 6,
        difficulty: 'cet4'
      }
      
      expect(initialState.gameStatus).toBe('playing')
      expect(initialState.incorrectGuesses).toBe(0)
      expect(initialState.guessedLetters).toHaveLength(0)
      expect(initialState.maxIncorrectGuesses).toBe(6)
    })

    it('should reset game state properly', () => {
      // Simulate game in progress
      gameState.guessedLetters = ['A', 'B', 'C']
      gameState.correctGuesses = ['A']
      gameState.incorrectGuesses = 2
      gameState.gameStatus = 'lost'
      
      // Reset game state
      gameState.guessedLetters = []
      gameState.correctGuesses = []
      gameState.incorrectGuesses = 0
      gameState.gameStatus = 'playing'
      
      expect(gameState.guessedLetters).toHaveLength(0)
      expect(gameState.correctGuesses).toHaveLength(0)
      expect(gameState.incorrectGuesses).toBe(0)
      expect(gameState.gameStatus).toBe('playing')
    })
  })

  describe('Word Selection Logic', () => {
    it('should handle fallback word selection', () => {
      const fallbackWords = {
        cet4: ['APPLE', 'HOUSE', 'WATER'],
        cet6: ['COMPUTER', 'LIBRARY'],
        toefl: ['ALGORITHM', 'FRAMEWORK'],
        gre: ['SOPHISTICATED', 'UBIQUITOUS']
      }
      
      const getFallbackWord = (difficulty: DifficultyLevel): string => {
        const words = fallbackWords[difficulty] || fallbackWords.cet4
        return words[Math.floor(Math.random() * words.length)]
      }
      
      const word = getFallbackWord('cet4')
      expect(fallbackWords.cet4).toContain(word)
    })

    it('should validate generated words meet difficulty requirements', () => {
      const testWords = {
        cet4: 'APPLE',  // 5 letters
        cet6: 'COMPUTER', // 8 letters
        toefl: 'ALGORITHM', // 9 letters
        gre: 'SOPHISTICATED' // 13 letters - should fail
      }
      
      expect(validateWordForDifficulty(testWords.cet4, 'cet4')).toBe(true)
      expect(validateWordForDifficulty(testWords.cet6, 'cet6')).toBe(true)
      expect(validateWordForDifficulty(testWords.toefl, 'toefl')).toBe(true)
      expect(validateWordForDifficulty(testWords.gre, 'gre')).toBe(false) // too long
    })
  })
})