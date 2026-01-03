import type { DifficultyLevel } from '../../types/game'
import { getEnhancedOllamaPrompt } from '../../utils/difficulty'

interface AIRequest {
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

interface AIResponse {
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

async function callDoubaoAPI(apiKey: string, model: string, prompt: string): Promise<string> {
    const baseUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
    
    const requestBody: AIRequest = {
        model,
        messages: [
            {
                role: 'system',
                content: 'You are an English word generator for a hangman game. Return ONLY the word, no explanations, no Chinese text, no punctuation.'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.8,
        max_tokens: 5,
        thinking: {
            type: 'enabled'
        }
    }

    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    })

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

    const data: AIResponse = await response.json()

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

    return content
}

async function callDeepseekAPI(apiKey: string, model: string, prompt: string): Promise<string> {
    const baseUrl = 'https://api.deepseek.com/chat/completions'
    
    const requestBody: AIRequest = {
        model,
        messages: [
            {
                role: 'system',
                content: 'You are an English word generator for a hangman game. Return ONLY the word, no explanations, no Chinese text, no punctuation.'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.8,
        max_tokens: 5
    }

    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    })

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

    const data: AIResponse = await response.json()

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

    return content
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
        
        // Get AI provider configuration
        const aiProvider = config.aiProvider || process.env.AI_PROVIDER || 'doubao'
        
        let apiKey: string
        let model: string
        
        if (aiProvider === 'deepseek') {
            apiKey = config.deepseekApiKey || process.env.DEEPSEEK_API_KEY || ''
            model = config.deepseekModel || process.env.DEEPSEEK_MODEL || 'deepseek-chat'
        } else if (aiProvider === 'zenmux') {
            apiKey = config.zenmuxApiKey || process.env.ZENMUX_API_KEY || ''
            model = config.zenmuxModel || process.env.ZENMUX_MODEL || 'gpt-4o-mini'
        } else {
            // Default to Doubao
            apiKey = config.doubaoApiKey || process.env.DOUBAO_API_KEY || ''
            model = config.doubaoModelEndpoint || process.env.DOUBAO_MODEL_ENDPOINT || 'deepseek-r1-250120'
        }

        if (!apiKey || apiKey.trim() === '') {
            throw createError({
                statusCode: 500,
                statusMessage: `API key not configured. Please set ${aiProvider.toUpperCase()}_API_KEY environment variable.`
            })
        }

        const timeout = 30000
        const maxRetries = 3
        
        let lastError: Error | null = null
        
        // Try multiple times to get a valid word
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            let timeoutId: NodeJS.Timeout | null = null
            
            try {
                const prompt = generateEnhancedPrompt(difficulty)
                console.log(`🔄 Attempt ${attempt}/${maxRetries} for ${difficulty} level`)

                const controller = new AbortController()
                timeoutId = setTimeout(() => controller.abort(), timeout)

                let content: string
                
                if (aiProvider === 'deepseek') {
                    content = await callDeepseekAPI(apiKey, model, prompt)
                } else if (aiProvider === 'zenmux') {
                    content = await callZenmuxAPI(apiKey, model, prompt)
                } else {
                    content = await callDoubaoAPI(apiKey, model, prompt)
                }

                if (timeoutId) {
                    clearTimeout(timeoutId)
                    timeoutId = null
                }

                // Extract and validate the word
                const word = extractWord(content)
                const validation = validateWordForDifficulty(word, difficulty)
                
                if (!validation.valid) {
                    console.log(`❌ Invalid word "${word}": ${validation.reason}`)
                    if (attempt === maxRetries) {
                        throw new Error(`Generated word "${word}" failed validation: ${validation.reason}`)
                    }
                    continue // Try again
                }

                console.log(`✅ Valid word generated: "${word}" (${word.length} letters)`)
                return {
                    success: true,
                    word: word.toUpperCase()
                }

            } catch (error) {
                if (timeoutId) {
                    clearTimeout(timeoutId)
                    timeoutId = null
                }
                
                lastError = error instanceof Error ? error : new Error(String(error))
                console.log(`❌ Attempt ${attempt} failed: ${lastError.message}`)
                
                if (attempt === maxRetries) {
                    break // Exit retry loop
                }
                
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
            }
        }
        
        // If all retries failed, throw the last error
        if (lastError) {
            if (lastError.name === 'AbortError') {
                throw createError({
                    statusCode: 408,
                    statusMessage: `Request timed out after ${timeout}ms`
                })
            } else if (lastError.message.includes('fetch')) {
                throw createError({
                    statusCode: 503,
                    statusMessage: 'Cannot connect to API service'
                })
            }
            
            throw createError({
                statusCode: 500,
                statusMessage: lastError.message
            })
        }

    } catch (error: unknown) {
        console.error('Word generation error:', error)
        
        if (error && typeof error === 'object' && 'statusCode' in error) {
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
    console.log('🔍 Processing API response...')
    
    // Clean the response and extract the first word
    const cleaned = response.trim().toLowerCase()
    console.log('🧹 Response cleaned successfully')

    // Remove any punctuation and get the first word
    const words = cleaned.replace(/[^\w\s]/g, '').split(/\s+/)
    console.log('📝 Word extraction completed')
    
    const firstWord = words[0] || ''
    console.log('🎯 First word extracted')

    // Ensure it's only alphabetic characters
    const alphabeticWord = firstWord.replace(/[^a-z]/g, '')
    console.log('🔤 Word validation completed')

    if (!alphabeticWord) {
        console.log('❌ No valid word found in API response')
        throw new Error('No valid word found in API response')
    }

    console.log('✅ Word generated successfully')
    return alphabeticWord
}

/**
 * Enhanced word validation with strict length requirements
 */
function validateWordForDifficulty(word: string, difficulty: DifficultyLevel): { valid: boolean, reason?: string } {
    // Basic validation
    if (!word || word.length === 0) {
        return { valid: false, reason: 'Empty word' }
    }
    
    if (!/^[a-zA-Z]+$/.test(word)) {
        return { valid: false, reason: 'Contains non-alphabetic characters' }
    }
    
    // Length validation based on difficulty
    const lengthRules = {
        junior: { min: 4, max: 7 },
        cet4: { min: 4, max: 6 },
        cet6: { min: 6, max: 8 },
        toefl: { min: 7, max: 10 },
        gre: { min: 8, max: 12 }
    }
    
    const rule = lengthRules[difficulty]
    if (word.length < rule.min || word.length > rule.max) {
        return { valid: false, reason: `Length ${word.length} not in range ${rule.min}-${rule.max} for ${difficulty}` }
    }
    
    // Blacklist overly simple words for higher difficulties
    const simpleWords = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD', 'BY', 'UP', 'DO', 'NO', 'IF', 'MY', 'ON', 'AS', 'WE', 'TO']
    if ((difficulty === 'toefl' || difficulty === 'gre') && simpleWords.includes(word.toUpperCase())) {
        return { valid: false, reason: 'Word too simple for difficulty level' }
    }
    
    return { valid: true }
}

/**
 * Generate enhanced prompts with more randomness and specificity
 */
function generateEnhancedPrompt(difficulty: DifficultyLevel): string {
    const timestamp = Date.now() % 10000
    const randomSeed = Math.floor(Math.random() * 1000)
    
    const prompts = {
        junior: [
            `Generate a single English word for junior high students (grades 7-9). Word must be exactly ${4 + (timestamp % 4)} letters long. Choose from: animals, food, school objects, nature, daily activities. Seed: ${randomSeed}. Return only the word.`,
            `Create one English vocabulary word suitable for 13-15 year old students. Length: ${4 + (timestamp % 4)} letters. Categories: home, family, sports, weather, colors. Random: ${randomSeed}. Word only.`,
            `Junior high English word needed. ${4 + (timestamp % 4)} letters exactly. Topics: transportation, clothing, body parts, emotions, time. ID: ${randomSeed}. Just the word.`
        ],
        cet4: [
            `Generate one CET-4 level English word. Must be ${4 + (timestamp % 3)} letters long. University basic vocabulary. Academic but common. Seed: ${randomSeed}. Word only.`,
            `CET-4 English word required. Length: ${4 + (timestamp % 3)} letters exactly. College-level but fundamental vocabulary. Random: ${randomSeed}. Return word only.`,
            `Create CET-4 difficulty word. ${4 + (timestamp % 3)} letters. University entrance level. Common academic terms. ID: ${randomSeed}. Just word.`
        ],
        cet6: [
            `Generate CET-6 level word. Must be ${6 + (timestamp % 3)} letters long. Intermediate university English. More sophisticated than CET-4. Seed: ${randomSeed}. Word only.`,
            `CET-6 English vocabulary word. Length: ${6 + (timestamp % 3)} letters exactly. Graduate-level preparation. Academic contexts. Random: ${randomSeed}. Return word only.`,
            `Create CET-6 difficulty word. ${6 + (timestamp % 3)} letters. Advanced undergraduate vocabulary. Professional contexts. ID: ${randomSeed}. Just word.`
        ],
        toefl: [
            `Generate TOEFL-level academic word. Must be ${7 + (timestamp % 4)} letters long. University academic English. Research, science, literature contexts. Seed: ${randomSeed}. Word only.`,
            `TOEFL vocabulary word needed. Length: ${7 + (timestamp % 4)} letters exactly. Academic English for international students. Scholarly texts. Random: ${randomSeed}. Return word only.`,
            `Create TOEFL difficulty word. ${7 + (timestamp % 4)} letters. Advanced academic vocabulary. University coursework level. ID: ${randomSeed}. Just word.`
        ],
        gre: [
            `Generate GRE-level sophisticated word. Must be ${8 + (timestamp % 5)} letters long. Graduate school vocabulary. Intellectual, precise, nuanced meaning. Seed: ${randomSeed}. Word only.`,
            `GRE vocabulary word required. Length: ${8 + (timestamp % 5)} letters exactly. Advanced graduate-level English. Academic writing, research. Random: ${randomSeed}. Return word only.`,
            `Create GRE difficulty word. ${8 + (timestamp % 5)} letters. Sophisticated vocabulary for graduate studies. Complex concepts. ID: ${randomSeed}. Just word.`
        ]
    }
    
    const levelPrompts = prompts[difficulty]
    return levelPrompts[Math.floor(Math.random() * levelPrompts.length)]
}

async function callZenmuxAPI(apiKey: string, model: string, prompt: string): Promise<string> {
    // Try different possible endpoints for Zenmux
    const baseUrl = 'https://zenmux.ai/api/v1/chat/completions'
    
    const requestBody: AIRequest = {
        model,
        messages: [
            {
                role: 'system',
                content: 'You are an English word generator for a hangman game. Return ONLY the word, no explanations, no Chinese text, no punctuation.'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.8,
        max_tokens: 5
    }

    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
    })

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

    const data: AIResponse = await response.json()

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

    return content
}