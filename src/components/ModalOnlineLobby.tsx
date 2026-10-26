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

import React, { useState, useEffect, useRef } from 'react';
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
  const [friendJoinedName, setFriendJoinedName] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Flag to know if game was started so cleanup is NOT invoked on modal unmount
  const isStartingGameRef = useRef(false);

  const handleCancelAll = () => {
    if (!isStartingGameRef.current) {
      onlineMatch.cleanup();
    }
    setIsSearching(false);
    setFriendJoinedName(null);
    setJoinError(null);
    setIsJoining(false);
  };

  // Automatically setup room code and listeners
  useEffect(() => {
    if (isOpen) {
      isStartingGameRef.current = false;
      if (initialRoomCode) {
        setActiveTab('friend');
        setFriendSubTab('join');
        setJoinCodeInput(initialRoomCode);
      } else {
        const code = onlineMatch.generateRoomCode();
        setGeneratedRoom(code);
      }
    } else {
      if (!isStartingGameRef.current) {
        onlineMatch.cleanup();
      }
      setIsSearching(false);
    }
  }, [isOpen, initialRoomCode]);

  // When switching to friend "create", activate the room immediately
  useEffect(() => {
    if (isOpen && activeTab === 'friend' && friendSubTab === 'create' && generatedRoom) {
      console.log(`[Lobby] Auto-hosting room: ${generatedRoom}`);
      onlineMatch.onOpponentJoined = (opponent) => {
        console.log(`[Lobby] Host detected friend joined: ${opponent}`);
        setFriendJoinedName(opponent);
      };
      onlineMatch.createPrivateRoom(generatedRoom, playerName);
    }
  }, [isOpen, activeTab, friendSubTab, generatedRoom, playerName]);

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
      console.log('[Lobby] Quick match found:', config);
      setIsSearching(false);
      isStartingGameRef.current = true;
      onStartOnlineGame(config);
      onClose();
    };
    await onlineMatch.startMatchmaking(playerName);
  };

  const handleCancelQuickMatch = () => {
    onlineMatch.cancelMatchmaking();
    setIsSearching(false);
  };

  // Start match after friend entered
  const handleStartWithJoinedFriend = () => {
    isStartingGameRef.current = true;
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
    setIsJoining(true);

    try {
      onlineMatch.onOpponentJoined = (hostName) => {
        console.log('[Lobby] Guest detected host ack:', hostName);
        isStartingGameRef.current = true;
        onStartOnlineGame({
          roomId: code,
          myRole: 'P2',
          myName: playerName,
          opponentName: hostName || (lang === 'en' ? 'Host Player' : 'Tuan Rumah'),
        });
        onClose();
      };

      await onlineMatch.joinPrivateRoom(code, playerName);

      // Transition to game board as P2
      setTimeout(() => {
        isStartingGameRef.current = true;
        onStartOnlineGame({
          roomId: code,
          myRole: 'P2',
          myName: playerName,
          opponentName: onlineMatch.getOpponentName() || (lang === 'en' ? 'Host Player' : 'Tuan Rumah'),
        });
        onClose();
      }, 1000);
    } catch (err) {
      setIsJoining(false);
      setJoinError(lang === 'en' ? 'Failed to connect to room.' : 'Gagal terhubung ke ruangan.');
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {}
  };

  const handleShareWhatsApp = () => {
    const text =
      lang === 'en'
        ? `Let's play traditional Indonesian Dam-Daman online with me! Click the link to join my game: ${shareableUrl}`
        : `Ayo main Dam-Daman online bareng saya! Klik link ini untuk langsung masuk ke ruangan: ${shareableUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleUserClose = () => {
    handleCancelAll();
    onClose();
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
            onClick={handleUserClose}
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
          <div className="p-5 sm:p-6 space-y-4">
            <div className="text-center space-y-1.5">
              <h4 className="font-bold text-stone-200 text-sm sm:text-base">
                {lang === 'en' ? 'Automatic Matchmaking' : 'Pemasangan Otomatis'}
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed max-w-sm mx-auto">
                {lang === 'en'
                  ? 'Pair automatically with another online player worldwide in 1 click.'
                  : 'Otomatis dicarikan lawan tanding dengan pemain lain di seluruh dunia.'}
              </p>
            </div>

            {isSearching ? (
              <div className="p-5 bg-stone-950/80 rounded-2xl border border-amber-500/30 text-center space-y-3.5">
                {/* Radar scanner animation */}
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-amber-500/40 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-2 border-amber-400/60 animate-pulse" />
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs">
                    {formatSeconds(searchTimer)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-300">
                    {lang === 'en' ? 'Searching for opponent...' : 'Sedang mencari lawan tanding...'}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    {lang === 'en' ? 'Waiting in queue' : 'Menunggu di antrean'}
                  </div>
                </div>

                <button
                  onClick={handleCancelQuickMatch}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
                >
                  {lang === 'en' ? 'Cancel' : 'Batalkan'}
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleStartQuickMatch}
                  className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 active:scale-[0.99]"
                >
                  <Zap size={16} />
                  <span>{lang === 'en' ? 'Find Match Now' : 'Cari Lawan Sekarang'}</span>
                </button>
                <p className="text-[11px] text-stone-500 text-center">
                  {lang === 'en'
                    ? 'Ultra-low latency sub-50ms WebSocket connection.'
                    : 'Koneksi WebSocket real-time dengan latensi di bawah 50ms.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Play with Friend */}
        {activeTab === 'friend' && (
          <div className="p-5 sm:p-6 space-y-4">
            {/* Sub-tabs: Create Room vs Join Room */}
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
                <div className="p-4 bg-stone-950/90 rounded-xl border border-amber-500/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="text-xs text-stone-400 font-medium">
                      {lang === 'en' ? 'Room Code' : 'Kode Ruang'}:{' '}
                      <strong className="text-amber-400 font-mono text-base">{generatedRoom}</strong>
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
                        className="w-full py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-1.5 shadow-md"
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
                          className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition flex items-center justify-center gap-1.5 active:scale-95"
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
                          className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <Share2 size={14} />
                          <span>WhatsApp</span>
                        </button>
                      </div>

                      <div className="pt-2 text-center flex items-center justify-center gap-2 text-stone-400 text-xs">
                        <RefreshCw size={13} className="animate-spin text-amber-400" />
                        <span>
                          {lang === 'en'
                            ? 'Waiting for friend to join...'
                            : 'Menunggu teman bergabung...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-stone-500 text-center">
                  {lang === 'en'
                    ? 'Friends opening your link will automatically connect.'
                    : 'Teman yang membuka link akan otomatis masuk ke ruangan Anda.'}
                </p>
              </div>
            )}

            {/* Sub-tab B: Join Room */}
            {friendSubTab === 'join' && (
              <div className="space-y-3.5">
                <div className="p-4 bg-stone-950/80 rounded-xl border border-stone-800 space-y-3">
                  <span className="text-xs text-stone-400 block text-center">
                    {lang === 'en'
                      ? 'Enter 6-digit room code from your friend:'
                      : 'Masukkan 6 digit kode ruang dari teman Anda:'}
                  </span>

                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => {
                      setJoinCodeInput(e.target.value.toUpperCase());
                      setJoinError(null);
                    }}
                    placeholder="Contoh: DAM-7842"
                    maxLength={10}
                    className="w-full text-center font-mono text-xl tracking-widest font-black uppercase bg-stone-900 border border-stone-700 focus:border-amber-500 rounded-xl py-2.5 text-amber-300 outline-none"
                  />

                  {joinError && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400">
                      <ShieldAlert size={14} />
                      <span>{joinError}</span>
                    </div>
                  )}

                  <button
                    onClick={handleJoinRoom}
                    disabled={isJoining}
                    className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 disabled:opacity-50"
                  >
                    {isJoining ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <ArrowRight size={14} />
                    )}
                    <span>
                      {isJoining
                        ? lang === 'en'
                          ? 'Connecting...'
                          : 'Menghubungkan...'
                        : lang === 'en'
                        ? 'Join Room'
                        : 'Gabung Ruangan'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
