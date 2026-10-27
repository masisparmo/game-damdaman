/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Tutorial & Rules Guide for Maen Dam-Daman.
 * Grounded in West Java Traditional Games Catalog & Pasuruan Ethnomathematics study.
 * Supports bilingual (ID & EN) with instant language toggle and mobile-safe navigation.
 */

import React, { useState, useEffect } from 'react';
import { X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Language, translations, getTutorialSlides } from '../i18n';

interface ModalTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  onChangeLang?: (newLang: Language) => void;
}

export const ModalTutorial: React.FC<ModalTutorialProps> = ({
  isOpen,
  onClose,
  lang = 'id',
  onChangeLang,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const t = translations[lang];
  const slidesData = getTutorialSlides(lang);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setActiveTab((prev) => Math.min(slidesData.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveTab((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, slidesData.length]);

  if (!isOpen) return null;

  const isLastSlide = activeTab === slidesData.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-stone-900 border border-stone-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title, Language Switcher, and Close Button */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-stone-800 bg-stone-950/70 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/logo.png"
              alt="Dam-Daman Logo"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl shadow-md shrink-0 object-contain ring-1 ring-amber-500/30"
            />
            <div className="min-w-0">
              <h3 className="font-bold text-stone-100 text-sm sm:text-base leading-tight truncate">
                {t.howToPlay}
              </h3>
              <p className="text-[10px] sm:text-xs text-stone-400 truncate">
                {slidesData[activeTab].subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Language Toggle on Tutorial Modal */}
            {onChangeLang && (
              <div className="flex bg-stone-800/90 border border-stone-700/70 rounded-xl p-0.5 text-xs shadow-inner">
                <button
                  type="button"
                  onClick={() => onChangeLang('id')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                    lang === 'id'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title="Bahasa Indonesia"
                >
                  <span>🇮🇩</span>
                  <span>ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLang('en')}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                    lang === 'en'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title="English"
                >
                  <span>🇬🇧</span>
                  <span>EN</span>
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition"
              aria-label={t.close}
              title={`${t.close} (Esc)`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 sm:space-y-4">
          <h4 className="text-sm sm:text-base font-bold text-amber-400">
            {slidesData[activeTab].title}
          </h4>
          {slidesData[activeTab].text}
        </div>

        {/* Footer Navigation — Mobile-Safe Layout without clipping */}
        <div className="px-4 sm:px-5 py-3 border-t border-stone-800 bg-stone-950/80 space-y-2">
          {/* Main Action Navigation Row: Prev | Indicators | Next/OK */}
          <div className="flex items-center justify-between gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
              disabled={activeTab === 0}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none transition text-stone-200"
            >
              <ChevronLeft size={14} />
              <span>{t.prev}</span>
            </button>

            {/* Slide Indicator Dots */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {slidesData.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all ${
                    activeTab === i ? 'w-5 sm:w-6 bg-amber-500' : 'w-1.5 sm:w-2 bg-stone-700 hover:bg-stone-600'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
              <span className="text-[10px] text-stone-400 ml-1 font-mono">
                {activeTab + 1}/{slidesData.length}
              </span>
            </div>

            {/* Next or OK Button (Adapts on last slide) */}
            {isLastSlide ? (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/40 transition active:scale-95 shrink-0"
              >
                <Check size={14} strokeWidth={3} />
                <span>{t.okPlay}</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab(activeTab + 1)}
                className="flex items-center gap-1 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition active:scale-95 shadow-md shadow-amber-950/30 shrink-0"
              >
                <span>{t.next}</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Skip / Close Link for convenience */}
          <div className="flex items-center justify-center">
            <button
              onClick={onClose}
              className="text-[11px] text-stone-400 hover:text-amber-300 transition py-0.5"
            >
              {lang === 'en' ? 'Skip tutorial & start playing' : 'Lewati panduan & langsung main'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
