import { useGameState } from './useGameState'

/**
 * Game logic composable for handling game actions and rules
 */
export const useGameLogic = () => {
    const { _gameState: gameState } = useGameState()

    // Make a letter guess
    const makeGuess = (letter: string): boolean => {
        // Validate input
        if (!letter || letter.length !== 1) {
            console.warn('Invalid guess: letter must be a single character')
            return false
        }

        // Convert to uppercase for consistency
        const upperLetter = letter.toUpperCase()

        // Check if letter is alphabetic
        if (!/^[A-Z]$/.test(upperLetter)) {
            console.warn('Invalid guess: letter must be alphabetic')
            return false
        }

        // Check if game is still active
        if (gameState.value.gameStatus !== 'playing') {
            console.warn('Cannot make guess: game is not active')
            return false
        }

        // Check if letter was already guessed
        if (gameState.value.guessedLetters.includes(upperLetter)) {
            console.warn(`Letter ${upperLetter} was already guessed`)
            return false
        }

        // Add letter to guessed letters
        gameState.value.guessedLetters.push(upperLetter)

        // Check if letter is in the word
        if (gameState.value.currentWord.includes(upperLetter)) {
            // Correct guess
            gameState.value.correctGuesses.push(upperLetter)
            console.log(`Correct guess: ${upperLetter}`)

            // Check win condition
            checkWinCondition()
        } else {
            // Incorrect guess
            gameState.value.incorrectGuesses++
            console.log(`Incorrect guess: ${upperLetter} (${gameState.value.incorrectGuesses}/${gameState.value.maxIncorrectGuesses})`)

            // Check lose condition
            checkLoseCondition()
        }

        return true
    }

    // Check if player has won
    const checkWinCondition = () => {
        if (!gameState.value.currentWord) return

        const uniqueLetters = new Set(gameState.value.currentWord.split(''))
        const hasAllLetters = Array.from(uniqueLetters).every(letter =>
            gameState.value.correctGuesses.includes(letter)
        )

        if (hasAllLetters) {
            gameState.value.gameStatus = 'won'
            console.log('🎉 Game won!')
        }
    }

    // Check if player has lost
    const checkLoseCondition = () => {
        if (gameState.value.incorrectGuesses >= gameState.value.maxIncorrectGuesses) {
            gameState.value.gameStatus = 'lost'
            console.log('💀 Game lost!')
        }
    }

    // Check if a letter has been guessed
    const isLetterGuessed = (letter: string): boolean => {
        return gameState.value.guessedLetters.includes(letter.toUpperCase())
    }

    // Check if a letter is correct
    const isLetterCorrect = (letter: string): boolean => {
        return gameState.value.correctGuesses.includes(letter.toUpperCase())
    }

    // Check if a letter is incorrect
    const isLetterIncorrect = (letter: string): boolean => {
        const upperLetter = letter.toUpperCase()
        return gameState.value.guessedLetters.includes(upperLetter) &&
            !gameState.value.correctGuesses.includes(upperLetter)
    }

    // Get letter status for UI styling
    const getLetterStatus = (letter: string): 'available' | 'correct' | 'incorrect' => {
        const upperLetter = letter.toUpperCase()

        if (gameState.value.correctGuesses.includes(upperLetter)) {
            return 'correct'
        } else if (gameState.value.guessedLetters.includes(upperLetter)) {
            return 'incorrect'
        } else {
            return 'available'
        }
    }

    // Get all available letters (not yet guessed)
    const getAvailableLetters = (): string[] => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
        return alphabet.filter(letter => !gameState.value.guessedLetters.includes(letter))
    }

    // Get game statistics
    const getGameStats = () => {
        const totalGuesses = gameState.value.guessedLetters.length
        const correctGuesses = gameState.value.correctGuesses.length
        const incorrectGuesses = gameState.value.incorrectGuesses
        const remainingGuesses = gameState.value.maxIncorrectGuesses - incorrectGuesses

        return {
            totalGuesses,
            correctGuesses,
            incorrectGuesses,
            remainingGuesses,
            accuracy: totalGuesses > 0 ? Math.round((correctGuesses / totalGuesses) * 100) : 0
        }
    }

    return {
        // Actions
        makeGuess,
        checkWinCondition,
        checkLoseCondition,

        // Utilities
        isLetterGuessed,
        isLetterCorrect,
        isLetterIncorrect,
        getLetterStatus,
        getAvailableLetters,
        getGameStats
    }
}