'use client';

import React, { useState, useEffect } from 'react';
import { WritingPrompt, WritingEvaluation } from '@/types';
import { SAMPLE_WRITING_PROMPTS } from '@/lib/sampleData';
import { addXP, getStoredSettings } from '@/lib/storage';
import confetti from 'canvas-confetti';
import {
  PenTool,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Zap,
  TrendingUp,
  ArrowRight,
  Loader2,
  Check,
  Award,
} from 'lucide-react';

export const WritingStudio: React.FC = () => {
  const [prompts] = useState<WritingPrompt[]>(SAMPLE_WRITING_PROMPTS);
  const [activePrompt, setActivePrompt] = useState<WritingPrompt>(SAMPLE_WRITING_PROMPTS[0]);

  // User input
  const [content, setContent] = useState<string>('');
  const [customPromptText, setCustomPromptText] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Exam Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(40 * 60); // 40 minutes default
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Evaluation states
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);
  const [activeTab, setActiveTab] = useState<'feedback' | 'corrections' | 'polish'>('feedback');
  const [appliedFixes, setAppliedFixes] = useState<Record<string, boolean>>({});

  // Countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = content.trim() ? words.length : 0;
  const targetWords = activePrompt.targetWordCount || 250;
  const wordProgress = Math.min(100, Math.round((wordCount / targetWords) * 100));

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectPrompt = (prompt: WritingPrompt) => {
    setActivePrompt(prompt);
    setIsCustomMode(false);
    setContent('');
    setEvaluation(null);
    setTimerActive(false);
    setTimerSeconds(40 * 60);
    setAppliedFixes({});
  };

  const handleApplyFix = (original: string, replacement: string, fixId: string) => {
    if (content.includes(original)) {
      setContent((prev) => prev.replace(original, replacement));
      setAppliedFixes((prev) => ({ ...prev, [fixId]: true }));
    }
  };

  const handleEvaluate = async () => {
    if (!content.trim() || wordCount < 30) {
      alert('Please write at least 30 words before requesting AI grading.');
      return;
    }

    setIsEvaluating(true);
    setEvaluation(null);

    try {
      const settings = getStoredSettings();
      const currentPromptText = isCustomMode ? customPromptText : activePrompt.prompt;

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate-writing',
          prompt: currentPromptText,
          submission: content,
          level: activePrompt.level,
          apiKey: settings.geminiApiKey,
        }),
      });

      const data: WritingEvaluation = await res.json();
      setEvaluation(data);

      // Rewarding celebration
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });
      addXP(50, 'writing');
    } catch (err) {
      console.error('Writing evaluation error', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PenTool className="w-5 h-5 text-emerald-400" />
            Writing Studio & Essay Grader
          </h2>
          <p className="text-xs text-slate-400">
            CEFR/IELTS Band rubric scoring, instant grammar correction, and native fluency enhancement
          </p>
        </div>

        {/* Timer Control */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className={timerSeconds < 300 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
              {formatTimer(timerSeconds)}
            </span>
          </div>
          <button
            onClick={() => setTimerActive(!timerActive)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            {timerActive ? 'Pause' : 'Start Timer'}
          </button>
          <button
            onClick={() => {
              setTimerActive(false);
              setTimerSeconds(40 * 60);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Reset Timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Prompt Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Select Writing Prompt
            </h3>
            <button
              onClick={() => setIsCustomMode(!isCustomMode)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              {isCustomMode ? 'Use Presets' : 'Custom Prompt'}
            </button>
          </div>

          {!isCustomMode ? (
            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {prompts.map((p) => {
                const isSelected = activePrompt.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPrompt(p)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                        : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {p.category}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {p.targetWordCount} words
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{p.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.prompt}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-300 block">
                Type Your Own Prompt / Essay Question
              </label>
              <textarea
                rows={4}
                value={customPromptText}
                onChange={(e) => setCustomPromptText(e.target.value)}
                placeholder="Enter assignment or test topic here..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Right Column: Writing Canvas & Evaluation Panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Prompt Details */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-emerald-400">
                {isCustomMode ? 'Custom Prompt' : activePrompt.category}
              </span>
              <span className="text-xs text-slate-400">
                Recommended: {targetWords} words
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              {isCustomMode ? 'Custom Assignment' : activePrompt.title}
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
              {isCustomMode ? customPromptText || 'Write your custom topic in the sidebar.' : activePrompt.prompt}
            </p>
          </div>

          {/* Editor Workspace */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">
                  Word Count:{' '}
                  <strong
                    className={`font-mono text-sm ${
                      wordCount >= targetWords ? 'text-emerald-400' : 'text-white'
                    }`}
                  >
                    {wordCount}
                  </strong>{' '}
                  / {targetWords}
                </span>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-2">
                <div className="w-28 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${wordProgress}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400">{wordProgress}%</span>
              </div>
            </div>

            {/* Text Area */}
            <textarea
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Begin drafting your essay or response here. Use clear topic sentences, well-developed supporting arguments, and appropriate academic linking words..."
              className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-100 text-sm leading-relaxed placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y font-sans"
            />

            {/* Submit for AI Grading */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-slate-400">
                Evaluated against CEFR criteria & IELTS descriptors.
              </p>
              <button
                onClick={handleEvaluate}
                disabled={isEvaluating || wordCount < 30}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI Analyzing Writing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Grade with AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Evaluation Report */}
          {evaluation && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-3">
              {/* Header Score Overview */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Award className="w-5 h-5" />
                    </span>
                    <h3 className="text-xl font-bold text-white">AI Evaluation Report</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{evaluation.summary}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-[10px] uppercase font-bold text-emerald-300">Band Score</p>
                    <p className="text-2xl font-black text-emerald-400">{evaluation.bandScore}</p>
                  </div>
                  <div className="text-center px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-[10px] uppercase font-bold text-indigo-300">CEFR Level</p>
                    <p className="text-2xl font-black text-indigo-400">{evaluation.cefrLevel}</p>
                  </div>
                </div>
              </div>

              {/* 4 Rubric Scoring Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-300">Task Response</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {evaluation.scores.taskResponse.score}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {evaluation.scores.taskResponse.comment}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-300">Coherence</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {evaluation.scores.coherence.score}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {evaluation.scores.coherence.comment}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-300">Lexical Range</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {evaluation.scores.lexicalResource.score}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {evaluation.scores.lexicalResource.comment}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-300">Grammar</span>
                    <span className="text-xs font-bold text-emerald-400">
                      {evaluation.scores.grammaticalAccuracy.score}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {evaluation.scores.grammaticalAccuracy.comment}
                  </p>
                </div>
              </div>

              {/* Sub-tabs for Detailed Analysis */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'feedback'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Insights & Guidance
                </button>
                <button
                  onClick={() => setActiveTab('corrections')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    activeTab === 'corrections'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Inline Corrections
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px]">
                    {evaluation.corrections.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('polish')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'polish'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Native Polish Version
                </button>
              </div>

              {/* Tab 1: Feedback */}
              {activeTab === 'feedback' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Key Strengths
                    </h4>
                    <ul className="space-y-1.5">
                      {evaluation.strengths.map((str, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="text-emerald-400">•</span>
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      Actionable Improvements
                    </h4>
                    <ul className="space-y-1.5">
                      {evaluation.improvements.map((imp, idx) => (
                        <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                          <span className="text-amber-400">•</span>
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 2: Corrections */}
              {activeTab === 'corrections' && (
                <div className="space-y-3">
                  {evaluation.corrections.length === 0 ? (
                    <p className="text-xs text-slate-400">No grammatical or spelling errors detected! Excellent accuracy.</p>
                  ) : (
                    evaluation.corrections.map((corr, idx) => {
                      const fixKey = `fix-${idx}`;
                      const isApplied = appliedFixes[fixKey];
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono line-through text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded">
                                {corr.original}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded">
                                {corr.replacement}
                              </span>
                              <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                                {corr.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed pt-1">
                              {corr.explanation}
                            </p>
                          </div>

                          <button
                            onClick={() => handleApplyFix(corr.original, corr.replacement, fixKey)}
                            disabled={isApplied || !content.includes(corr.original)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                              isApplied
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Applied
                              </>
                            ) : (
                              'Apply Fix to Text'
                            )}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Tab 3: Native Polish Version */}
              {activeTab === 'polish' && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Enhanced Academic / Idiomatic Phrasing
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(evaluation.polishedVersion)}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      Copy text
                    </button>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-serif whitespace-pre-line">
                    {evaluation.polishedVersion}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
