import type { DifficultyLevel } from './game'

/**
 * User progress data structure
 */
export interface UserProgress {
  id: string
  ipAddress: string
  createdAt: Date
  lastPlayedAt: Date
  totalGames: number
  totalWins: number
  totalLosses: number
  winRate: number
  currentStreak: number
  bestStreak: number
  difficultyStats: DifficultyStats
  achievements: Achievement[]
  preferences: UserPreferences
}

/**
 * Statistics for each difficulty level
 */
export interface DifficultyStats {
  cet4: DifficultyProgress
  cet6: DifficultyProgress
  toefl: DifficultyProgress
  gre: DifficultyProgress
}

/**
 * Progress data for a specific difficulty level
 */
export interface DifficultyProgress {
  gamesPlayed: number
  wins: number
  losses: number
  winRate: number
  averageGuesses: number
  bestGame: GameRecord | null
  recentGames: GameRecord[]
  unlockedAt: Date | null
  masteryLevel: MasteryLevel
}

/**
 * Individual game record
 */
export interface GameRecord {
  id: string
  difficulty: DifficultyLevel
  wordLength: number
  guessesUsed: number
  timeElapsed: number
  won: boolean
  playedAt: Date
  incorrectGuesses: string[]
  correctGuesses: string[]
}

/**
 * Achievement system
 */
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: Date
  category: AchievementCategory
  rarity: AchievementRarity
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  preferredDifficulty: DifficultyLevel
  soundEnabled: boolean
  animationsEnabled: boolean
  theme: 'classic' | 'amber' | 'green'
  autoAdvanceDifficulty: boolean
}

/**
 * Progress tracking request/response types
 */
export interface ProgressUpdateRequest {
  gameRecord: Omit<GameRecord, 'id' | 'playedAt'>
  ipAddress: string
}

export interface ProgressResponse {
  success: boolean
  progress: UserProgress
  newAchievements?: Achievement[]
  error?: string
}

/**
 * Progress query parameters
 */
export interface ProgressQuery {
  ipAddress: string
  includeRecentGames?: boolean
  includeAchievements?: boolean
}

/**
 * Enums and constants
 */
export type MasteryLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master'

export type AchievementCategory = 
  | 'first_steps'
  | 'difficulty_mastery' 
  | 'streak_achievements'
  | 'speed_achievements'
  | 'efficiency_achievements'
  | 'milestone_achievements'

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

/**
 * Achievement definitions
 */
export const ACHIEVEMENTS: Record<string, Omit<Achievement, 'id' | 'unlockedAt'>> = {
  FIRST_WIN: {
    name: 'First Victory',
    description: 'Win your first game',
    icon: '🎉',
    category: 'first_steps',
    rarity: 'common'
  },
  CET4_MASTER: {
    name: 'CET-4 Master',
    description: 'Win 10 games at CET-4 difficulty',
    icon: '📚',
    category: 'difficulty_mastery',
    rarity: 'uncommon'
  },
  SPEED_DEMON: {
    name: 'Speed Demon',
    description: 'Win a game in under 60 seconds',
    icon: '⚡',
    category: 'speed_achievements',
    rarity: 'rare'
  },
  PERFECT_GAME: {
    name: 'Perfect Game',
    description: 'Win without any incorrect guesses',
    icon: '💎',
    category: 'efficiency_achievements',
    rarity: 'epic'
  },
  STREAK_MASTER: {
    name: 'Streak Master',
    description: 'Win 10 games in a row',
    icon: '🔥',
    category: 'streak_achievements',
    rarity: 'legendary'
  }
}

/**
 * Mastery level requirements
 */
export const MASTERY_REQUIREMENTS: Record<MasteryLevel, { wins: number, winRate: number }> = {
  beginner: { wins: 0, winRate: 0 },
  intermediate: { wins: 5, winRate: 0.4 },
  advanced: { wins: 15, winRate: 0.6 },
  expert: { wins: 30, winRate: 0.75 },
  master: { wins: 50, winRate: 0.85 }
}

/**
 * Difficulty unlock requirements
 */
export const DIFFICULTY_UNLOCK_REQUIREMENTS: Record<DifficultyLevel, { prerequisite: DifficultyLevel | null, wins: number }> = {
  cet4: { prerequisite: null, wins: 0 },
  cet6: { prerequisite: 'cet4', wins: 3 },
  toefl: { prerequisite: 'cet6', wins: 5 },
  gre: { prerequisite: 'toefl', wins: 8 }
}