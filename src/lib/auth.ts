import crypto from 'crypto';
import { readDb, writeDb, UserRecord, SessionRecord } from './db';
import { UserStats, VocabularyWord } from '@/types';
import { AppSettings, defaultStats, defaultSettings, initialVocabulary } from './storage';

// Hash password with unique salt using native scrypt
export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Register a new user account
export function registerUser(params: {
  name: string;
  email: string;
  password: string;
  initialStats?: UserStats;
  initialVocab?: VocabularyWord[];
  initialSettings?: AppSettings;
}): { user: Omit<UserRecord, 'passwordHash' | 'salt'>; token: string } {
  const db = readDb();
  const normalizedEmail = params.email.trim().toLowerCase();

  const existing = db.users.find((u) => u.email === normalizedEmail);
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const salt = generateSalt();
  const passwordHash = hashPassword(params.password, salt);
  const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const newUser: UserRecord = {
    id: userId,
    name: params.name.trim(),
    email: normalizedEmail,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    stats: params.initialStats || defaultStats,
    vocabulary: params.initialVocab || initialVocabulary,
    settings: params.initialSettings || defaultSettings,
  };

  // Create session (valid for 30 days)
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const session: SessionRecord = {
    token,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt,
  };

  db.users.push(newUser);
  db.sessions.push(session);
  writeDb(db);

  const { passwordHash: _, salt: __, ...safeUser } = newUser;
  return { user: safeUser, token };
}

// Authenticate user login
export function authenticateUser(
  email: string,
  password: string
): { user: Omit<UserRecord, 'passwordHash' | 'salt'>; token: string } {
  const db = readDb();
  const normalizedEmail = email.trim().toLowerCase();

  const user = db.users.find((u) => u.email === normalizedEmail);
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const candidateHash = hashPassword(password, user.salt);
  if (candidateHash !== user.passwordHash) {
    throw new Error('Invalid email or password.');
  }

  // Create new session
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const session: SessionRecord = {
    token,
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt,
  };

  db.sessions.push(session);
  writeDb(db);

  const { passwordHash: _, salt: __, ...safeUser } = user;
  return { user: safeUser, token };
}

// Validate session token and retrieve user
export function getUserByToken(
  token: string
): Omit<UserRecord, 'passwordHash' | 'salt'> | null {
  if (!token) return null;
  const db = readDb();

  const session = db.sessions.find(
    (s) => s.token === token && new Date(s.expiresAt) > new Date()
  );
  if (!session) return null;

  const user = db.users.find((u) => u.id === session.userId);
  if (!user) return null;

  const { passwordHash: _, salt: __, ...safeUser } = user;
  return safeUser;
}

// Invalidate session (logout)
export function invalidateSession(token: string): void {
  const db = readDb();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  writeDb(db);
}

// Synchronize user progress to server database
export function syncUserProgress(
  token: string,
  updates: {
    stats?: UserStats;
    vocabulary?: VocabularyWord[];
    settings?: AppSettings;
  }
): boolean {
  if (!token) return false;
  const db = readDb();

  const session = db.sessions.find(
    (s) => s.token === token && new Date(s.expiresAt) > new Date()
  );
  if (!session) return false;

  const userIndex = db.users.findIndex((u) => u.id === session.userId);
  if (userIndex === -1) return false;

  if (updates.stats) {
    db.users[userIndex].stats = updates.stats;
  }
  if (updates.vocabulary) {
    db.users[userIndex].vocabulary = updates.vocabulary;
  }
  if (updates.settings) {
    db.users[userIndex].settings = updates.settings;
  }

  writeDb(db);
  return true;
}
