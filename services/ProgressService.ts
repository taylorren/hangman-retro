import type {
  UserProgress,
  GameRecord,
  Achievement,
  ProgressResponse,
  ProgressUpdateRequest
} from '../types/progress'
import type { DifficultyLevel } from '../types/game'

export class ClientProgressService {
  private readonly timeout = 10000 // 10 seconds
  private progressCache: UserProgress | null = null
  private cacheExpiry: number = 0
  private readonly cacheTimeout = 5 * 60 * 1000 // 5 minutes

  constructor() {
    // Client-side progress service
  }

  /**
   * Get user progress from server
   */
  async getUserProgress(options: {
    includeRecentGames?: boolean
    includeAchievements?: boolean
    forceRefresh?: boolean
  } = {}): Promise<UserProgress> {
    // Check cache first (unless force refresh)
    if (!options.forceRefresh && this.progressCache && Date.now() < this.cacheExpiry) {
      return this.progressCache
    }

    try {
      const params = new URLSearchParams()
      if (options.includeRecentGames === false) params.set('includeRecentGames', 'false')
      if (options.includeAchievements === false) params.set('includeAchievements', 'false')

      const response = await fetch(`/api/progress/get?${params.toString()}`, {
        method: 'GET',
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`Server error ${response.status}: ${response.statusText}`)
      }

      const data: ProgressResponse = await response.json()

      if (!data.success || !data.progress) {
        throw new Error(data.error || 'Invalid response from server')
      }

      // Cache the result
      this.progressCache = data.progress
      this.cacheExpiry = Date.now() + this.cacheTimeout

      console.log('✅ Progress loaded successfully')
      return data.progress

    } catch (error) {
      console.error('❌ Failed to load progress:', error)

      // Return default progress if server fails
      if (this.progressCache) {
        console.log('🔄 Using cached progress data')
        return this.progressCache
      }

      throw new Error(`Failed to load progress: ${error}`)
    }
  }

  /**
   * Update progress with new game result
   */
  async updateProgress(gameResult: {
    difficulty: DifficultyLevel
    wordLength: number
    guessesUsed: number
    timeElapsed: number
    won: boolean
    incorrectGuesses: string[]
    correctGuesses: string[]
  }): Promise<{ progress: UserProgress; newAchievements: Achievement[] }> {
    try {
      const gameRecord: Omit<GameRecord, 'id' | 'playedAt'> = {
        difficulty: gameResult.difficulty,
        wordLength: gameResult.wordLength,
        guessesUsed: gameResult.guessesUsed,
        timeElapsed: gameResult.timeElapsed,
        won: gameResult.won,
        incorrectGuesses: gameResult.incorrectGuesses,
        correctGuesses: gameResult.correctGuesses
      }

      const requestBody: ProgressUpdateRequest = {
        gameRecord,
        ipAddress: '' // Server will detect IP
      }

      const response = await fetch('/api/progress/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.timeout)
      })

      if (!response.ok) {
        throw new Error(`Server error ${response.status}: ${response.statusText}`)
      }

      const data: ProgressResponse = await response.json()

      if (!data.success || !data.progress) {
        throw new Error(data.error || 'Invalid response from server')
      }

      // Update cache
      this.progressCache = data.progress
      this.cacheExpiry = Date.now() + this.cacheTimeout

      console.log('✅ Progress updated successfully')

      if (data.newAchievements && data.newAchievements.length > 0) {
        console.log(`🏆 Unlocked ${data.newAchievements.length} new achievements!`)
      }

      return {
        progress: data.progress,
        newAchievements: data.newAchievements || []
      }

    } catch (error) {
      console.error('❌ Failed to update progress:', error)
      throw new Error(`Failed to update progress: ${error}`)
    }
  }

  /**
   * Check if user can access a difficulty level
   */
  async canAccessDifficulty(difficulty: DifficultyLevel): Promise<boolean> {
    try {
      const progress = await this.getUserProgress({ includeRecentGames: false })

      // CET4 is always available
      if (difficulty === 'cet4') return true

      // Check unlock requirements
      const requirements = {
        cet6: { prerequisite: 'cet4' as DifficultyLevel, wins: 3 },
        toefl: { prerequisite: 'cet6' as DifficultyLevel, wins: 5 },
        gre: { prerequisite: 'toefl' as DifficultyLevel, wins: 8 }
      }

      const requirement = requirements[difficulty as keyof typeof requirements]
      if (!requirement) return false

      const prerequisiteStats = progress.difficultyStats[requirement.prerequisite]
      return prerequisiteStats.wins >= requirement.wins

    } catch (error) {
      console.warn('Failed to check difficulty access, allowing access:', error)
      return true // Allow access if check fails
    }
  }

  /**
   * Get recommended next difficulty
   */
  async getRecommendedDifficulty(): Promise<DifficultyLevel> {
    try {
      const progress = await this.getUserProgress({ includeRecentGames: false })

      // Check mastery levels and recommend next difficulty
      const { difficultyStats } = progress

      if (difficultyStats.gre.masteryLevel === 'master') return 'gre'
      if (difficultyStats.toefl.masteryLevel === 'expert' && difficultyStats.gre.wins < 3) return 'gre'
      if (difficultyStats.cet6.masteryLevel === 'expert' && difficultyStats.toefl.wins < 5) return 'toefl'
      if (difficultyStats.cet4.masteryLevel === 'expert' && difficultyStats.cet6.wins < 3) return 'cet6'

      // Default recommendations based on win rate
      if (difficultyStats.cet4.winRate > 0.8 && difficultyStats.cet4.wins >= 5) return 'cet6'
      if (difficultyStats.cet6.winRate > 0.7 && difficultyStats.cet6.wins >= 8) return 'toefl'
      if (difficultyStats.toefl.winRate > 0.6 && difficultyStats.toefl.wins >= 10) return 'gre'

      return progress.preferences.preferredDifficulty

    } catch (error) {
      console.warn('Failed to get recommended difficulty:', error)
      return 'cet4'
    }
  }

  /**
   * Get progress summary for display
   */
  async getProgressSummary(): Promise<{
    totalGames: number
    winRate: number
    currentStreak: number
    bestStreak: number
    recentAchievements: Achievement[]
    masteryLevels: Record<DifficultyLevel, string>
  }> {
    try {
      const progress = await this.getUserProgress()

      return {
        totalGames: progress.totalGames,
        winRate: progress.winRate,
        currentStreak: progress.currentStreak,
        bestStreak: progress.bestStreak,
        recentAchievements: progress.achievements.slice(-3), // Last 3 achievements
        masteryLevels: {
          cet4: progress.difficultyStats.cet4.masteryLevel,
          cet6: progress.difficultyStats.cet6.masteryLevel,
          toefl: progress.difficultyStats.toefl.masteryLevel,
          gre: progress.difficultyStats.gre.masteryLevel
        }
      }
    } catch (error) {
      console.warn('Failed to get progress summary:', error)
      return {
        totalGames: 0,
        winRate: 0,
        currentStreak: 0,
        bestStreak: 0,
        recentAchievements: [],
        masteryLevels: {
          cet4: 'beginner',
          cet6: 'beginner',
          toefl: 'beginner',
          gre: 'beginner'
        }
      }
    }
  }

  /**
   * Clear cached progress (force refresh on next request)
   */
  clearCache(): void {
    this.progressCache = null
    this.cacheExpiry = 0
  }

  /**
   * Check if progress tracking is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch('/api/progress/get', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      return response.ok
    } catch (error) {
      console.warn('Progress tracking not available:', error)
      return false
    }
  }
}

// Singleton instance
let _progressService: ClientProgressService | null = null

export function getProgressService(): ClientProgressService {
  if (!_progressService) {
    _progressService = new ClientProgressService()
  }
  return _progressService
}

// For backward compatibility
export const progressService = {
  get instance() {
    return getProgressService()
  }
}