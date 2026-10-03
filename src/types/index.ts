export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type SkillType = 'reading' | 'writing' | 'listening' | 'speaking';

export interface UserStats {
  xp: number;
  streak: number;
  lastActiveDate: string;
  level: CEFRLevel;
  skillScores: {
    reading: number;
    writing: number;
    listening: number;
    speaking: number;
  };
  completedExercises: {
    reading: number;
    writing: number;
    listening: number;
    speaking: number;
  };
}

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  cefr: CEFRLevel;
  dateAdded: string;
  nextReviewDate: string;
  interval: number; // SRS interval in days
  easeFactor: number;
}

// Reading Types
export interface ReadingPassage {
  id: string;
  title: string;
  level: CEFRLevel;
  topic: string;
  content: string;
  wordCount: number;
  estimatedMinutes: number;
  vocabulary: {
    word: string;
    definition: string;
    phonetic: string;
    partOfSpeech: string;
  }[];
  questions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

// Writing Types
export interface WritingPrompt {
  id: string;
  category: 'IELTS Task 2' | 'Business Email' | 'Daily Journal' | 'Opinion Essay' | 'Storytelling';
  title: string;
  prompt: string;
  targetWordCount: number;
  level: CEFRLevel;
}

export interface WritingCorrection {
  original: string;
  replacement: string;
  explanation: string;
  type: 'grammar' | 'spelling' | 'vocabulary' | 'style';
  offsetStart?: number;
  offsetEnd?: number;
}

export interface WritingEvaluation {
  cefrLevel: CEFRLevel;
  bandScore: number; // 0 to 9.0 (IELTS style)
  summary: string;
  scores: {
    taskResponse: { score: number; comment: string };
    coherence: { score: number; comment: string };
    lexicalResource: { score: number; comment: string };
    grammaticalAccuracy: { score: number; comment: string };
  };
  corrections: WritingCorrection[];
  polishedVersion: string;
  strengths: string[];
  improvements: string[];
}

// Listening Types
export interface ListeningExercise {
  id: string;
  title: string;
  level: CEFRLevel;
  accent: 'US' | 'UK' | 'AU';
  category: 'Conversation' | 'Short Story' | 'Lecture' | 'News';
  dialogue: {
    speaker: string;
    text: string;
  }[];
  dictationSentences: {
    sentence: string;
    hint: string;
  }[];
  questions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

// Speaking Types
export interface PronunciationChallenge {
  id: string;
  text: string;
  phoneticFocus: string;
  level: CEFRLevel;
  tips: string;
}

export interface SpeakingScenario {
  id: string;
  role: string;
  partnerRole: string;
  scenario: string;
  initialMessage: string;
  level: CEFRLevel;
  suggestedPhrases: string[];
}

export interface ConversationTurn {
  sender: 'ai' | 'user';
  text: string;
  timestamp: number;
  feedback?: {
    grammarCheck?: string;
    betterAlternative?: string;
    vocabularyTip?: string;
  };
}

export interface PronunciationResult {
  score: number;
  recognizedText: string;
  wordsAnalysis: {
    word: string;
    matched: boolean;
    confidence?: number;
  }[];
  feedback: string;
}
