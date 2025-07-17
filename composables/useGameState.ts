import type { GameState, DifficultyLevel } from '../types/game'
import { getOllamaService } from '../services/OllamaService'
import { useGamePersistence } from './useGamePersistence'
import { computed, watch, readonly } from 'vue'
import { useState } from 'nuxt/app'
/**
 * Game state management composable using Nuxt's useState
 */
export const useGameState = () => {
    const { loadGameState, autoSave } = useGamePersistence()

    // Initialize game state with default values or loaded state
    const gameState = useState<GameState>('hangman-game-state', () => {
        // Try to load saved state first
        const savedState = loadGameState()
        if (savedState) {
            return savedState
        }

        // Return default state if no saved state
        return {
            currentWord: '',
            guessedLetters: [],
            correctGuesses: [],
            incorrectGuesses: 0,
            gameStatus: 'playing',
            maxIncorrectGuesses: 6, // Classic hangman allows 6 wrong guesses
            difficulty: 'cet4'
        }
    })

    // Watch for state changes and auto-save
    watch(gameState, (newState: GameState) => {
        autoSave(newState)
    }, { deep: true })

    // Initialize a new game with selected difficulty
    const initializeGame = async (difficulty: DifficultyLevel) => {
        try {
            // Get word generation service
            const ollamaService = getOllamaService()

            // Generate word based on difficulty
            const word = await ollamaService.generateWord(difficulty)

            // Reset game state
            gameState.value = {
                currentWord: word,
                guessedLetters: [],
                correctGuesses: [],
                incorrectGuesses: 0,
                gameStatus: 'playing',
                maxIncorrectGuesses: 6,
                difficulty
            }

            console.log(`New game initialized with word: ${word} (${difficulty} difficulty)`)
        } catch (error) {
            console.error('Failed to initialize game:', error)
            throw new Error('Failed to start new game. Please try again.')
        }
    }

    // Reset game state to initial values
    const resetGame = () => {
        gameState.value = {
            currentWord: '',
            guessedLetters: [],
            correctGuesses: [],
            incorrectGuesses: 0,
            gameStatus: 'playing',
            maxIncorrectGuesses: 6,
            difficulty: 'cet4'
        }
    }

    // Get current game state (reactive)
    const getCurrentState = () => gameState.value

    // Check if game is in progress
    const isGameActive = computed(() => gameState.value.gameStatus === 'playing')

    // Check if game is won
    const isGameWon = computed(() => gameState.value.gameStatus === 'won')

    // Check if game is lost
    const isGameLost = computed(() => gameState.value.gameStatus === 'lost')

    // Get remaining incorrect guesses
    const remainingGuesses = computed(() =>
        gameState.value.maxIncorrectGuesses - gameState.value.incorrectGuesses
    )

    // Get word display with revealed letters
    const wordDisplay = computed(() => {
        if (!gameState.value.currentWord) return ''

        return gameState.value.currentWord
            .split('')
            .map((letter: string) => gameState.value.correctGuesses.includes(letter) ? letter : '_')
            .join(' ')
    })

    // Check if all letters are revealed (win condition)
    const isWordComplete = computed(() => {
        if (!gameState.value.currentWord) return false

        return gameState.value.currentWord
            .split('')
            .every((letter: string) => gameState.value.correctGuesses.includes(letter))
    })

    // Get game progress percentage
    const gameProgress = computed(() => {
        if (!gameState.value.currentWord) return 0

        const totalLetters = new Set(gameState.value.currentWord.split('')).size
        const revealedLetters = gameState.value.correctGuesses.length

        return Math.round((revealedLetters / totalLetters) * 100)
    })

    return {
        // State (readonly for external use)
        gameState: readonly(gameState),
        // Internal state (writable for game logic)
        _gameState: gameState,

        // Actions
        initializeGame,
        resetGame,
        getCurrentState,

        // Computed properties
        isGameActive,
        isGameWon,
        isGameLost,
        remainingGuesses,
        wordDisplay,
        isWordComplete,
        gameProgress
    }
}