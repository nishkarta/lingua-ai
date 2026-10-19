'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { UserStats } from '@/types';
import {
  getStoredStats,
  defaultStats,
  getCurrentUser,
  logoutLocalUser,
  AuthUserProfile,
  initFirebaseStorage,
  subscribeToStorage,
  notifyStorageListeners,
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
import { LevelSetupModal } from '@/components/level/LevelSetupModal';
import { CEFRLevel } from '@/types';

const emptySubscribe = () => () => {};

export default function Home() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const stats = useSyncExternalStore(
    subscribeToStorage,
    getStoredStats,
    () => defaultStats
  );

  const user = useSyncExternalStore(
    subscribeToStorage,
    getCurrentUser,
    () => null
  );

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState<boolean>(false);
  const [initialModalLevel, setInitialModalLevel] = useState<CEFRLevel | undefined>(undefined);

  useEffect(() => {
    // Initialize Firebase Auth listener and Firestore data sync
    initFirebaseStorage();
  }, []);

  const handleUpdateStats = () => {
    notifyStorageListeners();
  };

  const handleAuthSuccess = (_authenticatedUser: AuthUserProfile) => {
    notifyStorageListeners();
  };

  const handleLogout = async () => {
    await logoutLocalUser();
  };

  const handleOpenLevelSetup = (initialLevel?: CEFRLevel) => {
    setInitialModalLevel(initialLevel);
    setIsLevelModalOpen(true);
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
        onOpenLevelSetup={() => handleOpenLevelSetup()}
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
            onOpenLevelSetup={handleOpenLevelSetup}
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
        onOpenFullLevelSetup={() => handleOpenLevelSetup()}
      />

      {/* CEFR Level Setup & Calibration Modal */}
      <LevelSetupModal
        isOpen={isLevelModalOpen}
        onClose={() => {
          setIsLevelModalOpen(false);
          handleUpdateStats();
        }}
        currentLevel={stats.level}
        currentTargetLevel={stats.targetLevel}
        initialSelectedLevel={initialModalLevel}
        onLevelSaved={(_newCurrent, _newTarget) => {
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
