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

    constructor() {
        // Client-side service - uses server API endpoint
    }

    /**
     * Generate a word using server API based on difficulty level with retry logic
     */
    async generateWord(difficulty: DifficultyLevel): Promise<string> {
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

                console.log(`✅ Successfully generated word: ${data.word}`)
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