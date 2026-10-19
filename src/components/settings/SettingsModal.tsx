'use client';

import React, { useState, useEffect } from 'react';
import {
  AppSettings,
  getStoredSettings,
  saveStoredSettings,
  getStoredStats,
  setUserLevel,
} from '@/lib/storage';
import { CEFRLevel } from '@/types';
import { getEnglishVoices, speakText } from '@/lib/speech';
import { X, Key, Volume2, Sliders, CheckCircle2, ExternalLink, Compass, Target } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: (newSettings: AppSettings) => void;
  onOpenFullLevelSetup?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved,
  onOpenFullLevelSetup,
}) => {
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [level, setLevel] = useState<CEFRLevel>(getStoredStats().level);
  const [targetLevel, setTargetLevel] = useState<CEFRLevel>(getStoredStats().targetLevel || 'C1');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getStoredSettings());
      setLevel(getStoredStats().level);
      setTargetLevel(getStoredStats().targetLevel || 'C1');
      getEnglishVoices().then((v) => setVoices(v));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated = saveStoredSettings(settings);
    setUserLevel(level, targetLevel, true);
    setSavedNotice(true);
    if (onSettingsSaved) onSettingsSaved(updated);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 900);
  };

  const handleTestSpeech = () => {
    speakText('Hello! This is how your English listening and speaking coach will sound.', {
      voiceURI: settings.voiceURI,
      rate: settings.speechRate,
      pitch: settings.speechPitch,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-indigo-950/40">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">App & AI Configuration</h2>
              <p className="text-xs text-slate-400">Personalize AI intelligence and voice synthesis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-5">
          {/* Gemini API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                Get Free Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy... (Leave blank for default / mock mode)"
                value={settings.geminiApiKey}
                onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-200"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Stored locally in your browser. If empty, the app uses your server environment variable or high-fidelity simulation engine.
            </p>
          </div>

          {/* CEFR Proficiency Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                Current Proficiency Level (CEFR)
              </label>
              {onOpenFullLevelSetup && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFullLevelSetup();
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  Level Guide & Details →
                </button>
              )}
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => {
                const isSelected = level === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Calibrates AI generated passages, essay evaluations, dictation difficulty, and speaking scenarios.
            </p>
          </div>

          {/* Target Goal Level */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              Target Goal Level (CEFR)
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((lvl) => {
                const isSelected = targetLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setTargetLevel(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400/40'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your overall aspiration goal. LinguaAI tracks your progression toward this tier.
            </p>
          </div>

          {/* Voice Accent & Model */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              Browser English Voice Accent
            </label>
            <div className="flex gap-2">
              <select
                value={settings.voiceURI}
                onChange={(e) => setSettings({ ...settings, voiceURI: e.target.value })}
                className="flex-1 px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="">Default System Voice (Auto)</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleTestSpeech}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                Test
              </button>
            </div>
          </div>

          {/* Speech Rate & Pitch Controls */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Speaking Rate</span>
                <span className="font-semibold text-indigo-400">{settings.speechRate}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.3"
                step="0.05"
                value={settings.speechRate}
                onChange={(e) => setSettings({ ...settings, speechRate: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Voice Pitch</span>
                <span className="font-semibold text-indigo-400">{settings.speechPitch}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={settings.speechPitch}
                onChange={(e) => setSettings({ ...settings, speechPitch: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-7 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={savedNotice}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            {savedNotice ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                Saved!
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
