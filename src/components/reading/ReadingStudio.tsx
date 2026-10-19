'use client';

import React, { useState, useEffect } from 'react';
import { ReadingPassage, CEFRLevel } from '@/types';
import { SAMPLE_READING_PASSAGES } from '@/lib/sampleData';
import { speakText } from '@/lib/speech';
import { addXP, addWordToVocab, getStoredSettings, recordPracticeScore, getStoredStats } from '@/lib/storage';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Volume2,
  BookmarkPlus,
  CheckCircle2,
  XCircle,
  Sparkles,
  Clock,
  Zap,
  HelpCircle,
  Plus,
  Loader2,
  Check,
} from 'lucide-react';

interface WordPopupData {
  word: string;
  definition: string;
  phonetic: string;
  partOfSpeech: string;
  example?: string;
  saved?: boolean;
}

export const ReadingStudio: React.FC = () => {
  const [passages, setPassages] = useState<ReadingPassage[]>(SAMPLE_READING_PASSAGES);
  const [activePassage, setActivePassage] = useState<ReadingPassage>(SAMPLE_READING_PASSAGES[0]);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');

  // Interactive Click-to-Define Popup State
  const [activeWordPopup, setActiveWordPopup] = useState<WordPopupData | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Reading Speed & Timer
  const [readSeconds, setReadSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [wpm, setWpm] = useState<number | null>(null);

  // Comprehension Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // AI Generator Modal State
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [generatorLevel, setGeneratorLevel] = useState<CEFRLevel>(getStoredStats().level || 'B2');
  const [showGenModal, setShowGenModal] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setReadSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Reset timer and quiz when switching passage
  const handleSelectPassage = (passage: ReadingPassage) => {
    setActivePassage(passage);
    setReadSeconds(0);
    setTimerRunning(true);
    setWpm(null);
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setActiveWordPopup(null);
  };

  const handleFinishReading = () => {
    setTimerRunning(false);
    const minutes = Math.max(0.1, readSeconds / 60);
    const calculatedWpm = Math.round(activePassage.wordCount / minutes);
    setWpm(calculatedWpm);
  };

  // Word Click Handler: Search in passage vocabulary or call lookup
  const handleWordClick = async (rawWord: string) => {
    const clean = rawWord.replace(/[^a-zA-Z-]/g, '').trim();
    if (!clean) return;

    // Check if word is already in passage's curated vocabulary
    const found = activePassage.vocabulary.find(
      (v) => v.word.toLowerCase() === clean.toLowerCase()
    );

    if (found) {
      setActiveWordPopup({
        word: found.word,
        definition: found.definition,
        phonetic: found.phonetic,
        partOfSpeech: found.partOfSpeech,
        example: `From passage: "...${clean}..."`,
      });
      return;
    }

    // Otherwise, fetch via AI lookup
    setIsLookingUp(true);
    setActiveWordPopup({
      word: clean,
      definition: 'Looking up definition...',
      phonetic: '/.../',
      partOfSpeech: '...',
    });

    try {
      const settings = getStoredSettings();
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lookup-word',
          word: clean,
          apiKey: settings.geminiApiKey,
        }),
      });
      const data = await res.json();
      setActiveWordPopup({
        word: data.word || clean,
        definition: data.definition || 'Meaning in context.',
        phonetic: data.phonetic || `/${clean.toLowerCase()}/`,
        partOfSpeech: data.partOfSpeech || 'word',
        example: data.example,
      });
    } catch {
      setActiveWordPopup({
        word: clean,
        definition: 'Click to listen to pronunciation and save to vocabulary bank.',
        phonetic: `/${clean.toLowerCase()}/`,
        partOfSpeech: 'word',
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSaveToVocab = () => {
    if (!activeWordPopup) return;
    const added = addWordToVocab({
      word: activeWordPopup.word,
      definition: activeWordPopup.definition,
      phonetic: activeWordPopup.phonetic,
      partOfSpeech: activeWordPopup.partOfSpeech,
      example: activeWordPopup.example || `Used in "${activePassage.title}"`,
      cefr: activePassage.level,
    });
    if (added) {
      setActiveWordPopup({ ...activeWordPopup, saved: true });
    }
  };

  // Submit Comprehension Quiz
  const handleSubmitQuiz = () => {
    let correct = 0;
    activePassage.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    const scorePct = Math.round((correct / activePassage.questions.length) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);

    recordPracticeScore('reading', activePassage.id, `${scorePct}%`, activePassage.title);

    if (scorePct >= 75) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      addXP(40, 'reading');
    } else {
      addXP(15, 'reading');
    }
  };

  // Generate Custom AI Passage
  const handleGenerateCustomPassage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    setIsGenerating(true);
    try {
      const settings = getStoredSettings();
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-reading',
          topic: customTopic,
          level: generatorLevel,
          apiKey: settings.geminiApiKey,
        }),
      });

      const newPassage = await res.json();
      setPassages([newPassage, ...passages]);
      handleSelectPassage(newPassage);
      setShowGenModal(false);
      setCustomTopic('');
    } catch (err) {
      console.error('Generation error', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredPassages = passages.filter((p) =>
    selectedLevel === 'ALL' ? true : p.level === selectedLevel
  );

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Reading Studio
          </h2>
          <p className="text-xs text-slate-400">
            Click any word in the text for instant definition, IPA phonetics, and speech synthesis
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* CEFR Level Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['ALL', 'B1', 'B2', 'C1'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedLevel === lvl
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* AI Generator Button */}
          <button
            onClick={() => setShowGenModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate AI Passage</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Passage List Selector */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Available Passages ({filteredPassages.length})
          </h3>
          <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
            {filteredPassages.map((p) => {
              const isSelected = activePassage.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPassage(p)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-lg shadow-indigo-950/30'
                      : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {p.level}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {p.estimatedMinutes} min read
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug line-clamp-2">
                    {p.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {p.topic} • {p.wordCount} words
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Reader Canvas & Quiz */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Reading Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                    CEFR {activePassage.level}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{activePassage.topic}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                  {activePassage.title}
                </h1>
              </div>

              {/* Reading Stats & Action */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[11px] text-slate-400">Reading Time</p>
                  <p className="text-sm font-bold text-indigo-300 font-mono">
                    {Math.floor(readSeconds / 60)}:{(readSeconds % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                {timerRunning ? (
                  <button
                    onClick={handleFinishReading}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                  >
                    Finish Reading
                  </button>
                ) : (
                  <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                    {wpm} WPM
                  </div>
                )}
              </div>
            </div>

            {/* Clickable Passage Text */}
            <div className="mt-6 text-slate-200 text-base sm:text-lg leading-relaxed font-serif space-y-4 select-text">
              {activePassage.content.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx}>
                  {paragraph.split(' ').map((word, wIdx) => {
                    return (
                      <span
                        key={wIdx}
                        onClick={() => handleWordClick(word)}
                        className="inline-block hover:text-indigo-300 hover:bg-indigo-900/40 rounded px-0.5 cursor-pointer transition-colors"
                      >
                        {word}{' '}
                      </span>
                    );
                  })}
                </p>
              ))}
            </div>

            {/* Floating / Embedded Word Definition Popup */}
            {activeWordPopup && (
              <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white capitalize">
                      {activeWordPopup.word}
                    </span>
                    <span className="text-xs font-mono text-indigo-400">
                      {activeWordPopup.phonetic}
                    </span>
                    <span className="text-[11px] text-slate-400 italic">
                      ({activeWordPopup.partOfSpeech})
                    </span>
                    <button
                      onClick={() => speakText(activeWordPopup.word)}
                      className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Pronounce word"
                    >
                      <Volume2 className="w-4 h-4 text-indigo-400" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isLookingUp ? (
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Loader2 className="w-3 h-3 animate-spin" /> Looking up definition...
                      </span>
                    ) : (
                      activeWordPopup.definition
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSaveToVocab}
                    disabled={activeWordPopup.saved}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activeWordPopup.saved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    {activeWordPopup.saved ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Saved
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5" /> Save Word
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveWordPopup(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Comprehension Quiz Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  Reading Comprehension Quiz
                </h3>
                <p className="text-xs text-slate-400">Test your retention, inference, and vocabulary grasp</p>
              </div>

              {quizScore !== null && (
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                    quizScore >= 75
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  Score: {quizScore}%
                </div>
              )}
            </div>

            <div className="space-y-6">
              {activePassage.questions.map((q, qIndex) => {
                const selectedOpt = userAnswers[q.id];
                return (
                  <div key={q.id} className="space-y-3">
                    <p className="text-sm font-semibold text-slate-200">
                      {qIndex + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((option, optIdx) => {
                        const isChosen = selectedOpt === optIdx;
                        const isCorrect = q.correctIndex === optIdx;

                        let style = 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800/60';
                        if (quizSubmitted) {
                          if (isCorrect) {
                            style = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200';
                          } else if (isChosen && !isCorrect) {
                            style = 'bg-rose-950/40 border-rose-500/50 text-rose-200';
                          }
                        } else if (isChosen) {
                          style = 'bg-indigo-950/60 border-indigo-500/60 text-white';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => setUserAnswers({ ...userAnswers, [q.id]: optIdx })}
                            className={`w-full text-left p-3 rounded-xl border text-xs leading-relaxed transition-all flex items-center justify-between ${style}`}
                          >
                            <span>{option}</span>
                            {quizSubmitted && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                            )}
                            {quizSubmitted && isChosen && !isCorrect && (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-300">Explanation: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(userAnswers).length < activePassage.questions.length}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Submit Answers & Claim XP
                </button>
              ) : (
                <button
                  onClick={() => {
                    setUserAnswers({});
                    setQuizSubmitted(false);
                    setQuizScore(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                >
                  Retake Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: AI Custom Passage Generator */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Generate Reading Passage
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter any topic and Gemini AI will construct a tailored reading passage with comprehension checks.
            </p>

            <form onSubmit={handleGenerateCustomPassage} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Article Topic or Concept
                </label>
                <input
                  type="text"
                  placeholder="e.g. Urban Farming, Space Tourism, Cognitive Biases..."
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Passage Difficulty (CEFR Level)
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setGeneratorLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        generatorLevel === lvl
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !customTopic.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Passage
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
