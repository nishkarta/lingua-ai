'use client';

import React, { useState } from 'react';
import {
  AuthUserProfile,
  setCurrentUser,
  setAuthToken,
  getStoredStats,
  getStoredVocab,
  getStoredSettings,
  saveStoredStats,
  saveStoredVocab,
  saveStoredSettings,
  defaultStats,
  initialVocabulary,
  defaultSettings,
} from '@/lib/storage';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  X,
  User,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CloudCheck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [migrateGuestData, setMigrateGuestData] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const firebaseAuth = auth;
    const firestore = db;

    if (!isFirebaseConfigured || !firebaseAuth || !firestore) {
      setErrorMessage(
        'Firebase credentials are not configured yet. Please add your NEXT_PUBLIC_FIREBASE_* variables to .env.local to enable cloud accounts.'
      );
      setLoading(false);
      return;
    }

    try {
      let finalUser: AuthUserProfile;

      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const fbUser = userCredential.user;

        if (name.trim()) {
          await updateProfile(fbUser, { displayName: name.trim() });
        }

        finalUser = {
          id: fbUser.uid,
          name: name.trim() || fbUser.email?.split('@')[0] || 'Learner',
          email: fbUser.email || email,
          createdAt: new Date().toISOString(),
          isAnonymous: false,
        };

        const initialStats = migrateGuestData ? getStoredStats() : defaultStats;
        const initialVocab = migrateGuestData ? getStoredVocab() : initialVocabulary;
        const initialConf = migrateGuestData ? getStoredSettings() : defaultSettings;

        // Persist to Cloud Firestore
        const userDocRef = doc(firestore, 'users', fbUser.uid);
        await setDoc(userDocRef, {
          profile: finalUser,
          stats: initialStats,
          vocabulary: initialVocab,
          settings: initialConf,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        saveStoredStats(initialStats);
        saveStoredVocab(initialVocab);
        saveStoredSettings(initialConf);
      } else {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        const fbUser = userCredential.user;

        finalUser = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Learner',
          email: fbUser.email || email,
          createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
          isAnonymous: false,
        };

        // Fetch user data from Cloud Firestore
        const userDocRef = doc(firestore, 'users', fbUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if (cloudData.stats) saveStoredStats(cloudData.stats);
          if (cloudData.vocabulary) saveStoredVocab(cloudData.vocabulary);
          if (cloudData.settings) saveStoredSettings(cloudData.settings);
          if (cloudData.profile) finalUser = { ...finalUser, ...cloudData.profile };
        }
      }

      const idToken = await firebaseAuth.currentUser?.getIdToken();
      if (idToken) setAuthToken(idToken);
      setCurrentUser(finalUser);

      setSuccessNotice(true);
      setTimeout(() => {
        setSuccessNotice(false);
        onSuccess(finalUser);
        onClose();
      }, 700);
    } catch (err: unknown) {
      const fbError = err as { code?: string; message?: string };
      if (fbError.code === 'auth/email-already-in-use') {
        setErrorMessage('An account with this email address already exists.');
      } else if (fbError.code === 'auth/wrong-password' || fbError.code === 'auth/invalid-credential' || fbError.code === 'auth/user-not-found') {
        setErrorMessage('Invalid email or password. Please check your credentials.');
      } else if (fbError.code === 'auth/weak-password') {
        setErrorMessage('Password should be at least 6 characters.');
      } else if (fbError.code === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid email address.');
      } else {
        setErrorMessage(fbError.message || 'Authentication error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-indigo-950/40">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === 'signin' ? 'Welcome Back to LinguaAI' : 'Create Your Free Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signin'
              ? 'Sign in to access your saved CEFR scores, streak, and vocabulary'
              : 'Save your learning progress forever and sync across devices'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mt-4">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mode === 'signin'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                mode === 'signup'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Notice */}
        {successNotice && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Successfully authenticated! Syncing profile...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-200"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-[10px] text-slate-500">Minimum 6 characters</p>
            )}
          </div>

          {/* Migrate guest progress option */}
          {mode === 'signup' && (
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={migrateGuestData}
                onChange={(e) => setMigrateGuestData(e.target.checked)}
                className="mt-0.5 accent-indigo-500 rounded"
              />
              <span>
                <strong>Keep my current session progress</strong>
                <span className="block text-[11px] text-slate-400 mt-0.5">
                  Your current XP, streak, and saved vocabulary will be stored on your new account.
                </span>
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading || successNotice}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : mode === 'signin' ? (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Create Account <Sparkles className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
