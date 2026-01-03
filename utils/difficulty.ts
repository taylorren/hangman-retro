import type { DifficultyLevel, WordCategory } from '../types/game'
import { DIFFICULTY_CONFIGS, FALLBACK_WORDS } from '../types/constants'

/**
 * Get difficulty configuration for a given level
 */
export function getDifficultyConfig(level: DifficultyLevel) {
  return DIFFICULTY_CONFIGS[level] || DIFFICULTY_CONFIGS.junior
}

/**
 * Get a random fallback word for a given difficulty level
 */
export function getFallbackWord(difficulty: DifficultyLevel): string {
  const difficultyWords = FALLBACK_WORDS[difficulty]
  if (!difficultyWords) {
    return 'CAT'
  }

  const categories = Object.keys(difficultyWords)
  if (categories.length === 0) {
    return 'CAT'
  }

  // Select a random category
  const randomCategory = categories[Math.floor(Math.random() * categories.length)]
  if (!randomCategory) {
    return 'CAT'
  }
  const categoryWords = (difficultyWords as any)[randomCategory]

  if (!categoryWords || !Array.isArray(categoryWords) || categoryWords.length === 0) {
    return 'CAT'
  }

  // Select a random word from the category
  const randomWord = categoryWords[Math.floor(Math.random() * categoryWords.length)]

  return String(randomWord).toUpperCase()
}

/**
 * Get a random fallback word from a specific category and difficulty
 */
export function getFallbackWordFromCategory(difficulty: DifficultyLevel, category: WordCategory): string {
  const difficultyWords = FALLBACK_WORDS[difficulty]

  if (!difficultyWords || !(difficultyWords as any)[category]) {
    // If category doesn't exist for this difficulty, fall back to any category
    return getFallbackWord(difficulty)
  }

  const categoryWords = (difficultyWords as any)[category]
  if (!categoryWords || !Array.isArray(categoryWords) || categoryWords.length === 0) {
    return getFallbackWord(difficulty)
  }

  const randomWord = categoryWords[Math.floor(Math.random() * categoryWords.length)]

  return String(randomWord).toUpperCase()
}

/**
 * Validate if a word meets the difficulty requirements
 */
export function validateWordForDifficulty(word: string, difficulty: DifficultyLevel): boolean {
  // Length validation removed as requested - accepts any length word
  // Only check if word is not empty and contains only letters
  return word.length > 0 && /^[a-zA-Z]+$/.test(word)
}

/**
 * Get all available categories for a difficulty level
 */
export function getCategoriesForDifficulty(difficulty: DifficultyLevel): WordCategory[] {
  const config = getDifficultyConfig(difficulty)
  return config?.categories || DIFFICULTY_CONFIGS.junior.categories
}

/**
 * Get Ollama prompt for a specific difficulty level
 */
export function getOllamaPrompt(difficulty: DifficultyLevel): string {
  const config = getDifficultyConfig(difficulty)
  return config.ollamaPrompt
}

/**
 * Get enhanced Ollama prompt with specific category for better word generation
 */
export function getEnhancedOllamaPrompt(difficulty: DifficultyLevel): string {
  // 中文难度级别映射
  const difficultyNames = {
    junior: '初中',
    cet4: 'CET-4',
    cet6: 'CET-6',
    toefl: 'TOEFL',
    gre: 'GRE'
  }

  const difficultyName = difficultyNames[difficulty] || difficulty

  // 使用更有效的随机性：时间和编号
  const randomTime = Date.now() % 1000
  const randomNumber = Math.floor(Math.random() * 1000)

  const variations = [
    `给我一个${difficultyName}单词，时间${randomTime}`,
    `请提供${difficultyName}单词，编号${randomNumber}`,
    `${difficultyName}单词，时间${randomTime}，只要单词`,
    `${difficultyName}词汇，编号${randomNumber}，仅返回单词`,
    `随机${difficultyName}单词，时间${randomTime}`,
    `生成${difficultyName}单词，编号${randomNumber}`
  ]

  return variations[Math.floor(Math.random() * variations.length)] || `给我一个${difficultyName}单词，时间${randomTime}`
}

/**
 * Get a random category for a difficulty level
 */
export function getRandomCategory(difficulty: DifficultyLevel): WordCategory {
  const categories = getCategoriesForDifficulty(difficulty)
  if (categories.length === 0) {
    return 'animals' // fallback to a default category
  }
  const randomCategory = categories[Math.floor(Math.random() * categories.length)]
  return randomCategory || 'animals'
}