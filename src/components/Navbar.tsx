'use client';

import React, { useState } from 'react';
import { UserStats } from '@/types';
import { AuthUserProfile } from '@/lib/storage';
import {
  BookOpen,
  PenTool,
  Headphones,
  Mic,
  Bookmark,
  LayoutDashboard,
  Flame,
  Zap,
  Settings,
  Sparkles,
  User,
  LogOut,
  CloudCheck,
  Compass,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: UserStats;
  user: AuthUserProfile | null;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenLevelSetup?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  user,
  onOpenSettings,
  onOpenAuth,
  onLogout,
  onOpenLevelSetup,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reading', label: 'Reading', icon: BookOpen },
    { id: 'writing', label: 'Writing', icon: PenTool },
    { id: 'listening', label: 'Listening', icon: Headphones },
    { id: 'speaking', label: 'Speaking', icon: Mic },
    { id: 'vocabulary', label: 'Vocab Bank', icon: Bookmark },
  ];

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  Lingua<span className="text-indigo-400">AI</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {stats.level}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                AI English Mastery Lab
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Stats and User Session */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold"
              title="Current Daily Streak"
            >
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>{stats.streak}d</span>
            </div>

            {/* XP Counter */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold"
              title="Experience Points"
            >
              <Zap className="w-4 h-4 text-purple-400" />
              <span>{stats.xp} XP</span>
            </div>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-slate-800 transition-colors"
              title="Settings & Gemini API Key"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Profile / Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {getInitials(user.name)}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[90px] truncate">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-2.5 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                        <CloudCheck className="w-3 h-3" />
                        <span>Progress Saved to Cloud</span>
                      </div>
                    </div>
                    <div className="pt-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          if (onOpenLevelSetup) onOpenLevelSetup();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Proficiency: {stats.level} ➔ {stats.targetLevel || 'C1'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/60 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
