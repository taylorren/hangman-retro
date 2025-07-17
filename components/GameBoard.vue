<template>
  <div class="game-board">
    <!-- Game Header -->
    <div class="game-header">
      <h1 class="game-title">RETRO HANGMAN</h1>
      <div class="game-subtitle">Terminal Edition v1.0</div>
    </div>

    <!-- Difficulty Selection (shown when no game is active) -->
    <div v-if="!gameState.currentWord" class="difficulty-section">
      <div class="section-title">
        <span class="prompt">user@retro-terminal:~$</span>
        <span class="command">hangman --select-difficulty</span>
      </div>
      <DifficultySelector :selected-difficulty="gameState.difficulty" @difficulty-selected="handleDifficultySelected" />
    </div>

    <!-- Main Game Area (shown when game is active) -->
    <div v-else class="game-area">
      <!-- Game Status and Controls -->
      <div class="status-section">
        <GameStatus :game-status="gameState.gameStatus" :current-word="gameState.currentWord"
          :guessed-letters="gameState.guessedLetters" :incorrect-guesses="gameState.incorrectGuesses"
          :max-incorrect-guesses="gameState.maxIncorrectGuesses" :difficulty="gameState.difficulty"
          @restart-game="handleRestartGame" @new-game="handleNewGame" @reset-game="handleResetGame" />
      </div>

      <!-- Game Display Grid -->
      <div class="game-display-grid">
        <!-- Left Column: Hangman Display -->
        <div class="hangman-section">
          <div class="section-header">
            <h3 class="section-title">GALLOWS</h3>
            <div class="section-indicator">
              {{ gameState.incorrectGuesses }}/{{ gameState.maxIncorrectGuesses }}
            </div>
          </div>
          <HangmanSVGDisplay :incorrect-guesses="gameState.incorrectGuesses"
            :max-incorrect-guesses="gameState.maxIncorrectGuesses" :game-status="gameState.gameStatus" />
        </div>

        <!-- Right Column: Word and Input -->
        <div class="word-input-section">
          <!-- Word Display -->
          <div class="word-section">
            <div class="section-header">
              <h3 class="section-title">WORD</h3>
              <div class="section-indicator">
                {{ revealedLettersCount }}/{{ totalUniqueLetters }}
              </div>
            </div>
            <WordDisplay :current-word="gameState.currentWord" :correct-guesses="gameState.correctGuesses"
              :game-status="gameState.gameStatus" />
          </div>

          <!-- Letter Grid -->
          <div class="input-section">
            <div class="section-header">
              <h3 class="section-title">ALPHABET</h3>
              <div class="section-indicator">
                {{ gameState.guessedLetters.length }}/26
              </div>
            </div>
            <LetterGrid :guessed-letters="gameState.guessedLetters" :correct-letters="gameState.correctGuesses"
              :game-status="gameState.gameStatus" @letter-selected="handleLetterSelected" />
          </div>
        </div>
      </div>
    </div>

    <!-- Game Footer -->
    <div class="game-footer">
      <div class="footer-info">
        <span class="status-indicator" :class="gameStatusClass">
          {{ gameStatusText }}
        </span>
        <span class="separator">|</span>
        <span class="difficulty-indicator" v-if="gameState.difficulty">
          DIFFICULTY: {{ gameState.difficulty.toUpperCase() }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { GameState, DifficultyLevel } from '../types/game'
import { getOllamaService } from '../services/OllamaService'

// Import components
import DifficultySelector from './DifficultySelector.vue'
import HangmanSVGDisplay from './HangmanSVGDisplay.vue'
import WordDisplay from './WordDisplay.vue'
import LetterGrid from './LetterGrid.vue'
import GameStatus from './GameStatus.vue'

// Game state
const gameState = ref<GameState>({
  currentWord: '',
  guessedLetters: [],
  correctGuesses: [],
  incorrectGuesses: 0,
  gameStatus: 'playing',
  maxIncorrectGuesses: 6,
  difficulty: 'cet4' // 设置默认难度
})

// Services
const ollamaService = getOllamaService()

// Computed properties
const revealedLettersCount = computed(() => {
  if (!gameState.value.currentWord) return 0
  const uniqueLetters = [...new Set(gameState.value.currentWord.split(''))]
  return uniqueLetters.filter(letter => gameState.value.correctGuesses.includes(letter)).length
})

const totalUniqueLetters = computed(() => {
  if (!gameState.value.currentWord) return 0
  return [...new Set(gameState.value.currentWord.split(''))].length
})

const gameStatusClass = computed(() => {
  switch (gameState.value.gameStatus) {
    case 'won': return 'status-won'
    case 'lost': return 'status-lost'
    default: return 'status-playing'
  }
})

const gameStatusText = computed(() => {
  switch (gameState.value.gameStatus) {
    case 'won': return 'VICTORY'
    case 'lost': return 'DEFEAT'
    default: return 'ACTIVE'
  }
})

// Game logic functions
const checkWinCondition = () => {
  if (!gameState.value.currentWord) return false

  const uniqueLetters = [...new Set(gameState.value.currentWord.split(''))]
  return uniqueLetters.every(letter => gameState.value.correctGuesses.includes(letter))
}

const checkLoseCondition = () => {
  return gameState.value.incorrectGuesses >= gameState.value.maxIncorrectGuesses
}

const updateGameStatus = () => {
  if (checkWinCondition()) {
    gameState.value.gameStatus = 'won'
  } else if (checkLoseCondition()) {
    gameState.value.gameStatus = 'lost'
  } else {
    gameState.value.gameStatus = 'playing'
  }
}

// Fallback words for each difficulty
const fallbackWords = {
  cet4: ['APPLE', 'HOUSE', 'WATER', 'HAPPY', 'STUDY', 'FRIEND', 'SCHOOL', 'FAMILY'],
  cet6: ['CHALLENGE', 'KNOWLEDGE', 'ENVIRONMENT', 'TECHNOLOGY', 'UNIVERSITY', 'DEVELOPMENT'],
  toefl: ['SOPHISTICATED', 'COMPREHENSIVE', 'FUNDAMENTAL', 'CONTEMPORARY', 'SIGNIFICANT'],
  gre: ['UBIQUITOUS', 'PERSPICACIOUS', 'MAGNANIMOUS', 'SERENDIPITY', 'EPHEMERAL']
}

const getFallbackWord = (difficulty: DifficultyLevel): string => {
  const words = fallbackWords[difficulty] || fallbackWords.cet4
  return words[Math.floor(Math.random() * words.length)] || 'CAT'
}

// Event handlers
const handleDifficultySelected = async (difficulty: DifficultyLevel) => {
  gameState.value.difficulty = difficulty

  try {
    // Try to get word from Ollama service
    const word = await ollamaService.generateWord(difficulty)
    gameState.value.currentWord = word.toUpperCase()
  } catch (error) {
    console.warn('Ollama service unavailable, using fallback word:', error)
    // Use fallback word based on difficulty
    const fallbackWord = getFallbackWord(difficulty)
    gameState.value.currentWord = fallbackWord.toUpperCase()
  }

  // Reset game state for new game
  gameState.value.guessedLetters = []
  gameState.value.correctGuesses = []
  gameState.value.incorrectGuesses = 0
  gameState.value.gameStatus = 'playing'
}

const handleLetterSelected = (letter: string) => {
  // Prevent duplicate guesses or guessing when game is over
  if (gameState.value.guessedLetters.includes(letter) || gameState.value.gameStatus !== 'playing') {
    return
  }

  // Add letter to guessed letters
  gameState.value.guessedLetters.push(letter)

  // Check if letter is in the word
  if (gameState.value.currentWord.includes(letter)) {
    // Correct guess
    gameState.value.correctGuesses.push(letter)
  } else {
    // Incorrect guess
    gameState.value.incorrectGuesses++
  }

  // Update game status
  updateGameStatus()
}

const handleRestartGame = () => {
  // Reset guesses but keep the same word and difficulty
  gameState.value.guessedLetters = []
  gameState.value.correctGuesses = []
  gameState.value.incorrectGuesses = 0
  gameState.value.gameStatus = 'playing'
}

const handleNewGame = async () => {
  if (!gameState.value.difficulty) return

  try {
    // Get a new word
    const word = await ollamaService.generateWord(gameState.value.difficulty)
    gameState.value.currentWord = word.toUpperCase()
  } catch (error) {
    console.warn('Ollama service unavailable, using fallback word:', error)
    const fallbackWord = getFallbackWord(gameState.value.difficulty)
    gameState.value.currentWord = fallbackWord.toUpperCase()
  }

  // Reset all game state
  gameState.value.guessedLetters = []
  gameState.value.correctGuesses = []
  gameState.value.incorrectGuesses = 0
  gameState.value.gameStatus = 'playing'
}

const handleResetGame = () => {
  // Reset to difficulty selection
  gameState.value.currentWord = ''
  gameState.value.guessedLetters = []
  gameState.value.correctGuesses = []
  gameState.value.incorrectGuesses = 0
  gameState.value.gameStatus = 'playing'
  gameState.value.difficulty = 'cet4' // 重置为默认难度而不是undefined
}

// Initialize component
onMounted(() => {
  console.log('GameBoard initialized')
})
</script>

<style scoped>
/* @tailwind directives are processed by PostCSS */
.game-board {
  @apply min-h-screen bg-retro-dark text-retro-green font-mono;
  @apply flex flex-col;
  @apply p-4 md:p-8;
}

/* Game Header */
.game-header {
  @apply text-center mb-8;
}

.game-title {
  @apply text-4xl md:text-6xl font-bold mb-2;
  @apply text-retro-amber;
  text-shadow: 0 0 20px rgba(255, 191, 0, 0.6);
  letter-spacing: 0.1em;
}

.game-subtitle {
  @apply text-sm text-retro-green opacity-75;
  @apply tracking-wider;
}

/* Difficulty Section */
.difficulty-section {
  @apply flex flex-col items-center space-y-6;
  @apply max-w-2xl mx-auto;
}

.prompt {
  @apply text-retro-amber;
}

.command {
  @apply text-retro-green;
  @apply ml-2;
}

/* Game Area */
.game-area {
  @apply flex-1 flex flex-col space-y-8;
  @apply max-w-7xl mx-auto w-full;
}

/* Status Section */
.status-section {
  @apply flex justify-center;
}

/* Game Display Grid */
.game-display-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-8;
  @apply flex-1;
}

/* Sections */
.hangman-section,
.word-input-section {
  @apply flex flex-col space-y-6;
}

.word-section,
.input-section {
  @apply flex flex-col space-y-4;
}

/* Section Headers */
.section-header {
  @apply flex justify-between items-center;
  @apply border-b border-retro-green border-opacity-30 pb-2;
}

.section-title {
  @apply text-lg font-bold text-retro-green;
  @apply tracking-wider;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.section-indicator {
  @apply text-sm text-retro-amber;
  @apply font-mono;
}

/* Game Footer */
.game-footer {
  @apply mt-8 pt-4;
  @apply border-t border-retro-green border-opacity-30;
}

.footer-info {
  @apply flex justify-center items-center space-x-4;
  @apply text-sm font-mono;
}

.status-indicator {
  @apply font-bold;
}

.status-indicator.status-playing {
  @apply text-blue-400;
}

.status-indicator.status-won {
  @apply text-green-400;
}

.status-indicator.status-lost {
  @apply text-red-400;
}

.separator {
  @apply text-retro-green opacity-50;
}

.difficulty-indicator {
  @apply text-retro-amber;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .game-display-grid {
    @apply grid-cols-1 space-y-8;
  }

  .hangman-section {
    @apply order-1;
  }

  .word-input-section {
    @apply order-2;
  }
}

@media (max-width: 640px) {
  .game-board {
    @apply p-2;
  }

  .game-title {
    @apply text-3xl;
  }

  .game-area {
    @apply space-y-6;
  }

  .game-display-grid {
    @apply gap-6;
  }

  .footer-info {
    @apply flex-col space-x-0 space-y-2;
  }
}

/* Terminal Effects */
.section-title {
  animation: terminal-glow 3s ease-in-out infinite alternate;
}

@keyframes terminal-glow {
  from {
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  }

  to {
    text-shadow: 0 0 15px rgba(0, 255, 0, 0.8);
  }
}
</style>