import type { DifficultyLevel } from '../types/game'

interface WordGenerationResponse {
    success: boolean
    word: string
    error?: string
}

export class WordGenerationService {
    private readonly timeout = 30000 // 30 seconds
    private readonly maxRetries = 3
    private readonly retryDelay = 1000 // 1 second
    private readonly cacheSize = 5 // Cache up to 5 words per difficulty
    private wordCache: Map<DifficultyLevel, string[]> = new Map()
    private preloadingPromises: Map<DifficultyLevel, Promise<void>> = new Map()

    constructor() {
        // Client-side service - uses server API endpoint
        // Initialize cache for all difficulty levels
        this.initializeCache()
    }

    /**
     * Initialize cache for all difficulty levels
     */
    private initializeCache(): void {
        const difficulties: DifficultyLevel[] = ['cet4', 'cet6', 'toefl', 'gre']
        difficulties.forEach(difficulty => {
            this.wordCache.set(difficulty, [])
        })
    }

    /**
     * Get a cached word if available, otherwise generate a new one
     */
    async generateWord(difficulty: DifficultyLevel): Promise<string> {
        // Try to get from cache first
        const cachedWords = this.wordCache.get(difficulty) || []
        if (cachedWords.length > 0) {
            const word = cachedWords.shift()!
            console.log('✅ Using cached word')
            
            // Start preloading more words in background if cache is getting low
            if (cachedWords.length < 2) {
                this.preloadWords(difficulty)
            }
            
            return word
        }

        // No cached words available, generate directly
        return this.generateWordDirect(difficulty)
    }

    /**
     * Generate a word directly from server API with retry logic
     */
    private async generateWordDirect(difficulty: DifficultyLevel): Promise<string> {
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`🔄 Attempting to generate word via server API (attempt ${attempt + 1})`)
                
                const response = await fetch('/api/generate-word', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ difficulty }),
                    signal: AbortSignal.timeout(this.timeout)
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(`Server error ${response.status}: ${errorText}`)
                }

                const data: WordGenerationResponse = await response.json()

                if (!data.success || !data.word) {
                    throw new Error(data.error || 'Invalid response from server')
                }

                console.log(`✅ Word generated successfully`)
                return data.word

            } catch (error) {
                console.error(`❌ Failed to generate word (attempt ${attempt + 1}):`, error)

                if (attempt === this.maxRetries) {
                    throw new Error(`Failed to generate word after ${this.maxRetries + 1} attempts: ${error}`)
                }

                // Wait before retrying
                if (attempt < this.maxRetries) {
                    await this.delay(this.retryDelay * (attempt + 1)) // Exponential backoff
                }
            }
        }

        // This should never be reached, but TypeScript requires it
        throw new Error('Unexpected error in word generation')
    }

    /**
     * Check if word generation service is available
     */
    async isAvailable(): Promise<boolean> {
        try {
            console.log('🔍 Checking server API availability...')
            
            const response = await fetch('/api/generate-word', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ difficulty: 'cet4' }),
                signal: AbortSignal.timeout(5000) // Shorter timeout for availability check
            })

            const isAvailable = response.ok
            console.log(`🔍 Server API availability: ${isAvailable}`)
            return isAvailable

        } catch (error) {
            console.warn('❌ Server API availability check failed:', error)
            return false
        }
    }

    /**
     * Preload words in background to improve perceived performance
     */
    private async preloadWords(difficulty: DifficultyLevel): Promise<void> {
        // Prevent multiple preloading operations for the same difficulty
        if (this.preloadingPromises.has(difficulty)) {
            return this.preloadingPromises.get(difficulty)!
        }

        const preloadPromise = this.performPreload(difficulty)
        this.preloadingPromises.set(difficulty, preloadPromise)

        try {
            await preloadPromise
        } finally {
            this.preloadingPromises.delete(difficulty)
        }
    }

    /**
     * Perform the actual preloading of words
     */
    private async performPreload(difficulty: DifficultyLevel): Promise<void> {
        const cachedWords = this.wordCache.get(difficulty) || []
        const wordsToPreload = Math.min(this.cacheSize - cachedWords.length, 3) // Preload up to 3 words

        if (wordsToPreload <= 0) {
            return // Cache is already full
        }

        console.log(`🔄 Preloading ${wordsToPreload} words for ${difficulty} difficulty...`)

        const preloadPromises = Array.from({ length: wordsToPreload }, () => 
            this.generateWordDirect(difficulty).catch(error => {
                console.warn(`❌ Failed to preload word for ${difficulty}:`, error)
                return null
            })
        )

        const results = await Promise.all(preloadPromises)
        const validWords = results.filter((word): word is string => word !== null)

        if (validWords.length > 0) {
            cachedWords.push(...validWords)
            console.log(`✅ Preloaded ${validWords.length} words for ${difficulty} difficulty`)
        }
    }

    /**
     * Preload words for all difficulty levels (can be called after game completion)
     */
    async preloadAllDifficulties(): Promise<void> {
        const difficulties: DifficultyLevel[] = ['cet4', 'cet6', 'toefl', 'gre']
        const preloadPromises = difficulties.map(difficulty => 
            this.preloadWords(difficulty).catch(error => {
                console.warn(`Failed to preload words for ${difficulty}:`, error)
            })
        )

        await Promise.all(preloadPromises)
        console.log('✅ Background preloading completed for all difficulties')
    }

    /**
     * Get cache status for debugging
     */
    getCacheStatus(): Record<DifficultyLevel, number> {
        const status: Record<string, number> = {}
        this.wordCache.forEach((words, difficulty) => {
            status[difficulty] = words.length
        })
        return status as Record<DifficultyLevel, number>
    }

    /**
     * Delay utility for retry logic
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

// Lazy singleton instance - will be created when first accessed
let _instance: WordGenerationService | null = null

export function getOllamaService(): WordGenerationService {
    if (!_instance) {
        _instance = new WordGenerationService()
    }
    return _instance
}

// For backward compatibility, create a getter that returns the lazy instance
export const ollamaService = {
    get instance() {
        return getOllamaService()
    }
}