import { UserStats, VocabularyWord, CEFRLevel } from '@/types';

const STATS_KEY = 'lingua_user_stats';
const VOCAB_KEY = 'lingua_vocab_bank';
const SETTINGS_KEY = 'lingua_app_settings';
const AUTH_TOKEN_KEY = 'lingua_auth_token';
const CURRENT_USER_KEY = 'lingua_current_user';

export interface AuthUserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AppSettings {
  geminiApiKey: string;
  voiceURI: string;
  speechRate: number; // 0.75 to 1.5
  speechPitch: number; // 0.8 to 1.2
  soundEffects: boolean;
}

export const defaultStats: UserStats = {
  xp: 320,
  streak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  level: 'B1',
  skillScores: {
    reading: 72,
    writing: 65,
    listening: 80,
    speaking: 58,
  },
  completedExercises: {
    reading: 4,
    writing: 2,
    listening: 5,
    speaking: 3,
  },
};

export const defaultSettings: AppSettings = {
  geminiApiKey: '',
  voiceURI: '',
  speechRate: 1.0,
  speechPitch: 1.0,
  soundEffects: true,
};

export const initialVocabulary: VocabularyWord[] = [
  {
    id: '1',
    word: 'resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    partOfSpeech: 'adjective',
    definition: 'Able to be happy, successful, etc. again after something difficult or bad has happened.',
    example: 'Life is harsh for all of us, but humans are extraordinarily resilient.',
    cefr: 'B2',
    dateAdded: '2026-10-01',
    nextReviewDate: '2026-10-04',
    interval: 3,
    easeFactor: 2.5,
  },
  {
    id: '2',
    word: 'articulate',
    phonetic: '/ɑːˈtɪk.jə.lət/',
    partOfSpeech: 'adjective',
    definition: 'Able to express thoughts and feelings easily and clearly in speech or writing.',
    example: 'She gave an articulate and persuasive presentation to the board.',
    cefr: 'C1',
    dateAdded: '2026-10-02',
    nextReviewDate: '2026-10-05',
    interval: 4,
    easeFactor: 2.6,
  },
  {
    id: '3',
    word: 'ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    partOfSpeech: 'adjective',
    definition: 'Present, appearing, or found everywhere at the same time.',
    example: 'Smartphones have become ubiquitous in modern society.',
    cefr: 'C2',
    dateAdded: '2026-10-03',
    nextReviewDate: '2026-10-06',
    interval: 2,
    easeFactor: 2.4,
  },
  {
    id: '4',
    word: 'pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    partOfSpeech: 'adjective',
    definition: 'Solving problems in a sensible way that suits the conditions that really exist, rather than following theoretical ideas.',
    example: 'We need a pragmatic approach to tackling climate change effectively.',
    cefr: 'B2',
    dateAdded: '2026-10-03',
    nextReviewDate: '2026-10-05',
    interval: 1,
    easeFactor: 2.5,
  },
];

// -------------------------------------------------------------
// AUTH CREDENTIAL & PROFILE HELPERS
// -------------------------------------------------------------
export const getAuthToken = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  try {
    if (!token) localStorage.removeItem(AUTH_TOKEN_KEY);
    else localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to set auth token', e);
  }
};

export const getCurrentUser = (): AuthUserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: AuthUserProfile | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (!user) localStorage.removeItem(CURRENT_USER_KEY);
    else localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to set current user', e);
  }
};

export const logoutLocalUser = async (): Promise<void> => {
  const token = getAuthToken();
  if (token) {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  setAuthToken('');
  setCurrentUser(null);
};

// Auto-sync progress to server when authenticated
export const syncProgressToServer = async (): Promise<void> => {
  const token = getAuthToken();
  if (!token) return;

  try {
    const stats = getStoredStats();
    const vocabulary = getStoredVocab();
    const settings = getStoredSettings();

    await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: 'sync',
        stats,
        vocabulary,
        settings,
      }),
    });
  } catch (e) {
    console.warn('Background sync warning:', e);
  }
};

// -------------------------------------------------------------
// STATS & PROGRESS
// -------------------------------------------------------------
export const getStoredStats = (): UserStats => {
  if (typeof window === 'undefined') return defaultStats;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats;
    return JSON.parse(raw);
  } catch {
    return defaultStats;
  }
};

export const saveStoredStats = (stats: UserStats): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    syncProgressToServer();
  } catch (e) {
    console.error('Failed to save stats', e);
  }
};

export const addXP = (amount: number, skill?: keyof UserStats['skillScores']): UserStats => {
  const current = getStoredStats();
  const today = new Date().toISOString().split('T')[0];

  let newStreak = current.streak;
  if (current.lastActiveDate !== today) {
    const lastDate = new Date(current.lastActiveDate);
    const currDate = new Date(today);
    const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  const updatedScores = { ...current.skillScores };
  const updatedCompleted = { ...current.completedExercises };

  if (skill) {
    updatedScores[skill] = Math.min(100, updatedScores[skill] + Math.ceil(amount / 15));
    updatedCompleted[skill] = (updatedCompleted[skill] || 0) + 1;
  }

  // Recalculate level based on overall average
  const avg = (updatedScores.reading + updatedScores.writing + updatedScores.listening + updatedScores.speaking) / 4;
  let newLevel: CEFRLevel = 'A1';
  if (avg >= 88) newLevel = 'C2';
  else if (avg >= 78) newLevel = 'C1';
  else if (avg >= 65) newLevel = 'B2';
  else if (avg >= 50) newLevel = 'B1';
  else if (avg >= 35) newLevel = 'A2';

  const updated: UserStats = {
    ...current,
    xp: current.xp + amount,
    streak: newStreak,
    lastActiveDate: today,
    level: newLevel,
    skillScores: updatedScores,
    completedExercises: updatedCompleted,
  };

  saveStoredStats(updated);
  return updated;
};

// -------------------------------------------------------------
// VOCABULARY BANK
// -------------------------------------------------------------
export const getStoredVocab = (): VocabularyWord[] => {
  if (typeof window === 'undefined') return initialVocabulary;
  try {
    const raw = localStorage.getItem(VOCAB_KEY);
    if (!raw) {
      localStorage.setItem(VOCAB_KEY, JSON.stringify(initialVocabulary));
      return initialVocabulary;
    }
    return JSON.parse(raw);
  } catch {
    return initialVocabulary;
  }
};

export const saveStoredVocab = (vocab: VocabularyWord[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOCAB_KEY, JSON.stringify(vocab));
    syncProgressToServer();
  } catch (e) {
    console.error('Failed to save vocabulary', e);
  }
};

export const addWordToVocab = (word: Omit<VocabularyWord, 'id' | 'dateAdded' | 'nextReviewDate' | 'interval' | 'easeFactor'>): boolean => {
  const current = getStoredVocab();
  const exists = current.some((item) => item.word.toLowerCase() === word.word.toLowerCase());
  if (exists) return false;

  const today = new Date().toISOString().split('T')[0];
  const newWord: VocabularyWord = {
    ...word,
    id: Date.now().toString(),
    dateAdded: today,
    nextReviewDate: today,
    interval: 1,
    easeFactor: 2.5,
  };

  saveStoredVocab([newWord, ...current]);
  return true;
};

// -------------------------------------------------------------
// SETTINGS
// -------------------------------------------------------------
export const getStoredSettings = (): AppSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
};

export const saveStoredSettings = (settings: Partial<AppSettings>): AppSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const current = getStoredSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    syncProgressToServer();
    return updated;
  } catch {
    return defaultSettings;
  }
};
