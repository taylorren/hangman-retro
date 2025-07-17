// Game constants and configuration

import type { DifficultyConfig, DifficultyLevel } from './game';

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
    cet4: {
        level: 'cet4',
        wordLength: { min: 4, max: 6 },
        categories: ['animals', 'food', 'objects'],
        description: '英语四级单词。大学毕业要求。',
        ollamaPrompt: 'Generate a single English word suitable for CET-4 level (basic university English). Choose from common vocabulary that CET-4 students would know. Return only the word, nothing else.'
    },
    cet6: {
        level: 'cet6',
        wordLength: { min: 6, max: 8 },
        categories: ['countries', 'nature', 'sports', 'general'],
        description: '英文六级单词。研究生毕业要求。',
        ollamaPrompt: 'Generate a single English word suitable for CET-6 level (intermediate university English). The word must be exactly 6-8 letters long and from categories like countries, nature, sports, or general vocabulary. Choose vocabulary that CET-6 students would encounter. Return only the word, nothing else.'
    },
    toefl: {
        level: 'toefl',
        wordLength: { min: 7, max: 10 },
        categories: ['science', 'technology', 'nature', 'general'],
        description: '托福单词。出国读书必须。',
        ollamaPrompt: 'Generate a single English word suitable for TOEFL level (advanced academic English). The word must be exactly 7-10 letters long and from categories like science, technology, nature, or academic vocabulary. Choose words that appear in TOEFL preparation materials. Return only the word, nothing else.'
    },
    gre: {
        level: 'gre',
        wordLength: { min: 8, max: 12 },
        categories: ['science', 'technology'],
        description: 'GRE单词。难度极大。国外研究生毕业。',
        ollamaPrompt: 'Generate a single English word suitable for GRE level (graduate-level vocabulary). The word must be exactly 8-12 letters long and from specialized categories like science or technology. Choose sophisticated vocabulary that would appear on the GRE exam. Return only the word, nothing else.'
    }
};

// Fallback word lists organized by difficulty and category
export const FALLBACK_WORDS = {
    cet4: {
        animals: ['cat', 'dog', 'bird', 'fish', 'bear', 'lion', 'wolf', 'deer', 'frog', 'duck'],
        food: ['apple', 'bread', 'cake', 'milk', 'rice', 'meat', 'soup', 'pizza', 'pasta', 'salad'],
        objects: ['chair', 'table', 'phone', 'book', 'clock', 'lamp', 'door', 'window', 'car', 'bike']
    },
    cet6: {
        countries: ['france', 'brazil', 'canada', 'mexico', 'poland', 'turkey', 'greece', 'norway', 'sweden', 'ireland'],
        nature: ['forest', 'mountain', 'ocean', 'desert', 'valley', 'river', 'island', 'canyon', 'meadow', 'glacier'],
        sports: ['soccer', 'tennis', 'hockey', 'boxing', 'rugby', 'cricket', 'skiing', 'surfing', 'cycling', 'baseball'],
        general: ['computer', 'kitchen', 'garden', 'library', 'hospital', 'school', 'office', 'market', 'theater', 'museum']
    },
    toefl: {
        science: ['biology', 'physics', 'chemistry', 'astronomy', 'geology', 'botany', 'zoology', 'genetics', 'ecology', 'neurology'],
        technology: ['computer', 'software', 'hardware', 'network', 'database', 'protocol', 'interface', 'framework', 'algorithm', 'programming'],
        nature: ['environment', 'ecosystem', 'biodiversity', 'conservation', 'pollution', 'renewable', 'sustainable', 'atmosphere', 'geography', 'landscape'],
        general: ['education', 'literature', 'philosophy', 'psychology', 'sociology', 'economics', 'politics', 'culture', 'society', 'community']
    },
    gre: {
        science: ['chemistry', 'astronomy', 'genetics', 'neurology', 'biochemistry', 'microbiology', 'psychology', 'anthropology', 'paleontology', 'meteorology'],
        technology: ['algorithm', 'database', 'software', 'hardware', 'protocol', 'encryption', 'interface', 'framework', 'architecture', 'programming']
    }
} as const;

export const MAX_INCORRECT_GUESSES = 6;

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');