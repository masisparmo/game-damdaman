/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Player Name Registration Modal for Maen Dam-Daman.
 * Prompts user for name after the rules guide is closed.
 * Fully user-friendly with zero technical jargon.
 */

import React, { useState, useEffect } from 'react';
import { User, Gamepad2, ArrowRight, Sparkles } from 'lucide-react';
import { Language, translations } from '../i18n';

interface ModalPlayerNameProps {
  isOpen: boolean;
  onSaveName: (p1Name: string, p2Name?: string) => void;
  gameMode: 'ai' | 'pvp' | 'online';
  currentP1Name: string;
  currentP2Name: string;
  lang?: Language;
  onChangeLang?: (newLang: Language) => void;
}

export const ModalPlayerName: React.FC<ModalPlayerNameProps> = ({
  isOpen,
  onSaveName,
  gameMode,
  currentP1Name,
  currentP2Name,
  lang = 'id',
  onChangeLang,
}) => {
  const [name, setName] = useState(currentP1Name || '');
  const [p2Name, setP2Name] = useState(currentP2Name || '');

  useEffect(() => {
    if (isOpen) {
      setName(currentP1Name || '');
      setP2Name(currentP2Name || '');
    }
  }, [isOpen, currentP1Name, currentP2Name]);

  if (!isOpen) return null;
  const t = translations[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalP1 = name.trim() || (lang === 'en' ? 'Player 1' : 'Pemain 1');
    const finalP2 = p2Name.trim() || (lang === 'en' ? 'Player 2' : 'Pemain 2');
    onSaveName(finalP1, gameMode === 'pvp' ? finalP2 : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-stone-900 border border-amber-600/50 rounded-3xl shadow-2xl overflow-hidden p-6 text-stone-200 space-y-5">
        {/* Header with Icon and Language Switcher */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-950/40 shrink-0">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-stone-100 font-serif leading-tight">
                {lang === 'en' ? 'Welcome to Dam-Daman!' : 'Selamat Datang di Dam-Daman!'}
              </h3>
              <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                {lang === 'en' ? 'Enter your name to start playing' : 'Masukkan nama Anda untuk mulai bermain'}
              </p>
            </div>
          </div>

          {/* Language Toggle in Welcome Modal */}
          {onChangeLang && (
            <div className="flex bg-stone-800/90 border border-stone-700/70 rounded-xl p-0.5 text-xs shadow-inner shrink-0 ml-2">
              <button
                type="button"
                onClick={() => onChangeLang('id')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                  lang === 'id'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Bahasa Indonesia"
              >
                <span>🇮🇩 ID</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                  lang === 'en'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="English"
              >
                <span>🇬🇧 EN</span>
              </button>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <User size={14} className="text-orange-400" />
              <span>{lang === 'en' ? 'Your Name (Player 1):' : 'Nama Anda (Pemain 1):'}</span>
            </label>
            <input
              type="text"
              autoFocus
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === 'en' ? 'e.g. Budi / Alex' : 'Contoh: Budi / Isparmo'}
              className="w-full px-4 py-2.5 bg-stone-950/80 border border-stone-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-stone-100 placeholder-stone-500 text-sm outline-none transition"
            />
          </div>

          {gameMode === 'pvp' && (
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <User size={14} className="text-sky-400" />
                <span>{lang === 'en' ? 'Player 2 Name:' : 'Nama Pemain 2:'}</span>
              </label>
              <input
                type="text"
                maxLength={24}
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                placeholder={lang === 'en' ? 'e.g. Sarah / Player 2' : 'Contoh: Sarah / Pemain 2'}
                className="w-full px-4 py-2.5 bg-stone-950/80 border border-stone-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-stone-100 placeholder-stone-500 text-sm outline-none transition"
              />
            </div>
          )}

          {/* User-friendly info box with zero technical jargon */}
          <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800 text-[11px] text-stone-400 space-y-1">
            <div className="flex items-center gap-1 text-amber-300 font-semibold">
              <Sparkles size={13} />
              <span>{lang === 'en' ? 'Automatic Match Tracking' : 'Pencatatan Otomatis Riwayat'}</span>
            </div>
            <p>
              {lang === 'en'
                ? 'Your scores, duration, date, and moves are automatically saved on your device without needing an account.'
                : 'Hasil skor, lama bermain, tanggal, dan riwayat langkah akan otomatis tersimpan rapi di memori perangkat Anda tanpa perlu mendaftar.'}
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-orange-950/40 active:scale-95 transition"
            >
              <span>{lang === 'en' ? 'Start Match' : 'Mulai Bermain'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
