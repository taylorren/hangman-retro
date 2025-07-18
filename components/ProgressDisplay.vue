<template>
  <div class="progress-display">
    <!-- Progress Button -->
    <button @click="toggleProgressPanel" class="progress-button"
      :class="{ 'has-new-achievements': hasNewAchievements }">
      <span class="progress-icon">📊</span>
      <span class="progress-text">PROGRESS</span>
      <span v-if="hasNewAchievements" class="achievement-badge">!</span>
    </button>

    <!-- Progress Panel -->
    <Transition name="progress-panel">
      <div v-if="showPanel" class="progress-panel">
        <div class="panel-header">
          <h3 class="panel-title">YOUR PROGRESS</h3>
          <button @click="closePanel" class="close-button">×</button>
        </div>

        <div class="panel-content">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading progress...</p>
          </div>

          <div v-else-if="error" class="error-state">
            <p>⚠️ Unable to load progress</p>
            <button @click="loadProgress" class="retry-button">Retry</button>
          </div>

          <div v-else class="progress-content">
            <!-- Overall Stats -->
            <div class="stats-section">
              <h4 class="section-title">OVERALL STATS</h4>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-value">{{ progress?.totalGames || 0 }}</span>
                  <span class="stat-label">Games</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ winRatePercent }}%</span>
                  <span class="stat-label">Win Rate</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ progress?.currentStreak || 0 }}</span>
                  <span class="stat-label">Streak</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ progress?.bestStreak || 0 }}</span>
                  <span class="stat-label">Best</span>
                </div>
              </div>
            </div>

            <!-- Difficulty Progress -->
            <div v-if="difficultyStats" class="difficulty-section">
              <h4 class="section-title">DIFFICULTY MASTERY</h4>
              <div class="difficulty-list">
                <div v-for="(stats, difficulty) in difficultyStats" :key="difficulty" class="difficulty-item">
                  <div class="difficulty-header">
                    <span class="difficulty-name">{{ String(difficulty).toUpperCase() }}</span>
                    <span class="mastery-level" :class="stats.masteryLevel">
                      {{ stats.masteryLevel.toUpperCase() }}
                    </span>
                  </div>
                  <div class="difficulty-stats">
                    <span>{{ stats.wins }}/{{ stats.gamesPlayed }} wins</span>
                    <span v-if="stats.gamesPlayed > 0">
                      ({{ Math.round(stats.winRate * 100) }}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Recent Achievements -->
            <div v-if="recentAchievements.length > 0" class="achievements-section">
              <h4 class="section-title">RECENT ACHIEVEMENTS</h4>
              <div class="achievements-list">
                <div v-for="achievement in recentAchievements" :key="achievement.id" class="achievement-item"
                  :class="achievement.rarity">
                  <span class="achievement-icon">{{ achievement.icon }}</span>
                  <div class="achievement-info">
                    <span class="achievement-name">{{ achievement.name }}</span>
                    <span class="achievement-desc">{{ achievement.description }}</span>
                    <span class="achievement-date">Date Unlocked: {{ formatDate(achievement.unlockedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Overlay -->
    <div v-if="showPanel" class="progress-overlay" @click="closePanel"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getProgressService } from '../services/ProgressService'
import type { UserProgress, Achievement } from '../types/progress'

const progressService = getProgressService()

// State
const showPanel = ref(false)
const loading = ref(false)
const error = ref(false)
const progress = ref<UserProgress | null>(null)
const hasNewAchievements = ref(false)

// Computed
const winRatePercent = computed(() => {
  if (!progress.value || progress.value.totalGames === 0) return 0
  return Math.round(progress.value.winRate * 100)
})

const difficultyStats = computed(() => {
  if (!progress.value) return null
  return progress.value.difficultyStats
})

const recentAchievements = computed(() => {
  if (!progress.value) return []
  return progress.value.achievements.slice(-3) // Last 3 achievements
})

// Methods
const toggleProgressPanel = () => {
  if (!showPanel.value) {
    loadProgress()
  }
  showPanel.value = !showPanel.value
  hasNewAchievements.value = false
}

const closePanel = () => {
  showPanel.value = false
}

const loadProgress = async () => {
  loading.value = true
  error.value = false

  try {
    progress.value = await progressService.getUserProgress()
    console.log('📊 Progress loaded:', progress.value)
  } catch (err) {
    console.error('Failed to load progress:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Initialize
onMounted(() => {
  // Load progress in background
  loadProgress()
})

// Expose method to trigger new achievement notification
defineExpose({
  notifyNewAchievement: () => {
    hasNewAchievements.value = true
  }
})
</script>

<style scoped>
.progress-display {
  @apply relative;
}

.progress-button {
  @apply flex items-center space-x-2 px-4 py-2;
  @apply bg-retro-dark border-2 border-retro-green rounded;
  @apply text-retro-green font-mono text-sm font-bold;
  @apply hover:bg-retro-green hover:bg-opacity-10;
  @apply transition-all duration-200;
  @apply relative;
}

.progress-button.has-new-achievements {
  @apply border-retro-amber text-retro-amber;
  animation: achievement-pulse 2s infinite;
}

.achievement-badge {
  @apply absolute -top-1 -right-1;
  @apply w-4 h-4 bg-retro-amber text-retro-dark;
  @apply rounded-full text-xs font-bold;
  @apply flex items-center justify-center;
}

.progress-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 z-40;
}

.progress-panel {
  @apply fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2;
  @apply bg-retro-dark border-2 border-retro-green rounded-lg;
  @apply w-full max-w-2xl max-h-[80vh] overflow-y-auto;
  @apply z-50 shadow-2xl;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
}

.panel-header {
  @apply flex justify-between items-center p-4;
  @apply border-b border-retro-green border-opacity-30;
}

.panel-title {
  @apply text-retro-green font-mono text-lg font-bold;
  @apply tracking-wider;
}

.close-button {
  @apply text-retro-green hover:text-retro-amber;
  @apply text-2xl font-bold;
  @apply w-8 h-8 flex items-center justify-center;
}

.panel-content {
  @apply p-4 space-y-6;
}

.loading-state,
.error-state {
  @apply flex flex-col items-center space-y-4 py-8;
  @apply text-retro-green;
}

.loading-spinner {
  @apply w-8 h-8 border-2 border-retro-green border-t-transparent;
  @apply rounded-full animate-spin;
}

.retry-button {
  @apply px-4 py-2 bg-retro-green bg-opacity-20;
  @apply border border-retro-green rounded;
  @apply text-retro-green hover:bg-opacity-30;
}

.section-title {
  @apply text-retro-amber font-mono text-sm font-bold;
  @apply tracking-wider mb-3;
}

.stats-grid {
  @apply grid grid-cols-4 gap-4;
}

.stat-item {
  @apply text-center;
}

.stat-value {
  @apply block text-retro-green font-mono text-xl font-bold;
}

.stat-label {
  @apply block text-retro-green opacity-75 text-xs;
}

.difficulty-list {
  @apply space-y-3;
}

.difficulty-item {
  @apply bg-retro-green bg-opacity-5 p-3 rounded;
  @apply border border-retro-green border-opacity-20;
}

.difficulty-header {
  @apply flex justify-between items-center mb-1;
}

.difficulty-name {
  @apply text-retro-green font-mono font-bold;
}

.mastery-level {
  @apply text-xs px-2 py-1 rounded;
  @apply font-mono font-bold;
}

.mastery-level.beginner {
  @apply bg-gray-600 text-gray-300;
}

.mastery-level.intermediate {
  @apply bg-blue-600 text-blue-300;
}

.mastery-level.advanced {
  @apply bg-green-600 text-green-300;
}

.mastery-level.expert {
  @apply bg-purple-600 text-purple-300;
}

.mastery-level.master {
  @apply bg-yellow-600 text-yellow-300;
}

.difficulty-stats {
  @apply text-retro-green opacity-75 text-sm;
}

.achievements-list {
  @apply space-y-2;
}

.achievement-item {
  @apply flex items-center space-x-3 p-2 rounded;
  @apply bg-retro-green bg-opacity-5;
}

.achievement-icon {
  @apply text-2xl;
}

.achievement-info {
  @apply flex flex-col;
}

.achievement-name {
  @apply text-retro-green font-mono font-bold text-sm;
}

.achievement-desc {
  @apply text-retro-green opacity-75 text-xs;
}

.achievement-date {
  @apply text-retro-amber opacity-90 text-xs font-mono;
  @apply mt-1;
}

.achievement-item.rare {
  @apply bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30;
}

.achievement-item.epic {
  @apply bg-purple-500 bg-opacity-10 border border-purple-500 border-opacity-30;
}

.achievement-item.legendary {
  @apply bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30;
}

/* Animations */
@keyframes achievement-pulse {

  0%,
  100% {
    border-color: rgb(255, 191, 0);
    box-shadow: 0 0 5px rgba(255, 191, 0, 0.3);
  }

  50% {
    border-color: rgb(255, 191, 0);
    box-shadow: 0 0 15px rgba(255, 191, 0, 0.6);
  }
}

.progress-panel-enter-active,
.progress-panel-leave-active {
  transition: all 0.3s ease;
}

.progress-panel-enter-from,
.progress-panel-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

/* Responsive */
@media (max-width: 640px) {
  .progress-panel {
    @apply w-[95vw] max-h-[90vh];
  }

  .stats-grid {
    @apply grid-cols-2 gap-2;
  }
}
</style>