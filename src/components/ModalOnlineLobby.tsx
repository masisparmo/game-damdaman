/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Online Multiplayer Lobby Modal for Maen Dam-Daman.
 * 
 * Features:
 * - Option 1: Quick Match (Auto Matchmaking queue)
 * - Option 2: Play with Friend (Private Room Code, Share Link & WhatsApp Invite)
 * - Option 3: Join Friend's Room via 6-digit code
 * - Full Dual Language (ID & EN)
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Zap,
  Users,
  Copy,
  Check,
  Share2,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Language } from '../i18n';
import { onlineMatch, OnlineMatchConfig } from '../game/onlineMatch';

interface ModalOnlineLobbyProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  lang?: Language;
  onStartOnlineGame: (config: OnlineMatchConfig) => void;
  initialRoomCode?: string | null;
}

export const ModalOnlineLobby: React.FC<ModalOnlineLobbyProps> = ({
  isOpen,
  onClose,
  playerName,
  lang = 'id',
  onStartOnlineGame,
  initialRoomCode = null,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'friend'>('quick');
  const [friendSubTab, setFriendSubTab] = useState<'create' | 'join'>('create');
  
  // Quick Match State
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimer, setSearchTimer] = useState(0);

  // Private Room State
  const [generatedRoom, setGeneratedRoom] = useState<string>('');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isWaitingFriend, setIsWaitingFriend] = useState(false);
  const [friendJoinedName, setFriendJoinedName] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const handleCancelAll = () => {
    onlineMatch.cleanup();
    setIsSearching(false);
    setIsWaitingFriend(false);
    setFriendJoinedName(null);
    setJoinError(null);
  };

  // Generate room code on open
  useEffect(() => {
    if (isOpen) {
      if (initialRoomCode) {
        setActiveTab('friend');
        setFriendSubTab('join');
        setJoinCodeInput(initialRoomCode);
      } else {
        const code = onlineMatch.generateRoomCode();
        setGeneratedRoom(code);
      }
    } else {
      handleCancelAll();
    }
  }, [isOpen, initialRoomCode]);

  // Matchmaking timer
  useEffect(() => {
    let interval: any;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setSearchTimer(0);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  if (!isOpen) return null;

  const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://damdaman.isparmo.com';
  const shareableUrl = `${currentDomain}/?room=${generatedRoom}`;

  // Handle Quick Match
  const handleStartQuickMatch = async () => {
    setIsSearching(true);
    onlineMatch.onMatchFound = (config) => {
      setIsSearching(false);
      onStartOnlineGame(config);
      onClose();
    };
    await onlineMatch.startMatchmaking(playerName);
  };

  const handleCancelQuickMatch = () => {
    onlineMatch.cancelMatchmaking();
    setIsSearching(false);
  };

  // Handle Create Private Room
  const handleCreateRoom = async () => {
    setIsWaitingFriend(true);
    setFriendJoinedName(null);

    onlineMatch.onOpponentJoined = (opponent) => {
      setFriendJoinedName(opponent);
    };

    await onlineMatch.createPrivateRoom(generatedRoom, playerName);
  };

  // Start match after friend entered
  const handleStartWithJoinedFriend = () => {
    onStartOnlineGame({
      roomId: generatedRoom,
      myRole: 'P1',
      myName: playerName,
      opponentName: friendJoinedName || (lang === 'en' ? 'Guest Player' : 'Teman'),
    });
    onClose();
  };

  // Handle Join Private Room
  const handleJoinRoom = async () => {
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) {
      setJoinError(lang === 'en' ? 'Please enter a valid room code.' : 'Masukkan kode ruang yang valid.');
      return;
    }

    setJoinError(null);
    try {
      onlineMatch.onOpponentJoined = (opponent) => {
        onStartOnlineGame({
          roomId: code,
          myRole: 'P2',
          myName: playerName,
          opponentName: opponent,
        });
        onClose();
      };

      await onlineMatch.joinPrivateRoom(code, playerName);

      // Auto start as P2 after a brief handshake
      setTimeout(() => {
        onStartOnlineGame({
          roomId: code,
          myRole: 'P2',
          myName: playerName,
          opponentName: onlineMatch.getOpponentName() || (lang === 'en' ? 'Host Player' : 'Tuan Rumah'),
        });
        onClose();
      }, 1200);
    } catch (err) {
      setJoinError(lang === 'en' ? 'Failed to connect to room.' : 'Gagal terhubung ke ruangan.');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text =
      lang === 'en'
        ? `Let's play traditional Indonesian Dam-Daman online with me! Click the link to join my game: ${shareableUrl}`
        : `Ayo main Dam-Daman online bareng saya! Klik link ini untuk langsung masuk ke ruangan: ${shareableUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Globe size={18} />
            </div>
            <div>
              <h3 className="font-bold text-stone-100 text-sm sm:text-base">
                {lang === 'en' ? 'Dam-Daman Online Multiplayer' : 'Main Dam-Daman Online'}
              </h3>
              <p className="text-[11px] text-stone-400">
                {lang === 'en'
                  ? 'Real-time WebSocket over Supabase'
                  : 'Real-time WebSocket via Supabase'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleCancelAll();
              onClose();
            }}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-stone-950 border-b border-stone-800 text-xs font-semibold">
          <button
            onClick={() => {
              handleCancelAll();
              setActiveTab('quick');
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition ${
              activeTab === 'quick'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Zap size={14} />
            <span>{lang === 'en' ? 'Quick Match' : 'Cari Lawan Cepat'}</span>
          </button>

          <button
            onClick={() => {
              handleCancelAll();
              setActiveTab('friend');
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition ${
              activeTab === 'friend'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users size={14} />
            <span>{lang === 'en' ? 'Play with Friend' : 'Main Bareng Teman'}</span>
          </button>
        </div>

        {/* Tab 1: Quick Match */}
        {activeTab === 'quick' && (
          <div className="p-5 space-y-4 text-center">
            <div className="max-w-xs mx-auto space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-400">
                {isSearching ? (
                  <RefreshCw size={28} className="animate-spin text-amber-400" />
                ) : (
                  <Zap size={28} />
                )}
              </div>
              <h4 className="font-bold text-stone-100 text-base">
                {isSearching
                  ? lang === 'en'
                    ? 'Searching for Opponent...'
                    : 'Mencari Lawan Online...'
                  : lang === 'en'
                  ? 'Ready to Play Against Anyone?'
                  : 'Siap Bertanding Melawan Siapa Saja?'}
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                {isSearching
                  ? lang === 'en'
                    ? `Matching with active players worldwide (${formatSeconds(searchTimer)})...`
                    : `Menghubungkan dengan pemain aktif di internet (${formatSeconds(searchTimer)})...`
                  : lang === 'en'
                  ? 'Click the button below to automatically pair with other players in the matchmaking queue.'
                  : 'Klik tombol di bawah untuk otomatis dipasangkan dengan pemain lain yang sedang mengantre.'}
              </p>
            </div>

            {isSearching ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>{formatSeconds(searchTimer)}</span>
                </div>
                <button
                  onClick={handleCancelQuickMatch}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-rose-400 border border-stone-700 transition"
                >
                  {lang === 'en' ? 'Cancel Matchmaking' : 'Batal Mencari'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartQuickMatch}
                className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-orange-950/40 active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                <span>{lang === 'en' ? 'Start Matchmaking Now' : 'Mulai Cari Lawan Sekarang'}</span>
              </button>
            )}
          </div>
        )}

        {/* Tab 2: Play with Friend (Private Room) */}
        {activeTab === 'friend' && (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Sub-tabs: Create or Join */}
            <div className="flex bg-stone-950 rounded-xl p-1 border border-stone-800 text-xs">
              <button
                onClick={() => {
                  handleCancelAll();
                  setFriendSubTab('create');
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  friendSubTab === 'create'
                    ? 'bg-stone-800 text-amber-300'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {lang === 'en' ? '1. Create Room (Host)' : '1. Buat Ruangan (Tuan Rumah)'}
              </button>
              <button
                onClick={() => {
                  handleCancelAll();
                  setFriendSubTab('join');
                }}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
                  friendSubTab === 'join'
                    ? 'bg-stone-800 text-amber-300'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {lang === 'en' ? '2. Join Room (Guest)' : '2. Gabung Ruangan (Tamu)'}
              </button>
            </div>

            {/* Sub-tab A: Create Room */}
            {friendSubTab === 'create' && (
              <div className="space-y-3.5">
                {!isWaitingFriend ? (
                  <div className="p-4 bg-stone-950/80 rounded-xl border border-stone-800 space-y-3 text-center">
                    <span className="text-xs text-stone-400 block">
                      {lang === 'en' ? 'Your Unique Room Code:' : 'Kode Ruangan Anda:'}
                    </span>
                    <div className="font-mono text-2xl font-black text-amber-400 tracking-wider">
                      {generatedRoom}
                    </div>
                    <button
                      onClick={handleCreateRoom}
                      className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white transition shadow-md shadow-amber-950/40"
                    >
                      {lang === 'en' ? 'Open Room & Invite Friend' : 'Buka Ruang & Undang Teman'}
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-stone-950/90 rounded-xl border border-amber-500/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                      <span className="text-xs text-stone-400 font-medium">
                        {lang === 'en' ? 'Room Code' : 'Kode Ruang'}:{' '}
                        <strong className="text-amber-400 font-mono text-sm">{generatedRoom}</strong>
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{lang === 'en' ? 'Room Active' : 'Ruang Aktif'}</span>
                      </span>
                    </div>

                    {friendJoinedName ? (
                      <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
                        <p className="text-xs text-emerald-300 font-bold">
                          🎉 {friendJoinedName}{' '}
                          {lang === 'en' ? 'has joined your room!' : 'telah masuk ke ruangan!'}
                        </p>
                        <button
                          onClick={handleStartWithJoinedFriend}
                          className="w-full py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-1.5"
                        >
                          <span>{lang === 'en' ? 'Start Game Now' : 'Mulai Bertanding Sekarang'}</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-stone-300 leading-relaxed text-center">
                          {lang === 'en'
                            ? 'Share the invitation link with your friend via WhatsApp or copy link:'
                            : 'Kirimkan link undangan ke teman via WhatsApp atau salin link:'}
                        </p>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={handleCopyLink}
                            className="py-2 px-3 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition flex items-center justify-center gap-1.5"
                          >
                            {copiedLink ? (
                              <Check size={14} className="text-emerald-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                            <span>
                              {copiedLink
                                ? lang === 'en'
                                  ? 'Copied!'
                                  : 'Tersalin!'
                                : lang === 'en'
                                ? 'Copy Link'
                                : 'Salin Link'}
                            </span>
                          </button>

                          <button
                            onClick={handleShareWhatsApp}
                            className="py-2 px-3 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white transition flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Share2 size={14} />
                            <span>WhatsApp</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-amber-300/80 font-mono">
                          <RefreshCw size={12} className="animate-spin" />
                          <span>
                            {lang === 'en'
                              ? 'Waiting for friend to open link...'
                              : 'Menunggu teman membuka link...'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab B: Join Room */}
            {friendSubTab === 'join' && (
              <div className="p-4 bg-stone-950/80 rounded-xl border border-stone-800 space-y-3">
                <label className="text-xs text-stone-300 font-medium block">
                  {lang === 'en'
                    ? 'Enter 6-digit room code from friend:'
                    : 'Masukkan 6 digit kode dari teman:'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="DAM-XXXX"
                    maxLength={10}
                    className="flex-1 px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-amber-400 font-mono text-sm tracking-wider uppercase focus:outline-hidden focus:border-amber-500"
                  />
                  <button
                    onClick={handleJoinRoom}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition"
                  >
                    {lang === 'en' ? 'Join' : 'Gabung'}
                  </button>
                </div>

                {joinError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400">
                    <ShieldAlert size={14} />
                    <span>{joinError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-stone-950 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
          <span>{lang === 'en' ? 'Playing as:' : 'Bermain sebagai:'} <strong className="text-stone-200">{playerName || 'Pemain'}</strong></span>
          <span className="font-mono text-emerald-400 text-[10px]">● Supabase Realtime</span>
        </div>
      </div>
    </div>
  );
};
