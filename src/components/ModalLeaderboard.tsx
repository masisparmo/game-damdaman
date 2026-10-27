/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Global Leaderboard & Personal Statistics Modal for Maen Dam-Daman.
 * Synchronized live with Supabase Database and local IndexedDB.
 */

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Award,
  BarChart3,
  Flame,
  Shield,
  Users,
  Bot,
  RefreshCw,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Language, translations } from '../i18n';
import { getHeroById } from '../game/heroes';
import {
  PlayerStats,
  LeaderboardEntry,
  getLocalPlayerStats,
  getGlobalLeaderboard,
} from '../game/leaderboard';

interface ModalLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  playerAvatar: string;
  lang?: Language;
}

export const ModalLeaderboard: React.FC<ModalLeaderboardProps> = ({
  isOpen,
  onClose,
  playerName,
  playerAvatar,
  lang = 'id',
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'stats' | 'rules'>('leaderboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number>(1);
  const [isLiveCloud, setIsLiveCloud] = useState<boolean>(false);

  const t = translations[lang];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const localStats = await getLocalPlayerStats(playerName, playerAvatar);
      setStats(localStats);

      const boardData = await getGlobalLeaderboard(localStats);
      setEntries(boardData.entries);
      setMyRank(boardData.myRank);
      setIsLiveCloud(boardData.isLiveCloud);
    } catch (err) {
      console.warn('Error loading leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, playerName, playerAvatar]);

  if (!isOpen) return null;

  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-stone-900 border border-amber-600/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-800 bg-stone-950/70 gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 flex items-center justify-center text-white shadow-lg shadow-amber-950/40 shrink-0">
              <Trophy size={18} className="text-yellow-100" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-stone-100 text-sm sm:text-base font-serif leading-tight truncate flex items-center gap-1.5">
                <span>{t.leaderboardTitle}</span>
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLiveCloud ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <p className="text-[10px] text-stone-400 truncate">
                  {isLiveCloud ? t.cloudSynced : t.offlineSync}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-stone-300 hover:text-white transition disabled:opacity-50"
              title={t.refreshLeaderboard}
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-stone-400 hover:text-stone-100 transition"
              title={t.close}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 sm:px-6 pt-2.5 pb-1 flex gap-1.5 border-b border-stone-800/80 bg-stone-900/40 shrink-0">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
              activeTab === 'leaderboard'
                ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-xs'
                : 'bg-stone-800/50 border-stone-700/50 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Trophy size={13} className="text-amber-400" />
            <span className="truncate">{t.leaderboardTab}</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
              activeTab === 'stats'
                ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-xs'
                : 'bg-stone-800/50 border-stone-700/50 text-stone-400 hover:text-stone-200'
            }`}
          >
            <BarChart3 size={13} className="text-sky-400" />
            <span className="truncate">{t.statsTab}</span>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
              activeTab === 'rules'
                ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-xs'
                : 'bg-stone-800/50 border-stone-700/50 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Flame size={13} className="text-orange-400" />
            <span className="truncate">{t.rulesTab}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {activeTab === 'leaderboard' && (
            <div className="space-y-4">
              {/* Podium Top 3 */}
              {entries.length >= 3 && (
                <div className="grid grid-cols-3 gap-2 pt-2 pb-1 items-end">
                  {/* Rank 2 (Silver) */}
                  {top2 && (
                    <div className="flex flex-col items-center p-2 rounded-2xl bg-gradient-to-t from-stone-900 to-stone-800/80 border border-slate-600/50 text-center relative shadow-md">
                      <div className="w-5 h-5 rounded-full bg-slate-300 text-stone-900 text-[11px] font-black flex items-center justify-center mb-1 shadow">
                        2
                      </div>
                      <img
                        src={getHeroById(top2.playerAvatar).image}
                        alt={top2.playerName}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-slate-300 shadow ring-2 ring-slate-400/20 mb-1"
                      />
                      <span className="text-xs font-bold text-stone-100 truncate w-full px-1">
                        {top2.playerName}
                      </span>
                      <span className="text-[11px] font-extrabold text-amber-300 font-mono mt-0.5">
                        {top2.totalPoints} {t.points}
                      </span>
                    </div>
                  )}

                  {/* Rank 1 (Gold Champion) */}
                  {top1 && (
                    <div className="flex flex-col items-center p-2.5 rounded-2xl bg-gradient-to-t from-stone-900 via-amber-950/30 to-amber-900/40 border-2 border-yellow-500/80 text-center relative shadow-xl shadow-amber-950/50 -translate-y-1">
                      <Crown size={18} className="text-yellow-400 fill-yellow-400 absolute -top-3" />
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-stone-950 text-xs font-black flex items-center justify-center mb-1 shadow">
                        1
                      </div>
                      <img
                        src={getHeroById(top1.playerAvatar).image}
                        alt={top1.playerName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-yellow-400 shadow-lg ring-4 ring-yellow-400/30 mb-1"
                      />
                      <span className="text-xs sm:text-sm font-black text-amber-200 truncate w-full px-1">
                        {top1.playerName}
                      </span>
                      <span className="text-xs font-black text-yellow-300 font-mono mt-0.5">
                        {top1.totalPoints} {t.points}
                      </span>
                    </div>
                  )}

                  {/* Rank 3 (Bronze) */}
                  {top3 && (
                    <div className="flex flex-col items-center p-2 rounded-2xl bg-gradient-to-t from-stone-900 to-stone-800/80 border border-amber-800/50 text-center relative shadow-md">
                      <div className="w-5 h-5 rounded-full bg-amber-700 text-stone-100 text-[11px] font-black flex items-center justify-center mb-1 shadow">
                        3
                      </div>
                      <img
                        src={getHeroById(top3.playerAvatar).image}
                        alt={top3.playerName}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-amber-700 shadow ring-2 ring-amber-700/20 mb-1"
                      />
                      <span className="text-xs font-bold text-stone-100 truncate w-full px-1">
                        {top3.playerName}
                      </span>
                      <span className="text-[11px] font-extrabold text-amber-300 font-mono mt-0.5">
                        {top3.totalPoints} {t.points}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Leaderboard Table */}
              <div className="bg-stone-950/70 rounded-2xl border border-stone-800/90 overflow-hidden shadow-inner">
                <div className="px-3 py-2 bg-stone-900/80 border-b border-stone-800 flex items-center justify-between text-[11px] font-semibold text-stone-400">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center">{t.rankHeader}</span>
                    <span>{t.playerHeader}</span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="w-16 hidden sm:inline">{t.statsHeader}</span>
                    <span className="w-16">{t.scoreHeader}</span>
                  </div>
                </div>

                <div className="divide-y divide-stone-800/50 max-h-64 overflow-y-auto">
                  {entries.map((entry) => {
                    const isMe = entry.isCurrentPlayer;
                    return (
                      <div
                        key={entry.playerId}
                        className={`px-3 py-2 flex items-center justify-between transition-colors ${
                          isMe
                            ? 'bg-amber-950/40 border-l-4 border-amber-400 ring-1 ring-amber-500/30'
                            : 'hover:bg-stone-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 text-center font-bold text-xs font-mono shrink-0 ${
                              entry.rank === 1
                                ? 'text-yellow-400'
                                : entry.rank === 2
                                ? 'text-slate-300'
                                : entry.rank === 3
                                ? 'text-amber-600'
                                : 'text-stone-400'
                            }`}
                          >
                            #{entry.rank}
                          </span>
                          <img
                            src={getHeroById(entry.playerAvatar).image}
                            alt="Avatar"
                            className="w-8 h-8 rounded-lg object-cover border border-stone-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-stone-100 flex items-center gap-1.5 truncate">
                              <span className="truncate">{entry.playerName}</span>
                              {isMe && (
                                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-semibold shrink-0">
                                  {lang === 'en' ? 'You' : 'Anda'}
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] text-stone-400 truncate block">
                              {getHeroById(entry.playerAvatar).nameId}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right shrink-0">
                          <div className="text-[10px] text-stone-400 font-mono w-16 hidden sm:block">
                            <span className="text-emerald-400 font-bold">{entry.wins}W</span> /{' '}
                            <span>{entry.totalMatches}L</span>
                          </div>
                          <div className="w-16">
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 font-mono font-black text-xs border border-amber-500/30">
                              {entry.totalPoints} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && stats && (
            <div className="space-y-4">
              {/* Profile Card */}
              <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-center gap-3.5 shadow-inner">
                <img
                  src={getHeroById(stats.playerAvatar).image}
                  alt={stats.playerName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md ring-2 ring-amber-500/30"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-extrabold text-stone-100 truncate">
                    {stats.playerName}
                  </h4>
                  <p className="text-xs text-amber-400 font-medium">
                    {getHeroById(stats.playerAvatar).nameId}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs">
                    <span className="text-stone-300 font-bold">
                      {t.myRank}: <strong className="text-yellow-400 font-mono font-black">#{myRank}</strong>
                    </span>
                    <span className="text-stone-500">•</span>
                    <span className="text-stone-300 font-bold">
                      {t.points}: <strong className="text-amber-400 font-mono font-black">{stats.totalPoints}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Summary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                    {t.scoreHeader}
                  </span>
                  <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">
                    {stats.totalPoints}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                    {lang === 'en' ? 'Matches' : 'Pertandingan'}
                  </span>
                  <span className="text-xl font-black text-stone-100 font-mono mt-0.5 block">
                    {stats.totalMatches}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                    {lang === 'en' ? 'Wins' : 'Kemenangan'}
                  </span>
                  <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">
                    {stats.wins}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                    {t.winRate}
                  </span>
                  <span className="text-xl font-black text-sky-400 font-mono mt-0.5 block">
                    {stats.winRate}%
                  </span>
                </div>
              </div>

              {/* Detailed Points Breakdown Matrix */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>{lang === 'en' ? 'Points Breakdown Matrix' : 'Rincian Perolehan Poin'}</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between">
                    <span className="text-stone-300 flex items-center gap-1.5">
                      <Bot size={14} className="text-emerald-400" />
                      <span>vs AI Mudah (+1 pt)</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {stats.aiEasyWins} menang = +{stats.aiEasyWins * 1} pts
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between">
                    <span className="text-stone-300 flex items-center gap-1.5">
                      <Bot size={14} className="text-amber-400" />
                      <span>vs AI Sedang (+2 pts)</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      {stats.aiMediumWins} menang = +{stats.aiMediumWins * 2} pts
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between">
                    <span className="text-stone-300 flex items-center gap-1.5">
                      <Bot size={14} className="text-orange-400" />
                      <span>vs AI Sulit (+3 pts)</span>
                    </span>
                    <span className="font-mono font-bold text-orange-400">
                      {stats.aiHardWins} menang = +{stats.aiHardWins * 3} pts
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between">
                    <span className="text-stone-300 flex items-center gap-1.5">
                      <Crown size={14} className="text-yellow-400" />
                      <span>vs AI Dewa (+5 pts)</span>
                    </span>
                    <span className="font-mono font-bold text-yellow-400">
                      {stats.aiMasterWins} menang = +{stats.aiMasterWins * 5} pts
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-950/70 border border-stone-800 flex items-center justify-between sm:col-span-2">
                    <span className="text-stone-300 flex items-center gap-1.5">
                      <Users size={14} className="text-sky-400" />
                      <span>vs Pemain Lain Offline / Online (+2 pts)</span>
                    </span>
                    <span className="font-mono font-bold text-sky-400">
                      {stats.pvpWins + stats.onlineWins} menang = +{(stats.pvpWins + stats.onlineWins) * 2} pts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3 text-xs text-stone-300">
              <div className="p-3.5 bg-stone-950/70 rounded-2xl border border-stone-800 space-y-2">
                <h4 className="font-extrabold text-amber-400 text-sm flex items-center gap-1.5">
                  <Flame size={16} />
                  <span>{lang === 'en' ? 'Official Scoring & Ranking Rules' : 'Aturan Resmi Perhitungan Nilai & Peringkat'}</span>
                </h4>
                <p className="text-stone-400 leading-relaxed">
                  {lang === 'en'
                    ? 'Points are accumulated upon winning matches to determine your global standing on the leaderboard:'
                    : 'Nilai diakumulasikan setiap kali Anda memenangkan pertandingan untuk menentukan peringkat pemain:'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-stone-950/50 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <strong className="text-stone-100 block">Menang vs AI Mudah (Easy)</strong>
                      <span className="text-[11px] text-stone-400">Latihan dasar melompat dan penempatan</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    +1 Poin
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-950/50 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <strong className="text-stone-100 block">Menang vs AI Sedang (Medium)</strong>
                      <span className="text-[11px] text-stone-400">Pertahanan stabil dengan pembukaan standar</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold">
                    +2 Poin
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-950/50 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <strong className="text-stone-100 block">Menang vs AI Sulit (Hard)</strong>
                      <span className="text-[11px] text-stone-400">Kalkulasi 4 langkah ke depan dengan perangkap DAM</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 font-mono font-bold">
                    +3 Poin
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-950/50 border border-stone-800 flex items-center justify-between border-yellow-500/30 bg-amber-950/20">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-yellow-500/30 text-yellow-300 flex items-center justify-center font-bold">
                      5
                    </div>
                    <div>
                      <strong className="text-yellow-200 block">Menang vs AI Dewa (Master 👑)</strong>
                      <span className="text-[11px] text-stone-400">Tingkat tertinggi dengan memori belajar taktis</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-yellow-500/30 text-yellow-300 font-mono font-bold">
                    +5 Poin
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-950/50 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <strong className="text-stone-100 block">Menang vs Pemain Lain (Offline & Online)</strong>
                      <span className="text-[11px] text-stone-400">Pertandingan 2 pemain maupun duel via room online</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-mono font-bold">
                    +2 Poin
                  </span>
                </div>
              </div>

              {/* Sync mechanism notice */}
              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 text-[11px] text-stone-400 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <CheckCircle2 size={13} />
                  <span>Sinkronisasi Otomatis Database & Memori Lokal</span>
                </div>
                <p>
                  Seluruh perolehan nilai dan peringkat secara langsung tersinkronisasi ke database cloud (Supabase) dan disimpan di IndexedDB perangkat Anda untuk kehandalan bermain saat offline.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky My Rank Footer */}
        {stats && (
          <div className="p-3 sm:px-6 bg-stone-950/90 border-t border-stone-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={getHeroById(stats.playerAvatar).image}
                alt="Avatar"
                className="w-8 h-8 rounded-lg object-cover border border-amber-500/50 shrink-0"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-stone-100 block truncate">
                  {stats.playerName}
                </span>
                <span className="text-[10px] text-stone-400 truncate block">
                  {t.myRank}: <strong className="text-yellow-400">#{myRank} Global</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-mono font-black text-xs shadow-md">
                {stats.totalPoints} {t.points}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
