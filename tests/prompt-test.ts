/**
 * Test the enhanced prompts for different difficulty levels
 */

import { getEnhancedOllamaPrompt, getDifficultyConfig } from '../utils/difficulty'
import type { DifficultyLevel } from '../types/game'

console.log('🔍 Testing Enhanced Prompts...\n')

const difficulties: DifficultyLevel[] = ['cet4', 'cet6', 'toefl', 'gre']

for (const difficulty of difficulties) {
    console.log(`=== ${difficulty.toUpperCase()} Level ===`)
    
    const config = getDifficultyConfig(difficulty)
    console.log(`Description: ${config.description}`)
    console.log(`Word Length: ${config.wordLength.min}-${config.wordLength.max} letters`)
    console.log(`Categories: ${config.categories.join(', ')}`)
    
    console.log('\nEnhanced Prompt:')
    const prompt = getEnhancedOllamaPrompt(difficulty)
    console.log(`"${prompt}"`)
    
    console.log('\n' + '='.repeat(50) + '\n')
}

console.log('✅ Prompt test completed!')