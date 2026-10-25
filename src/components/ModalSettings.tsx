/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Settings & QA Test Runner Modal for Maen Dam-Daman.
 */

import React, { useState } from 'react';
import { X, Volume2, VolumeX, Sliders, CheckCircle2, Play, RefreshCw, Palette, HelpCircle } from 'lucide-react';
import { RulesConfig } from '../game/rulesEngine';
import { BoardTheme } from './Board';
import { runAllQATests, TestResult } from '../game/testHarness';

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
}) => {
  const [qaResults, setQaResults] = useState<TestResult[] | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

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
            <h3 className="font-bold text-stone-100 text-base">Pengaturan & Pengujian QA</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-stone-300 text-xs sm:text-sm">
          {/* Audio & Visuals */}
          <div className="space-y-3">
            <h4 className="font-semibold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Palette size={14} />
              <span>Tema & Efek Suara</span>
            </h4>
            
            <div className="flex items-center justify-between p-3 bg-stone-950/60 rounded-xl border border-stone-800">
              <div className="flex items-center gap-2.5">
                {soundEnabled ? (
                  <Volume2 className="text-emerald-400" size={18} />
                ) : (
                  <VolumeX className="text-stone-500" size={18} />
                )}
                <div>
                  <span className="font-medium text-stone-200 block">Efek Suara Sintetis</span>
                  <span className="text-[11px] text-stone-400">Ketukan kayu, lompatan & pinalti DAM</span>
                </div>
              </div>
              <button
                onClick={onToggleSound}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  soundEnabled ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400'
                }`}
              >
                {soundEnabled ? 'Aktif' : 'Mati'}
              </button>
            </div>

            {/* Board Theme Selection */}
            <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800 space-y-2">
              <span className="font-medium text-stone-200 block text-xs">Gaya Tampilan Papan:</span>
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
                  Hijau Klasik (Foto)
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
                  Kayu Jati Nusantara
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
                  Modern Obsidian
                </button>
              </div>
            </div>
          </div>

          {/* Rules Configuration */}
          <div className="space-y-3">
            <h4 className="font-semibold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sliders size={14} />
              <span>Konfigurasi Aturan Permainan</span>
            </h4>

            {/* Multi Capture Toggle */}
            <div className="flex items-center justify-between p-3 bg-stone-950/60 rounded-xl border border-stone-800">
              <div>
                <span className="font-medium text-stone-200 block text-xs">Pemakanan Beruntun (Multi-Jump)</span>
                <span className="text-[11px] text-stone-400">Dapat melompat lagi jika ada sasaran makan tambahan</span>
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
                <span className="font-medium text-stone-200 block text-xs">Pinalti DAM ("Dam ora mangan")</span>
                <span className="text-[11px] text-stone-400">Ambil 3 bidak lawan jika lawan lalai memakan</span>
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
                <span className="font-medium text-stone-200 block text-xs">Variasi Bidak Raja (Opsional)</span>
                <span className="text-[11px] text-stone-400">Promosi saat mencapai puncak sayap paling ujung lawan</span>
              </div>
              <input
                type="checkbox"
                checked={rulesConfig.kingEnabled}
                onChange={(e) => onChangeRulesConfig({ ...rulesConfig, kingEnabled: e.target.checked })}
                className="w-4 h-4 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* QA Acceptance Test Suite */}
          <div className="p-3.5 bg-stone-950/80 rounded-xl border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-stone-200 text-xs block">Pengujian QA Otomatis (12 Kriteria GDD)</span>
                <span className="text-[11px] text-stone-400">Verifikasi aturan legal, lompatan, AI, dan graf</span>
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
                Jalankan Tes
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
              if (window.confirm('Mulai ulang papan permainan dari posisi awal?')) {
                onResetGame();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition"
          >
            <RefreshCw size={13} />
            Reset Permainan
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
