#!/usr/bin/env node

/**
 * Test script to fetch words using the local server endpoint
 * Make sure your app is running on localhost:3000 first
 * Run with: node test-words-local.js
 */

import fetch from 'node-fetch'

const difficulties = ['junior', 'cet4', 'cet6', 'toefl', 'gre']
const SERVER_URL = 'http://localhost:3000'

async function generateWord(difficulty) {
  try {
    const response = await fetch(`${SERVER_URL}/api/generate-word`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ difficulty }),
      timeout: 15000
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Server error ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    if (!data.success || !data.word) {
      throw new Error(data.error || 'Invalid response from server')
    }

    return data.word
  } catch (error) {
    throw new Error(`Failed to generate word: ${error.message}`)
  }
}

async function testWordGeneration() {
  console.log('🎮 Testing Hangman Word Generation via Local Server')
  console.log('=' .repeat(60))
  console.log(`📡 Server: ${SERVER_URL}`)
  console.log()

  // Test server connectivity
  try {
    const response = await fetch(`${SERVER_URL}/api/generate-word`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty: 'junior' }),
      timeout: 5000
    })
    console.log('✅ Server is reachable')
  } catch (error) {
    console.error('❌ Cannot reach server. Make sure your app is running on localhost:3000')
    console.log('Run: npm run dev')
    process.exit(1)
  }

  console.log()

  for (const difficulty of difficulties) {
    console.log(`🎯 Testing ${difficulty.toUpperCase()} level:`)
    console.log('-'.repeat(40))
    
    const words = []
    const errors = []
    
    for (let i = 1; i <= 10; i++) {
      try {
        process.stdout.write(`  ${i.toString().padStart(2)}/10: `)
        
        const word = await generateWord(difficulty)
        words.push(word)
        
        console.log(`✅ ${word} (${word.length} letters)`)
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 300))
        
      } catch (error) {
        errors.push(error.message)
        console.log(`❌ ${error.message}`)
      }
    }
    
    console.log()
    console.log(`📊 Results for ${difficulty.toUpperCase()}:`)
    console.log(`   ✅ Success: ${words.length}/10`)
    console.log(`   ❌ Errors: ${errors.length}/10`)
    
    if (words.length > 0) {
      console.log(`   📝 Words: ${words.join(', ')}`)
      
      // Analysis
      const lengths = words.map(w => w.length)
      const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length
      const minLength = Math.min(...lengths)
      const maxLength = Math.max(...lengths)
      
      console.log(`   📏 Length: avg=${avgLength.toFixed(1)}, min=${minLength}, max=${maxLength}`)
      
      // Check for duplicates
      const unique = [...new Set(words)]
      if (unique.length !== words.length) {
        console.log(`   ⚠️  Duplicates found: ${words.length - unique.length}`)
      }
    }
    
    console.log()
  }
  
  console.log('🏁 Test completed!')
}

// Run the test
testWordGeneration().catch(error => {
  console.error('💥 Test failed:', error.message)
  process.exit(1)
})