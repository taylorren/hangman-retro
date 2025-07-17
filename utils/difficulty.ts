import type { DifficultyLevel, WordCategory } from '../types/game'
import { DIFFICULTY_CONFIGS, FALLBACK_WORDS } from '../types/constants'

/**
 * Get difficulty configuration for a given level
 */
export function getDifficultyConfig(level: DifficultyLevel) {
  return DIFFICULTY_CONFIGS[level] || DIFFICULTY_CONFIGS.cet4
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
  const config = getDifficultyConfig(difficulty)
  if (!config) return false

  const wordLength = word.length
  return wordLength >= config.wordLength.min && wordLength <= config.wordLength.max
}

/**
 * Get all available categories for a difficulty level
 */
export function getCategoriesForDifficulty(difficulty: DifficultyLevel): WordCategory[] {
  const config = getDifficultyConfig(difficulty)
  return config?.categories || DIFFICULTY_CONFIGS.cet4.categories
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
    cet4: '英语四级',
    cet6: '英语六级',
    toefl: '托福',
    gre: 'GRE'
  }

  const difficultyName = difficultyNames[difficulty] || difficulty

  // 添加更多随机元素
  const randomTime = Date.now() % 1000  // 增大随机种子范围

  const variations = [
    `随便给一个${difficultyName}单词，只返回单词。不许重复。随机种子${randomTime}${randomTime}`,
    `找到一个${difficultyName}英语单词，随机数${randomTime}，只要单词`,
    `随机生成${difficultyName}单词，时间${randomTime}，仅返回单词`,
    `给我${difficultyName}单词，编号${randomTime}，只返回英文单词`,
    `有没有一个${difficultyName}词汇，ID${randomTime}，只要英文单词`,
    `请提供${difficultyName}单词，序号${randomTime}`
  ]

  return variations[Math.floor(Math.random() * variations.length)] || `给我一个${difficultyName}单词`
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