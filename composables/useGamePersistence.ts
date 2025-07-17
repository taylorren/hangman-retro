import type { GameState } from '../types/game'

/**
 * Game persistence composable for saving/loading game state
 */
export const useGamePersistence = () => {
    const STORAGE_KEY = 'hangman-game-state'

    // Save game state to localStorage
    const saveGameState = (state: GameState) => {
        if (typeof window !== 'undefined') {
            try {
                const serializedState = JSON.stringify(state)
                localStorage.setItem(STORAGE_KEY, serializedState)
                console.log('Game state saved to localStorage')
            } catch (error) {
                console.error('Failed to save game state:', error)
            }
        }
    }

    // Load game state from localStorage
    const loadGameState = (): GameState | null => {
        if (typeof window !== 'undefined') {
            try {
                const serializedState = localStorage.getItem(STORAGE_KEY)
                if (serializedState) {
                    const state = JSON.parse(serializedState) as GameState
                    console.log('Game state loaded from localStorage')
                    return state
                }
            } catch (error) {
                console.error('Failed to load game state:', error)
            }
        }
        return null
    }

    // Clear saved game state
    const clearSavedState = () => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(STORAGE_KEY)
                console.log('Saved game state cleared')
            } catch (error) {
                console.error('Failed to clear saved state:', error)
            }
        }
    }

    // Check if there's a saved game state
    const hasSavedState = (): boolean => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(STORAGE_KEY) !== null
        }
        return false
    }

    // Auto-save game state (can be called on state changes)
    const autoSave = (state: GameState) => {
        // Only auto-save if game is in progress
        if (state.gameStatus === 'playing' && state.currentWord) {
            saveGameState(state)
        }
    }

    return {
        saveGameState,
        loadGameState,
        clearSavedState,
        hasSavedState,
        autoSave
    }
}