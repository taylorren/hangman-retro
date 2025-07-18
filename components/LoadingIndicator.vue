<template>
    <div class="loading-container">
        <!-- Terminal-style loading display -->
        <div class="terminal-window">
            <div class="terminal-header">
                <div class="terminal-buttons">
                    <span class="terminal-button red"></span>
                    <span class="terminal-button yellow"></span>
                    <span class="terminal-button green"></span>
                </div>
                <div class="terminal-title">HANGMAN.EXE</div>
            </div>

            <div class="terminal-content">
                <!-- Loading message with animated dots -->
                <div class="loading-line">
                    <span class="prompt">system@hangman:~$</span>
                    <span class="command">{{ loadingMessage }}</span>
                    <span class="animated-dots">{{ animatedDots }}</span>
                </div>

                <!-- Progress bar -->
                <div class="progress-container" v-if="showProgress">
                    <div class="progress-label">{{ progressLabel }}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
                    </div>
                    <div class="progress-text">{{ progress.toFixed(2) }}%</div>
                </div>

                <!-- Status messages -->
                <div class="status-messages">
                    <div v-for="(message, index) in statusMessages" :key="index" class="status-message"
                        :class="message.type">
                        <span class="status-icon">{{ getStatusIcon(message.type) }}</span>
                        <span class="status-text">{{ message.text }}</span>
                    </div>
                </div>

                <!-- Retro loading animation -->
                <div class="loading-animation">
                    <div class="loading-blocks">
                        <div v-for="i in 8" :key="i" class="loading-block" :style="{ animationDelay: `${i * 0.1}s` }">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface StatusMessage {
    type: 'info' | 'success' | 'warning' | 'error'
    text: string
    timestamp?: number
}

interface Props {
    message?: string
    difficulty?: string
    showProgress?: boolean
    progress?: number
    statusMessages?: StatusMessage[]
}

const props = withDefaults(defineProps<Props>(), {
    message: 'GENERATING WORD',
    difficulty: '',
    showProgress: false,
    progress: 0,
    statusMessages: () => []
})

// Animated dots for loading effect
const dotCount = ref(0)
const dotInterval = ref<NodeJS.Timeout>()

const animatedDots = computed(() => {
    return '.'.repeat(dotCount.value)
})

const loadingMessage = computed(() => {
    if (props.difficulty) {
        return `CONSULTING AI FOR ${props.difficulty.toUpperCase()} VOCABULARY`
    }
    return props.message
})

const progressLabel = computed(() => {
    if (props.progress < 25) return 'Initializing AI connection...'
    if (props.progress < 50) return 'Processing difficulty parameters...'
    if (props.progress < 75) return 'Generating vocabulary...'
    if (props.progress < 100) return 'Validating word format...'
    return 'Complete!'
})

const getStatusIcon = (type: string) => {
    switch (type) {
        case 'info': return 'ℹ'
        case 'success': return '✓'
        case 'warning': return '⚠'
        case 'error': return '✗'
        default: return '•'
    }
}

onMounted(() => {
    // Animate dots
    dotInterval.value = setInterval(() => {
        dotCount.value = (dotCount.value + 1) % 4
    }, 500)
})

onUnmounted(() => {
    if (dotInterval.value) {
        clearInterval(dotInterval.value)
    }
})
</script>

<style scoped>
.loading-container {
    @apply fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50;
    backdrop-filter: blur(2px);
}

.terminal-window {
    @apply bg-retro-dark border-2 border-retro-green rounded-lg shadow-2xl;
    @apply w-full max-w-2xl mx-4;
    box-shadow:
        0 0 20px rgba(0, 255, 0, 0.3),
        inset 0 0 20px rgba(0, 255, 0, 0.1);
}

.terminal-header {
    @apply flex items-center justify-between px-4 py-2;
    @apply bg-retro-green bg-opacity-10 border-b border-retro-green border-opacity-30;
}

.terminal-buttons {
    @apply flex space-x-2;
}

.terminal-button {
    @apply w-3 h-3 rounded-full;
}

.terminal-button.red {
    @apply bg-red-500;
}

.terminal-button.yellow {
    @apply bg-yellow-500;
}

.terminal-button.green {
    @apply bg-green-500;
}

.terminal-title {
    @apply text-retro-green font-mono text-sm font-bold;
    @apply tracking-wider;
}

.terminal-content {
    @apply p-6 space-y-4;
}

.loading-line {
    @apply flex items-center space-x-2 font-mono text-lg;
}

.prompt {
    @apply text-retro-amber;
}

.command {
    @apply text-retro-green font-bold;
    @apply tracking-wider;
}

.animated-dots {
    @apply text-retro-green;
    @apply w-8 inline-block;
}

.progress-container {
    @apply space-y-2;
}

.progress-label {
    @apply text-retro-green font-mono text-sm;
    @apply opacity-75;
}

.progress-bar {
    @apply w-full h-2 bg-retro-dark border border-retro-green border-opacity-30 rounded;
    @apply relative overflow-hidden;
}

.progress-fill {
    @apply h-full bg-retro-green transition-all duration-300 ease-out;
    @apply relative;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.progress-fill::after {
    content: '';
    @apply absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent;
    @apply opacity-30;
    animation: shimmer 2s infinite;
}

.progress-text {
    @apply text-retro-amber font-mono text-sm text-right;
}

.status-messages {
    @apply space-y-1 max-h-32 overflow-y-auto;
}

.status-message {
    @apply flex items-center space-x-2 font-mono text-sm;
    @apply py-1 px-2 rounded;
}

.status-message.info {
    @apply text-blue-400 bg-blue-400 bg-opacity-10;
}

.status-message.success {
    @apply text-green-400 bg-green-400 bg-opacity-10;
}

.status-message.warning {
    @apply text-yellow-400 bg-yellow-400 bg-opacity-10;
}

.status-message.error {
    @apply text-red-400 bg-red-400 bg-opacity-10;
}

.status-icon {
    @apply font-bold;
}

.loading-animation {
    @apply flex justify-center mt-6;
}

.loading-blocks {
    @apply flex space-x-1;
}

.loading-block {
    @apply w-2 h-8 bg-retro-green rounded;
    animation: pulse-block 1.6s infinite ease-in-out;
}

/* Animations */
@keyframes shimmer {
    0% {
        transform: translateX(-100%);
    }

    100% {
        transform: translateX(100%);
    }
}

@keyframes pulse-block {

    0%,
    40%,
    100% {
        transform: scaleY(0.4);
        opacity: 0.5;
    }

    20% {
        transform: scaleY(1);
        opacity: 1;
    }
}

/* Terminal scan lines effect */
.terminal-content::before {
    content: '';
    @apply absolute inset-0 pointer-events-none;
    background: linear-gradient(transparent 50%,
            rgba(0, 255, 0, 0.03) 50%);
    background-size: 100% 4px;
    animation: scan-lines 0.1s linear infinite;
}

@keyframes scan-lines {
    0% {
        transform: translateY(0);
    }

    100% {
        transform: translateY(4px);
    }
}

/* Responsive design */
@media (max-width: 640px) {
    .terminal-window {
        @apply mx-2;
    }

    .terminal-content {
        @apply p-4;
    }

    .loading-line {
        @apply text-base flex-wrap;
    }

    .command {
        @apply text-sm;
    }
}
</style>