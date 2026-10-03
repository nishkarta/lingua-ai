'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  PronunciationChallenge,
  SpeakingScenario,
  ConversationTurn,
} from '@/types';
import {
  SAMPLE_PRONUNCIATION_CHALLENGES,
  SAMPLE_SPEAKING_SCENARIOS,
} from '@/lib/sampleData';
import {
  speakText,
  stopSpeech,
  createSpeechRecognizer,
  evaluatePronunciationAccuracy,
  WordComparison,
} from '@/lib/speech';
import { addXP, getStoredSettings } from '@/lib/storage';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Send,
  Zap,
  Bot,
  User,
  Lightbulb,
  Radio,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

export const SpeakingCoach: React.FC = () => {
  const [tab, setTab] = useState<'pronounce' | 'roleplay'>('roleplay');

  // Pronunciation Practice State
  const [challenges] = useState<PronunciationChallenge[]>(SAMPLE_PRONUNCIATION_CHALLENGES);
  const [activeChallenge, setActiveChallenge] = useState<PronunciationChallenge>(SAMPLE_PRONUNCIATION_CHALLENGES[0]);
  const [isRecordingPronounce, setIsRecordingPronounce] = useState(false);
  const [spokenPronounceText, setSpokenPronounceText] = useState('');
  const [pronounceResult, setPronounceResult] = useState<{
    score: number;
    words: WordComparison[];
    feedback: string;
  } | null>(null);

  // Roleplay Conversation State
  const [scenarios] = useState<SpeakingScenario[]>(SAMPLE_SPEAKING_SCENARIOS);
  const [activeScenario, setActiveScenario] = useState<SpeakingScenario>(SAMPLE_SPEAKING_SCENARIOS[0]);
  const [conversation, setConversation] = useState<ConversationTurn[]>([
    {
      sender: 'ai',
      text: SAMPLE_SPEAKING_SCENARIOS[0].initialMessage,
      timestamp: Date.now(),
    },
  ]);
  const [userSpeechDraft, setUserSpeechDraft] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Recognizer reference
  const recognizerRef = useRef<ReturnType<typeof createSpeechRecognizer> | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognizerRef.current) {
        recognizerRef.current.abort();
      }
    };
  }, []);

  const handleSelectScenario = (scen: SpeakingScenario) => {
    stopSpeech();
    setActiveScenario(scen);
    setConversation([
      {
        sender: 'ai',
        text: scen.initialMessage,
        timestamp: Date.now(),
      },
    ]);
    setUserSpeechDraft('');
    // Speak the opening line
    speakText(scen.initialMessage);
  };

  // Toggle voice recording for Pronunciation Challenge
  const handleTogglePronounceRecording = () => {
    if (isRecordingPronounce) {
      if (recognizerRef.current) recognizerRef.current.stop();
      setIsRecordingPronounce(false);
      return;
    }

    setSpokenPronounceText('');
    setPronounceResult(null);

    const recognizer = createSpeechRecognizer({
      onStart: () => setIsRecordingPronounce(true),
      onResult: (transcript) => {
        setSpokenPronounceText(transcript);
      },
      onError: (err) => {
        console.warn('Speech error', err);
        setIsRecordingPronounce(false);
      },
      onEnd: () => {
        setIsRecordingPronounce(false);
      },
    });

    recognizerRef.current = recognizer;
    recognizer.start();
  };

  // Evaluate the spoken pronunciation
  const handleEvaluatePronounce = () => {
    if (!spokenPronounceText.trim()) return;

    const evalResult = evaluatePronunciationAccuracy(
      activeChallenge.text,
      spokenPronounceText
    );
    setPronounceResult(evalResult);

    if (evalResult.score >= 80) {
      confetti({ particleCount: 70, spread: 60 });
      addXP(30, 'speaking');
    } else {
      addXP(15, 'speaking');
    }
  };

  // Toggle voice recording for Conversation Roleplay
  const handleToggleConversationMic = () => {
    if (isRecordingVoice) {
      if (recognizerRef.current) recognizerRef.current.stop();
      setIsRecordingVoice(false);
      return;
    }

    setUserSpeechDraft('');
    const recognizer = createSpeechRecognizer({
      onStart: () => setIsRecordingVoice(true),
      onResult: (transcript) => {
        setUserSpeechDraft(transcript);
      },
      onError: (err) => {
        console.warn('Conversation mic error', err);
        setIsRecordingVoice(false);
      },
      onEnd: () => {
        setIsRecordingVoice(false);
      },
    });

    recognizerRef.current = recognizer;
    recognizer.start();
  };

  // Send turn to Gemini AI
  const handleSendConversationMessage = async (messageText: string) => {
    const textToSend = messageText.trim();
    if (!textToSend || isAiThinking) return;

    // Add user turn
    const userTurn: ConversationTurn = {
      sender: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    const newHistory = [...conversation, userTurn];
    setConversation(newHistory);
    setUserSpeechDraft('');
    setIsAiThinking(true);

    try {
      const settings = getStoredSettings();
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'conversation-turn',
          scenario: activeScenario,
          history: newHistory,
          userSpeech: textToSend,
          apiKey: settings.geminiApiKey,
        }),
      });

      const data = await res.json();
      const aiTurn: ConversationTurn = {
        sender: 'ai',
        text: data.replyText,
        timestamp: Date.now(),
        feedback: data.feedback,
      };

      setConversation((prev) => [...prev, aiTurn]);

      // Speak AI response aloud!
      speakText(data.replyText, {
        voiceURI: settings.voiceURI,
        rate: settings.speechRate,
        pitch: settings.speechPitch,
      });

      addXP(20, 'speaking');
    } catch (err) {
      console.error('Conversation turn error', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-amber-400" />
            Speaking Coach & Roleplay
          </h2>
          <p className="text-xs text-slate-400">
            Interactive voice conversations, real-time grammar feedback, and phoneme accuracy drills
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTab('roleplay')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              tab === 'roleplay'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Conversation Partner
          </button>
          <button
            onClick={() => setTab('pronounce')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              tab === 'pronounce'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pronunciation Drills
          </button>
        </div>
      </div>

      {/* TAB 1: AI CONVERSATION PARTNER (ROLEPLAY) */}
      {tab === 'roleplay' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Roleplay Scenarios */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Select Roleplay Scenario
            </h3>
            <div className="space-y-2">
              {scenarios.map((scen) => {
                const isSelected = activeScenario.id === scen.id;
                return (
                  <div
                    key={scen.id}
                    onClick={() => handleSelectScenario(scen)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-950/20'
                        : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {scen.level}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Your role: {scen.role}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {scen.partnerRole}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {scen.scenario}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Chat Box & Voice Interaction */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col h-[700px]">
            {/* Chat Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{activeScenario.partnerRole}</h3>
                  <p className="text-xs text-slate-400">{activeScenario.scenario}</p>
                </div>
              </div>

              <button
                onClick={() => handleSelectScenario(activeScenario)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                title="Restart Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {conversation.map((turn, idx) => {
                const isAi = turn.sender === 'ai';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
                        isAi
                          ? 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-sm'
                          : 'bg-amber-600 text-white rounded-tr-sm shadow-md shadow-amber-600/20'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="text-[10px] uppercase font-bold opacity-75">
                          {isAi ? activeScenario.partnerRole : activeScenario.role}
                        </span>
                        {isAi && (
                          <button
                            onClick={() => speakText(turn.text)}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Replay Voice"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                        )}
                      </div>
                      <p>{turn.text}</p>
                    </div>

                    {/* AI Feedback Bubble (Grammar Tips & Native Phrasing) */}
                    {isAi && turn.feedback && (
                      <div className="mt-2 ml-2 max-w-[80%] p-3 rounded-2xl bg-slate-950/80 border border-indigo-500/30 text-xs space-y-1.5 animate-in fade-in">
                        <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px]">
                          <Lightbulb className="w-3.5 h-3.5" /> AI Coach Feedback
                        </div>
                        {turn.feedback.grammarCheck && (
                          <p className="text-amber-300">
                            <strong>Correction: </strong>
                            {turn.feedback.grammarCheck}
                          </p>
                        )}
                        {turn.feedback.betterAlternative && (
                          <p className="text-emerald-300">
                            <strong>More Natural: </strong>
                            {turn.feedback.betterAlternative}
                          </p>
                        )}
                        {turn.feedback.vocabularyTip && (
                          <p className="text-indigo-300">
                            <strong>Collocation: </strong>
                            {turn.feedback.vocabularyTip}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {isAiThinking && (
                <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold p-3 rounded-2xl bg-slate-950 border border-slate-800 w-fit">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  {activeScenario.partnerRole} is replying...
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Suggested Quick Phrases */}
            <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800 overflow-x-auto flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 shrink-0">Suggestions:</span>
              {activeScenario.suggestedPhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendConversationMessage(phrase)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 shrink-0 transition-colors"
                >
                  &ldquo;{phrase}&rdquo;
                </button>
              ))}
            </div>

            {/* Input Bar with Voice & Keyboard */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
              {/* Mic Button */}
              <button
                onClick={handleToggleConversationMic}
                className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
                  isRecordingVoice
                    ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30'
                }`}
                title={isRecordingVoice ? 'Stop Speaking' : 'Click to Speak (Microphone)'}
              >
                {isRecordingVoice ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={userSpeechDraft}
                onChange={(e) => setUserSpeechDraft(e.target.value)}
                placeholder={
                  isRecordingVoice
                    ? 'Listening to your microphone... speak naturally!'
                    : 'Type a message or press the microphone to speak...'
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendConversationMessage(userSpeechDraft);
                  }
                }}
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendConversationMessage(userSpeechDraft)}
                disabled={!userSpeechDraft.trim() || isAiThinking}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRONUNCIATION DRILLS */}
      {tab === 'pronounce' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Challenges */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Phoneme Challenges
            </h3>
            <div className="space-y-2">
              {challenges.map((ch) => {
                const isSelected = activeChallenge.id === ch.id;
                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      setActiveChallenge(ch);
                      setPronounceResult(null);
                      setSpokenPronounceText('');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-950/20'
                        : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {ch.level}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{ch.phoneticFocus}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ch.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Pronunciation Drill Canvas */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                {activeChallenge.phoneticFocus}
              </span>
              <h3 className="text-xl font-bold text-white mt-2">Target Sentence</h3>
            </div>

            {/* Target Sentence Box */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
              <p className="text-xl sm:text-2xl font-serif text-white leading-relaxed">
                &ldquo;{activeChallenge.text}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => speakText(activeChallenge.text)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  Listen to Native Speaker
                </button>
              </div>
            </div>

            {/* Mouth & Tongue Articulation Tips */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">Articulation Advice:</strong>
                {activeChallenge.tips}
              </div>
            </div>

            {/* Microphone Recording Zone */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center space-y-4">
              <button
                onClick={handleTogglePronounceRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  isRecordingPronounce
                    ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-500/30'
                    : 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-xl shadow-amber-600/30'
                }`}
              >
                {isRecordingPronounce ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              <p className="text-xs font-bold text-slate-300">
                {isRecordingPronounce
                  ? 'Recording in progress... speak the target sentence clearly!'
                  : 'Click the microphone, read the sentence aloud, then click to finish.'}
              </p>

              {spokenPronounceText && (
                <div className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">
                    Recognized Speech:
                  </span>
                  <p className="text-sm font-medium text-slate-200 mt-1">
                    &ldquo;{spokenPronounceText}&rdquo;
                  </p>
                </div>
              )}

              {spokenPronounceText && !pronounceResult && (
                <button
                  onClick={handleEvaluatePronounce}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Evaluate Pronunciation
                </button>
              )}
            </div>

            {/* Pronunciation Feedback Breakdown */}
            {pronounceResult && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-white">Acoustic & Phonetic Breakdown</h4>
                  <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs">
                    Score: {pronounceResult.score}%
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Word-by-word match:</p>
                  <div className="flex flex-wrap gap-2">
                    {pronounceResult.words.map((w, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          w.status === 'correct'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : w.status === 'near'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {w.word}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  {pronounceResult.feedback}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
