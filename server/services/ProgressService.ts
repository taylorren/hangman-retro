import { promises as fs } from 'fs'
import { join } from 'path'
import type {
  UserProgress,
  GameRecord,
  Achievement,
  DifficultyProgress,
  MasteryLevel
} from '../../types/progress'
import {
  ACHIEVEMENTS,
  MASTERY_REQUIREMENTS,
  DIFFICULTY_UNLOCK_REQUIREMENTS
} from '../../types/progress'
import type { DifficultyLevel } from '../../types/game'

export class ProgressService {
  private readonly dataDir: string
  private readonly progressFile: string
  private progressCache: Map<string, UserProgress> = new Map()

  constructor() {
    // Store progress data in .data directory (gitignored)
    this.dataDir = join(process.cwd(), '.data')
    this.progressFile = join(this.dataDir, 'user-progress.json')
    this.ensureDataDirectory()
  }

  /**
   * Ensure data directory exists
   */
  private async ensureDataDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.dataDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create data directory:', error)
    }
  }

  /**
   * Load progress data from file
   */
  private async loadProgressData(): Promise<Record<string, UserProgress>> {
    try {
      const data = await fs.readFile(this.progressFile, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      // File doesn't exist or is invalid, return empty object
      return {}
    }
  }

  /**
   * Save progress data to file
   */
  private async saveProgressData(data: Record<string, UserProgress>): Promise<void> {
    try {
      await fs.writeFile(this.progressFile, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Failed to save progress data:', error)
      throw new Error('Failed to persist progress data')
    }
  }

  /**
   * Get user progress by IP address
   */
  async getUserProgress(
    ipAddress: string,
    options: { includeRecentGames?: boolean; includeAchievements?: boolean } = {}
  ): Promise<UserProgress> {
    // Check cache first
    if (this.progressCache.has(ipAddress)) {
      const cached = this.progressCache.get(ipAddress)!
      return this.filterProgressData(cached, options)
    }

    // Load from file
    const allProgress = await this.loadProgressData()
    const userProgress = allProgress[ipAddress] || this.createNewUserProgress(ipAddress)

    // Cache the result
    this.progressCache.set(ipAddress, userProgress)

    return this.filterProgressData(userProgress, options)
  }

  /**
   * Update user progress with new game record
   */
  async updateProgress(
    ipAddress: string,
    gameRecord: Omit<GameRecord, 'id' | 'playedAt'>
  ): Promise<{ progress: UserProgress; newAchievements: Achievement[] }> {
    // Get current progress
    const currentProgress = await this.getUserProgress(ipAddress)

    // Create full game record
    const fullGameRecord: GameRecord = {
      ...gameRecord,
      id: this.generateId(),
      playedAt: new Date()
    }

    // Update progress
    const updatedProgress = this.calculateUpdatedProgress(currentProgress, fullGameRecord)

    // Check for new achievements
    const newAchievements = this.checkForNewAchievements(currentProgress, updatedProgress, fullGameRecord)

    // Add new achievements to progress
    updatedProgress.achievements.push(...newAchievements)

    // Save to cache and file
    this.progressCache.set(ipAddress, updatedProgress)
    const allProgress = await this.loadProgressData()
    allProgress[ipAddress] = updatedProgress
    await this.saveProgressData(allProgress)

    return { progress: updatedProgress, newAchievements }
  }

  /**
   * Create new user progress record
   */
  private createNewUserProgress(ipAddress: string): UserProgress {
    const now = new Date()

    return {
      id: this.generateId(),
      ipAddress,
      createdAt: now,
      lastPlayedAt: now,
      totalGames: 0,
      totalWins: 0,
      totalLosses: 0,
      winRate: 0,
      currentStreak: 0,
      bestStreak: 0,
      difficultyStats: {
        cet4: this.createEmptyDifficultyProgress(),
        cet6: this.createEmptyDifficultyProgress(),
        toefl: this.createEmptyDifficultyProgress(),
        gre: this.createEmptyDifficultyProgress()
      },
      achievements: [],
      preferences: {
        preferredDifficulty: 'cet4',
        soundEnabled: true,
        animationsEnabled: true,
        theme: 'classic',
        autoAdvanceDifficulty: false
      }
    }
  }

  /**
   * Create empty difficulty progress
   */
  private createEmptyDifficultyProgress(): DifficultyProgress {
    return {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      averageGuesses: 0,
      bestGame: null,
      recentGames: [],
      unlockedAt: null,
      masteryLevel: 'beginner'
    }
  }

  /**
   * Calculate updated progress after a game
   */
  private calculateUpdatedProgress(
    currentProgress: UserProgress,
    gameRecord: GameRecord
  ): UserProgress {
    const updated = { ...currentProgress }
    updated.lastPlayedAt = new Date()
    updated.totalGames++

    if (gameRecord.won) {
      updated.totalWins++
      updated.currentStreak++
      updated.bestStreak = Math.max(updated.bestStreak, updated.currentStreak)
    } else {
      updated.totalLosses++
      updated.currentStreak = 0
    }

    updated.winRate = updated.totalWins / updated.totalGames

    // Update difficulty-specific stats
    const difficultyStats = updated.difficultyStats[gameRecord.difficulty]
    difficultyStats.gamesPlayed++

    if (gameRecord.won) {
      difficultyStats.wins++
    } else {
      difficultyStats.losses++
    }

    difficultyStats.winRate = difficultyStats.wins / difficultyStats.gamesPlayed

    // Update average guesses
    const totalGuesses = difficultyStats.averageGuesses * (difficultyStats.gamesPlayed - 1) + gameRecord.guessesUsed
    difficultyStats.averageGuesses = totalGuesses / difficultyStats.gamesPlayed

    // Update best game
    if (gameRecord.won && (!difficultyStats.bestGame || gameRecord.guessesUsed < difficultyStats.bestGame.guessesUsed)) {
      difficultyStats.bestGame = gameRecord
    }

    // Add to recent games (keep last 10)
    difficultyStats.recentGames.unshift(gameRecord)
    if (difficultyStats.recentGames.length > 10) {
      difficultyStats.recentGames = difficultyStats.recentGames.slice(0, 10)
    }

    // Update mastery level
    difficultyStats.masteryLevel = this.calculateMasteryLevel(difficultyStats)

    // Check if difficulty should be unlocked
    if (!difficultyStats.unlockedAt && difficultyStats.gamesPlayed === 1) {
      difficultyStats.unlockedAt = new Date()
    }

    return updated
  }

  /**
   * Calculate mastery level based on stats
   */
  private calculateMasteryLevel(stats: DifficultyProgress): MasteryLevel {
    const levels: MasteryLevel[] = ['master', 'expert', 'advanced', 'intermediate', 'beginner']

    for (const level of levels) {
      const requirements = MASTERY_REQUIREMENTS[level]
      if (stats.wins >= requirements.wins && stats.winRate >= requirements.winRate) {
        return level
      }
    }

    return 'beginner'
  }

  /**
   * Check for new achievements
   */
  private checkForNewAchievements(
    oldProgress: UserProgress,
    newProgress: UserProgress,
    gameRecord: GameRecord
  ): Achievement[] {
    const newAchievements: Achievement[] = []
    const existingAchievementIds = new Set(oldProgress.achievements.map(a => a.id))

    // Check each achievement
    for (const [achievementId, achievementTemplate] of Object.entries(ACHIEVEMENTS)) {
      if (existingAchievementIds.has(achievementId)) {
        continue // Already unlocked
      }

      let unlocked = false

      switch (achievementId) {
        case 'FIRST_WIN':
          unlocked = gameRecord.won && oldProgress.totalWins === 0
          break

        case 'CET4_MASTER':
          unlocked = newProgress.difficultyStats.cet4.wins >= 10
          break

        case 'SPEED_DEMON':
          unlocked = gameRecord.won && gameRecord.timeElapsed < 60000 // 60 seconds
          break

        case 'PERFECT_GAME':
          unlocked = gameRecord.won && gameRecord.incorrectGuesses.length === 0
          break

        case 'STREAK_MASTER':
          unlocked = newProgress.currentStreak >= 10
          break
      }

      if (unlocked) {
        newAchievements.push({
          ...achievementTemplate,
          id: achievementId,
          unlockedAt: new Date()
        })
      }
    }

    return newAchievements
  }

  /**
   * Filter progress data based on options
   */
  private filterProgressData(
    progress: UserProgress,
    options: { includeRecentGames?: boolean; includeAchievements?: boolean }
  ): UserProgress {
    const filtered = { ...progress }

    if (options.includeRecentGames === false) {
      // Remove recent games from difficulty stats
      Object.values(filtered.difficultyStats).forEach(stats => {
        stats.recentGames = []
      })
    }

    if (options.includeAchievements === false) {
      filtered.achievements = []
    }

    return filtered
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
  }

  /**
   * Clean up old data (privacy compliance)
   */
  async cleanupOldData(daysOld: number = 90): Promise<void> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const allProgress = await this.loadProgressData()
    const cleanedProgress: Record<string, UserProgress> = {}

    for (const [ipAddress, progress] of Object.entries(allProgress)) {
      if (new Date(progress.lastPlayedAt) > cutoffDate) {
        cleanedProgress[ipAddress] = progress
      }
    }

    await this.saveProgressData(cleanedProgress)

    // Clear cache
    this.progressCache.clear()

    console.log(`Cleaned up progress data older than ${daysOld} days`)
  }
}

// Singleton instance
let _progressService: ProgressService | null = null

export function getProgressService(): ProgressService {
  if (!_progressService) {
    _progressService = new ProgressService()
  }
  return _progressService
}