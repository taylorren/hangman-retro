<template>
    <div class="hangman-display" :class="displayClass">
        <!-- Retro Border Effect -->
        <div class="retro-border"></div>

        <!-- Hangman Art Container -->
        <div class="hangman-art-container">
            <div class="art-background"></div>
            <Transition name="hangman-stage" mode="out-in">
                <pre :key="currentArt.stage" class="hangman-art" :class="hangmanArtClass">{{ currentArt.art }}</pre>
            </Transition>

            <!-- Stage Change Effect -->
            <div v-if="showStageEffect" class="stage-change-effect"></div>
        </div>

        <!-- Game Status Info -->
        <div class="hangman-info">
            <div class="stage-indicator">
                <span class="stage-text">Stage {{ currentArt.stage }}/6</span>
                <div class="stage-progress">
                    <div class="stage-progress-track"></div>
                    <div class="stage-progress-bar" :style="{ width: `${(currentArt.stage / 6) * 100}%` }"></div>
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
import { computed } from 'vue'
import { getHangmanArtByGuesses } from '../types/hangman-art'
import type { HangmanArt } from '../types/game'

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

// Get current hangman art based on incorrect guesses
const currentArt = computed((): HangmanArt => {
    return getHangmanArtByGuesses(props.incorrectGuesses)
})

// Calculate remaining guesses
const remainingGuesses = computed((): number => {
    return Math.max(0, props.maxIncorrectGuesses - props.incorrectGuesses)
})

// Dynamic CSS class based on game state
const hangmanArtClass = computed((): string => {
    const classes = ['hangman-ascii']

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
</script>

<style scoped>
.hangman-display {
    @apply flex flex-col items-center space-y-6 p-6;
    @apply bg-gray-900 rounded-lg border-2 border-gray-700;
    @apply shadow-lg;
}

.hangman-art-container {
    @apply relative;
}

.hangman-art {
    @apply font-mono text-lg leading-tight;
    @apply text-gray-300 whitespace-pre;
    @apply transition-all duration-500 ease-in-out;
    @apply select-none;
    font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
    text-shadow: 0 0 10px rgba(156, 163, 175, 0.3);
}

/* Game state styling */
.hangman-ascii.game-won {
    @apply text-green-400;
    text-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
    animation: pulse-green 2s infinite;
}

.hangman-ascii.game-lost {
    @apply text-red-400;
    text-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
    animation: pulse-red 2s infinite;
}

.hangman-ascii.danger-zone {
    @apply text-red-300;
    text-shadow: 0 0 12px rgba(252, 165, 165, 0.4);
    animation: danger-pulse 1.5s infinite;
}

.hangman-ascii.warning-zone {
    @apply text-yellow-300;
    text-shadow: 0 0 10px rgba(253, 224, 71, 0.4);
}

/* Hangman Info Section */
.hangman-info {
    @apply flex flex-col items-center space-y-4 w-full max-w-xs;
}

.stage-indicator {
    @apply flex flex-col items-center space-y-2 w-full;
}

.stage-text {
    @apply text-sm font-semibold text-gray-400 uppercase tracking-wide;
}

.stage-progress {
    @apply w-full h-2 bg-gray-700 rounded-full overflow-hidden;
}

.stage-progress-bar {
    @apply h-full transition-all duration-500 ease-out;
    @apply bg-gradient-to-r from-green-500 via-yellow-500 to-red-500;
}

.remaining-guesses {
    @apply text-center;
}

.remaining-text {
    @apply text-sm font-medium;
    @apply transition-colors duration-300;
}

/* Dynamic text color based on remaining guesses */
.remaining-text {
    color: v-bind('remainingGuesses <= 1 ? "#ef4444" : remainingGuesses <= 2 ? "#f59e0b" : "#10b981"');
}

/* Animations */
@keyframes pulse-green {

    0%,
    100% {
        text-shadow: 0 0 15px rgba(34, 197, 94, 0.5);
        transform: scale(1);
    }

    50% {
        text-shadow: 0 0 25px rgba(34, 197, 94, 0.8);
        transform: scale(1.02);
    }
}

@keyframes pulse-red {

    0%,
    100% {
        text-shadow: 0 0 15px rgba(239, 68, 68, 0.5);
        transform: scale(1);
    }

    50% {
        text-shadow: 0 0 25px rgba(239, 68, 68, 0.8);
        transform: scale(1.02);
    }
}

@keyframes danger-pulse {

    0%,
    100% {
        text-shadow: 0 0 12px rgba(252, 165, 165, 0.4);
    }

    50% {
        text-shadow: 0 0 20px rgba(252, 165, 165, 0.7);
    }
}

/* Retro Border Effect */
.retro-border {
    @apply absolute inset-0 rounded-lg;
    background: linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.1), transparent);
    animation: retro-scan 3s linear infinite;
    pointer-events: none;
}

/* Art Background */
.art-background {
    @apply absolute inset-0 rounded-lg;
    background: radial-gradient(circle at center, rgba(75, 85, 99, 0.1), transparent);
}

/* Stage Progress Track */
.stage-progress {
    @apply relative w-full h-2 rounded-full overflow-hidden;
}

.stage-progress-track {
    @apply absolute inset-0 bg-gray-700 rounded-full;
}

.stage-progress-bar {
    @apply absolute inset-y-0 left-0 h-full transition-all duration-500 ease-out;
    @apply bg-gradient-to-r from-green-500 via-yellow-500 to-red-500;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
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

/* Transition Animations */
.hangman-stage-enter-active,
.hangman-stage-leave-active {
    transition: all 0.5s ease-in-out;
}

.hangman-stage-enter-from {
    opacity: 0;
    transform: scale(0.8) rotateY(90deg);
}

.hangman-stage-leave-to {
    opacity: 0;
    transform: scale(1.2) rotateY(-90deg);
}

.danger-warning-enter-active,
.danger-warning-leave-active {
    transition: all 0.3s ease-in-out;
}

.danger-warning-enter-from,
.danger-warning-leave-to {
    opacity: 0;
    transform: scale(0.5);
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
    0% {
        opacity: 0;
    }

    50% {
        opacity: 1;
    }

    100% {
        opacity: 0;
    }
}

@keyframes danger-blink {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

@keyframes danger-glow {

    0%,
    100% {
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

/* Retro glow effect */
.hangman-display {
    position: relative;
    box-shadow:
        0 0 20px rgba(75, 85, 99, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Enhanced monospace font styling */
.hangman-art {
    font-feature-settings: "liga" 0;
    letter-spacing: 0.05em;
}

/* Responsive design */
@media (max-width: 640px) {
    .hangman-art {
        @apply text-base;
        letter-spacing: 0.03em;
    }

    .hangman-display {
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