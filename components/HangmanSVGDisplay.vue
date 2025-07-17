<template>
  <div class="hangman-svg-display" :class="displayClass">
    <!-- Retro Border Effect -->
    <div class="retro-border"></div>

    <!-- SVG Hangman Container -->
    <div class="hangman-svg-container">
      <div class="svg-background"></div>
      
      <!-- SVG Hangman Drawing -->
      <svg 
        :viewBox="currentSVGArt.viewBox" 
        class="hangman-svg" 
        :class="hangmanSVGClass"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Draw each path with animation -->
        <g class="hangman-paths">
          <path
            v-for="(pathData, index) in currentSVGArt.svgPaths"
            :key="`${currentSVGArt.stage}-${index}`"
            :d="pathData"
            class="hangman-path"
            :class="getPathClass(index)"
            :style="getPathStyle(index)"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
        
        <!-- Add retro glow effect -->
        <defs>
          <filter id="retro-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>

      <!-- Stage Change Effect -->
      <div v-if="showStageEffect" class="stage-change-effect"></div>
    </div>

    <!-- Game Status Info -->
    <div class="hangman-info">
      <div class="stage-indicator">
        <span class="stage-text">Stage {{ currentSVGArt.stage }}/6</span>
        <div class="stage-progress">
          <div class="stage-progress-track"></div>
          <div class="stage-progress-bar" :style="{ width: `${(currentSVGArt.stage / 6) * 100}%` }"></div>
        </div>
      </div>

      <div class="remaining-guesses">
        <span class="remaining-text">
          {{ remainingGuesses }} guess{{ remainingGuesses !== 1 ? 'es' : '' }} remaining
        </span>
      </div>

      <!-- Danger Warning -->
      <Transition name="danger-warning">
        <div v-if="remainingGuesses <= 1 && gameStatus === 'playing'" class="danger-warning">
          ⚠️ LAST CHANCE! ⚠️
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getHangmanSVGArtByGuesses } from '../types/hangman-svg'
import type { HangmanSVGArt } from '../types/hangman-svg'

interface Props {
  incorrectGuesses: number
  maxIncorrectGuesses: number
  gameStatus: 'playing' | 'won' | 'lost'
}

const props = withDefaults(defineProps<Props>(), {
  incorrectGuesses: 0,
  maxIncorrectGuesses: 6,
  gameStatus: 'playing'
})

// Animation state
const animationDelay = ref(0)

// Get current SVG hangman art based on incorrect guesses
const currentSVGArt = computed((): HangmanSVGArt => {
  return getHangmanSVGArtByGuesses(props.incorrectGuesses)
})

// Calculate remaining guesses
const remainingGuesses = computed((): number => {
  return Math.max(0, props.maxIncorrectGuesses - props.incorrectGuesses)
})

// Dynamic CSS class based on game state
const hangmanSVGClass = computed((): string => {
  const classes = ['hangman-drawing']

  if (props.gameStatus === 'lost') {
    classes.push('game-lost')
  } else if (props.gameStatus === 'won') {
    classes.push('game-won')
  } else if (props.incorrectGuesses >= 4) {
    classes.push('danger-zone')
  } else if (props.incorrectGuesses >= 2) {
    classes.push('warning-zone')
  }

  return classes.join(' ')
})

// Display container class
const displayClass = computed((): string => {
  const classes: string[] = []

  if (props.gameStatus === 'lost') {
    classes.push('display-lost')
  } else if (props.gameStatus === 'won') {
    classes.push('display-won')
  } else if (remainingGuesses.value <= 1) {
    classes.push('display-danger')
  }

  return classes.join(' ')
})

// Show stage change effect
const showStageEffect = computed((): boolean => {
  return props.incorrectGuesses > 0 && props.gameStatus === 'playing'
})

// Get path-specific CSS class for animations
const getPathClass = (index: number): string => {
  const classes = ['svg-path']
  
  // Add specific classes for different parts
  if (index === 4) classes.push('head-path') // Head
  if (index === 5) classes.push('body-path') // Body
  if (index >= 6) classes.push('limb-path') // Arms and legs
  
  return classes.join(' ')
}

// Get path-specific styles for progressive drawing - optimized for speed
const getPathStyle = (index: number): Record<string, string> => {
  const baseDelay = index * 0.05 // Much faster delay between parts
  return {
    'animation-delay': `${baseDelay}s`,
    'stroke-dasharray': index >= 4 ? '100' : '0', // Shorter dash for faster animation
    'stroke-dashoffset': index >= 4 ? '100' : '0'
  }
}

// Watch for stage changes to trigger animations
watch(() => props.incorrectGuesses, (newVal, oldVal) => {
  if (newVal > oldVal) {
    animationDelay.value = Date.now()
  }
})
</script>

<style scoped>
/* @tailwind directives are processed by PostCSS */
.hangman-svg-display {
  @apply flex flex-col items-center space-y-6 p-6;
  @apply bg-retro-dark rounded-lg border-2 border-retro-green;
  @apply shadow-lg;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
}

.hangman-svg-container {
  @apply relative;
  width: 200px;
  height: 200px;
}

.hangman-svg {
  @apply w-full h-full;
  @apply transition-all duration-200 ease-out;
  filter: url(#retro-glow);
  will-change: transform;
}

/* SVG Path Styling */
.hangman-path {
  @apply text-retro-green;
  stroke: currentColor;
  transition: all 0.3s ease-in-out;
}

/* Progressive drawing animation for body parts - optimized for speed */
.hangman-path.svg-path {
  animation: draw-path 0.3s ease-out forwards;
}

@keyframes draw-path {
  from {
    stroke-dashoffset: 100;
    opacity: 0;
  }
  to {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

/* Game state styling */
.hangman-drawing.game-won {
  @apply text-green-400;
  filter: url(#retro-glow) drop-shadow(0 0 10px rgba(34, 197, 94, 0.5));
  animation: pulse-green 2s infinite;
}

.hangman-drawing.game-lost {
  @apply text-red-400;
  filter: url(#retro-glow) drop-shadow(0 0 10px rgba(239, 68, 68, 0.5));
  animation: pulse-red 2s infinite;
}

.hangman-drawing.danger-zone {
  @apply text-red-300;
  filter: url(#retro-glow) drop-shadow(0 0 8px rgba(252, 165, 165, 0.4));
  animation: danger-pulse 1.5s infinite;
}

.hangman-drawing.warning-zone {
  @apply text-retro-amber;
  filter: url(#retro-glow) drop-shadow(0 0 6px rgba(255, 191, 0, 0.4));
}

/* Hangman Info Section */
.hangman-info {
  @apply flex flex-col items-center space-y-4 w-full max-w-xs;
}

.stage-indicator {
  @apply flex flex-col items-center space-y-2 w-full;
}

.stage-text {
  @apply text-sm font-semibold text-retro-green uppercase tracking-wide;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

.stage-progress {
  @apply w-full h-2 bg-retro-gray rounded-full overflow-hidden;
}

.stage-progress-bar {
  @apply h-full transition-all duration-500 ease-out;
  @apply bg-gradient-to-r from-green-500 via-yellow-500 to-red-500;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
}

.remaining-guesses {
  @apply text-center;
}

.remaining-text {
  @apply text-sm font-medium text-retro-green;
  @apply transition-colors duration-300;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
}

/* Dynamic text color based on remaining guesses */
.remaining-text {
  color: v-bind('remainingGuesses <= 1 ? "#ef4444" : remainingGuesses <= 2 ? "#ffbf00" : "#00ff00"');
}

/* Animations */
@keyframes pulse-green {
  0%, 100% {
    transform: scale(1);
    filter: url(#retro-glow) drop-shadow(0 0 10px rgba(34, 197, 94, 0.5));
  }
  50% {
    transform: scale(1.02);
    filter: url(#retro-glow) drop-shadow(0 0 20px rgba(34, 197, 94, 0.8));
  }
}

@keyframes pulse-red {
  0%, 100% {
    transform: scale(1);
    filter: url(#retro-glow) drop-shadow(0 0 10px rgba(239, 68, 68, 0.5));
  }
  50% {
    transform: scale(1.02);
    filter: url(#retro-glow) drop-shadow(0 0 20px rgba(239, 68, 68, 0.8));
  }
}

@keyframes danger-pulse {
  0%, 100% {
    filter: url(#retro-glow) drop-shadow(0 0 8px rgba(252, 165, 165, 0.4));
  }
  50% {
    filter: url(#retro-glow) drop-shadow(0 0 15px rgba(252, 165, 165, 0.7));
  }
}

/* Retro Border Effect */
.retro-border {
  @apply absolute inset-0 rounded-lg;
  background: linear-gradient(45deg, transparent, rgba(0, 255, 0, 0.1), transparent);
  animation: retro-scan 3s linear infinite;
  pointer-events: none;
}

/* SVG Background */
.svg-background {
  @apply absolute inset-0 rounded-lg;
  background: radial-gradient(circle at center, rgba(0, 255, 0, 0.05), transparent);
}

/* Stage Change Effect */
.stage-change-effect {
  @apply absolute inset-0 rounded-lg pointer-events-none;
  background: radial-gradient(circle, rgba(239, 68, 68, 0.2), transparent);
  animation: stage-flash 0.5s ease-out;
}

/* Danger Warning */
.danger-warning {
  @apply text-red-400 font-bold text-sm text-center;
  @apply px-3 py-1 rounded-full bg-red-900 bg-opacity-30;
  @apply border border-red-500 border-opacity-50;
  animation: danger-blink 1s infinite;
  text-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
}

/* Display State Classes */
.display-won {
  @apply border-green-500;
  box-shadow:
    0 0 30px rgba(34, 197, 94, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.display-lost {
  @apply border-red-500;
  box-shadow:
    0 0 30px rgba(239, 68, 68, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.display-danger {
  @apply border-yellow-500;
  box-shadow:
    0 0 25px rgba(245, 158, 11, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: danger-glow 2s infinite;
}

/* Additional Animations */
@keyframes retro-scan {
  0% {
    transform: translateX(-100%) skewX(-15deg);
  }
  100% {
    transform: translateX(200%) skewX(-15deg);
  }
}

@keyframes stage-flash {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes danger-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes danger-glow {
  0%, 100% {
    box-shadow:
      0 0 25px rgba(245, 158, 11, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  50% {
    box-shadow:
      0 0 40px rgba(245, 158, 11, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .hangman-svg-container {
    width: 160px;
    height: 160px;
  }

  .hangman-svg-display {
    @apply p-4 space-y-4;
  }

  .stage-text {
    @apply text-xs;
  }

  .remaining-text {
    @apply text-xs;
  }
}
</style>