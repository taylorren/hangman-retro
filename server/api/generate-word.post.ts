import type { DifficultyLevel } from '~/types/game'
import { getEnhancedOllamaPrompt } from '~/utils/difficulty'

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

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { difficulty } = body as { difficulty: DifficultyLevel }

        if (!difficulty) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Difficulty level is required'
            })
        }

        const config = useRuntimeConfig()
        const apiKey = config.doubaoApiKey
        const model = config.doubaoModelEndpoint || 'deepseek-r1-250120'

        if (!apiKey) {
            throw createError({
                statusCode: 500,
                statusMessage: 'API key not configured'
            })
        }

        const baseUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
        const timeout = 30000

        const requestBody: DoubaoRequest = {
            model,
            messages: [
                {
                    role: 'system',
                    content: 'You are an English word generator for a hangman game. Generate only ONE English word based on the difficulty level requested. Return ONLY the word, no explanations, no Chinese text, no punctuation.'
                },
                {
                    role: 'user',
                    content: `Generate one ${difficulty.toUpperCase()} level English word. Return only the word.`
                }
            ],
            temperature: 0.8,
            max_tokens: 5,
            thinking: {
                type: 'enabled'
            }
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        try {
            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody),
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`
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
                throw new Error(`API error: ${data.error.message}`)
            }

            if (!data.choices || data.choices.length === 0) {
                throw new Error('No choices returned from API')
            }

            const content = data.choices[0]?.message?.content
            if (!content || content.trim() === '') {
                throw new Error('Empty response from API')
            }

            // Extract and validate the word
            const word = extractWord(content)
            
            if (!isValidEnglishWord(word)) {
                throw new Error(`Generated word "${word}" is not valid`)
            }

            return {
                success: true,
                word: word.toUpperCase()
            }

        } catch (error) {
            clearTimeout(timeoutId)
            
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw createError({
                        statusCode: 408,
                        statusMessage: `Request timed out after ${timeout}ms`
                    })
                } else if (error.message.includes('fetch')) {
                    throw createError({
                        statusCode: 503,
                        statusMessage: 'Cannot connect to API service'
                    })
                }
            }
            
            throw createError({
                statusCode: 500,
                statusMessage: error instanceof Error ? error.message : 'Unknown error'
            })
        }

    } catch (error) {
        console.error('Word generation error:', error)
        
        if (error.statusCode) {
            throw error // Re-throw HTTP errors
        }
        
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error'
        })
    }
})

/**
 * Extract a single word from API response
 */
function extractWord(response: string): string {
    console.log('🔍 Raw API response:', JSON.stringify(response))
    
    // Clean the response and extract the first word
    const cleaned = response.trim().toLowerCase()
    console.log('🧹 Cleaned response:', JSON.stringify(cleaned))

    // Remove any punctuation and get the first word
    const words = cleaned.replace(/[^\w\s]/g, '').split(/\s+/)
    console.log('📝 Extracted words:', words)
    
    const firstWord = words[0] || ''
    console.log('🎯 First word:', JSON.stringify(firstWord))

    // Ensure it's only alphabetic characters
    const alphabeticWord = firstWord.replace(/[^a-z]/g, '')
    console.log('🔤 Alphabetic word:', JSON.stringify(alphabeticWord))

    if (!alphabeticWord) {
        console.log('❌ No valid word found in response:', JSON.stringify(response))
        throw new Error('No valid word found in API response')
    }

    return alphabeticWord
}

/**
 * Validate if a word is a valid English word
 */
function isValidEnglishWord(word: string): boolean {
    // Check if word contains only alphabetic characters and is not empty
    const invalidWords = ['ID', 'OK', 'NO', 'GO', 'SO', 'TO', 'OF', 'IN', 'ON', 'AT', 'BY', 'UP', 'OR', 'IF', 'IS', 'AS', 'BE', 'DO', 'WE', 'HE', 'MY', 'AN', 'IT']
    
    return /^[a-zA-Z]+$/.test(word) && 
           word.length > 0 && 
           !invalidWords.includes(word.toUpperCase())
}