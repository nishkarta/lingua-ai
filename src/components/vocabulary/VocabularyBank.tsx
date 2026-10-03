'use client';

import React, { useState, useEffect } from 'react';
import { VocabularyWord, CEFRLevel } from '@/types';
import {
  getStoredVocab,
  saveStoredVocab,
  addWordToVocab,
  addXP,
  getStoredSettings,
} from '@/lib/storage';
import { speakText } from '@/lib/speech';
import confetti from 'canvas-confetti';
import {
  Bookmark,
  Plus,
  Volume2,
  Search,
  Sparkles,
  Layers,
  RotateCw,
  CheckCircle2,
  Check,
  Trash2,
  Loader2,
  Calendar,
} from 'lucide-react';

export const VocabularyBank: React.FC = () => {
  const [vocabList, setVocabList] = useState<VocabularyWord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCefr, setSelectedCefr] = useState<string>('ALL');

  // SRS Flashcard Mode State
  const [srsMode, setSrsMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // New Word Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWordInput, setNewWordInput] = useState('');
  const [isAiLookingUp, setIsAiLookingUp] = useState(false);
  const [newWordData, setNewWordData] = useState<{
    word: string;
    phonetic: string;
    partOfSpeech: string;
    definition: string;
    example: string;
    cefr: CEFRLevel;
  }>({
    word: '',
    phonetic: '',
    partOfSpeech: 'noun',
    definition: '',
    example: '',
    cefr: 'B2',
  });

  useEffect(() => {
    setVocabList(getStoredVocab());
  }, []);

  const filteredVocab = vocabList.filter((item) => {
    const matchesSearch =
      item.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCefr = selectedCefr === 'ALL' || item.cefr === selectedCefr;
    return matchesSearch && matchesCefr;
  });

  // Handle AI Auto-lookup for new word
  const handleAutoLookupWord = async () => {
    if (!newWordInput.trim()) return;
    setIsAiLookingUp(true);

    try {
      const settings = getStoredSettings();
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lookup-word',
          word: newWordInput.trim(),
          apiKey: settings.geminiApiKey,
        }),
      });

      const data = await res.json();
      setNewWordData({
        word: data.word || newWordInput.trim(),
        phonetic: data.phonetic || `/${newWordInput.trim().toLowerCase()}/`,
        partOfSpeech: data.partOfSpeech || 'noun',
        definition: data.definition || '',
        example: data.example || '',
        cefr: data.cefr || 'B2',
      });
    } catch (err) {
      console.error('Word lookup failed', err);
    } finally {
      setIsAiLookingUp(false);
    }
  };

  const handleSaveNewWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordData.word.trim()) return;

    addWordToVocab({
      word: newWordData.word,
      phonetic: newWordData.phonetic,
      partOfSpeech: newWordData.partOfSpeech,
      definition: newWordData.definition,
      example: newWordData.example,
      cefr: newWordData.cefr,
    });

    setVocabList(getStoredVocab());
    setShowAddModal(false);
    setNewWordInput('');
    setNewWordData({
      word: '',
      phonetic: '',
      partOfSpeech: 'noun',
      definition: '',
      example: '',
      cefr: 'B2',
    });
  };

  const handleDeleteWord = (id: string) => {
    const updated = vocabList.filter((w) => w.id !== id);
    setVocabList(updated);
    saveStoredVocab(updated);
  };

  // SRS Rating Action: Hard (+1d), Good (+3d), Easy (+6d)
  const handleSrsRate = (quality: 'hard' | 'good' | 'easy') => {
    if (vocabList.length === 0) return;
    const card = vocabList[currentCardIndex];
    let intervalDays = 1;
    if (quality === 'hard') intervalDays = 1;
    if (quality === 'good') intervalDays = Math.round(card.interval * 2 + 1);
    if (quality === 'easy') intervalDays = Math.round(card.interval * 2.5 + 3);

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);

    const updated = [...vocabList];
    updated[currentCardIndex] = {
      ...card,
      interval: intervalDays,
      nextReviewDate: nextDate.toISOString().split('T')[0],
    };

    setVocabList(updated);
    saveStoredVocab(updated);
    addXP(10);

    if (currentCardIndex < vocabList.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      confetti({ particleCount: 80, spread: 70 });
      setSrsMode(false);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-400" />
            Personal Vocabulary Bank
          </h2>
          <p className="text-xs text-slate-400">
            Build long-term retention using Spaced Repetition (SRS) flashcards and AI definition lookups
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setSrsMode(!srsMode);
              setCurrentCardIndex(0);
              setIsFlipped(false);
            }}
            disabled={vocabList.length === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              srsMode
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {srsMode ? 'Exit Flashcards' : 'Practice Flashcards'}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Word
          </button>
        </div>
      </div>

      {/* SRS FLASHCARD INTERFACE */}
      {srsMode && vocabList.length > 0 ? (
        <div className="max-w-xl mx-auto py-8 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>
              Card {currentCardIndex + 1} of {vocabList.length}
            </span>
            <span>Spaced Repetition Active</span>
          </div>

          {/* Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[300px] p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500/40 transition-all select-none relative"
          >
            <span className="absolute top-4 right-4 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              {vocabList[currentCardIndex].cefr}
            </span>

            {!isFlipped ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Tap card to reveal definition
                </p>
                <h3 className="text-3xl font-extrabold text-white">
                  {vocabList[currentCardIndex].word}
                </h3>
                <p className="text-sm font-mono text-indigo-400">
                  {vocabList[currentCardIndex].phonetic}
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-2xl font-bold text-white">
                    {vocabList[currentCardIndex].word}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(vocabList[currentCardIndex].word);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <Volume2 className="w-5 h-5 text-indigo-400" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 italic">
                  ({vocabList[currentCardIndex].partOfSpeech})
                </p>
                <p className="text-sm text-slate-200 leading-relaxed max-w-md">
                  {vocabList[currentCardIndex].definition}
                </p>
                {vocabList[currentCardIndex].example && (
                  <p className="text-xs text-indigo-300 italic max-w-md pt-2 border-t border-slate-800">
                    &ldquo;{vocabList[currentCardIndex].example}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>

          {/* SRS Evaluation Buttons */}
          {isFlipped && (
            <div className="grid grid-cols-3 gap-3 animate-in fade-in">
              <button
                onClick={() => handleSrsRate('hard')}
                className="py-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 text-xs font-bold transition-all"
              >
                Hard (+1 Day)
              </button>
              <button
                onClick={() => handleSrsRate('good')}
                className="py-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/50 text-xs font-bold transition-all"
              >
                Good (+3 Days)
              </button>
              <button
                onClick={() => handleSrsRate('easy')}
                className="py-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50 text-xs font-bold transition-all"
              >
                Easy (+6 Days)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* STANDARD VOCABULARY LIST VIEW */
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search vocabulary words or definitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
              {['ALL', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedCefr(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCefr === lvl
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Vocabulary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVocab.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors capitalize">
                        {item.word}
                      </span>
                      <button
                        onClick={() => speakText(item.word)}
                        className="p-1 rounded text-slate-400 hover:text-white"
                        title="Pronounce Word"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      </button>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {item.cefr}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>{item.phonetic}</span>
                    <span>•</span>
                    <span className="italic">{item.partOfSpeech}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.definition}
                  </p>

                  {item.example && (
                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/80">
                      &ldquo;{item.example}&rdquo;
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Review: {item.nextReviewDate}
                  </span>
                  <button
                    onClick={() => handleDeleteWord(item.id)}
                    className="p-1 rounded hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Remove from bank"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredVocab.length === 0 && (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-2">
              <p className="text-sm font-semibold text-slate-300">No words found in this category.</p>
              <p className="text-xs text-slate-400">Click &apos;Add Word&apos; to look up and store new vocabulary terms.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Word with AI Lookup */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Add Vocabulary Word
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Type an English word and let Gemini AI auto-populate its IPA transcription, CEFR level, definition, and example.
            </p>

            {/* Quick Auto-Lookup Bar */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Enter word (e.g. serendipity, ephemeral)..."
                value={newWordInput}
                onChange={(e) => setNewWordInput(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAutoLookupWord}
                disabled={isAiLookingUp || !newWordInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
              >
                {isAiLookingUp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Auto-Fill
              </button>
            </div>

            <form onSubmit={handleSaveNewWord} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Word
                  </label>
                  <input
                    type="text"
                    value={newWordData.word}
                    onChange={(e) => setNewWordData({ ...newWordData, word: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    IPA Phonetic
                  </label>
                  <input
                    type="text"
                    value={newWordData.phonetic}
                    onChange={(e) => setNewWordData({ ...newWordData, phonetic: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Part of Speech
                  </label>
                  <input
                    type="text"
                    value={newWordData.partOfSpeech}
                    onChange={(e) => setNewWordData({ ...newWordData, partOfSpeech: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    CEFR Level
                  </label>
                  <select
                    value={newWordData.cefr}
                    onChange={(e) => setNewWordData({ ...newWordData, cefr: e.target.value as CEFRLevel })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Definition
                </label>
                <textarea
                  rows={2}
                  value={newWordData.definition}
                  onChange={(e) => setNewWordData({ ...newWordData, definition: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Example Sentence
                </label>
                <input
                  type="text"
                  value={newWordData.example}
                  onChange={(e) => setNewWordData({ ...newWordData, example: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
                >
                  Save Word
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
