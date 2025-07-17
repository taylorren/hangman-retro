import type { HangmanArt } from './game'

/**
 * SVG-based hangman art for each stage (0-6)
 * Each stage contains SVG path data for precise rendering
 */
export interface HangmanSVGArt extends HangmanArt {
  svgPaths: string[]
  viewBox: string
}

/**
 * SVG Hangman stages with precise path definitions
 */
export const HANGMAN_SVG_STAGES: HangmanSVGArt[] = [
  {
    stage: 0,
    art: 'Empty gallows',
    svgPaths: [
      // Base
      'M 20 180 L 180 180',
      // Vertical post
      'M 50 180 L 50 20',
      // Top beam
      'M 50 20 L 130 20',
      // Noose rope
      'M 130 20 L 130 40'
    ],
    viewBox: '0 0 200 200'
  },
  {
    stage: 1,
    art: 'Head',
    svgPaths: [
      // Base
      'M 20 180 L 180 180',
      // Vertical post
      'M 50 180 L 50 20',
      // Top beam
      'M 50 20 L 130 20',
      // Noose rope
      'M 130 20 L 130 40',
      // Head (circle)
      'M 130 55 A 15 15 0 1 1 130 54'
    ],
    viewBox: '0 0 200 200'
  },
  {
    stage: 2,
    art: 'Body',
    svgPaths: [
      // Base
      'M 20 180 L 180 180',
      // Vertical post
      'M 50 180 L 50 20',
      // Top beam
      'M 50 20 L 130 20',
      // Noose rope
      'M 130 20 L 130 40',
      // Head (circle)
      'M 130 55 A 15 15 0 1 1 130 54',
      // Body
      'M 130 70 L 130 130'
    ],
    viewBox: '0 0 200 200'
  },
  {
    stage: 3,
    art: 'Left arm',
    svgPaths: [
      // Base
      'M 20 180 L 180 180',
      // Vertical post
      'M 50 180 L 50 20',
      // Top beam
      'M 50 20 L 130 20',
      // Noose rope
      'M 130 20 L 130 40',
      // Head (circle)
      'M 130 55 A 15 15 0 1 1 130 54',
      // Body
      'M 130 70 L 130 130',
      // Left arm
      'M 130 90 L 110 110'
    ],
    viewBox: '0 0 200 200'
  },
  {
    stage: 4,
    art: 'Right arm',
    svgPaths: [
      // Base
      'M 20 180 L 180 180',
      // Vertical post
      'M 50 180 L 50 20',
      // Top beam
      'M 50 20 L 130 20',
      // Noose rope
      'M 130 20 L 130 40',
      // Head (circle)
      'M 130 55 A 15 15 0 1 1 130 54',
      // Body
      'M 130 70 L 130 130',
      // Left arm
      'M 130 90 L 110 110',
      // Right arm
      'M 130 90 L 150 110'
    ],
    viewBox: '0 0 200 200'
  },
  {
    stage: 5,
    art: 'Left leg',
    svgPaths: [
      // Base
      'M 20 180 L 180 180',
      // Vertical post
      'M 50 180 L 50 20',
      // Top beam
      'M 50 20 L 130 20',
      // Noose rope
      'M 130 20 L 130 40',
      // Head (circle)
      'M 130 55 A 15 15 0 1 1 130 54',
      // Body
      'M 130 70 L 130 130',
      // Left arm
      'M 130 90 L 110 110',
      // Right arm
      'M 130 90 L 150 110',
      // Left leg
      'M 130 130 L 110 160'
    ],
    viewBox: '0 0 200 200'
  },
  {
    stage: 6,
    art: 'Right leg (game over)',
    svgPaths: [
      // Base
      'M 20 180 L 180 180',
      // Vertical post
      'M 50 180 L 50 20',
      // Top beam
      'M 50 20 L 130 20',
      // Noose rope
      'M 130 20 L 130 40',
      // Head (circle)
      'M 130 55 A 15 15 0 1 1 130 54',
      // Body
      'M 130 70 L 130 130',
      // Left arm
      'M 130 90 L 110 110',
      // Right arm
      'M 130 90 L 150 110',
      // Left leg
      'M 130 130 L 110 160',
      // Right leg
      'M 130 130 L 150 160'
    ],
    viewBox: '0 0 200 200'
  }
]

/**
 * Get SVG hangman art for a specific stage
 */
export function getHangmanSVGArt(stage: number): HangmanSVGArt {
  // Ensure stage is within valid range
  const validStage = Math.max(0, Math.min(6, stage))
  return HANGMAN_SVG_STAGES[validStage]
}

/**
 * Get SVG hangman art based on incorrect guesses count
 */
export function getHangmanSVGArtByGuesses(incorrectGuesses: number): HangmanSVGArt {
  return getHangmanSVGArt(incorrectGuesses)
}