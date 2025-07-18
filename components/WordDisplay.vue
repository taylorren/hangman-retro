<template>
  <div class="word-display">
    <!-- Word Container -->
    <div class="word-container">
      <div class="word-letters">
        <TransitionGroup name="letter-reveal" tag="div" class="letters-grid">
          <div
            v-for="(letter, index) in wordLetters"
            :key="`${letter.char}-${index}`"
            class="letter-slot"
            :class="letterSlotClass(letter)"
          >
            <div class="letter-content">
              <span v-if="letter.revealed" class="revealed-letter">
                {{ letter.char }}
              </span>
              <span v-else class="hidden-letter">_</span>
            </div>
            
            <!-- Letter reveal effect -->
            <div v-if="letter.justRevealed" class="reveal-effect"></div>
          </div>
        </TransitionGroup>
      </div>
      
      <!-- Word Progress Info -->
      <div class="word-info">
        <div class="progress-bar">
          <div class="progress-track"></div>
          <div 
            class="progress-fill" 
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
        
        <div class="progress-text">
          <span class="revealed-count">{{ revealedCount }}</span>
          <span class="separator">/</span>
          <span class="total-count">{{ totalLetters }}</span>
          <span class="progress-label">letters revealed</span>
        </div>
      </div>
    </div>
    
    <!-- Word completion celebration -->
    <Transition name="celebration">
      <div v-if="isComplete" class="completion-celebration">
        <div class="celebration-text">🎉 WORD COMPLETE! 🎉</div>
        <div class="celebration-word">{{ currentWord }}</div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'

interface Props {
  currentWord: string
  correctGuesses: string[]
  gameStatus: 'playing' | 'won' | 'lost'
}

const props = withDefaults(defineProps<Props>(), {
  currentWord: '',
  correctGuesses: () => [],
  gameStatus: 'playing'
})

// Track recently revealed letters for animation
const recentlyRevealed = ref<Set<number>>(new Set())

// Process word into letter objects
const wordLetters = computed(() => {
  if (!props.currentWord) return []
  
  return props.currentWord.split('').map((char, index) => {
    const revealed = props.correctGuesses.includes(char.toUpperCase())
    const justRevealed = recentlyRevealed.value.has(index)
    
    return {
      char: char.toUpperCase(),
      revealed,
      justRevealed,
      index
    }
  })
})

// Calculate progress statistics
const revealedCount = computed(() => {
  return wordLetters.value.filter(letter => letter.revealed).length
})

const totalLetters = computed(() => {
  return props.currentWord.length
})

const progressPercentage = computed(() => {
  if (totalLetters.value === 0) return 0
  // Count actual revealed letter positions, not unique letters
  const revealedPositions = wordLetters.value.filter(letter => letter.revealed).length
  return Math.round((revealedPositions / totalLetters.value) * 100)
})

const isComplete = computed(() => {
  return props.gameStatus === 'won' || 
         (props.currentWord && wordLetters.value.every(letter => letter.revealed))
})

// Watch for new correct guesses to trigger reveal animations
watch(() => props.correctGuesses, (newGuesses, oldGuesses) => {
  if (!oldGuesses) return
  
  const newLetters = newGuesses.filter(guess => !oldGuesses.includes(guess))
  
  if (newLetters.length > 0) {
    // Find indices of newly revealed letters
    const newIndices = new Set<number>()
    
    newLetters.forEach(letter => {
      props.currentWord.split('').forEach((char, index) => {
        if (char.toUpperCase() === letter) {
          newIndices.add(index)
        }
      })
    })
    
    // Trigger reveal animation
    recentlyRevealed.value = newIndices
    
    // Clear animation flags after animation completes
    setTimeout(() => {
      recentlyRevealed.value.clear()
    }, 600)
  }
}, { deep: true })

// Dynamic CSS class for letter slots
const letterSlotClass = (letter: any) => {
  const classes = []
  
  if (letter.revealed) {
    classes.push('revealed')
  } else {
    classes.push('hidden')
  }
  
  if (letter.justRevealed) {
    classes.push('just-revealed')
  }
  
  return classes.join(' ')
}
</script>

<style scoped>
.word-display {
  @apply flex flex-col items-center space-y-6 p-6;
  @apply bg-gray-800 rounded-lg border border-gray-600;
  @apply shadow-lg;
}

.word-container {
  @apply flex flex-col items-center space-y-4 w-full;
}

.word-letters {
  @apply flex justify-center w-full;
}

.letters-grid {
  @apply flex flex-wrap justify-center gap-2;
  @apply max-w-2xl;
}

.letter-slot {
  @apply relative flex items-center justify-center;
  @apply w-12 h-16 border-2 border-gray-600 rounded-lg;
  @apply bg-gray-900 transition-all duration-300;
  @apply font-mono text-2xl font-bold;
}

.letter-slot.revealed {
  @apply border-green-500 bg-green-900 bg-opacity-30;
  @apply text-green-400;
  box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
}

.letter-slot.hidden {
  @apply border-gray-600 bg-gray-900;
  @apply text-gray-400;
}

.letter-slot.just-revealed {
  animation: letter-pop 0.6s ease-out;
}

.letter-content {
  @apply relative z-10;
}

.revealed-letter {
  @apply text-green-400;
  text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}

.hidden-letter {
  @apply text-gray-500;
  font-size: 1.5rem;
}

.reveal-effect {
  @apply absolute inset-0 rounded-lg pointer-events-none;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.4), transparent);
  animation: reveal-flash 0.6s ease-out;
}

/* Word Progress Info */
.word-info {
  @apply flex flex-col items-center space-y-2 w-full max-w-xs;
}

.progress-bar {
  @apply relative w-full h-2 rounded-full overflow-hidden;
}

.progress-track {
  @apply absolute inset-0 bg-gray-700 rounded-full;
}

.progress-fill {
  @apply absolute inset-y-0 left-0 h-full transition-all duration-500 ease-out;
  @apply bg-gradient-to-r from-blue-500 to-green-500;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
}

.progress-text {
  @apply flex items-center space-x-1 text-sm font-mono;
  @apply text-gray-400;
}

.revealed-count {
  @apply text-green-400 font-bold;
}

.total-count {
  @apply text-blue-400 font-bold;
}

.separator {
  @apply text-gray-500;
}

.progress-label {
  @apply text-gray-500 ml-2;
}

/* Completion Celebration */
.completion-celebration {
  @apply flex flex-col items-center space-y-2 p-4;
  @apply bg-green-900 bg-opacity-30 border border-green-500 rounded-lg;
  @apply text-center;
}

.celebration-text {
  @apply text-green-400 font-bold text-lg;
  animation: celebration-pulse 1s infinite;
}

.celebration-word {
  @apply text-green-300 font-mono text-xl font-bold;
  @apply tracking-wider;
  text-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
}

/* Animations */
@keyframes letter-pop {
  0% { 
    transform: scale(1); 
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
  }
  50% { 
    transform: scale(1.2); 
    box-shadow: 0 0 25px rgba(34, 197, 94, 0.6);
  }
  100% { 
    transform: scale(1); 
    box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
  }
}

@keyframes reveal-flash {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes celebration-pulse {
  0%, 100% { 
    transform: scale(1);
    text-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
  }
  50% { 
    transform: scale(1.05);
    text-shadow: 0 0 25px rgba(34, 197, 94, 0.8);
  }
}

/* Transition Animations */
.letter-reveal-enter-active,
.letter-reveal-leave-active {
  transition: all 0.3s ease-in-out;
}

.letter-reveal-enter-from {
  opacity: 0;
  transform: scale(0.5) rotateY(90deg);
}

.letter-reveal-leave-to {
  opacity: 0;
  transform: scale(0.5) rotateY(-90deg);
}

.celebration-enter-active,
.celebration-leave-active {
  transition: all 0.5s ease-in-out;
}

.celebration-enter-from,
.celebration-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

/* Responsive design */
@media (max-width: 640px) {
  .letter-slot {
    @apply w-10 h-14 text-xl;
  }
  
  .letters-grid {
    @apply gap-1;
  }
  
  .word-display {
    @apply p-4 space-y-4;
  }
}
</style>