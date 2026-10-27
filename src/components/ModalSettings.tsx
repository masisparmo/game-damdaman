/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Settings & QA Test Runner Modal for Maen Dam-Daman.
 * Supports bilingual (ID & EN).
 */

import React, { useState } from 'react';
import { X, Volume2, VolumeX, Sliders, CheckCircle2, Play, RefreshCw, Palette, Globe, Brain, RotateCcw } from 'lucide-react';
import { RulesConfig } from '../game/rulesEngine';
import { BoardTheme } from './Board';
import { runAllQATests, TestResult } from '../game/testHarness';
import { Language, translations } from '../i18n';
import { getAIMemoryStats, resetLocalAIMemory } from '../game/aiMemory';

interface ModalSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  rulesConfig: RulesConfig;
  onChangeRulesConfig: (newConfig: RulesConfig) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  boardTheme: BoardTheme;
  onChangeTheme: (theme: BoardTheme) => void;
  onResetGame: () => void;
  lang?: Language;
  onChangeLang?: (lang: Language) => void;
}

export const ModalSettings: React.FC<ModalSettingsProps> = ({
  isOpen,
  onClose,
  rulesConfig,
  onChangeRulesConfig,
  soundEnabled,
  onToggleSound,
  boardTheme,
  onChangeTheme,
  onResetGame,
  lang = 'id',
  onChangeLang,
}) => {
  const [qaResults, setQaResults] = useState<TestResult[] | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [, setMemoryTrigger] = useState(0);

  if (!isOpen) return null;
  const t = translations[lang];

  const handleRunQA = async () => {
    setIsTesting(true);
    const results = await runAllQATests();
    setQaResults(results);
    setIsTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-stone-100 text-base">{t.settingsTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
            aria-label={t.close}
            title={t.close}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-stone-300 text-xs sm:text-sm">
          {/* Language Selection */}
          {onChangeLang && (
            <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 uppercase tracking-wider">
                <Globe size={14} />
                <span>{t.languageHeader}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => onChangeLang('id')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition ${
                    lang === 'id'
                      ? 'border-amber-500 bg-amber-950/60 text-amber-200 font-bold'
                      : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span className="text-base">🇮🇩</span>
                  <span>Bahasa Indonesia (Default)</span>
                </button>
                <button
                  onClick={() => onChangeLang('en')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition ${
                    lang === 'en'
                      ? 'border-amber-500 bg-amber-950/60 text-amber-200 font-bold'
                      : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span className="text-base">🇬🇧</span>
                  <span>English (International)</span>
                </button>
              </div>
            </div>
          )}

          {/* Audio & Visuals */}
          <div className="space-y-3">
            <h4 className="font-semibold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Palette size={14} />
              <span>{t.audioVisualHeader}</span>
            </h4>
            
            <div className="flex items-center justify-between p-3 bg-stone-950/60 rounded-xl border border-stone-800">
              <div className="flex items-center gap-2.5">
                {soundEnabled ? (
                  <Volume2 className="text-emerald-400" size={18} />
                ) : (
                  <VolumeX className="text-stone-500" size={18} />
                )}
                <div>
                  <span className="font-medium text-stone-200 block">{t.soundEffectsTitle}</span>
                  <span className="text-[11px] text-stone-400">{t.soundEffectsDesc}</span>
                </div>
              </div>
              <button
                onClick={onToggleSound}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  soundEnabled ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400'
                }`}
              >
                {soundEnabled ? t.soundActive : t.soundInactive}
              </button>
            </div>

            {/* Board Theme Selection */}
            <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800 space-y-2">
              <span className="font-medium text-stone-200 block text-xs">{t.boardThemeLabel}</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => onChangeTheme('green')}
                  className={`p-2 rounded-lg border text-center transition ${
                    boardTheme === 'green'
                      ? 'border-emerald-500 bg-emerald-950/60 text-emerald-200 font-bold'
                      : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span className="block text-sm mb-0.5">🟩</span>
                  {lang === 'en' ? 'Emerald Velvet' : 'Hijau Beludru'}
                </button>

                <button
                  onClick={() => onChangeTheme('wood')}
                  className={`p-2 rounded-lg border text-center transition ${
                    boardTheme === 'wood'
                      ? 'border-amber-500 bg-amber-950/60 text-amber-200 font-bold'
                      : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span className="block text-sm mb-0.5">🪵</span>
                  {lang === 'en' ? 'Teak Wood' : 'Kayu Jati'}
                </button>

                <button
                  onClick={() => onChangeTheme('obsidian')}
                  className={`p-2 rounded-lg border text-center transition ${
                    boardTheme === 'obsidian'
                      ? 'border-sky-500 bg-sky-950/60 text-sky-200 font-bold'
                      : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span className="block text-sm mb-0.5">🌑</span>
                  {lang === 'en' ? 'Obsidian Slate' : 'Batu Obsidian'}
                </button>
              </div>
            </div>
          </div>

          {/* Rules Configuration */}
          <div className="space-y-3">
            <h4 className="font-semibold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sliders size={14} />
              <span>{t.rulesHeader}</span>
            </h4>

            {/* Multi Capture Toggle */}
            <div className="flex items-center justify-between p-3 bg-stone-950/60 rounded-xl border border-stone-800">
              <div>
                <span className="font-medium text-stone-200 block text-xs">{t.ruleMultiCapture}</span>
                <span className="text-[11px] text-stone-400">{t.ruleMultiCaptureDesc}</span>
              </div>
              <input
                type="checkbox"
                checked={rulesConfig.multiCapture}
                onChange={(e) => onChangeRulesConfig({ ...rulesConfig, multiCapture: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* DAM Penalty Toggle */}
            <div className="flex items-center justify-between p-3 bg-stone-950/60 rounded-xl border border-stone-800">
              <div>
                <span className="font-medium text-stone-200 block text-xs">{t.ruleDamClaim}</span>
                <span className="text-[11px] text-stone-400">{t.ruleDamClaimDesc}</span>
              </div>
              <input
                type="checkbox"
                checked={rulesConfig.damPenaltyClaim}
                onChange={(e) => onChangeRulesConfig({ ...rulesConfig, damPenaltyClaim: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* King Piece Toggle */}
            <div className="flex items-center justify-between p-3 bg-stone-950/60 rounded-xl border border-stone-800">
              <div>
                <span className="font-medium text-stone-200 block text-xs">{t.ruleKing}</span>
                <span className="text-[11px] text-stone-400">{t.ruleKingDesc}</span>
              </div>
              <input
                type="checkbox"
                checked={rulesConfig.kingEnabled}
                onChange={(e) => onChangeRulesConfig({ ...rulesConfig, kingEnabled: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Continuous AI Memory & Hive Mind */}
          <div className="p-3.5 bg-gradient-to-br from-amber-950/20 via-stone-900 to-stone-950 rounded-xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Brain size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-100 flex items-center gap-1.5">
                    <span>{t.aiMemoryTitle}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/30 text-amber-300 font-extrabold uppercase">
                      Level Dewa
                    </span>
                  </h4>
                  <p className="text-[11px] text-stone-400">{t.aiMemoryDesc}</p>
                </div>
              </div>
            </div>

            {/* Cloud Connection Badge */}
            <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-stone-950/70 border border-stone-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-stone-300 font-medium">
                  {lang === 'en' ? 'Global Collective Intelligence' : 'Kecerdasan Kolektif Global'}
                </span>
              </div>
              <span className="text-emerald-400 font-mono text-[10px]">
                {lang === 'en' ? 'Live Synchronized' : 'Tersinkronisasi Real-time'}
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-stone-950/80 rounded-lg border border-stone-800">
                <div className="text-[10px] text-stone-400">{t.matchesLearnedLabel}</div>
                <div className="font-extrabold text-sm sm:text-base text-amber-400 font-mono">
                  {getAIMemoryStats().totalGamesLearned}
                </div>
              </div>
              <div className="p-2 bg-stone-950/80 rounded-lg border border-stone-800">
                <div className="text-[10px] text-stone-400">{t.openingsLearnedLabel}</div>
                <div className="font-extrabold text-sm sm:text-base text-sky-400 font-mono">
                  {getAIMemoryStats().openingsCount}
                </div>
              </div>
              <div className="p-2 bg-stone-950/80 rounded-lg border border-stone-800">
                <div className="text-[10px] text-stone-400">{t.blundersAvoidedLabel}</div>
                <div className="font-extrabold text-sm sm:text-base text-emerald-400 font-mono">
                  {getAIMemoryStats().blundersAvoidedCount}
                </div>
              </div>
            </div>

            {/* Reset Action */}
            <div className="flex items-center justify-end pt-1 border-t border-stone-800/80">
              <button
                onClick={() => {
                  if (window.confirm(t.brainResetConfirm)) {
                    resetLocalAIMemory();
                    setMemoryTrigger((prev) => prev + 1);
                  }
                }}
                className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-rose-400 transition"
              >
                <RotateCcw size={11} />
                <span>{t.resetBrainBtn}</span>
              </button>
            </div>
          </div>

          {/* QA Acceptance Test Suite */}
          <div className="p-3.5 bg-stone-950/80 rounded-xl border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-stone-200 text-xs block">{t.qaHeader}</span>
                <span className="text-[11px] text-stone-400">
                  {lang === 'en'
                    ? 'Verify legal movement, jump captures, AI logic, and graph structure'
                    : 'Verifikasi aturan legal, lompatan, AI, dan struktur graf'}
                </span>
              </div>
              <button
                onClick={handleRunQA}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-500/30 transition disabled:opacity-50"
              >
                {isTesting ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Play size={13} />
                )}
                {isTesting ? t.runningQa : t.runQaButton}
              </button>
            </div>

            {qaResults && (
              <div className="mt-2 space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {qaResults.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-start gap-2 p-1.5 rounded text-[11px] ${
                      t.passed ? 'bg-emerald-950/40 text-emerald-300' : 'bg-rose-950/40 text-rose-300'
                    }`}
                  >
                    <CheckCircle2 size={13} className={`shrink-0 mt-0.5 ${t.passed ? 'text-emerald-400' : 'text-rose-400'}`} />
                    <div>
                      <span className="font-medium">#{t.id} {t.name}:</span>{' '}
                      <span className="opacity-90">{t.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-stone-800 bg-stone-950/60">
          <button
            onClick={() => {
              if (window.confirm(t.resetConfirm)) {
                onResetGame();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition"
          >
            <RefreshCw size={13} />
            {t.reset}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition"
          >
            {t.ok}
          </button>
        </div>
      </div>
    </div>
  );
};
