<template>
  <div class="letter-grid-container">
    <!-- Letter Grid Title -->
    <div class="grid-title">
      <span class="title-text">SELECT A LETTER</span>
      <div class="title-underline"></div>
    </div>
    
    <!-- Alphabet Grid -->
    <div class="letter-grid">
      <button
        v-for="letter in alphabet"
        :key="letter"
        class="letter-button"
        :class="getLetterClass(letter)"
        :disabled="isLetterDisabled(letter)"
        @click="handleLetterClick(letter)"
        @keydown="handleKeyDown($event, letter)"
      >
        <span class="letter-text">{{ letter }}</span>
        <div class="letter-glow" v-if="getLetterClass(letter).includes('correct')"></div>
      </button>
    </div>
    
    <!-- Grid Status -->
    <div class="grid-status">
      <div class="status-item">
        <span class="status-dot available"></span>
        <span class="status-label">Available</span>
      </div>
      <div class="status-item">
        <span class="status-dot correct"></span>
        <span class="status-label">Correct</span>
      </div>
      <div class="status-item">
        <span class="status-dot incorrect"></span>
        <span class="status-label">Incorrect</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

interface Props {
  guessedLetters: string[]
  correctLetters: string[]
  gameStatus: 'playing' | 'won' | 'lost'
}

const props = withDefaults(defineProps<Props>(), {
  guessedLetters: () => [],
  correctLetters: () => [],
  gameStatus: 'playing'
})

const emit = defineEmits<{
  (e: 'letter-selected', letter: string): void
}>()

// Alphabet array
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// Check if letter is disabled
const isLetterDisabled = (letter: string): boolean => {
  return props.guessedLetters.includes(letter) || props.gameStatus !== 'playing'
}

// Get CSS class for letter based on state
const getLetterClass = (letter: string): string[] => {
  const classes = ['letter-button']
  
  if (props.correctLetters.includes(letter)) {
    classes.push('correct')
  } else if (props.guessedLetters.includes(letter)) {
    classes.push('incorrect')
  } else if (props.gameStatus !== 'playing') {
    classes.push('disabled')
  } else {
    classes.push('available')
  }
  
  return classes
}

// Handle letter click
const handleLetterClick = (letter: string) => {
  if (isLetterDisabled(letter)) return
  emit('letter-selected', letter)
}

// Handle keyboard navigation
const handleKeyDown = (event: KeyboardEvent, letter: string) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleLetterClick(letter)
  }
}

// Global keyboard handler
const handleGlobalKeyDown = (event: KeyboardEvent) => {
  const key = event.key.toUpperCase()
  
  if (alphabet.includes(key) && !isLetterDisabled(key)) {
    event.preventDefault()
    emit('letter-selected', key)
  }
}

// Set up keyboard listeners
onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown)
})
</script>

<style scoped>
.letter-grid-container {
  @apply flex flex-col items-center space-y-6 p-6;
  @apply bg-gray-900 rounded-lg border border-gray-700;
  @apply shadow-2xl;
}

/* Grid Title */
.grid-title {
  @apply flex flex-col items-center space-y-2;
}

.title-text {
  @apply text-lg font-bold text-green-400 font-mono;
  @apply tracking-wider;
  text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}

.title-underline {
  @apply w-24 h-0.5 bg-green-500;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
}

/* Letter Grid */
.letter-grid {
  @apply grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-13 gap-2;
  @apply max-w-4xl;
}

.letter-button {
  @apply relative w-10 h-10 flex items-center justify-center;
  @apply rounded-lg font-bold text-lg font-mono;
  @apply transition-all duration-200 ease-in-out;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900;
  @apply transform hover:scale-105;
}

/* Letter Button States */
.letter-button.available {
  @apply bg-gray-700 text-gray-300 border border-gray-600;
  @apply hover:bg-gray-600 hover:text-white hover:border-gray-500;
  @apply focus:ring-blue-500;
  @apply shadow-md hover:shadow-lg;
}

.letter-button.correct {
  @apply bg-green-700 text-white border border-green-500;
  @apply hover:bg-green-600;
  @apply focus:ring-green-500;
  @apply shadow-lg;
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}

.letter-button.incorrect {
  @apply bg-red-900 text-red-300 border border-red-700;
  @apply cursor-not-allowed opacity-75;
  @apply shadow-inner;
}

.letter-button.disabled {
  @apply bg-gray-800 text-gray-600 border border-gray-700;
  @apply cursor-not-allowed opacity-50;
}

/* Letter Text */
.letter-text {
  @apply relative z-10;
}

/* Letter Glow Effect */
.letter-glow {
  @apply absolute inset-0 rounded-lg;
  @apply bg-green-500 opacity-20;
  animation: pulse-glow 2s infinite;
}

/* Grid Status Legend */
.grid-status {
  @apply flex justify-center space-x-6 text-sm;
  @apply border-t border-gray-700 pt-4 mt-2;
}

.status-item {
  @apply flex items-center space-x-2;
}

.status-dot {
  @apply w-3 h-3 rounded-full;
}

.status-dot.available {
  @apply bg-gray-600;
}

.status-dot.correct {
  @apply bg-green-500;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
}

.status-dot.incorrect {
  @apply bg-red-700;
}

.status-label {
  @apply text-gray-400 font-mono text-xs;
}

/* Animations */
@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
}

/* Game Status Specific Styles */
.letter-grid-container[data-status="won"] .letter-button.correct {
  animation: victory-pulse 1.5s infinite;
}

.letter-grid-container[data-status="lost"] .letter-button.incorrect {
  @apply bg-red-800 text-red-200;
}

@keyframes victory-pulse {
  0%, 100% {
    transform: scale(1.05);
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.4);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 25px rgba(34, 197, 94, 0.7);
  }
}

/* Responsive Design */
@media (max-width: 640px) {
  .letter-grid {
    @apply grid-cols-6 gap-1;
  }
  
  .letter-button {
    @apply w-8 h-8 text-base;
  }
  
  .grid-status {
    @apply space-x-4 text-xs;
  }
}

@media (max-width: 480px) {
  .letter-grid {
    @apply grid-cols-5;
  }
  
  .letter-button {
    @apply w-7 h-7 text-sm;
  }
}

/* Accessibility */
.letter-button:focus {
  @apply ring-2 ring-offset-2 ring-offset-gray-900;
}

.letter-button.available:focus {
  @apply ring-blue-500;
}

.letter-button.correct:focus {
  @apply ring-green-500;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .letter-button.available {
    @apply border-2 border-white;
  }
  
  .letter-button.correct {
    @apply border-2 border-green-300;
  }
  
  .letter-button.incorrect {
    @apply border-2 border-red-300;
  }
}
</style>