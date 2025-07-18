<template>
  <div class="game-board">
    <!-- Game Header -->
    <div class="game-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="game-title">RETRO HANGMAN</h1>
          <div class="game-subtitle">Terminal Edition v1.0</div>
        </div>
        <div class="header-controls">
          <ProgressDisplay ref="progressDisplayRef" />
        </div>
      </div>
    </div>

    <!-- Loading Indicator (shown during word generation) -->
    <LoadingIndicator v-if="isLoading" :message="loadingMessage" :difficulty="gameState.difficulty"
      :show-progress="showLoadingProgress" :progress="loadingProgress" :status-messages="loadingStatusMessages" />

    <!-- Difficulty Selection (shown when no game is active) -->
    <div v-if="!gameState.currentWord && !isLoading" class="difficulty-section">
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
                {{ gameState.difficulty.toUpperCase() }}
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
import { getAudioService } from '../services/AudioService'
import { getProgressService } from '../services/ProgressService'

// Import components
import DifficultySelector from './DifficultySelector.vue'
import HangmanSVGDisplay from './HangmanSVGDisplay.vue'
import WordDisplay from './WordDisplay.vue'
import LetterGrid from './LetterGrid.vue'
import GameStatus from './GameStatus.vue'
import LoadingIndicator from './LoadingIndicator.vue'
import ProgressDisplay from './ProgressDisplay.vue'

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
const audioService = getAudioService()
const progressService = getProgressService()

// Component refs
const progressDisplayRef = ref<InstanceType<typeof ProgressDisplay>>()

// Loading state
const isLoading = ref(false)
const loadingMessage = ref('GENERATING WORD')
const showLoadingProgress = ref(true)
const loadingProgress = ref(0)
const loadingStatusMessages = ref<Array<{ type: 'info' | 'success' | 'warning' | 'error', text: string, timestamp?: number }>>([])
const loadingInterval = ref<NodeJS.Timeout>()

// Game tracking state
const gameStartTime = ref<number>(0)
const gameEndTime = ref<number>(0)

// Computed properties
const revealedLettersCount = computed(() => {
  if (!gameState.value.currentWord) return 0
  // Count actual revealed letter positions, not unique letters
  return gameState.value.currentWord.split('').filter(letter =>
    gameState.value.correctGuesses.includes(letter)
  ).length
})

const totalLetters = computed(() => {
  if (!gameState.value.currentWord) return 0
  // Return actual word length, not unique letters count
  return gameState.value.currentWord.length
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
  cet4: ['CAT', 'DOG', 'BOOK', 'TREE', 'HOUSE', 'WATER', 'HAPPY', 'MUSIC'],
  cet6: ['COMPUTER', 'LANGUAGE', 'CULTURE', 'SCIENCE', 'HISTORY', 'NATURE', 'FREEDOM', 'JOURNEY'],
  toefl: ['ARCHITECTURE', 'PHILOSOPHY', 'DEMOCRACY', 'TECHNOLOGY', 'ENVIRONMENT', 'LITERATURE', 'PSYCHOLOGY', 'ECONOMICS'],
  gre: ['METAMORPHOSIS', 'JUXTAPOSITION', 'SERENDIPITY', 'PERSPICACIOUS', 'UBIQUITOUS', 'EPHEMERAL', 'QUINTESSENTIAL', 'MAGNANIMOUS'],
}

const getFallbackWord = (difficulty: DifficultyLevel): string => {
  const words = fallbackWords[difficulty] || fallbackWords.cet4
  return words[Math.floor(Math.random() * words.length)] || 'CAT'
}

// Loading state management functions
const startLoading = (difficulty: DifficultyLevel) => {
  isLoading.value = true
  loadingProgress.value = 0
  loadingStatusMessages.value = []

  // Contextual loading messages based on difficulty
  const difficultyMessages = {
    cet4: 'CONSULTING AI FOR CET-4 VOCABULARY',
    cet6: 'CONSULTING AI FOR CET-6 VOCABULARY',
    toefl: 'CONSULTING AI FOR TOEFL VOCABULARY',
    gre: 'CONSULTING AI FOR GRE VOCABULARY'
  }

  loadingMessage.value = difficultyMessages[difficulty] || 'GENERATING WORD'

  // Add contextual initial status message
  const difficultyDescriptions = {
    cet4: 'basic English vocabulary (4-6 letters)',
    cet6: 'intermediate English vocabulary (6-8 letters)',
    toefl: 'academic English vocabulary (8-12 letters)',
    gre: 'advanced English vocabulary (8-12 letters)'
  }

  addStatusMessage('info', `Initializing ${difficulty.toUpperCase()} word generation...`)
  addStatusMessage('info', `Target: ${difficultyDescriptions[difficulty]}`)

  // Simulate progress with realistic timing and contextual messages
  loadingInterval.value = setInterval(() => {
    if (loadingProgress.value < 90) {
      const increment = Math.random() * 15 + 5 // Random progress between 5-20%
      loadingProgress.value = Math.min(90, loadingProgress.value + increment) // Cap at 90%

      // Add contextual status messages based on progress and difficulty
      if (loadingProgress.value > 15 && loadingProgress.value < 20) {
        addStatusMessage('info', 'Establishing secure connection to AI service...')
      } else if (loadingProgress.value > 30 && loadingProgress.value < 35) {
        addStatusMessage('info', `Configuring ${difficulty.toUpperCase()} difficulty parameters...`)
      } else if (loadingProgress.value > 50 && loadingProgress.value < 55) {
        addStatusMessage('info', 'AI processing vocabulary database...')
      } else if (loadingProgress.value > 70 && loadingProgress.value < 75) {
        addStatusMessage('info', 'Generating contextually appropriate word...')
      } else if (loadingProgress.value > 85 && loadingProgress.value < 90) {
        addStatusMessage('info', 'Validating word complexity and format...')
      }
    }
  }, 300)
}

const stopLoading = (success: boolean, word?: string, error?: string) => {
  if (loadingInterval.value) {
    clearInterval(loadingInterval.value)
  }

  loadingProgress.value = 100

  if (success && word) {
    // Don't reveal the word! Just show success with word length
    addStatusMessage('success', `Word generated successfully (${word.length} letters)`)
    setTimeout(() => {
      isLoading.value = false
    }, 1000) // Show success message briefly
  } else {
    addStatusMessage('error', error || 'Word generation failed')
    addStatusMessage('warning', 'Using fallback word instead...')
    setTimeout(() => {
      isLoading.value = false
    }, 1500) // Show error message a bit longer
  }
}

const addStatusMessage = (type: 'info' | 'success' | 'warning' | 'error', text: string) => {
  loadingStatusMessages.value.push({
    type,
    text,
    timestamp: Date.now()
  })

  // Keep only last 5 messages
  if (loadingStatusMessages.value.length > 5) {
    loadingStatusMessages.value.shift()
  }
}

// Event handlers
const handleDifficultySelected = async (difficulty: DifficultyLevel) => {
  // Play button click sound
  audioService.playButtonClick()

  gameState.value.difficulty = difficulty

  // Start loading indicator
  startLoading(difficulty)

  try {
    // Try to get word from Ollama service
    console.log('🔄 Attempting to generate word for difficulty:', difficulty)

    // First check if the service is available
    addStatusMessage('info', 'Checking AI service connectivity...')
    const isAvailable = await ollamaService.isAvailable()
    console.log('🔍 Service availability check:', isAvailable)

    if (!isAvailable) {
      addStatusMessage('warning', 'AI service temporarily unavailable')
      throw new Error('Service is not available')
    }

    addStatusMessage('info', 'AI service connected, generating word...')
    const word = await ollamaService.generateWord(difficulty)
    console.log('✅ Successfully generated word from API')
    gameState.value.currentWord = word.toUpperCase()

    // Stop loading with success
    stopLoading(true, word)
  } catch (error) {
    console.error('❌ API service failed, using fallback word:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : String(error))

    // Add retry feedback message
    addStatusMessage('warning', 'AI generation failed, switching to fallback...')

    // Use fallback word based on difficulty
    const fallbackWord = getFallbackWord(difficulty)
    console.log('🔄 Using fallback word')
    gameState.value.currentWord = fallbackWord.toUpperCase()

    // Stop loading with error
    stopLoading(false, fallbackWord, error instanceof Error ? error.message : String(error))
  }

  // Reset game state for new game
  gameState.value.guessedLetters = []
  gameState.value.correctGuesses = []
  gameState.value.incorrectGuesses = 0
  gameState.value.gameStatus = 'playing'

  // Start game timing
  gameStartTime.value = Date.now()
}

const handleLetterSelected = (letter: string) => {
  // Prevent duplicate guesses or guessing when game is over
  if (gameState.value.guessedLetters.includes(letter) || gameState.value.gameStatus !== 'playing') {
    return
  }

  // Play letter selection sound
  audioService.playLetterSelect()

  // Add letter to guessed letters
  gameState.value.guessedLetters.push(letter)

  // Check if letter is in the word
  if (gameState.value.currentWord.includes(letter)) {
    // Correct guess - play success sound
    setTimeout(() => audioService.playCorrectGuess(), 100)
    gameState.value.correctGuesses.push(letter)
  } else {
    // Incorrect guess - play error sound
    setTimeout(() => audioService.playIncorrectGuess(), 100)
    gameState.value.incorrectGuesses++
  }

  // Update game status
  const previousStatus = gameState.value.gameStatus
  updateGameStatus()

  // Handle game completion and progress tracking
  if (previousStatus === 'playing' && gameState.value.gameStatus !== 'playing') {
    gameEndTime.value = Date.now()

    console.log('🎮 Game completed! Status:', gameState.value.gameStatus)
    console.log('🎮 Calling trackGameResult...')

    // Track game result in progress system
    trackGameResult()

    if (gameState.value.gameStatus === 'won') {
      setTimeout(() => audioService.playVictory(), 300)
    } else {
      setTimeout(() => audioService.playDefeat(), 300)
    }

    // Start preloading words for all difficulties in background after game completion
    setTimeout(() => ollamaService.preloadAllDifficulties(), 1000)
  }
}

const handleRestartGame = async () => {
  // "Play Again": Keep current difficulty, get a new word
  if (!gameState.value.difficulty) return

  // Start loading indicator for restart
  startLoading(gameState.value.difficulty)

  try {
    // Get a new word with the same difficulty
    const word = await ollamaService.generateWord(gameState.value.difficulty)
    gameState.value.currentWord = word.toUpperCase()

    // Stop loading with success
    stopLoading(true, word)
  } catch (error) {
    console.warn('Ollama service unavailable, using fallback word:', error)
    const fallbackWord = getFallbackWord(gameState.value.difficulty)
    gameState.value.currentWord = fallbackWord.toUpperCase()

    // Stop loading with error
    stopLoading(false, fallbackWord, error instanceof Error ? error.message : String(error))
  }

  // Reset all game state but keep difficulty
  gameState.value.guessedLetters = []
  gameState.value.correctGuesses = []
  gameState.value.incorrectGuesses = 0
  gameState.value.gameStatus = 'playing'
}

const handleNewGame = () => {
  // "New Game": Return to difficulty selection
  gameState.value.currentWord = ''
  gameState.value.guessedLetters = []
  gameState.value.correctGuesses = []
  gameState.value.incorrectGuesses = 0
  gameState.value.gameStatus = 'playing'
  gameState.value.difficulty = 'cet4' // 重置为默认难度
}

const handleResetGame = () => {
  // "Reset": Reset current game (same word, clear guesses)
  gameState.value.guessedLetters = []
  gameState.value.correctGuesses = []
  gameState.value.incorrectGuesses = 0
  gameState.value.gameStatus = 'playing'
}

// Progress tracking function
const trackGameResult = async () => {
  try {
    const gameResult = {
      difficulty: gameState.value.difficulty,
      wordLength: gameState.value.currentWord.length,
      guessesUsed: gameState.value.guessedLetters.length,
      timeElapsed: gameEndTime.value - gameStartTime.value,
      won: gameState.value.gameStatus === 'won',
      incorrectGuesses: gameState.value.guessedLetters.filter(letter =>
        !gameState.value.correctGuesses.includes(letter)
      ),
      correctGuesses: gameState.value.correctGuesses
    }

    console.log('📊 Tracking game result:', {
      difficulty: gameResult.difficulty,
      won: gameResult.won,
      guesses: gameResult.guessesUsed,
      time: `${(gameResult.timeElapsed / 1000).toFixed(1)}s`
    })

    const result = await progressService.updateProgress(gameResult)

    console.log('✅ Progress updated successfully')

    // Show achievement notifications if any new achievements were unlocked
    if (result.newAchievements && result.newAchievements.length > 0) {
      console.log('🏆 New achievements unlocked:', result.newAchievements.map(a => a.name))

      // Notify the progress display component about new achievements
      if (progressDisplayRef.value) {
        progressDisplayRef.value.notifyNewAchievement()
      }
    }

  } catch (error) {
    console.warn('⚠️ Failed to track game result:', error)
    // Don't block the game if progress tracking fails
  }
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
  @apply mb-8;
}

.header-content {
  @apply flex justify-between items-center;
  @apply flex-col md:flex-row space-y-4 md:space-y-0;
}

.title-section {
  @apply text-center md:text-left;
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

.header-controls {
  @apply flex items-center space-x-4;
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