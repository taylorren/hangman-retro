import type { DifficultyLevel } from '../types/game'
import { getEnhancedOllamaPrompt } from '../utils/difficulty'

interface DoubaoRequest {
    model: string
    messages: Array<{
        role: 'user' | 'assistant' | 'system'
        content: string
    }>
    temperature?: number
    max_tokens?: number
    thinking?: {
        type: 'disabled' | 'enabled' | 'auto'
    }
}

interface DoubaoResponse {
    choices: Array<{
        message: {
            content: string
        }
    }>
    error?: {
        message: string
        type: string
    }
}

export class WordGenerationService {
    private readonly baseUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
    private readonly model = process.env.DOUBAO_MODEL_ENDPOINT || 'deepseek-r1-250120' // 豆包模型名称
    private readonly timeout = 30000 // 30 seconds
    private readonly maxRetries = 3
    private readonly retryDelay = 1000 // 1 second
    private readonly apiKey: string

    constructor() {
        // 从环境变量获取API密钥
        this.apiKey = process.env.DOUBAO_API_KEY || ''
        if (!this.apiKey) {
            console.warn('DOUBAO_API_KEY not found in environment variables')
        }
    }

    /**
     * Generate a word using 豆包 API based on difficulty level with retry logic
     */
    async generateWord(difficulty: DifficultyLevel): Promise<string> {
        // Check if API key is available
        if (!this.apiKey) {
            throw new Error('豆包 API key is not configured. Please set DOUBAO_API_KEY environment variable.')
        }

        const prompt = getEnhancedOllamaPrompt(difficulty)

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const word = await this.callDoubaoWithRetry(prompt, attempt)

                // Validate the generated word (only check if it's a valid English word)
                if (this.isValidEnglishWord(word)) {
                    return word.toUpperCase()
                } else {
                    console.warn(`Generated word "${word}" is not a valid English word (attempt ${attempt + 1})`)
                    if (attempt === this.maxRetries) {
                        throw new Error(`Failed to generate valid English word for ${difficulty} difficulty after ${this.maxRetries + 1} attempts`)
                    }
                    // Continue to next retry
                }
            } catch (error) {
                console.error(`Failed to generate word from 豆包 API (attempt ${attempt + 1}):`, error)

                if (attempt === this.maxRetries) {
                    throw new Error(`Failed to generate word from 豆包 API after ${this.maxRetries + 1} attempts: ${error}`)
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
     * Check if 豆包 API service is available
     */
    async isAvailable(): Promise<boolean> {
        if (!this.apiKey) {
            return false
        }

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), this.timeout)

            // 发送一个简单的测试请求
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{
                        role: 'system',
                        content: '你是一个专业的英语单词生成助手，专门为hangman猜词游戏提供各种难度级别的英语单词。请根据用户的要求生成合适的单词。'
                    }, {
                        role: 'user',
                        content: 'test'
                    }],
                    max_tokens: 1
                }),
                signal: controller.signal
            })

            clearTimeout(timeoutId)
            return response.status === 200 || response.status === 400 // 400 might indicate API is available but request format issue

        } catch (error) {
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    console.warn('豆包 API service check timed out')
                } else if (error.message.includes('fetch')) {
                    console.warn('Cannot connect to 豆包 API service')
                } else {
                    console.warn('豆包 API service availability check failed:', error.message)
                }
            } else {
                console.warn('Unknown error checking 豆包 API service:', error)
            }
            return false
        }
    }

    /**
     * Make HTTP request to 豆包 API with retry context
     */
    private async callDoubaoWithRetry(prompt: string, attempt: number): Promise<string> {
        return this.callDoubao(prompt)
    }

    /**
     * Delay utility for retry logic
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * Make HTTP request to 豆包 API
     */
    private async callDoubao(prompt: string): Promise<string> {
        const requestBody: DoubaoRequest = {
            model: this.model,
            messages: [
                {
                    role: 'system',
                    content: '你是一个专业的英语单词生成助手，专门为hangman猜词游戏提供各种难度级别的英语单词。你需要根据用户指定的难度级别，去搜索相应的词库，随机返回一个英语单词。你可以用提示中的随机输入来提供随机性。请确保生成的单词符合相应难度级别的词汇要求，并且只返回单词本身，不要包含任何解释或额外文字。每次都要生成不同的随机单词，避免重复。'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 50,
            thinking: {
                type: 'disabled'
            }
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`

                // Try to get more specific error information
                try {
                    const errorData = await response.json()
                    if (errorData.error) {
                        errorMessage += ` - ${errorData.error.message || errorData.error}`
                    }
                } catch {
                    // Ignore JSON parsing errors for error responses
                }

                throw new Error(errorMessage)
            }

            const data: DoubaoResponse = await response.json()

            if (data.error) {
                throw new Error(`豆包 API error: ${data.error.message}`)
            }

            if (!data.choices || data.choices.length === 0) {
                throw new Error('No choices returned from 豆包 API')
            }

            const content = data.choices[0].message.content
            if (!content || content.trim() === '') {
                throw new Error('Empty response from 豆包 API')
            }

            return this.extractWord(content)
        } catch (error) {
            clearTimeout(timeoutId)

            // Enhance error messages for better debugging
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error(`Request timed out after ${this.timeout}ms`)
                } else if (error.message.includes('fetch')) {
                    throw new Error('Network error: Cannot connect to 豆包 API service')
                }
            }

            throw error
        }
    }

    /**
     * Extract a single word from 豆包 API response
     */
    private extractWord(response: string): string {
        // Clean the response and extract the first word
        const cleaned = response.trim().toLowerCase()

        // Remove any punctuation and get the first word
        const words = cleaned.replace(/[^\w\s]/g, '').split(/\s+/)
        const firstWord = words[0] || ''

        // Ensure it's only alphabetic characters
        const alphabeticWord = firstWord.replace(/[^a-z]/g, '')

        if (!alphabeticWord) {
            throw new Error('No valid word found in 豆包 API response')
        }

        return alphabeticWord
    }

    /**
     * Validate if a word is a valid English word (only alphabetic characters)
     */
    private isValidEnglishWord(word: string): boolean {
        // Check if word contains only alphabetic characters and is not empty
        return /^[a-zA-Z]+$/.test(word) && word.length > 0
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