import type { HangmanArt } from './game'

/**
 * Hangman ASCII art for each stage (0-6)
 * Stage 0: Empty gallows
 * Stage 1: Head
 * Stage 2: Body
 * Stage 3: Left arm
 * Stage 4: Right arm
 * Stage 5: Left leg
 * Stage 6: Right leg (game over)
 */
export const HANGMAN_STAGES: HangmanArt[] = [
  {
    stage: 0,
    art: `
   ┌─────┐
   │     │
   │      
   │      
   │      
   │      
   │      
 ──┴──────
`
  },
  {
    stage: 1,
    art: `
   ┌─────┐
   │     │
   │     ●
   │      
   │      
   │      
   │      
 ──┴──────
`
  },
  {
    stage: 2,
    art: `
   ┌─────┐
   │     │
   │     ●
   │     │
   │     │
   │      
   │      
 ──┴──────
`
  },
  {
    stage: 3,
    art: `
   ┌─────┐
   │     │
   │     ●
   │    ╱│
   │     │
   │      
   │      
 ──┴──────
`
  },
  {
    stage: 4,
    art: `
   ┌─────┐
   │     │
   │     ●
   │    ╱│╲
   │     │
   │      
   │      
 ──┴──────
`
  },
  {
    stage: 5,
    art: `
   ┌─────┐
   │     │
   │     ●
   │    ╱│╲
   │     │
   │    ╱ 
   │      
 ──┴──────
`
  },
  {
    stage: 6,
    art: `
   ┌─────┐
   │     │
   │     ●
   │    ╱│╲
   │     │
   │    ╱ ╲
   │      
 ──┴──────
`
  }
]

/**
 * Get hangman art for a specific stage
 */
export function getHangmanArt(stage: number): HangmanArt {
  // Ensure stage is within valid range
  const validStage = Math.max(0, Math.min(6, stage))
  return HANGMAN_STAGES[validStage]
}

/**
 * Get hangman art based on incorrect guesses count
 */
export function getHangmanArtByGuesses(incorrectGuesses: number): HangmanArt {
  return getHangmanArt(incorrectGuesses)
}