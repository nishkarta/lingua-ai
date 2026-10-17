'use client';

import React, { useState, useEffect } from 'react';
import { UserStats } from '@/types';
import {
  getStoredStats,
  defaultStats,
  getCurrentUser,
  logoutLocalUser,
  AuthUserProfile,
  initFirebaseStorage,
  subscribeToStorage,
} from '@/lib/storage';
import { Navbar } from '@/components/Navbar';
import { SkillDashboard } from '@/components/dashboard/SkillDashboard';
import { ReadingStudio } from '@/components/reading/ReadingStudio';
import { WritingStudio } from '@/components/writing/WritingStudio';
import { ListeningLab } from '@/components/listening/ListeningLab';
import { SpeakingCoach } from '@/components/speaking/SpeakingCoach';
import { VocabularyBank } from '@/components/vocabulary/VocabularyBank';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { AuthModal } from '@/components/auth/AuthModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [user, setUser] = useState<AuthUserProfile | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    // Initialize Firebase Auth listener and Firestore data sync
    initFirebaseStorage();

    setStats(getStoredStats());
    setUser(getCurrentUser());

    // Subscribe to live storage updates (e.g. Firestore sync, XP changes)
    const unsubscribe = subscribeToStorage(() => {
      setStats(getStoredStats());
      setUser(getCurrentUser());
    });

    const handleFocus = () => {
      setStats(getStoredStats());
      setUser(getCurrentUser());
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleUpdateStats = () => {
    setStats(getStoredStats());
  };

  const handleAuthSuccess = (authenticatedUser: AuthUserProfile) => {
    setUser(authenticatedUser);
    setStats(getStoredStats());
  };

  const handleLogout = async () => {
    await logoutLocalUser();
    setUser(null);
    setStats(getStoredStats());
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          handleUpdateStats();
        }}
        stats={stats}
        user={user}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <SkillDashboard
            stats={stats}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              handleUpdateStats();
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'reading' && <ReadingStudio />}

        {activeTab === 'writing' && <WritingStudio />}

        {activeTab === 'listening' && <ListeningLab />}

        {activeTab === 'speaking' && <SpeakingCoach />}

        {activeTab === 'vocabulary' && <VocabularyBank />}
      </main>

      {/* Auth Login / Register Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Settings & Key Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          handleUpdateStats();
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 LinguaAI — Multimodal English Learning Platform powered by Gemini AI</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>CEFR Framework (A1 - C2)</span>
            <span>•</span>
            <span>Local Database & Session Auth</span>
            <span>•</span>
            <span>Spaced Repetition SRS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
