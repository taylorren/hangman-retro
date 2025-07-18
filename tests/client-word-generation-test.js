/**
 * Simple client-side test to verify word generation is working
 * This can be run in the browser console when the game is loaded
 */

// Test the word generation service directly
async function testWordGeneration() {
    console.log('🔍 Testing client-side word generation...')
    
    try {
        // Test API availability
        const response = await fetch('/api/generate-word', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ difficulty: 'cet4' })
        })
        
        if (response.ok) {
            const data = await response.json()
            console.log('✅ API is working! Generated word:', data.word)
            return true
        } else {
            console.error('❌ API failed with status:', response.status)
            return false
        }
    } catch (error) {
        console.error('❌ API test failed:', error)
        return false
    }
}

// Run the test
testWordGeneration()