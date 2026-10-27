/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Player Profile & Hero Avatar Customization Modal for Maen Dam-Daman.
 * Allows customizing player names and choosing from 16 authentic Indonesian hero characters.
 * Fully responsive, zero technical jargon, with instant visual feedback.
 */

import React, { useState, useEffect } from 'react';
import { User, Sparkles, Check, X, Shield, ArrowRight } from 'lucide-react';
import { Language, translations } from '../i18n';
import { HEROES_LIST, getHeroById, DEFAULT_HERO_ID, DEFAULT_P2_HERO_ID } from '../game/heroes';

interface ModalPlayerNameProps {
  isOpen: boolean;
  onClose?: () => void;
  onSaveProfile: (p1Name: string, p1Hero: string, p2Name?: string, p2Hero?: string) => void;
  gameMode: 'ai' | 'pvp' | 'online';
  currentP1Name: string;
  currentP1Avatar?: string;
  currentP2Name: string;
  currentP2Avatar?: string;
  lang?: Language;
  onChangeLang?: (newLang: Language) => void;
}

export const ModalPlayerName: React.FC<ModalPlayerNameProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
  gameMode,
  currentP1Name,
  currentP1Avatar,
  currentP2Name,
  currentP2Avatar,
  lang = 'id',
  onChangeLang,
}) => {
  const [name, setName] = useState<string>(currentP1Name || '');
  const [avatar, setAvatar] = useState<string>(currentP1Avatar || DEFAULT_HERO_ID);
  const [p2Name, setP2Name] = useState<string>(currentP2Name || '');
  const [p2Avatar, setP2Avatar] = useState<string>(currentP2Avatar || DEFAULT_P2_HERO_ID);
  const [activeTab, setActiveTab] = useState<'p1' | 'p2'>('p1');

  useEffect(() => {
    if (isOpen) {
      setName(currentP1Name || '');
      setAvatar(currentP1Avatar || DEFAULT_HERO_ID);
      setP2Name(currentP2Name || '');
      setP2Avatar(currentP2Avatar || DEFAULT_P2_HERO_ID);
      setActiveTab('p1');
    }
  }, [isOpen, currentP1Name, currentP1Avatar, currentP2Name, currentP2Avatar]);

  if (!isOpen) return null;
  const t = translations[lang];

  const currentSelectedHero = activeTab === 'p1' ? getHeroById(avatar) : getHeroById(p2Avatar);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalP1 = name.trim() || (lang === 'en' ? 'Player 1' : 'Pemain 1');
    const finalP2 = p2Name.trim() || (lang === 'en' ? 'Player 2' : 'Pemain 2');
    onSaveProfile(finalP1, avatar, gameMode === 'pvp' ? finalP2 : undefined, gameMode === 'pvp' ? p2Avatar : undefined);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-stone-900 border border-amber-600/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-stone-800 bg-stone-950/70 gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/logo.png"
              alt="Dam-Daman Logo"
              className="w-8 h-8 rounded-xl shadow-md shrink-0 object-contain ring-1 ring-amber-500/30"
            />
            <div className="min-w-0">
              <h3 className="font-extrabold text-stone-100 text-sm sm:text-base font-serif leading-tight truncate">
                {t.playerProfile}
              </h3>
              <p className="text-[10px] sm:text-xs text-amber-400 truncate">
                {t.editProfile}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language Switcher */}
            {onChangeLang && (
              <div className="flex bg-stone-800/90 border border-stone-700/70 rounded-xl p-0.5 text-xs shadow-inner">
                <button
                  type="button"
                  onClick={() => onChangeLang('id')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                    lang === 'id' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  🇮🇩 ID
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLang('en')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition ${
                    lang === 'en' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  🇬🇧 EN
                </button>
              </div>
            )}

            {/* Close Button if onClose is available */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition"
                title={t.close}
                aria-label="Close Profile Modal"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher for PvP mode */}
        {gameMode === 'pvp' && (
          <div className="px-4 sm:px-6 pt-3 pb-1 flex gap-2 border-b border-stone-800/80 bg-stone-900/50 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('p1')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                activeTab === 'p1'
                  ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-xs'
                  : 'bg-stone-800/60 border-stone-700/50 text-stone-400 hover:text-stone-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-xs" />
              <span>{lang === 'en' ? 'Player 1 (Orange)' : 'Pemain 1 (Oranye)'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('p2')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border ${
                activeTab === 'p2'
                  ? 'bg-sky-600/30 border-sky-500 text-sky-300 shadow-xs'
                  : 'bg-stone-800/60 border-stone-700/50 text-stone-400 hover:text-stone-200'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-xs" />
              <span>{lang === 'en' ? 'Player 2 (Blue)' : 'Pemain 2 (Biru)'}</span>
            </button>
          </div>
        )}

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {/* Active Hero Preview & Name Input */}
          <div className="p-3.5 bg-stone-950/70 rounded-2xl border border-stone-800/90 flex flex-col sm:flex-row items-center gap-3.5 shadow-inner">
            {/* Large Avatar Preview */}
            <div className="relative shrink-0">
              <img
                src={currentSelectedHero.image}
                alt={lang === 'en' ? currentSelectedHero.nameEn : currentSelectedHero.nameId}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-lg border-2 ${
                  activeTab === 'p1'
                    ? 'border-amber-400 ring-4 ring-amber-500/20 shadow-orange-950/50'
                    : 'border-sky-400 ring-4 ring-sky-500/20 shadow-sky-950/50'
                }`}
              />
              <span
                className={`absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-lg text-[10px] font-black text-white shadow border border-stone-900 ${
                  activeTab === 'p1' ? 'bg-orange-600' : 'bg-sky-600'
                }`}
              >
                {activeTab === 'p1' ? 'P1' : 'P2'}
              </span>
            </div>

            {/* Name Input & Selected Hero Details */}
            <div className="flex-1 w-full space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-stone-300 flex items-center gap-1.5">
                  <User size={13} className={activeTab === 'p1' ? 'text-amber-400' : 'text-sky-400'} />
                  <span>
                    {activeTab === 'p1'
                      ? (lang === 'en' ? 'Player 1 Name:' : 'Nama Pemain 1:')
                      : (lang === 'en' ? 'Player 2 Name:' : 'Nama Pemain 2:')}
                  </span>
                </label>
                <span className="text-[10px] text-stone-500 font-mono">
                  {(activeTab === 'p1' ? name : p2Name).length}/20
                </span>
              </div>

              <input
                type="text"
                maxLength={20}
                value={activeTab === 'p1' ? name : p2Name}
                onChange={(e) => {
                  if (activeTab === 'p1') setName(e.target.value);
                  else setP2Name(e.target.value);
                }}
                placeholder={
                  activeTab === 'p1'
                    ? (lang === 'en' ? 'e.g. Isparmo / Player 1' : 'Contoh: Isparmo / Pemain 1')
                    : (lang === 'en' ? 'e.g. Alex / Player 2' : 'Contoh: Alex / Pemain 2')
                }
                className="w-full px-3.5 py-2 bg-stone-900 border border-stone-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-stone-100 placeholder-stone-500 text-sm outline-none transition"
              />

              <div className="flex items-center gap-1.5 text-[11px] text-amber-300/90 pt-0.5">
                <Shield size={12} className="shrink-0" />
                <span className="font-medium truncate">
                  {t.heroSelected} <strong className="text-white">{lang === 'en' ? currentSelectedHero.nameEn : currentSelectedHero.nameId}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Hero Selection Grid (16 Authentic Nusantara Characters) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                <span>{t.chooseHero}</span>
                <span className="text-[10px] text-stone-500 font-normal">
                  ({HEROES_LIST.length} {lang === 'en' ? 'characters' : 'karakter'})
                </span>
              </h4>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 sm:gap-2.5 max-h-56 sm:max-h-64 overflow-y-auto p-1.5 bg-stone-950/60 rounded-2xl border border-stone-800/80">
              {HEROES_LIST.map((hero) => {
                const isSelected = activeTab === 'p1' ? avatar === hero.id : p2Avatar === hero.id;
                const heroDisplayName = lang === 'en' ? hero.nameEn : hero.nameId;

                return (
                  <button
                    key={hero.id}
                    type="button"
                    onClick={() => {
                      if (activeTab === 'p1') setAvatar(hero.id);
                      else setP2Avatar(hero.id);
                    }}
                    className={`relative flex flex-col items-center p-1.5 sm:p-2 rounded-xl border transition-all text-center group active:scale-95 ${
                      isSelected
                        ? activeTab === 'p1'
                          ? 'bg-amber-950/50 border-amber-400 ring-2 ring-amber-500/50 shadow-md shadow-orange-950/50'
                          : 'bg-sky-950/50 border-sky-400 ring-2 ring-sky-500/50 shadow-md shadow-sky-950/50'
                        : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 hover:bg-stone-800/50'
                    }`}
                  >
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-stone-950 mb-1 shrink-0">
                      <img
                        src={hero.image}
                        alt={heroDisplayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div
                          className={`absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[0.5px]`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-white shadow ${
                              activeTab === 'p1' ? 'bg-amber-500' : 'bg-sky-500'
                            }`}
                          >
                            <Check size={12} strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] font-semibold leading-tight line-clamp-1 w-full px-0.5 ${
                        isSelected
                          ? activeTab === 'p1'
                            ? 'text-amber-300'
                            : 'text-sky-300'
                          : 'text-stone-300 group-hover:text-stone-100'
                      }`}
                    >
                      {heroDisplayName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User-friendly info box with zero technical jargon */}
          <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800 text-[11px] text-stone-400 space-y-1">
            <div className="flex items-center gap-1 text-amber-300 font-semibold">
              <Sparkles size={13} />
              <span>{lang === 'en' ? 'Saved Automatically' : 'Tersimpan Otomatis'}</span>
            </div>
            <p>
              {lang === 'en'
                ? 'Your player name and hero avatar are saved safely on your device for future matches.'
                : 'Pilihan nama dan hero karakter Anda tersimpan otomatis di perangkat ini untuk pertandingan berikutnya.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-1 flex gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition"
              >
                {t.close}
              </button>
            )}
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-orange-950/40 active:scale-95 transition"
            >
              <span>{t.saveProfile}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
