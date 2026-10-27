/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Game Match History Modal for Maen Dam-Daman.
 * Displays all games recorded in IndexedDB:
 * - Nama (Player name)
 * - Jam (Time)
 * - Tanggal DDMMYYYY (Date)
 * - Lamanya bermain (Duration in minutes)
 * - Hasil: Menang, Kalah, Draw
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  History,
  Trophy,
  Clock,
  Calendar,
  Trash2,
  Award,
  RefreshCw,
  Users,
  Bot,
  TrendingUp,
} from 'lucide-react';
import {
  GameHistoryRecord,
  getAllGameHistory,
  clearAllGameHistory,
  deleteGameHistory,
} from '../game/db';
import { Language, translations } from '../i18n';

interface ModalGameHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const ModalGameHistory: React.FC<ModalGameHistoryProps> = ({
  isOpen,
  onClose,
  lang = 'id',
}) => {
  const [history, setHistory] = useState<GameHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const t = translations[lang];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await getAllGameHistory();
      setHistory(records);
    } catch (err) {
      console.error('Failed to load history from IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearAll = async () => {
    const confirmMsg =
      lang === 'en'
        ? 'Are you sure you want to clear all game history?'
        : 'Apakah Anda yakin ingin menghapus seluruh riwayat permainan?';
    if (window.confirm(confirmMsg)) {
      await clearAllGameHistory();
      setHistory([]);
    }
  };

  const handleDeleteItem = async (id?: number) => {
    if (!id) return;
    await deleteGameHistory(id);
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Quick stats calculation
  const totalMatches = history.length;
  const totalWins = history.filter((h) => h.result === 'menang').length;
  const totalLosses = history.filter((h) => h.result === 'kalah').length;
  const totalDraws = history.filter((h) => h.result === 'draw').length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <History size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-100 text-base font-serif">
                {lang === 'en' ? 'Game Match History' : 'Riwayat Pertandingan'}
              </h3>
              <p className="text-[11px] text-stone-400">
                {lang === 'en'
                  ? 'All matches recorded locally on your device'
                  : 'Tersimpan otomatis di memori perangkat Anda'}
              </p>
            </div>
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

        {/* Stats Summary Bar */}
        {totalMatches > 0 && (
          <div className="grid grid-cols-4 gap-2 px-6 py-3 bg-stone-950/40 border-b border-stone-800/80 text-center text-xs">
            <div className="p-2 bg-stone-900/60 rounded-xl border border-stone-800">
              <span className="text-[10px] text-stone-400 block">
                {lang === 'en' ? 'Matches' : 'Total Main'}
              </span>
              <span className="text-base font-bold text-stone-100 font-mono">{totalMatches}</span>
            </div>
            <div className="p-2 bg-emerald-950/30 rounded-xl border border-emerald-900/40">
              <span className="text-[10px] text-emerald-400 block">
                {lang === 'en' ? 'Won' : 'Menang'}
              </span>
              <span className="text-base font-bold text-emerald-300 font-mono">{totalWins}</span>
            </div>
            <div className="p-2 bg-rose-950/30 rounded-xl border border-rose-900/40">
              <span className="text-[10px] text-rose-400 block">
                {lang === 'en' ? 'Lost' : 'Kalah'}
              </span>
              <span className="text-base font-bold text-rose-300 font-mono">{totalLosses}</span>
            </div>
            <div className="p-2 bg-amber-950/30 rounded-xl border border-amber-900/40">
              <span className="text-[10px] text-amber-400 block">
                {lang === 'en' ? 'Draw' : 'Seri'}
              </span>
              <span className="text-base font-bold text-amber-300 font-mono">{totalDraws}</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-stone-400 space-y-2">
              <RefreshCw className="animate-spin text-amber-400" size={24} />
              <p className="text-xs">{lang === 'en' ? 'Loading game history...' : 'Memuat riwayat permainan...'}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-stone-400">
              <div className="w-14 h-14 rounded-full bg-stone-800 flex items-center justify-center text-stone-500">
                <History size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-stone-200">
                  {lang === 'en' ? 'No match records yet' : 'Belum ada riwayat permainan'}
                </p>
                <p className="text-xs text-stone-500 max-w-xs">
                  {lang === 'en'
                    ? 'Play a game and your match result, duration, and date will automatically be saved here.'
                    : 'Mainkan pertandingan dan hasil, durasi, serta tanggal Anda akan otomatis tersimpan di sini.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map((item) => {
                const isWin = item.result === 'menang';
                const isLoss = item.result === 'kalah';
                const isDraw = item.result === 'draw';

                let badgeClass = 'bg-amber-950/50 text-amber-300 border-amber-600/40';
                let resultLabel = lang === 'en' ? 'DRAW' : 'SERI';

                if (isWin) {
                  badgeClass = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50';
                  resultLabel = lang === 'en' ? 'WON' : 'MENANG';
                } else if (isLoss) {
                  badgeClass = 'bg-rose-950/60 text-rose-300 border-rose-500/50';
                  resultLabel = lang === 'en' ? 'LOST' : 'KALAH';
                }

                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-stone-950/70 border border-stone-800 hover:border-stone-700 rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    {/* Left: Player vs Opponent */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] border tracking-wider ${badgeClass}`}
                        >
                          {resultLabel}
                        </span>
                        <span className="font-bold text-stone-100 text-sm">
                          {item.playerName}
                        </span>
                        <span className="text-stone-500 text-xs">vs</span>
                        <span className="text-stone-300 font-medium">
                          {item.opponentName}
                        </span>
                      </div>

                      {/* Mode and piece counts */}
                      <div className="flex items-center gap-2 text-[11px] text-stone-400">
                        <span className="flex items-center gap-1">
                          {item.gameMode === 'ai' ? <Bot size={12} /> : <Users size={12} />}
                          {item.gameMode === 'ai' ? 'vs AI' : '2 Pemain'}
                        </span>
                        <span>•</span>
                        <span>{item.movesCount} {lang === 'en' ? 'moves' : 'langkah'}</span>
                        <span>•</span>
                        <span>
                          {lang === 'en' ? 'Sisa:' : 'Sisa:'} {item.p1Remaining} vs {item.p2Remaining}
                        </span>
                      </div>
                    </div>

                    {/* Right: Date, Time & Duration */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 text-stone-400 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-800">
                      <div className="text-left sm:text-right space-y-0.5">
                        <div className="flex items-center sm:justify-end gap-1.5 font-mono text-[11px] text-stone-200">
                          <Calendar size={12} className="text-amber-400" />
                          <span title={`DDMMYYYY: ${item.date}`}>
                            {item.dateFormatted} <span className="text-stone-500 text-[10px]">({item.date})</span>
                          </span>
                          <span className="text-stone-600">|</span>
                          <Clock size={12} className="text-sky-400" />
                          <span>{item.time}</span>
                        </div>
                        <div className="text-[11px] text-amber-300/90 font-medium">
                          {lang === 'en' ? 'Duration:' : 'Durasi:'}{' '}
                          <strong>{item.durationMinutes} {lang === 'en' ? 'min' : 'menit'}</strong> ({item.durationFormatted})
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition"
                        title={lang === 'en' ? 'Delete this record' : 'Hapus catatan ini'}
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-stone-800 bg-stone-950/60 text-xs">
          {history.length > 0 ? (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-semibold transition"
            >
              <Trash2 size={14} />
              <span>{lang === 'en' ? 'Clear History' : 'Hapus Semua'}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
