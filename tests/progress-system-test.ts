/**
 * Test script for the progress tracking system
 * Run with: npx tsx tests/progress-system-test.ts
 */

import { getProgressService } from '../services/ProgressService'
import type { DifficultyLevel } from '../types/game'

async function testProgressSystem() {
  console.log('🧪 Testing Progress Tracking System...\n')

  const progressService = getProgressService()

  try {
    // Test 1: Check if progress service is available
    console.log('1. Testing progress service availability...')
    const isAvailable = await progressService.isAvailable()
    console.log(`   Service available: ${isAvailable ? '✅ Yes' : '❌ No'}`)

    if (!isAvailable) {
      console.log('   ⚠️  Progress service not available - make sure server is running')
      return
    }

    // Test 2: Get initial progress
    console.log('\n2. Testing initial progress retrieval...')
    const initialProgress = await progressService.getUserProgress()
    console.log(`   ✅ Initial progress loaded`)
    console.log(`   📊 Total games: ${initialProgress.totalGames}`)
    console.log(`   🎯 Win rate: ${(initialProgress.winRate * 100).toFixed(1)}%`)
    console.log(`   🔥 Current streak: ${initialProgress.currentStreak}`)

    // Test 3: Simulate a game result
    console.log('\n3. Testing progress update with game result...')
    const gameResult = {
      difficulty: 'cet4' as DifficultyLevel,
      wordLength: 5,
      guessesUsed: 4,
      timeElapsed: 45000, // 45 seconds
      won: true,
      incorrectGuesses: ['X', 'Z'],
      correctGuesses: ['A', 'P', 'L', 'E']
    }

    const updateResult = await progressService.updateProgress(gameResult)
    console.log(`   ✅ Progress updated successfully`)
    console.log(`   📈 New total games: ${updateResult.progress.totalGames}`)
    console.log(`   🎯 New win rate: ${(updateResult.progress.winRate * 100).toFixed(1)}%`)
    console.log(`   🔥 New streak: ${updateResult.progress.currentStreak}`)

    if (updateResult.newAchievements.length > 0) {
      console.log(`   🏆 New achievements unlocked:`)
      updateResult.newAchievements.forEach(achievement => {
        console.log(`      ${achievement.icon} ${achievement.name}: ${achievement.description}`)
      })
    }

    // Test 4: Test difficulty access
    console.log('\n4. Testing difficulty access checks...')
    const difficulties: DifficultyLevel[] = ['cet4', 'cet6', 'toefl', 'gre']
    
    for (const difficulty of difficulties) {
      const canAccess = await progressService.canAccessDifficulty(difficulty)
      console.log(`   ${difficulty.toUpperCase()}: ${canAccess ? '✅ Unlocked' : '🔒 Locked'}`)
    }

    // Test 5: Get recommended difficulty
    console.log('\n5. Testing difficulty recommendation...')
    const recommended = await progressService.getRecommendedDifficulty()
    console.log(`   🎯 Recommended difficulty: ${recommended.toUpperCase()}`)

    // Test 6: Get progress summary
    console.log('\n6. Testing progress summary...')
    const summary = await progressService.getProgressSummary()
    console.log(`   📊 Summary:`)
    console.log(`      Total games: ${summary.totalGames}`)
    console.log(`      Win rate: ${(summary.winRate * 100).toFixed(1)}%`)
    console.log(`      Best streak: ${summary.bestStreak}`)
    console.log(`      Recent achievements: ${summary.recentAchievements.length}`)
    console.log(`      Mastery levels:`)
    Object.entries(summary.masteryLevels).forEach(([difficulty, level]) => {
      console.log(`        ${difficulty.toUpperCase()}: ${level}`)
    })

    console.log('\n✅ Progress tracking system test completed successfully!')

  } catch (error) {
    console.error('\n❌ Progress tracking system test failed:', error)
  }
}

// Run the test
testProgressSystem().catch(console.error)