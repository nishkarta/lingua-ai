import { UserStats, VocabularyWord, CEFRLevel } from '@/types';
import { auth, db, isFirebaseConfigured } from './firebase';
import {
  onAuthStateChanged,
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

export interface AuthUserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isAnonymous?: boolean;
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
  targetLevel: 'C1',
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
  lastScores: {
    reading: { score: '80%', title: 'The Global Journey of Coffee', date: '2026-10-02' },
    writing: { score: 'Band 6.5', title: 'Technology and Human Connection', date: '2026-10-01' },
    listening: { score: '85%', title: 'Artisan Bakery Consultation', date: '2026-10-03' },
    speaking: { score: '78%', title: '/θ/ vs /ð/ Dental Fricatives', date: '2026-10-02' },
  },
  exerciseScores: {
    'pass-b1-coffee': { score: '80%', date: '2026-10-02' },
    'wp-ielts-1': { score: 'Band 6.5', date: '2026-10-01' },
    'listen-1': { score: '85%', date: '2026-10-03' },
    'pron-1': { score: '78%', date: '2026-10-02' },
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
// IN-MEMORY REACTIVE STATE (BACKED BY FIREBASE FIRESTORE)
// -------------------------------------------------------------
let memoryUser: AuthUserProfile | null = null;
let memoryStats: UserStats = { ...defaultStats };
let memoryVocab: VocabularyWord[] = [...initialVocabulary];
let memorySettings: AppSettings = { ...defaultSettings };
let memoryToken: string = '';

type StorageListener = () => void;
const storageListeners = new Set<StorageListener>();

export const subscribeToStorage = (listener: StorageListener): (() => void) => {
  storageListeners.add(listener);
  const handleFocus = () => {
    try {
      listener();
    } catch (e) {
      console.error('Focus storage listener error:', e);
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', handleFocus);
  }
  return () => {
    storageListeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', handleFocus);
    }
  };
};

const notifyListeners = (): void => {
  storageListeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Storage listener execution error:', e);
    }
  });
};

export const notifyStorageListeners = (): void => {
  notifyListeners();
};

// -------------------------------------------------------------
// FIRESTORE SYNC & AUTH LIFECYCLE
// -------------------------------------------------------------
let unsubscribeFirestoreDoc: (() => void) | null = null;
let isStorageInitialized = false;

export const initFirebaseStorage = (): void => {
  if (typeof window === 'undefined' || isStorageInitialized) return;
  isStorageInitialized = true;

  const firebaseAuth = auth;
  const firestore = db;
  if (!firebaseAuth || !firestore) {
    return;
  }

  onAuthStateChanged(firebaseAuth, async (fbUser) => {
    if (unsubscribeFirestoreDoc) {
      unsubscribeFirestoreDoc();
      unsubscribeFirestoreDoc = null;
    }

    if (fbUser) {
      try {
        memoryToken = await fbUser.getIdToken();
      } catch {
        memoryToken = fbUser.uid;
      }

      const profile: AuthUserProfile = {
        id: fbUser.uid,
        name:
          fbUser.displayName ||
          (fbUser.isAnonymous ? 'Guest Learner' : fbUser.email?.split('@')[0] || 'Learner'),
        email: fbUser.email || (fbUser.isAnonymous ? 'Guest' : ''),
        createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
        isAnonymous: fbUser.isAnonymous,
      };
      memoryUser = profile;

      // Subscribe in real-time to the user's Firestore document
      const userDocRef = doc(firestore, 'users', fbUser.uid);
      unsubscribeFirestoreDoc = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.stats) memoryStats = data.stats as UserStats;
            if (data.vocabulary) memoryVocab = data.vocabulary as VocabularyWord[];
            if (data.settings) memorySettings = { ...defaultSettings, ...data.settings };
            if (data.profile) memoryUser = { ...profile, ...data.profile };
          } else {
            // First time this user logs in, seed their document
            setDoc(
              userDocRef,
              {
                profile,
                stats: memoryStats,
                vocabulary: memoryVocab,
                settings: memorySettings,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            ).catch((err) => console.error('Failed to create Firestore user document:', err));
          }
          notifyListeners();
        },
        (err) => {
          console.warn('Firestore real-time subscription error:', err);
        }
      );
    } else {
      // User is logged out
      memoryUser = null;
      memoryToken = '';
      memoryStats = { ...defaultStats };
      memoryVocab = [...initialVocabulary];
      memorySettings = { ...defaultSettings };
      notifyListeners();

      // Automatically sign in anonymously so even guests have their data persisted to Cloud Firestore
      if (isFirebaseConfigured && firebaseAuth) {
        signInAnonymously(firebaseAuth).catch((err) => {
          console.warn('Anonymous sign-in skipped:', err);
        });
      }
    }
  });
};

// Asynchronously persist changes directly to Firebase Cloud Firestore
const syncToFirestore = async (data: {
  stats?: UserStats;
  vocabulary?: VocabularyWord[];
  settings?: AppSettings;
  profile?: Partial<AuthUserProfile>;
}): Promise<void> => {
  const firestore = db;
  const currentAuth = auth;
  if (!firestore || !currentAuth?.currentUser) return;
  try {
    const userDocRef = doc(firestore, 'users', currentAuth.currentUser.uid);
    await setDoc(
      userDocRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to sync user data to Cloud Firestore:', error);
  }
};

// -------------------------------------------------------------
// AUTH CREDENTIAL & PROFILE HELPERS
// -------------------------------------------------------------
export const getAuthToken = (): string => {
  return memoryToken;
};

export const setAuthToken = (token: string): void => {
  memoryToken = token;
};

export const getCurrentUser = (): AuthUserProfile | null => {
  return memoryUser;
};

export const setCurrentUser = (user: AuthUserProfile | null): void => {
  memoryUser = user;
  notifyListeners();
  if (user && db && auth?.currentUser) {
    syncToFirestore({ profile: user });
  }
};

export const logoutLocalUser = async (): Promise<void> => {
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut warning:', e);
    }
  }
  memoryUser = null;
  memoryToken = '';
  memoryStats = { ...defaultStats };
  memoryVocab = [...initialVocabulary];
  memorySettings = { ...defaultSettings };
  notifyListeners();
};

export const syncProgressToServer = async (): Promise<void> => {
  await syncToFirestore({
    stats: memoryStats,
    vocabulary: memoryVocab,
    settings: memorySettings,
  });
};

// -------------------------------------------------------------
// STATS & PROGRESS
// -------------------------------------------------------------
export const getStoredStats = (): UserStats => {
  return memoryStats;
};

export const saveStoredStats = (stats: UserStats): void => {
  memoryStats = stats;
  notifyListeners();
  syncToFirestore({ stats });
};

export const CEFR_BASELINE_SCORES: Record<CEFRLevel, UserStats['skillScores']> = {
  A1: { reading: 25, writing: 20, listening: 30, speaking: 25 },
  A2: { reading: 42, writing: 38, listening: 45, speaking: 40 },
  B1: { reading: 58, writing: 54, listening: 62, speaking: 55 },
  B2: { reading: 72, writing: 68, listening: 75, speaking: 70 },
  C1: { reading: 84, writing: 80, listening: 86, speaking: 82 },
  C2: { reading: 94, writing: 91, listening: 95, speaking: 92 },
};

export const setUserLevel = (
  level: CEFRLevel,
  targetLevel?: CEFRLevel,
  calibrateBaseline: boolean = true
): UserStats => {
  const current = getStoredStats();
  const updatedScores = calibrateBaseline
    ? { ...CEFR_BASELINE_SCORES[level] }
    : { ...current.skillScores };

  const resolvedTarget = targetLevel || current.targetLevel || 'C1';

  const updated: UserStats = {
    ...current,
    level,
    targetLevel: resolvedTarget,
    skillScores: updatedScores,
  };

  saveStoredStats(updated);
  return updated;
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
  const avg =
    (updatedScores.reading + updatedScores.writing + updatedScores.listening + updatedScores.speaking) / 4;
  let calculatedLevel: CEFRLevel = 'A1';
  if (avg >= 88) calculatedLevel = 'C2';
  else if (avg >= 78) calculatedLevel = 'C1';
  else if (avg >= 65) calculatedLevel = 'B2';
  else if (avg >= 50) calculatedLevel = 'B1';
  else if (avg >= 35) calculatedLevel = 'A2';

  // Automatically advance level if score meets or exceeds next tier, but do not demote user's chosen level
  const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = CEFR_ORDER.indexOf(current.level);
  const calculatedIndex = CEFR_ORDER.indexOf(calculatedLevel);
  const finalLevel = calculatedIndex > currentIndex ? calculatedLevel : current.level;

  const updated: UserStats = {
    ...current,
    xp: current.xp + amount,
    streak: newStreak,
    lastActiveDate: today,
    level: finalLevel,
    skillScores: updatedScores,
    completedExercises: updatedCompleted,
  };

  saveStoredStats(updated);
  return updated;
};

export const recordPracticeScore = (
  skill: keyof UserStats['skillScores'],
  exerciseId: string,
  score: number | string,
  title?: string
): UserStats => {
  const current = getStoredStats();
  const today = new Date().toISOString().split('T')[0];

  const updatedLastScores = {
    ...(current.lastScores || {}),
    [skill]: {
      score,
      title,
      date: today,
    },
  };

  const updatedExerciseScores = {
    ...(current.exerciseScores || {}),
    [exerciseId]: {
      score,
      date: today,
    },
  };

  const updated: UserStats = {
    ...current,
    lastScores: updatedLastScores,
    exerciseScores: updatedExerciseScores,
  };

  saveStoredStats(updated);
  return updated;
};

// -------------------------------------------------------------
// VOCABULARY BANK
// -------------------------------------------------------------
export const getStoredVocab = (): VocabularyWord[] => {
  return memoryVocab;
};

export const saveStoredVocab = (vocab: VocabularyWord[]): void => {
  memoryVocab = vocab;
  notifyListeners();
  syncToFirestore({ vocabulary: vocab });
};

export const addWordToVocab = (
  word: Omit<VocabularyWord, 'id' | 'dateAdded' | 'nextReviewDate' | 'interval' | 'easeFactor'>
): boolean => {
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
  return memorySettings;
};

export const saveStoredSettings = (settings: Partial<AppSettings>): AppSettings => {
  const updated = { ...memorySettings, ...settings };
  memorySettings = updated;
  notifyListeners();
  syncToFirestore({ settings: updated });
  return updated;
};
