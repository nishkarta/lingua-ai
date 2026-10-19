'use client';

import React from 'react';
import { UserStats, CEFRLevel } from '@/types';
import {
  BookOpen,
  PenTool,
  Headphones,
  Mic,
  Flame,
  Zap,
  Award,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle,
  Sliders,
  Compass,
  Target,
} from 'lucide-react';

interface SkillDashboardProps {
  stats: UserStats;
  onNavigateTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenLevelSetup?: (initialLevel?: CEFRLevel) => void;
}

const CEFR_LEVELS: { level: CEFRLevel; title: string; minScore: number }[] = [
  { level: 'A1', title: 'Beginner', minScore: 0 },
  { level: 'A2', title: 'Elementary', minScore: 35 },
  { level: 'B1', title: 'Intermediate', minScore: 50 },
  { level: 'B2', title: 'Upper Intermediate', minScore: 65 },
  { level: 'C1', title: 'Advanced', minScore: 78 },
  { level: 'C2', title: 'Proficiency', minScore: 88 },
];

export const SkillDashboard: React.FC<SkillDashboardProps> = ({
  stats,
  onNavigateTab,
  onOpenLevelSetup,
}) => {
  const avgScore = Math.round(
    (stats.skillScores.reading +
      stats.skillScores.writing +
      stats.skillScores.listening +
      stats.skillScores.speaking) /
      4
  );

  const targetLevel = stats.targetLevel || 'C1';
  const targetLevelIndex = CEFR_LEVELS.findIndex((l) => l.level === targetLevel);
  const currentLevelOption = CEFR_LEVELS.find((l) => l.level === stats.level);
  const targetLevelOption = CEFR_LEVELS.find((l) => l.level === targetLevel);

  const currentLevelIndex = CEFR_LEVELS.findIndex((l) => l.level === stats.level);
  const nextLevel = currentLevelIndex < CEFR_LEVELS.length - 1 ? CEFR_LEVELS[currentLevelIndex + 1] : null;
  const progressToNext = nextLevel
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((avgScore - CEFR_LEVELS[currentLevelIndex].minScore) /
              (nextLevel.minScore - CEFR_LEVELS[currentLevelIndex].minScore)) *
              100
          )
        )
      )
    : 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/60 via-slate-900 to-purple-900/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              AI Intelligent Language Tutor Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, Learner!
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your current proficiency is evaluated at{' '}
              <strong className="text-indigo-300">
                {stats.level} ({currentLevelOption?.title})
              </strong>
              {stats.level !== targetLevel && (
                <>
                  {' '}working toward target goal{' '}
                  <strong className="text-amber-300">
                    {targetLevel} ({targetLevelOption?.title})
                  </strong>
                </>
              )}
              .
              {onOpenLevelSetup && (
                <button
                  type="button"
                  onClick={() => onOpenLevelSetup()}
                  className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Adjust Levels</span>
                </button>
              )}
            </p>
            <p className="text-xs text-slate-400">
              Keep your {stats.streak}-day streak going by completing your 4-skill daily session.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-initial p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Daily Streak</p>
                <p className="text-lg font-bold text-white">{stats.streak} Days</p>
              </div>
            </div>

            <div className="flex-1 md:flex-initial p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Total XP</p>
                <p className="text-lg font-bold text-white">{stats.xp} pts</p>
              </div>
            </div>
          </div>
        </div>

        {/* CEFR Level Progress Roadmap */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between text-xs mb-2.5 font-medium gap-2">
            <span className="text-slate-300 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                Current: <strong className="text-white">{stats.level}</strong>
              </span>
              <span className="text-slate-500">➔</span>
              <span className="flex items-center gap-1 text-amber-300">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                Goal: <strong className="text-amber-200">{targetLevel}</strong>
              </span>
              {nextLevel && stats.level !== targetLevel && (
                <span className="text-slate-400 hidden md:inline text-[11px]">(Next milestone: {nextLevel.level})</span>
              )}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-indigo-400 font-semibold">{progressToNext}% to {nextLevel ? nextLevel.level : 'Goal'}</span>
              {onOpenLevelSetup && (
                <button
                  type="button"
                  onClick={() => onOpenLevelSetup()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-semibold transition-all cursor-pointer"
                >
                  <Compass className="w-3 h-3 text-indigo-400" />
                  <span>Set Levels</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
          </div>

          {/* CEFR Milestones */}
          <div className="grid grid-cols-6 gap-1 mt-3">
            {CEFR_LEVELS.map((lvl, idx) => {
              const isCurrent = lvl.level === stats.level;
              const isTarget = lvl.level === targetLevel;
              const isPassed = idx < currentLevelIndex;
              const isInPath = idx > currentLevelIndex && idx < targetLevelIndex;

              return (
                <button
                  key={lvl.level}
                  type="button"
                  onClick={() => onOpenLevelSetup?.(lvl.level)}
                  title={`Click to set level (Current or Goal)`}
                  className="text-center group/lvl cursor-pointer p-1 rounded-xl hover:bg-slate-800/50 transition-all focus:outline-none"
                >
                  <div
                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold transition-transform group-hover/lvl:scale-105 ${
                      isCurrent
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50 shadow-md shadow-indigo-600/30'
                        : isTarget
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 ring-1 ring-amber-400/30'
                        : isPassed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isInPath
                        ? 'bg-slate-800/70 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-800/40 text-slate-500 group-hover/lvl:text-slate-300 group-hover/lvl:bg-slate-800'
                    }`}
                  >
                    {lvl.level}
                  </div>
                  <p className="text-[10px] text-slate-400 group-hover/lvl:text-slate-200 truncate mt-0.5 hidden sm:block">
                    {isCurrent ? 'Current' : isTarget ? '★ Goal' : lvl.title}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* The 4 Core Skills Quadrant */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Language Skill Mastery</h2>
            <p className="text-xs text-slate-400">Comprehensive breakdown across 4 competencies</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            Composite Score: {avgScore} / 100
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Reading Studio */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/90 hover:border-indigo-500/40 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                  {stats.skillScores.reading}%
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  Reading Studio
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Interactive passages with instant click-to-define vocabulary and comprehension tests.
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3">
                <span>Completed:</span>
                <span className="font-semibold text-slate-200">{stats.completedExercises.reading} articles</span>
              </div>
              {stats.lastScores?.reading && (
                <div className="flex items-center justify-between text-xs bg-slate-950/70 px-2.5 py-1.5 rounded-xl border border-blue-500/20">
                  <span className="text-slate-400 font-medium">Last Score:</span>
                  <span className="font-bold text-blue-400">{stats.lastScores.reading.score}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => onNavigateTab('reading')}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              Practice Reading <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Writing Studio */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/90 hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <PenTool className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {stats.skillScores.writing}%
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Writing Studio
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  AI essay grader with CEFR band scores, inline grammar corrections, and native rewrites.
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3">
                <span>Evaluated:</span>
                <span className="font-semibold text-slate-200">{stats.completedExercises.writing} essays</span>
              </div>
              {stats.lastScores?.writing && (
                <div className="flex items-center justify-between text-xs bg-slate-950/70 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
                  <span className="text-slate-400 font-medium">Last Score:</span>
                  <span className="font-bold text-emerald-400">{stats.lastScores.writing.score}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => onNavigateTab('writing')}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              Practice Writing <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3. Listening Lab */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/90 hover:border-purple-500/40 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                  {stats.skillScores.listening}%
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  Listening Lab
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Sentence dictation challenges and conversational dialogues with multi-accent synthesis.
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3">
                <span>Completed:</span>
                <span className="font-semibold text-slate-200">{stats.completedExercises.listening} audios</span>
              </div>
              {stats.lastScores?.listening && (
                <div className="flex items-center justify-between text-xs bg-slate-950/70 px-2.5 py-1.5 rounded-xl border border-purple-500/20">
                  <span className="text-slate-400 font-medium">Last Score:</span>
                  <span className="font-bold text-purple-400">{stats.lastScores.listening.score}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => onNavigateTab('listening')}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-purple-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              Practice Listening <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4. Speaking Coach */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800/90 hover:border-amber-500/40 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  {stats.skillScores.speaking}%
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                  Speaking Coach
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Phoneme pronunciation feedback and turn-by-turn interactive voice conversation roleplay.
                </p>
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3">
                <span>Practiced:</span>
                <span className="font-semibold text-slate-200">{stats.completedExercises.speaking} sessions</span>
              </div>
              {stats.lastScores?.speaking && (
                <div className="flex items-center justify-between text-xs bg-slate-950/70 px-2.5 py-1.5 rounded-xl border border-amber-500/20">
                  <span className="text-slate-400 font-medium">Last Score:</span>
                  <span className="font-bold text-amber-400">{stats.lastScores.speaking.score}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => onNavigateTab('speaking')}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              Practice Speaking <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Daily Routine */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Today&apos;s Recommended Path</h3>
          </div>
          <span className="text-xs text-slate-400">+100 Bonus XP upon completion</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            onClick={() => onNavigateTab('reading')}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-white">Read 1 Article</p>
                <p className="text-[11px] text-slate-400">AI & Daily Life (B2)</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <span className="text-[11px] text-indigo-400 font-bold">+25 XP</span>
              {stats.lastScores?.reading && (
                <span className="text-[10px] text-blue-300 font-semibold bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-500/30">
                  Last: {stats.lastScores.reading.score}
                </span>
              )}
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('listening')}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs font-bold text-white">3 Dictation Rounds</p>
                <p className="text-[11px] text-slate-400">Artisan Bakery Dialogue</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <span className="text-[11px] text-purple-400 font-bold">+25 XP</span>
              {stats.lastScores?.listening && (
                <span className="text-[10px] text-purple-300 font-semibold bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/30">
                  Last: {stats.lastScores.listening.score}
                </span>
              )}
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('speaking')}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs font-bold text-white">Pronunciation Drill</p>
                <p className="text-[11px] text-slate-400">/θ/ vs /ð/ Fricatives</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <span className="text-[11px] text-amber-400 font-bold">+25 XP</span>
              {stats.lastScores?.speaking && (
                <span className="text-[10px] text-amber-300 font-semibold bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                  Last: {stats.lastScores.speaking.score}
                </span>
              )}
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('writing')}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-white">Submit 1 Essay</p>
                <p className="text-[11px] text-slate-400">IELTS Task 2 Review</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
              <span className="text-[11px] text-emerald-400 font-bold">+25 XP</span>
              {stats.lastScores?.writing && (
                <span className="text-[10px] text-emerald-300 font-semibold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Last: {stats.lastScores.writing.score}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
