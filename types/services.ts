// Service interfaces

import type { DifficultyLevel } from './game';

export interface OllamaService {
  generateWord(difficulty: DifficultyLevel): Promise<string>;
  isAvailable(): Promise<boolean>;
  getFallbackWord(difficulty: DifficultyLevel): string;
}

export interface GameService {
  initializeGame(difficulty: DifficultyLevel): Promise<void>;
  makeGuess(letter: string): boolean;
  resetGame(): void;
  isGameOver(): boolean;
  hasWon(): boolean;
}