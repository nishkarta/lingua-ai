'use client';

import React, { useState, useEffect } from 'react';
import { ListeningExercise } from '@/types';
import { SAMPLE_LISTENING_EXERCISES } from '@/lib/sampleData';
import { speakText, stopSpeech } from '@/lib/speech';
import { addXP, getStoredSettings } from '@/lib/storage';
import confetti from 'canvas-confetti';
import {
  Headphones,
  Play,
  Square,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  HelpCircle,
  Activity,
  Layers,
} from 'lucide-react';

export const ListeningLab: React.FC = () => {
  const [exercises] = useState<ListeningExercise[]>(SAMPLE_LISTENING_EXERCISES);
  const [activeExercise, setActiveExercise] = useState<ListeningExercise>(SAMPLE_LISTENING_EXERCISES[0]);
  const [activeMode, setActiveMode] = useState<'dialogue' | 'dictation'>('dictation');

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [hideTranscript, setHideTranscript] = useState<boolean>(true);

  // Dictation Mode State
  const [dictationIndex, setDictationIndex] = useState<number>(0);
  const [userTranscriptInput, setUserTranscriptInput] = useState<string>('');
  const [dictationChecked, setDictationChecked] = useState<boolean>(false);
  const [dictationResults, setDictationResults] = useState<{ word: string; correct: boolean }[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const settings = getStoredSettings();

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const handleSelectExercise = (ex: ListeningExercise) => {
    stopSpeech();
    setIsPlaying(false);
    setCurrentLineIndex(-1);
    setActiveExercise(ex);
    setDictationIndex(0);
    setUserTranscriptInput('');
    setDictationChecked(false);
    setDictationResults([]);
    setShowHint(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  // Play entire dialogue sequentially line by line
  const handlePlayDialogue = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      setCurrentLineIndex(-1);
      return;
    }

    setIsPlaying(true);
    let index = 0;

    const playNext = () => {
      if (index >= activeExercise.dialogue.length) {
        setIsPlaying(false);
        setCurrentLineIndex(-1);
        return;
      }

      setCurrentLineIndex(index);
      const line = activeExercise.dialogue[index];
      const speechTextStr = `${line.text}`;

      speakText(speechTextStr, {
        voiceURI: settings.voiceURI,
        rate: playbackSpeed,
        pitch: line.speaker.includes('Customer') || line.speaker.includes('Marcus') ? 0.95 : 1.05,
        onEnd: () => {
          index++;
          setTimeout(playNext, 400);
        },
        onError: () => {
          setIsPlaying(false);
          setCurrentLineIndex(-1);
        },
      });
    };

    playNext();
  };

  // Play single line
  const handlePlaySingleLine = (text: string, index: number) => {
    stopSpeech();
    setCurrentLineIndex(index);
    speakText(text, {
      voiceURI: settings.voiceURI,
      rate: playbackSpeed,
      onEnd: () => setCurrentLineIndex(-1),
    });
  };

  // Dictation: Play current target sentence
  const handlePlayDictationSentence = () => {
    const target = activeExercise.dictationSentences[dictationIndex]?.sentence;
    if (!target) return;

    speakText(target, {
      voiceURI: settings.voiceURI,
      rate: playbackSpeed,
    });
  };

  // Check user dictation submission
  const handleCheckDictation = () => {
    const target = activeExercise.dictationSentences[dictationIndex]?.sentence;
    if (!target) return;

    const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const targetWords = target.split(/\s+/).filter(Boolean);
    const userWords = userTranscriptInput.trim().split(/\s+/).filter(Boolean);

    let correctCount = 0;
    const comparison = targetWords.map((tWord, idx) => {
      const uWord = userWords[idx] || '';
      const isMatch = clean(tWord) === clean(uWord);
      if (isMatch) correctCount++;
      return { word: tWord, correct: isMatch };
    });

    setDictationResults(comparison);
    setDictationChecked(true);

    const accuracy = Math.round((correctCount / targetWords.length) * 100);
    if (accuracy >= 80) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
      addXP(25, 'listening');
    } else {
      addXP(10, 'listening');
    }
  };

  const handleNextDictation = () => {
    if (dictationIndex < activeExercise.dictationSentences.length - 1) {
      setDictationIndex((prev) => prev + 1);
      setUserTranscriptInput('');
      setDictationChecked(false);
      setDictationResults([]);
      setShowHint(false);
    }
  };

  // Submit Comprehension Quiz
  const handleSubmitQuiz = () => {
    let correct = 0;
    activeExercise.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    const scorePct = Math.round((correct / activeExercise.questions.length) * 100);
    setQuizScore(scorePct);
    setQuizSubmitted(true);

    if (scorePct >= 75) {
      confetti({
        particleCount: 70,
        spread: 70,
      });
      addXP(35, 'listening');
    } else {
      addXP(15, 'listening');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Headphones className="w-5 h-5 text-purple-400" />
            Listening Lab
          </h2>
          <p className="text-xs text-slate-400">
            Train acoustic decoding, sentence dictation, and spoken comprehension with multi-speed audio
          </p>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Speed:</span>
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[0.75, 1.0, 1.25].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  playbackSpeed === spd
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Audio Tracks */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Audio Modules
          </h3>
          <div className="space-y-2">
            {exercises.map((ex) => {
              const isSelected = activeExercise.id === ex.id;
              return (
                <div
                  key={ex.id}
                  onClick={() => handleSelectExercise(ex)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500/50 shadow-lg shadow-purple-950/20'
                      : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {ex.level} • {ex.accent} Accent
                    </span>
                    <span className="text-[11px] text-slate-400">{ex.category}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{ex.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {ex.dialogue.length} dialogue turns • {ex.dictationSentences.length} dictation drills
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Player & Interactive Training */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Track Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                    {activeExercise.level}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {activeExercise.accent} Accent • {activeExercise.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-1.5">{activeExercise.title}</h3>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveMode('dictation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeMode === 'dictation'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dictation Challenge
                </button>
                <button
                  onClick={() => setActiveMode('dialogue')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeMode === 'dialogue'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dialogue & Quiz
                </button>
              </div>
            </div>

            {/* Mode 1: Dictation Challenge */}
            {activeMode === 'dictation' && (
              <div className="mt-6 space-y-6">
                <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Round {dictationIndex + 1} of {activeExercise.dictationSentences.length}
                    </span>
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                  </div>

                  {showHint && (
                    <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200">
                      💡 Hint: {activeExercise.dictationSentences[dictationIndex]?.hint}
                    </div>
                  )}

                  {/* Play Sentence Audio Button with animated soundwaves */}
                  <div className="flex items-center justify-center py-6 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                    <div className="flex flex-col items-center gap-3">
                      <button
                        onClick={handlePlayDictationSentence}
                        className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-transform active:scale-95"
                      >
                        <Volume2 className="w-7 h-7" />
                      </button>
                      <span className="text-xs font-semibold text-slate-300">
                        Click to Listen to Sentence
                      </span>
                    </div>
                  </div>

                  {/* Dictation Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Type exactly what you hear:
                    </label>
                    <input
                      type="text"
                      value={userTranscriptInput}
                      onChange={(e) => setUserTranscriptInput(e.target.value)}
                      placeholder="Start typing the spoken words here..."
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={dictationChecked}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !dictationChecked && userTranscriptInput.trim()) {
                          handleCheckDictation();
                        }
                      }}
                    />
                  </div>

                  {/* Verification Result */}
                  {dictationChecked && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 animate-in fade-in">
                      <p className="text-xs font-bold text-slate-300">Word-by-Word Evaluation:</p>
                      <div className="flex flex-wrap gap-1.5 font-mono text-sm">
                        {dictationResults.map((item, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded ${
                              item.correct
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 line-through'
                            }`}
                          >
                            {item.word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    {!dictationChecked ? (
                      <button
                        onClick={handleCheckDictation}
                        disabled={!userTranscriptInput.trim()}
                        className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Check Transcription
                      </button>
                    ) : (
                      dictationIndex < activeExercise.dictationSentences.length - 1 && (
                        <button
                          onClick={handleNextDictation}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                        >
                          Next Sentence &rarr;
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: Dialogue & Comprehension Quiz */}
            {activeMode === 'dialogue' && (
              <div className="mt-6 space-y-6">
                {/* Dialogue Controller Bar */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePlayDialogue}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                        isPlaying
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" /> Pause Audio
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" /> Play Full Dialogue
                        </>
                      )}
                    </button>

                    {/* Equalizer Soundwave Indicator */}
                    {isPlaying && (
                      <div className="flex items-end gap-1 h-5 px-2">
                        <div className="w-1 bg-purple-400 rounded-full soundwave-bar h-5" />
                        <div className="w-1 bg-purple-400 rounded-full soundwave-bar h-4" />
                        <div className="w-1 bg-purple-400 rounded-full soundwave-bar h-6" />
                        <div className="w-1 bg-purple-400 rounded-full soundwave-bar h-3" />
                        <div className="w-1 bg-purple-400 rounded-full soundwave-bar h-5" />
                      </div>
                    )}
                  </div>

                  {/* Hide Transcript Toggle */}
                  <button
                    onClick={() => setHideTranscript(!hideTranscript)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900"
                  >
                    {hideTranscript ? (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Show Transcript
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Hide Transcript (Blind Listening)
                      </>
                    )}
                  </button>
                </div>

                {/* Spoken Dialogue Turns */}
                {!hideTranscript && (
                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {activeExercise.dialogue.map((turn, tIdx) => {
                      const isCurrent = currentLineIndex === tIdx;
                      return (
                        <div
                          key={tIdx}
                          className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                            isCurrent
                              ? 'bg-purple-950/40 border-purple-500/50 shadow-md ring-1 ring-purple-500/30'
                              : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wide">
                              {turn.speaker}
                            </span>
                            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                              {turn.text}
                            </p>
                          </div>
                          <button
                            onClick={() => handlePlaySingleLine(turn.text, tIdx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
                            title="Replay this line"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Comprehension Quiz */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-purple-400" />
                      Listening Comprehension Quiz
                    </h4>
                    {quizScore !== null && (
                      <span className="text-xs font-bold text-emerald-400">Score: {quizScore}%</span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {activeExercise.questions.map((q, idx) => (
                      <div key={q.id} className="space-y-2">
                        <p className="text-xs font-semibold text-slate-200">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="grid grid-cols-1 gap-1.5">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = quizAnswers[q.id] === optIdx;
                            const isCorrect = q.correctIndex === optIdx;
                            let style = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

                            if (quizSubmitted) {
                              if (isCorrect) style = 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200';
                              else if (isChosen && !isCorrect) style = 'bg-rose-950/40 border-rose-500/50 text-rose-200';
                            } else if (isChosen) {
                              style = 'bg-purple-950/60 border-purple-500/60 text-white';
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={quizSubmitted}
                                onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: optIdx })}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs leading-relaxed transition-all flex items-center justify-between ${style}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                                {quizSubmitted && isChosen && !isCorrect && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    {!quizSubmitted ? (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length < activeExercise.questions.length}
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md"
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                          setQuizScore(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                      >
                        Retake
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
