'use client';

import React, { useState } from 'react';
import { CEFRLevel } from '@/types';
import { setUserLevel } from '@/lib/storage';
import confetti from 'canvas-confetti';
import {
  X,
  Award,
  CheckCircle2,
  Sparkles,
  Compass,
  Sliders,
  Check,
  Target,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface LevelOption {
  level: CEFRLevel;
  title: string;
  ielts: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  activeBorder: string;
  summary: string;
  skills: string;
}

const LEVEL_OPTIONS: LevelOption[] = [
  {
    level: 'A1',
    title: 'Beginner',
    ielts: 'IELTS 0 – 2.5',
    badgeBg: 'bg-cyan-500/10',
    badgeBorder: 'border-cyan-500/30',
    badgeText: 'text-cyan-400',
    activeBorder: 'border-cyan-500 ring-2 ring-cyan-500/30',
    summary: 'Foundational expressions, simple greetings & basic introductions.',
    skills: 'Understand everyday words, simple phrases, and slow clear speech.',
  },
  {
    level: 'A2',
    title: 'Elementary',
    ielts: 'IELTS 3.0 – 3.5',
    badgeBg: 'bg-blue-500/10',
    badgeBorder: 'border-blue-500/30',
    badgeText: 'text-blue-400',
    activeBorder: 'border-blue-500 ring-2 ring-blue-500/30',
    summary: 'Daily routines, immediate environment, shopping, and family.',
    skills: 'Exchange direct information on familiar matters with simple compound sentences.',
  },
  {
    level: 'B1',
    title: 'Intermediate',
    ielts: 'IELTS 4.0 – 5.0',
    badgeBg: 'bg-indigo-500/10',
    badgeBorder: 'border-indigo-500/30',
    badgeText: 'text-indigo-400',
    activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/30',
    summary: 'Independent communication, travel, and personal interests.',
    skills: 'Describe experiences, hopes, opinions, and handle standard travel situations.',
  },
  {
    level: 'B2',
    title: 'Upper Intermediate',
    ielts: 'IELTS 5.5 – 6.5',
    badgeBg: 'bg-purple-500/10',
    badgeBorder: 'border-purple-500/30',
    badgeText: 'text-purple-400',
    activeBorder: 'border-purple-500 ring-2 ring-purple-500/30',
    summary: 'Professional workplace fluency and technical comprehension.',
    skills: 'Interact spontaneously with native speakers and compose structured essays.',
  },
  {
    level: 'C1',
    title: 'Advanced',
    ielts: 'IELTS 7.0 – 8.0',
    badgeBg: 'bg-fuchsia-500/10',
    badgeBorder: 'border-fuchsia-500/30',
    badgeText: 'text-fuchsia-400',
    activeBorder: 'border-fuchsia-500 ring-2 ring-fuchsia-500/30',
    summary: 'Demanding academic, business, and nuanced communication.',
    skills: 'Express ideas fluently, understand implicit meanings, and produce complex discourse.',
  },
  {
    level: 'C2',
    title: 'Proficiency',
    ielts: 'IELTS 8.5 – 9.0',
    badgeBg: 'bg-amber-500/10',
    badgeBorder: 'border-amber-500/30',
    badgeText: 'text-amber-400',
    activeBorder: 'border-amber-500 ring-2 ring-amber-500/30',
    summary: 'Near-native mastery and effortless precision in any context.',
    skills: 'Summarize complex arguments from multiple sources and express subtle nuances.',
  },
];

const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

interface LevelSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: CEFRLevel;
  currentTargetLevel?: CEFRLevel;
  initialSelectedLevel?: CEFRLevel;
  initialTab?: 'current' | 'target';
  onLevelSaved?: (newCurrent: CEFRLevel, newTarget: CEFRLevel) => void;
}

const LevelSetupModalDialog: React.FC<Omit<LevelSetupModalProps, 'isOpen'>> = ({
  onClose,
  currentLevel,
  currentTargetLevel,
  initialSelectedLevel,
  initialTab = 'current',
  onLevelSaved,
}) => {
  const initialCur = initialSelectedLevel || currentLevel || 'B1';
  const initialTgt = currentTargetLevel || 'C1';
  const resolvedTarget =
    CEFR_ORDER.indexOf(initialTgt) < CEFR_ORDER.indexOf(initialCur)
      ? initialCur
      : initialTgt;

  const [activeTab, setActiveTab] = useState<'current' | 'target'>(initialTab);
  const [selectedCurrent, setSelectedCurrent] = useState<CEFRLevel>(initialCur);
  const [selectedTarget, setSelectedTarget] = useState<CEFRLevel>(resolvedTarget);
  const [calibrateScores, setCalibrateScores] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSelectLevelForTab = (lvl: CEFRLevel) => {
    if (activeTab === 'current') {
      setSelectedCurrent(lvl);
      // If new current is higher than target, auto-bump target to at least current
      if (CEFR_ORDER.indexOf(lvl) > CEFR_ORDER.indexOf(selectedTarget)) {
        setSelectedTarget(lvl);
      }
    } else {
      // Selecting target
      // If target is lower than current, adjust current down or nudge
      if (CEFR_ORDER.indexOf(lvl) < CEFR_ORDER.indexOf(selectedCurrent)) {
        setSelectedCurrent(lvl);
      }
      setSelectedTarget(lvl);
    }
  };

  const handleConfirm = () => {
    setUserLevel(selectedCurrent, selectedTarget, calibrateScores);
    setIsSaved(true);

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (onLevelSaved) {
      onLevelSaved(selectedCurrent, selectedTarget);
    }

    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const currentOption = LEVEL_OPTIONS.find((opt) => opt.level === selectedCurrent) || LEVEL_OPTIONS[2];
  const targetOption = LEVEL_OPTIONS.find((opt) => opt.level === selectedTarget) || LEVEL_OPTIONS[4];

  const currentIdx = CEFR_ORDER.indexOf(selectedCurrent);
  const targetIdx = CEFR_ORDER.indexOf(selectedTarget);
  const tiersDistance = targetIdx - currentIdx;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-indigo-950/50 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  Proficiency & Learning Goal
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
                  CEFR Standard
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your starting benchmark and long-term mastery goal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Journey Road Banner */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-950 to-purple-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
              <span className="text-[10px] font-medium text-slate-300">Current:</span>
              <span className="text-xs font-black text-indigo-300">{selectedCurrent}</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">({currentOption.title})</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-medium text-slate-300">Target Goal:</span>
              <span className="text-xs font-black text-amber-300">{selectedTarget}</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">({targetOption.title})</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            {tiersDistance === 0 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Maintenance & Mastery tier
              </span>
            ) : (
              <span className="text-indigo-300 font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                {tiersDistance} {tiersDistance === 1 ? 'CEFR tier' : 'CEFR tiers'} progression path
              </span>
            )}
          </div>
        </div>

        {/* Tab Switcher: Setting Current vs Setting Target */}
        <div className="mt-3 grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'current'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. Set Current Level ({selectedCurrent})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('target')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'target'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>2. Set Target Goal ({selectedTarget})</span>
          </button>
        </div>

        {/* Description for active tab */}
        <p className="text-[11px] text-slate-400 mt-2 px-1 shrink-0">
          {activeTab === 'current'
            ? 'Choose your current capability. This calibrates your baseline practice difficulty and initial scores.'
            : 'Choose your aspiration goal. Your roadmap and progress bar will guide you toward this target.'}
        </p>

        {/* Scrollable Levels Grid */}
        <div className="overflow-y-auto py-3 space-y-3 pr-1 my-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LEVEL_OPTIONS.map((opt) => {
              const isSelectedForTab =
                activeTab === 'current'
                  ? selectedCurrent === opt.level
                  : selectedTarget === opt.level;

              const isCurrent = selectedCurrent === opt.level;
              const isTarget = selectedTarget === opt.level;

              const lvlIdx = CEFR_ORDER.indexOf(opt.level);
              const isInPath = lvlIdx >= currentIdx && lvlIdx <= targetIdx;

              return (
                <div
                  key={opt.level}
                  onClick={() => handleSelectLevelForTab(opt.level)}
                  className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelectedForTab
                      ? `${activeTab === 'current' ? opt.activeBorder : 'border-amber-500 ring-2 ring-amber-500/30'} bg-slate-800/90 shadow-lg shadow-indigo-950/40`
                      : isInPath
                      ? 'border-indigo-500/30 bg-slate-950/80 hover:border-indigo-500/50 hover:bg-slate-900/80'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div>
                    {/* Top row with badge and title */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${opt.badgeBg} ${opt.badgeBorder} ${opt.badgeText}`}
                        >
                          {opt.level}
                        </span>
                        <span className="text-sm font-bold text-white">{opt.title}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-500/40">
                            Current
                          </span>
                        )}
                        {isTarget && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-500/40 flex items-center gap-1">
                            <Target className="w-2.5 h-2.5" /> Goal
                          </span>
                        )}
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            isSelectedForTab
                              ? activeTab === 'current'
                                ? 'border-indigo-400 bg-indigo-600 text-white'
                                : 'border-amber-400 bg-amber-600 text-white'
                              : 'border-slate-700 bg-slate-900'
                          }`}
                        >
                          {isSelectedForTab && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    {/* IELTS Equivalent */}
                    <p className="text-[11px] font-medium text-slate-400 mb-2">{opt.ielts}</p>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                      {opt.summary}
                    </p>
                  </div>

                  {/* Skills summary footer */}
                  <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 leading-normal flex items-start gap-1.5">
                    <Sparkles className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{opt.skills}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Option: Baseline Calibration */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
            <input
              id="calibrate-scores-checkbox"
              type="checkbox"
              checked={calibrateScores}
              onChange={(e) => setCalibrateScores(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
            />
            <label htmlFor="calibrate-scores-checkbox" className="text-xs cursor-pointer select-none">
              <span className="font-bold text-slate-200 block">
                Calibrate 4-Skill baseline scores to Current Level ({selectedCurrent})
              </span>
              <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                Initializes Reading, Writing, Listening, and Speaking baseline scores to match {currentOption.title} ({selectedCurrent}), giving you an accurate starting ground to work towards {targetOption.title} ({selectedTarget}).
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Path: <strong className="text-indigo-300">{selectedCurrent}</strong> ➔ <strong className="text-amber-300">{selectedTarget}</strong></span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSaved}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Goals Saved!</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Save Plan ({selectedCurrent} ➔ {selectedTarget})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LevelSetupModal: React.FC<LevelSetupModalProps> = (props) => {
  if (!props.isOpen) return null;

  return (
    <LevelSetupModalDialog
      key={`${props.initialSelectedLevel ?? ''}-${props.currentLevel}-${props.currentTargetLevel ?? ''}-${props.initialTab ?? 'current'}`}
      {...props}
    />
  );
};
