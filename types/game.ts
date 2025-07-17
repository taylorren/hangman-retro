// Core game types and interfaces

export type DifficultyLevel = 'cet4' | 'cet6' | 'toefl' | 'gre';

export type WordCategory = 
  | 'animals' 
  | 'food' 
  | 'countries' 
  | 'objects' 
  | 'science' 
  | 'technology' 
  | 'nature' 
  | 'sports' 
  | 'general';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface DifficultyConfig {
  level: DifficultyLevel;
  wordLength: {
    min: number;
    max: number;
  };
  categories: WordCategory[];
  description: string;
  ollamaPrompt: string;
}

export interface GameState {
  currentWord: string;
  guessedLetters: string[];
  correctGuesses: string[];
  incorrectGuesses: number;
  gameStatus: GameStatus;
  maxIncorrectGuesses: number; // Always 6 for classic hangman
  difficulty: DifficultyLevel;
}

export interface HangmanArt {
  stage: number; // 0-6
  art: string; // ASCII art representation
}

export interface OllamaResponse {
  response: string;
  done: boolean;
  error?: string;
}

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream: boolean;
}