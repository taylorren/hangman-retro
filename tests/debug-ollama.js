/**
 * Debug script to test Ollama/Doubao API connection
 * Run with: node tests/debug-ollama.js
 */

// Load environment variables (ES module syntax)
import { config } from 'dotenv'
config()

async function debugOllamaConnection() {
  console.log('🔍 Debugging Ollama/Doubao API Connection...\n')
  
  // Check environment variables
  console.log('📋 Environment Variables:')
  console.log(`DOUBAO_API_KEY: ${process.env.DOUBAO_API_KEY ? '✅ Set (length: ' + process.env.DOUBAO_API_KEY.length + ')' : '❌ Not set'}`)
  console.log(`DOUBAO_MODEL_ENDPOINT: ${process.env.DOUBAO_MODEL_ENDPOINT || 'Not set (using default: deepseek-r1-250120)'}`)
  console.log()
  
  if (!process.env.DOUBAO_API_KEY) {
    console.log('❌ DOUBAO_API_KEY is not set!')
    console.log('📝 Please:')
    console.log('1. Copy .env.example to .env')
    console.log('2. Add your Doubao API key to .env file')
    console.log('3. Run this test again')
    return
  }
  
  // Test API connection
  console.log('🌐 Testing API Connection...')
  
  try {
    const baseUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
    const model = process.env.DOUBAO_MODEL_ENDPOINT || 'deepseek-r1-250120'
    
    console.log(`📡 Connecting to: ${baseUrl}`)
    console.log(`🤖 Using model: ${model}`)
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DOUBAO_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{
          role: 'user',
          content: '给我一个英语四级单词'
        }],
        max_tokens: 10
      })
    })
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ API Connection Successful!')
      console.log('📝 Response:', JSON.stringify(data, null, 2))
      
      if (data.choices && data.choices[0]) {
        const word = data.choices[0].message.content.trim()
        console.log(`🎯 Generated word: "${word}"`)
      }
    } else {
      console.log('❌ API Connection Failed!')
      const errorText = await response.text()
      console.log('📝 Error Response:', errorText)
      
      if (response.status === 401) {
        console.log('🔑 This looks like an authentication error. Please check your API key.')
      } else if (response.status === 404) {
        console.log('🤖 This might be a model name issue. Please check DOUBAO_MODEL_ENDPOINT.')
      }
    }
    
  } catch (error) {
    console.log('❌ Network Error!')
    console.log('📝 Error:', error.message)
    
    if (error.message.includes('fetch')) {
      console.log('🌐 This looks like a network connectivity issue.')
      console.log('💡 Please check your internet connection and firewall settings.')
    }
  }
  
  console.log('\n🔧 Troubleshooting Tips:')
  console.log('1. Make sure .env file exists with DOUBAO_API_KEY')
  console.log('2. Verify your API key is valid and active')
  console.log('3. Check if you have internet access to ark.cn-beijing.volces.com')
  console.log('4. Try running: npm run test:ollama')
}

// Run the debug function
debugOllamaConnection().catch(console.error)