<template>
  <div class="game-status-container">
    <!-- Game Status Display -->
    <Transition name="status-fade" mode="out-in">
      <div v-if="gameStatus === 'playing'" key="playing" class="status-card playing">
        <div class="status-header">
          <div class="status-icon playing-icon">⚡</div>
          <h3 class="status-title">GAME IN PROGRESS</h3>
        </div>
        <div class="status-content">
          <p class="status-message">Make your guess!</p>
          <div class="game-progress">
            <div class="progress-item">
              <span class="progress-label">Incorrect Guesses:</span>
              <span class="progress-value">{{ incorrectGuesses }}/{{ maxIncorrectGuesses }}</span>
            </div>
            <div class="progress-item">
              <span class="progress-label">Letters Guessed:</span>
              <span class="progress-value">{{ guessedLetters.length }}</span>
            </div>
            <div v-if="difficulty" class="progress-item">
              <span class="progress-label">Difficulty:</span>
              <span class="progress-value difficulty-badge">{{ difficulty.toUpperCase() }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="gameStatus === 'won'" key="won" class="status-card won">
        <div class="status-header">
          <div class="status-icon won-icon">🎉</div>
          <h3 class="status-title">VICTORY!</h3>
        </div>
        <div class="status-content">
          <p class="status-message">Congratulations! You guessed the word!</p>
          <div class="revealed-word">{{ currentWord }}</div>
          <div class="victory-stats">
            <div class="stat-item">
              <span class="stat-label">Guesses Used:</span>
              <span class="stat-value">{{ guessedLetters.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Incorrect:</span>
              <span class="stat-value">{{ incorrectGuesses }}/{{ maxIncorrectGuesses }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="gameStatus === 'lost'" key="lost" class="status-card lost">
        <div class="status-header">
          <div class="status-icon lost-icon">💀</div>
          <h3 class="status-title">GAME OVER</h3>
        </div>
        <div class="status-content">
          <p class="status-message">Better luck next time!</p>
          <div class="revealed-word">The word was: {{ currentWord }}</div>
          <div class="defeat-stats">
            <div class="stat-item">
              <span class="stat-label">Total Guesses:</span>
              <span class="stat-value">{{ guessedLetters.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Incorrect:</span>
              <span class="stat-value">{{ incorrectGuesses }}/{{ maxIncorrectGuesses }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Game Controls -->
    <div class="game-controls">
      <Transition name="controls-fade">
        <div v-if="gameStatus !== 'playing'" class="control-buttons">
          <button 
            @click="handleRestart"
            class="restart-button"
            :class="{ 'won': gameStatus === 'won', 'lost': gameStatus === 'lost' }"
          >
            <span class="button-icon">🔄</span>
            <span class="button-text">Play Again</span>
          </button>
          
          <button 
            @click="handleNewGame"
            class="new-game-button"
          >
            <span class="button-icon">🎮</span>
            <span class="button-text">New Game</span>
          </button>
        </div>
      </Transition>
      
      <!-- Always available controls -->
      <div class="persistent-controls">
        <button 
          @click="handleReset"
          class="reset-button"
          :disabled="gameStatus !== 'playing'"
        >
          <span class="button-icon">↻</span>
          <span class="button-text">Reset</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  gameStatus: 'playing' | 'won' | 'lost'
  currentWord: string
  guessedLetters: string[]
  incorrectGuesses: number
  maxIncorrectGuesses: number
  difficulty?: string
}

const props = withDefaults(defineProps<Props>(), {
  gameStatus: 'playing',
  currentWord: '',
  guessedLetters: () => [],
  incorrectGuesses: 0,
  maxIncorrectGuesses: 6
})

const emit = defineEmits<{
  (e: 'restart-game'): void
  (e: 'new-game'): void
  (e: 'reset-game'): void
}>()

// Handle restart (same word, reset guesses)
const handleRestart = () => {
  emit('restart-game')
}

// Handle new game (new word, new difficulty)
const handleNewGame = () => {
  emit('new-game')
}

// Handle reset (reset current game)
const handleReset = () => {
  emit('reset-game')
}
</script>

<style scoped>
.game-status-container {
  @apply flex flex-col items-center space-y-6 w-full max-w-md mx-auto;
}

/* Status Cards */
.status-card {
  @apply w-full p-6 rounded-lg border-2 shadow-lg;
  @apply font-mono text-center;
  @apply transition-all duration-300;
}

.status-card.playing {
  @apply bg-blue-900 bg-opacity-30 border-blue-500;
  @apply text-blue-300;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.status-card.won {
  @apply bg-green-900 bg-opacity-30 border-green-500;
  @apply text-green-300;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
  animation: victory-glow 2s infinite;
}

.status-card.lost {
  @apply bg-red-900 bg-opacity-30 border-red-500;
  @apply text-red-300;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

/* Status Header */
.status-header {
  @apply flex flex-col items-center space-y-2 mb-4;
}

.status-icon {
  @apply text-4xl;
}

.playing-icon {
  animation: pulse-icon 2s infinite;
}

.won-icon {
  animation: bounce-icon 1s infinite;
}

.lost-icon {
  animation: shake-icon 0.5s ease-in-out;
}

.status-title {
  @apply text-xl font-bold tracking-wider;
}

/* Status Content */
.status-content {
  @apply space-y-4;
}

.status-message {
  @apply text-lg;
}

.revealed-word {
  @apply text-2xl font-bold tracking-widest p-3;
  @apply bg-black bg-opacity-50 rounded border;
  @apply text-yellow-300;
  text-shadow: 0 0 10px rgba(253, 224, 71, 0.5);
}

/* Progress and Stats */
.game-progress,
.victory-stats,
.defeat-stats {
  @apply flex justify-between items-center space-x-4 text-sm;
}

.progress-item,
.stat-item {
  @apply flex flex-col items-center space-y-1;
}

.progress-label,
.stat-label {
  @apply text-xs opacity-75;
}

.progress-value,
.stat-value {
  @apply font-bold text-lg;
}

.difficulty-badge {
  @apply px-2 py-1 rounded text-xs;
  @apply bg-purple-700 text-purple-200;
  @apply border border-purple-500;
  text-shadow: 0 0 5px rgba(168, 85, 247, 0.5);
}

/* Game Controls */
.game-controls {
  @apply w-full space-y-4;
}

.control-buttons {
  @apply flex justify-center space-x-4;
}

.persistent-controls {
  @apply flex justify-center;
}

/* Buttons */
.restart-button,
.new-game-button,
.reset-button {
  @apply flex items-center space-x-2 px-6 py-3;
  @apply rounded-lg font-bold text-sm;
  @apply transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900;
  @apply transform hover:scale-105;
}

.restart-button {
  @apply bg-blue-700 text-white hover:bg-blue-600;
  @apply focus:ring-blue-500;
}

.restart-button.won {
  @apply bg-green-700 text-white hover:bg-green-600;
  @apply focus:ring-green-500;
}

.restart-button.lost {
  @apply bg-red-700 text-white hover:bg-red-600;
  @apply focus:ring-red-500;
}

.new-game-button {
  @apply bg-purple-700 text-white hover:bg-purple-600;
  @apply focus:ring-purple-500;
}

.reset-button {
  @apply bg-gray-700 text-gray-300 hover:bg-gray-600;
  @apply focus:ring-gray-500;
}

.reset-button:disabled {
  @apply bg-gray-800 text-gray-600 cursor-not-allowed opacity-50;
  @apply hover:bg-gray-800 transform-none;
}

.button-icon {
  @apply text-lg;
}

.button-text {
  @apply font-mono;
}

/* Animations */
@keyframes victory-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(34, 197, 94, 0.7);
  }
}

@keyframes pulse-icon {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes bounce-icon {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes shake-icon {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

/* Transitions */
.status-fade-enter-active,
.status-fade-leave-active {
  transition: all 0.5s ease-in-out;
}

.status-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.status-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.controls-fade-enter-active,
.controls-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.controls-fade-enter-from,
.controls-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsive Design */
@media (max-width: 640px) {
  .status-card {
    @apply p-4;
  }
  
  .status-title {
    @apply text-lg;
  }
  
  .revealed-word {
    @apply text-xl;
  }
  
  .control-buttons {
    @apply flex-col space-x-0 space-y-3;
  }
  
  .restart-button,
  .new-game-button,
  .reset-button {
    @apply w-full justify-center;
  }
}
</style>