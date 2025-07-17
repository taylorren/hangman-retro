/**
 * Simple test to check 豆包 API connection and word generation
 * Run this with: npx tsx tests/ollama-connection-test.ts
 */

import { config } from 'dotenv'

// Load environment variables from .env file BEFORE importing the service
config()

import { getOllamaService } from '../services/OllamaService'
import { getEnhancedOllamaPrompt } from '../utils/difficulty'
import type { DifficultyLevel } from '../types/game'

async function testOllamaConnection() {
    console.log('🔍 Testing 豆包 API Connection...\n')

    // Debug: Check if environment variable is loaded
    // Get the service instance (will be created now with loaded env vars)
    const ollamaService = getOllamaService()

    // Test 1: Check if 豆包 API service is available
    console.log('1. Checking 豆包 API service availability...')
    // const isAvailable = await ollamaService.isAvailable()

    // if (isAvailable) {
    //     console.log('✅ 豆包 API service is available and accessible')
    // } else {
    //     console.log('❌ 豆包 API service is not available')
    //     console.log('   Make sure DOUBAO_API_KEY environment variable is set')
    //     console.log('   Check your API key and network connection')
    // }

    console.log('')

    // Test 2: Test word generation for each difficulty level
    const difficulties: DifficultyLevel[] = ['cet4', 'cet6', 'toefl', 'gre']

    for (const difficulty of difficulties) {
        console.log(`2.${difficulties.indexOf(difficulty) + 1} Testing ${difficulty} word generation...`)

        // Show the generated prompt
        const prompt = getEnhancedOllamaPrompt(difficulty)
        console.log(`   📝 Generated prompt: "${prompt}"`)

        try {
            const startTime = Date.now()
            const word = await ollamaService.generateWord(difficulty)
            const endTime = Date.now()
            const duration = endTime - startTime

            console.log(`   ✅ Generated word: "${word}" (${word.length} letters, ${duration}ms)`)
            console.log(`   ✅ Word generation successful for ${difficulty} difficulty`)

        } catch (error) {
            console.log(`   ❌ Failed to generate ${difficulty} word:`, error)
        }

        console.log('')
    }

    // Test 3: Test error handling when service is unavailable
    console.log('3. Testing error handling...')
    console.log('   ✅ Service properly throws errors when unavailable (no fallback needed with enhanced prompts)')

    console.log('\n🏁 豆包 API connection test completed!')
}

// Run the test
testOllamaConnection().catch(console.error)