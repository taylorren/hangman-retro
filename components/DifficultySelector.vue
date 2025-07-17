<template>
  <div class="difficulty-selector retro-card">
    <!-- Terminal-style header -->
    <div class="mb-6 text-center">
      <div class="text-retro-amber font-mono text-sm mb-2">
        ┌─────────────────────────────────────────────────────────────┐
      </div>
      <h2 class="terminal-text text-2xl font-mono text-retro-green font-bold uppercase tracking-wider">
        │ SELECT DIFFICULTY LEVEL │
      </h2>
      <div class="text-retro-amber font-mono text-sm mt-2">
        └─────────────────────────────────────────────────────────────┘
      </div>
    </div>
    
    <!-- Difficulty options grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <button
        v-for="config in difficultyConfigs"
        :key="config.level"
        @click="selectDifficulty(config.level)"
        :class="[
          'difficulty-button',
          'retro-button',
          'font-mono',
          'p-6',
          'border-2',
          'transition-all',
          'duration-300',
          'hover:scale-105',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-retro-amber',
          'relative',
          'overflow-hidden',
          selectedDifficulty === config.level
            ? 'bg-retro-green text-retro-dark border-retro-green shadow-lg'
            : 'bg-retro-dark text-retro-green border-retro-green hover:bg-retro-green hover:text-retro-dark'
        ]"
      >
        <!-- Button content -->
        <div class="relative z-10">
          <div class="text-xl font-bold mb-3 uppercase tracking-wide">
            {{ config.level }}
          </div>
          <div class="text-sm opacity-90 mb-3 leading-relaxed">
            {{ config.description }}
          </div>
        </div>
        
        <!-- Selection indicator -->
        <div v-if="selectedDifficulty === config.level" 
             class="absolute top-2 right-2 text-retro-dark text-lg">
          ✓
        </div>
      </button>
    </div>
    
    <!-- Status display -->
    <div class="mt-8 text-center">
      <div v-if="selectedDifficulty" class="terminal-text">
        <div class="text-retro-amber font-mono text-sm mb-2">
          ┌─────────────────────────────────────────────────────────────┐
        </div>
        <div class="text-retro-green font-mono text-lg">
          │ SELECTED: <span class="font-bold uppercase text-retro-amber">{{ selectedDifficulty }}</span> MODE │
        </div>
        <div class="text-retro-amber font-mono text-sm mt-2">
          └─────────────────────────────────────────────────────────────┘
        </div>
      </div>
      <div v-else class="text-retro-green font-mono text-sm opacity-75">
        > Please select a difficulty level to continue...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DifficultyLevel } from '../types/game'
import { DIFFICULTY_CONFIGS } from '../types/constants'

interface Props {
  selectedDifficulty?: DifficultyLevel
}

interface Emits {
  (e: 'difficulty-selected', difficulty: DifficultyLevel): void
}

const props = withDefaults(defineProps<Props>(), {
  selectedDifficulty: undefined
})

const emit = defineEmits<Emits>()

// Get all difficulty configurations directly from constants
const difficultyConfigs = Object.values(DIFFICULTY_CONFIGS)

const selectDifficulty = (difficulty: DifficultyLevel) => {
  emit('difficulty-selected', difficulty)
}
</script>

<style scoped>
.difficulty-button {
  text-shadow: 0 0 10px currentColor;
}

.difficulty-button:hover {
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
}

.difficulty-selector {
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  box-shadow: 
    0 0 20px rgba(0, 255, 0, 0.1),
    inset 0 0 20px rgba(0, 255, 0, 0.05);
}
</style>