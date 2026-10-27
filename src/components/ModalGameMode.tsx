/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Game Mode & Difficulty Selector Modal / Bottom Sheet.
 * Adapts Chess.com mobile ergonomics for mode selection.
 */

import React from 'react';
import { Bot, Users, Globe, Crown, Sparkles, X, Check, ShieldAlert } from 'lucide-react';
import { AIDifficulty } from '../game/aiEngine';
import { Language, translations } from '../i18n';

interface ModalGameModeProps {
  isOpen: boolean;
  onClose: () => void;
  gameMode: 'ai' | 'pvp' | 'online';
  onSelectMode: (mode: 'ai' | 'pvp' | 'online') => void;
  aiDifficulty: AIDifficulty;
  onSelectDifficulty: (difficulty: AIDifficulty) => void;
  lang: Language;
  onOpenOnlineLobby: () => void;
}

export const ModalGameMode: React.FC<ModalGameModeProps> = ({
  isOpen,
  onClose,
  gameMode,
  onSelectMode,
  aiDifficulty,
  onSelectDifficulty,
  lang,
  onOpenOnlineLobby,
}) => {
  if (!isOpen) return null;

  const t = translations[lang];

  const difficultyLevels: {
    id: AIDifficulty;
    title: string;
    desc: string;
    isMaster?: boolean;
  }[] = [
    {
      id: 'easy',
      title: t.easy,
      desc: lang === 'en' ? 'Quick moves with gentle tactical play.' : 'Langkah cepat, cocok untuk pemula.',
    },
    {
      id: 'medium',
      title: t.medium,
      desc: lang === 'en' ? 'Minimax depth-3 with Alpha-Beta pruning.' : 'Minimax 3-langkah dengan pemangkasan taktis.',
    },
    {
      id: 'hard',
      title: t.hard,
      desc: lang === 'en' ? 'Positional play controlling degree-8 hubs.' : 'Strategi ketat menguasai 7 simpul sentral derajat 8.',
    },
    {
      id: 'master',
      title: `${t.master} 👑`,
      desc: lang === 'en' ? 'Grandmaster engine with Quiescence & blunder memory.' : 'Mesin Dewa: Quiescence Search & Memori Adaptif.',
      isMaster: true,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-100">
                {lang === 'en' ? 'Game Mode & Match Setup' : 'Mode & Pengaturan Pertandingan'}
              </h2>
              <p className="text-xs text-stone-400">
                {lang === 'en' ? 'Choose opponent and intelligence level' : 'Pilih lawan tanding dan tingkat kesulitan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Cards */}
        <div className="grid grid-cols-3 gap-2">
          {/* vs AI */}
          <button
            onClick={() => {
              onSelectMode('ai');
            }}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
              gameMode === 'ai'
                ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-sm'
                : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
            }`}
          >
            <Bot size={22} className={gameMode === 'ai' ? 'text-amber-400' : 'text-stone-400'} />
            <span className="font-bold text-xs mt-1.5">{t.vsAi}</span>
            <span className="text-[10px] text-stone-500 mt-0.5">{t[aiDifficulty]}</span>
          </button>

          {/* 2 Players Local */}
          <button
            onClick={() => {
              onSelectMode('pvp');
            }}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
              gameMode === 'pvp'
                ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-sm'
                : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
            }`}
          >
            <Users size={22} className={gameMode === 'pvp' ? 'text-amber-400' : 'text-stone-400'} />
            <span className="font-bold text-xs mt-1.5">{t.pvp}</span>
            <span className="text-[10px] text-stone-500 mt-0.5">{lang === 'en' ? '1 Device' : '1 HP'}</span>
          </button>

          {/* Online Match */}
          <button
            onClick={() => {
              onClose();
              onOpenOnlineLobby();
            }}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
              gameMode === 'online'
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
            }`}
          >
            <Globe size={22} className={gameMode === 'online' ? 'text-emerald-400' : 'text-stone-400'} />
            <span className="font-bold text-xs mt-1.5">{t.online}</span>
            <span className="text-[10px] text-emerald-500/80 mt-0.5 font-medium">DAM-XXXX</span>
          </button>
        </div>

        {/* AI Difficulty Options (Show when mode is AI) */}
        {gameMode === 'ai' && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              {lang === 'en' ? 'AI Difficulty Level' : 'Tingkat Kecerdasan AI'}
            </h3>
            <div className="space-y-1.5">
              {difficultyLevels.map((lvl) => {
                const isSelected = aiDifficulty === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => onSelectDifficulty(lvl.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? lvl.isMaster
                          ? 'bg-gradient-to-r from-amber-950/50 via-stone-900 to-amber-900/40 border-amber-500 text-amber-200 shadow-sm'
                          : 'bg-stone-800/80 border-amber-500/70 text-amber-300'
                        : 'bg-stone-950/40 border-stone-800/70 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isSelected
                            ? lvl.isMaster
                              ? 'bg-amber-500 text-stone-950 shadow'
                              : 'bg-amber-500/30 text-amber-300'
                            : 'bg-stone-800 text-stone-500'
                        }`}
                      >
                        {lvl.isMaster ? <Crown size={15} /> : lvl.title.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-stone-100 flex items-center gap-1.5">
                          <span>{lvl.title}</span>
                          {lvl.isMaster && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                              Grandmaster
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400">{lvl.desc}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md transition active:scale-98"
          >
            {lang === 'en' ? 'Close & Resume Game' : 'Tutup & Lanjutkan Permainan'}
          </button>
        </div>
      </div>
    </div>
  );
};
