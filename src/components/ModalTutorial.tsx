/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Tutorial & Rules Guide for Maen Dam-Daman.
 * Grounded in West Java Traditional Games Catalog & Pasuruan Ethnomathematics study.
 * Supports bilingual (ID & EN).
 */

import React, { useState, useEffect } from 'react';
import { X, Check, ChevronLeft, ChevronRight, BookOpen, ShieldAlert, Trophy, Compass, Flame } from 'lucide-react';
import { Language, translations, getTutorialSlides } from '../i18n';

interface ModalTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const ModalTutorial: React.FC<ModalTutorialProps> = ({ isOpen, onClose, lang = 'id' }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const t = translations[lang];
  const slidesData = getTutorialSlides(lang);

  const icons = [
    <Compass key="1" className="w-5 h-5 text-amber-400" />,
    <BookOpen key="2" className="w-5 h-5 text-emerald-400" />,
    <Flame key="3" className="w-5 h-5 text-orange-400" />,
    <ShieldAlert key="4" className="w-5 h-5 text-rose-400" />,
    <Trophy key="5" className="w-5 h-5 text-yellow-400" />,
  ];

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2">
            {icons[activeTab] || <Compass className="w-5 h-5 text-amber-400" />}
            <div>
              <h3 className="font-bold text-stone-100 text-base">{t.howToPlay}</h3>
              <p className="text-[11px] text-stone-400">{slidesData[activeTab].subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2 py-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition text-xs"
            aria-label={t.close}
            title={`${t.close} (Esc)`}
          >
            <X size={18} />
            <span className="hidden sm:inline">{t.close}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <h4 className="text-base font-bold text-amber-400">
            {slidesData[activeTab].title}
          </h4>
          {slidesData[activeTab].text}
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-stone-800 bg-stone-950/60">
          {/* Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {slidesData.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`h-2 rounded-full transition-all ${
                    activeTab === i ? 'w-6 bg-amber-500' : 'w-2 bg-stone-700 hover:bg-stone-600'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
            <span className="text-[11px] text-stone-400">
              {activeTab + 1}/{slidesData.length}
            </span>
          </div>

          {/* Action buttons: Tutup (Close), Previous, Next, and OK */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
              title={t.close}
            >
              {t.close}
            </button>

            <button
              onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
              disabled={activeTab === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-stone-200"
            >
              <ChevronLeft size={14} />
              {t.prev}
            </button>

            {activeTab < slidesData.length - 1 && (
              <button
                onClick={() => setActiveTab(activeTab + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-700 hover:bg-stone-600 transition text-stone-100"
              >
                {t.next}
                <ChevronRight size={14} />
              </button>
            )}

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 transition active:scale-95"
              title={t.ok}
            >
              <Check size={14} />
              {activeTab === slidesData.length - 1 ? t.okPlay : t.ok}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
