/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Main Application for "Maen Dam-Daman".
 * Authentic Indonesian Traditional Board Game featuring Graph Etnomathematics,
 * dynamic scalable board with Portrait-first mobile layout, clean modern UI,
 * ultra-snappy AI, and procedural sound effects.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  createInitialState,
  applyMove,
  getLegalMoves,
  claimDamPenalty,
  passConsecutiveJump,
  GameState,
  Move,
  RulesConfig,
  DEFAULT_RULES_CONFIG,
  PlayerId,
} from './game/rulesEngine';
import { getAIMove, AIDifficulty } from './game/aiEngine';
import { sound } from './game/audio';
import { Board, BoardTheme, BoardOrientation } from './components/Board';
import { ModalTutorial } from './components/ModalTutorial';
import { ModalEtnomatematika } from './components/ModalEtnomatematika';
import { ModalSettings } from './components/ModalSettings';
import { ModalGameOver } from './components/ModalGameOver';
import {
  HelpCircle,
  Settings,
  RotateCcw,
  Bot,
  Users,
  AlertTriangle,
  Smartphone,
  Monitor,
  User,
  History,
  GraduationCap,
  Volume2,
  VolumeX,
  Crown,
  Globe,
  ChevronDown,
  Gamepad2,
  RefreshCw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Language, translations, formatMoveDescription } from './i18n';
import { ModalPlayerName } from './components/ModalPlayerName';
import { ModalGameHistory } from './components/ModalGameHistory';
import { ModalOnlineLobby } from './components/ModalOnlineLobby';
import { ModalGameMode } from './components/ModalGameMode';
import { ModalLeaderboard } from './components/ModalLeaderboard';
import {
  saveGameHistory,
  formatDDMMYYYY,
  formatDisplayDate,
  formatTime,
} from './game/db';
import { initMasterBrain, learnFromFinishedMatch } from './game/aiMemory';
import { onlineMatch, OnlineMatchConfig } from './game/onlineMatch';
import { getHeroById, DEFAULT_HERO_ID, DEFAULT_P2_HERO_ID } from './game/heroes';
import { recordMatchPointsAndStats } from './game/leaderboard';

export default function App() {
  // Game State
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [historyStack, setHistoryStack] = useState<GameState[]>([]);

  // Settings & Modes
  const [gameMode, setGameMode] = useState<'ai' | 'pvp' | 'online'>('ai');
  const [showOnlineLobby, setShowOnlineLobby] = useState<boolean>(false);
  const [onlineConfig, setOnlineConfig] = useState<OnlineMatchConfig | null>(null);
  const [isOpponentConnected, setIsOpponentConnected] = useState<boolean>(false);
  const [reactionToast, setReactionToast] = useState<{ emoji: string; sender: string } | null>(null);
  const [urlRoomCode, setUrlRoomCode] = useState<string | null>(null);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('green'); // Modern Green Velvet (matches user's green photo)
  const [orientation, setOrientation] = useState<BoardOrientation>('portrait'); // Portrait first per user request
  const [boardScale, setBoardScale] = useState<number>(1.0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showNodeLabels, setShowNodeLabels] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [rulesConfig, setRulesConfig] = useState<RulesConfig>(DEFAULT_RULES_CONFIG);

  // Modals
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  const [showNameModal, setShowNameModal] = useState<boolean>(false);
  const [showGameHistory, setShowGameHistory] = useState<boolean>(false);
  const [showEtnomatematika, setShowEtnomatematika] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showGameOver, setShowGameOver] = useState<boolean>(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [showGameModeModal, setShowGameModeModal] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [lastEarnedPoints, setLastEarnedPoints] = useState<number>(0);

  // Player Name & Hero Avatar State
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem('damdaman_player_name') || '';
    } catch {}
    return '';
  });
  const [playerAvatar, setPlayerAvatar] = useState<string>(() => {
    try {
      return localStorage.getItem('damdaman_player_avatar') || DEFAULT_HERO_ID;
    } catch {}
    return DEFAULT_HERO_ID;
  });
  const [p2CustomName, setP2CustomName] = useState<string>('');
  const [p2Avatar, setP2Avatar] = useState<string>(() => {
    try {
      return localStorage.getItem('damdaman_p2_avatar') || DEFAULT_P2_HERO_ID;
    } catch {}
    return DEFAULT_P2_HERO_ID;
  });

  // Match Duration & IndexedDB save tracker
  const gameStartTimeRef = useRef<number>(Date.now());
  const hasSavedToDbRef = useRef<boolean>(false);

  // Internationalization (Default: Indonesian 'id')
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('damdaman_lang');
      if (saved === 'en' || saved === 'id') return saved;
    } catch {}
    return 'id';
  });

  useEffect(() => {
    try {
      localStorage.setItem('damdaman_lang', lang);
    } catch {}
  }, [lang]);

  const t = translations[lang];

  // AI Thinking state & lock ref to prevent race conditions
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const aiBusyRef = useRef<boolean>(false);

  // Sync sound manager enabled state
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Initialize Master Brain on startup
  useEffect(() => {
    initMasterBrain();
  }, []);

  // Check for room invite code in URL query params (?room=DAM-XXXX)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setUrlRoomCode(roomParam);
        setShowOnlineLobby(true);
      }
    } catch {}
  }, []);

  // Online Multiplayer WebSocket Listeners
  useEffect(() => {
    onlineMatch.onRemoteMoveReceived = ({ move, nextState }) => {
      if (move.isCapture) sound.playCapture();
      else sound.playMove();
      if (move.promotedToKing) sound.playPromotion();

      setHistoryStack((prev) => [...prev, gameStateRef.current]);
      setGameState(nextState);
      setSelectedPieceId(null);
      setLegalMoves([]);
    };

    onlineMatch.onRemoteClaimDam = () => {
      sound.playDamPenalty();
      setHistoryStack((prev) => [...prev, gameStateRef.current]);
      setGameState((prev) => claimDamPenalty(prev));
    };

    onlineMatch.onRemotePassJump = () => {
      sound.playMove();
      setHistoryStack((prev) => [...prev, gameStateRef.current]);
      setGameState((prev) => passConsecutiveJump(prev));
      setSelectedPieceId(null);
      setLegalMoves([]);
    };

    onlineMatch.onRemoteRestart = () => {
      handleRestart(rulesConfig, true);
    };

    onlineMatch.onReactionReceived = ({ emoji, senderName }) => {
      sound.playSelect();
      setReactionToast({ emoji, sender: senderName });
      setTimeout(() => setReactionToast(null), 3000);
    };

    onlineMatch.onOpponentStatusChange = (connected) => {
      setIsOpponentConnected(connected);
    };
  }, []);

  // Check Game Over & Save Match to IndexedDB & Learn Match Outcome
  useEffect(() => {
    if (gameState.gameStatus === 'won' || gameState.gameStatus === 'draw') {
      setShowGameOver(true);
      if (gameState.gameStatus === 'won') {
        sound.playVictory();
      }

      if (!hasSavedToDbRef.current) {
        hasSavedToDbRef.current = true;
        const now = new Date();
        const start = gameStartTimeRef.current || Date.now();
        const diffMs = Math.max(1000, now.getTime() - start);
        const mins = Math.max(0.1, Number((diffMs / 60000).toFixed(1)));
        const minutes = Math.floor(diffMs / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        const durationFormatted = `${minutes}m ${seconds}s`;

        let result: 'menang' | 'kalah' | 'draw' = 'draw';
        if (gameState.gameStatus === 'won') {
          result = gameState.winner === 'P1' ? 'menang' : 'kalah';
        }

        const p1Name = playerName || (lang === 'en' ? 'Player 1' : 'Pemain 1');
        const p2Name = gameMode === 'ai'
          ? `AI (${t[aiDifficulty]})`
          : (p2CustomName || (lang === 'en' ? 'Player 2' : 'Pemain 2'));

        const p1Rem = Object.values(gameState.pieces).filter((p) => p.owner === 'P1').length;
        const p2Rem = Object.values(gameState.pieces).filter((p) => p.owner === 'P2').length;

        saveGameHistory({
          playerName: p1Name,
          opponentName: p2Name,
          gameMode,
          date: formatDDMMYYYY(now),
          dateFormatted: formatDisplayDate(now),
          time: formatTime(now),
          durationMinutes: mins,
          durationFormatted,
          result,
          winner: gameState.winner,
          movesCount: gameState.moveHistory.length,
          p1Remaining: p1Rem,
          p2Remaining: p2Rem,
          timestamp: now.getTime(),
        }).catch((err) => console.error('Failed saving game history to IndexedDB:', err));

        // Record points and player stats for Global Ranking (Supabase & IndexedDB)
        recordMatchPointsAndStats(
          result,
          gameMode,
          aiDifficulty,
          p1Name,
          playerAvatar
        ).then(({ pointsEarned }) => {
          setLastEarnedPoints(pointsEarned);
        }).catch((err) => console.warn('Could not record match stats:', err));

        // Continuous Learning: Record and learn from this match
        if (gameMode === 'ai') {
          learnFromFinishedMatch(gameState, gameState.winner);
        }
      }
    }
  }, [
    gameState.gameStatus,
    gameState.winner,
    gameState.moveHistory.length,
    gameState.pieces,
    gameMode,
    aiDifficulty,
    playerName,
    p2CustomName,
    lang,
  ]);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    if (!playerName) {
      setShowNameModal(true);
    }
  };

  const handleSaveProfile = (p1: string, p1Hero: string, p2?: string, p2Hero?: string) => {
    setPlayerName(p1);
    setPlayerAvatar(p1Hero);
    try {
      localStorage.setItem('damdaman_player_name', p1);
      localStorage.setItem('damdaman_player_avatar', p1Hero);
    } catch {}
    if (p2) {
      setP2CustomName(p2);
    }
    if (p2Hero) {
      setP2Avatar(p2Hero);
      try {
        localStorage.setItem('damdaman_p2_avatar', p2Hero);
      } catch {}
    }
    setShowNameModal(false);
    gameStartTimeRef.current = Date.now();
  };

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Robust AI Turn Handler
  useEffect(() => {
    const runAITurn = async () => {
      const currentState = gameStateRef.current;
      if (
        gameMode !== 'ai' ||
        currentState.currentPlayer !== 'P2' ||
        currentState.gameStatus !== 'playing' ||
        aiBusyRef.current
      ) {
        return;
      }

      aiBusyRef.current = true;
      setIsAiThinking(true);

      try {
        let activeState = gameStateRef.current;

        // If P1 missed a capture, AI can claim the DAM penalty first
        if (
          activeState.opponentMissedCapture &&
          rulesConfig.damPenaltyClaim &&
          !activeState.damClaimedThisTurn
        ) {
          if (aiDifficulty !== 'easy' || Math.random() < 0.7) {
            await new Promise((r) => setTimeout(r, 200));
            sound.playDamPenalty();
            activeState = claimDamPenalty(activeState);
            setGameState(activeState);
          }
        }

        // Verify state is still active P2
        if (activeState.currentPlayer !== 'P2' || activeState.gameStatus !== 'playing') {
          return;
        }

        // Calculate AI move
        const aiMove = await getAIMove(activeState, 'P2', aiDifficulty);

        if (aiMove && activeState.currentPlayer === 'P2') {
          if (aiMove.isCapture) sound.playCapture();
          else sound.playMove();

          if (aiMove.promotedToKing) sound.playPromotion();

          setHistoryStack((prev) => [...prev, activeState]);
          let nextState = applyMove(activeState, aiMove, true);
          setGameState(nextState);
          setSelectedPieceId(null);
          setLegalMoves([]);

          // If AI piece has consecutive jumps required
          while (nextState.consecutivePieceId && nextState.currentPlayer === 'P2' && nextState.gameStatus === 'playing') {
            await new Promise((r) => setTimeout(r, 260));
            const followUpMove = await getAIMove(nextState, 'P2', aiDifficulty);
            if (!followUpMove) break;
            if (followUpMove.isCapture) sound.playCapture();
            nextState = applyMove(nextState, followUpMove, true);
            setGameState(nextState);
          }
        }
      } catch (err) {
        console.error('Error during AI move execution:', err);
      } finally {
        aiBusyRef.current = false;
        setIsAiThinking(false);
      }
    };

    runAITurn();
  }, [gameState.currentPlayer, gameState.gameStatus, gameMode, aiDifficulty, rulesConfig.damPenaltyClaim]);

  // Piece Selection Handler
  const handleSelectPiece = useCallback(
    (pieceId: string) => {
      if (isAiThinking || gameState.gameStatus !== 'playing') return;
      if (gameMode === 'ai' && gameState.currentPlayer === 'P2') return;
      if (gameMode === 'online' && onlineConfig && gameState.currentPlayer !== onlineConfig.myRole) return;

      const piece = gameState.pieces[pieceId];
      if (!piece || piece.owner !== gameState.currentPlayer) return;

      // If in consecutive jump, cannot pick a different piece
      if (gameState.consecutivePieceId && gameState.consecutivePieceId !== pieceId) {
        return;
      }

      setSelectedPieceId(pieceId);
      const moves = getLegalMoves(gameState, pieceId);
      setLegalMoves(moves);
    },
    [gameState, isAiThinking, gameMode, onlineConfig]
  );

  // Destination Selection Handler (Execute Move)
  const handleSelectDestination = useCallback(
    (toNodeId: string) => {
      if (!selectedPieceId || isAiThinking || gameState.gameStatus !== 'playing') return;
      if (gameMode === 'online' && onlineConfig && gameState.currentPlayer !== onlineConfig.myRole) return;

      const targetMove = legalMoves.find((m) => m.toNodeId === toNodeId);
      if (!targetMove) return;

      try {
        if (targetMove.isCapture) {
          sound.playCapture();
        } else {
          sound.playMove();
        }

        if (targetMove.promotedToKing) {
          sound.playPromotion();
        }

        // Save for undo
        setHistoryStack((prev) => [...prev, gameState]);

        const nextState = applyMove(gameState, targetMove);
        setGameState(nextState);

        // Broadcast to online opponent
        if (gameMode === 'online') {
          onlineMatch.broadcastMove(targetMove, nextState);
        }

        // If consecutive jump available for the same piece
        if (nextState.consecutivePieceId) {
          setSelectedPieceId(nextState.consecutivePieceId);
          setLegalMoves(getLegalMoves(nextState, nextState.consecutivePieceId));
        } else {
          setSelectedPieceId(null);
          setLegalMoves([]);
        }
      } catch (err) {
        console.error('Move execution failed:', err);
      }
    },
    [gameState, selectedPieceId, legalMoves, isAiThinking, gameMode, onlineConfig]
  );

  // Claim DAM Penalty Button
  const handleClaimDam = () => {
    if (!gameState.opponentMissedCapture || gameState.damClaimedThisTurn) return;
    if (gameMode === 'online' && onlineConfig && gameState.currentPlayer !== onlineConfig.myRole) return;
    sound.playDamPenalty();
    setHistoryStack((prev) => [...prev, gameState]);
    setGameState((prev) => claimDamPenalty(prev));
    if (gameMode === 'online') {
      onlineMatch.broadcastClaimDam();
    }
  };

  // Pass Consecutive Jump
  const handlePassJump = () => {
    if (!gameState.consecutivePieceId) return;
    if (gameMode === 'online' && onlineConfig && gameState.currentPlayer !== onlineConfig.myRole) return;
    sound.playMove();
    setHistoryStack((prev) => [...prev, gameState]);
    setGameState((prev) => passConsecutiveJump(prev));
    setSelectedPieceId(null);
    setLegalMoves([]);
    if (gameMode === 'online') {
      onlineMatch.broadcastPassJump();
    }
  };

  // Undo Move
  const handleUndo = () => {
    if (historyStack.length === 0 || isAiThinking) return;

    if (gameMode === 'ai') {
      if (historyStack.length >= 2) {
        const previousState = historyStack[historyStack.length - 2];
        setHistoryStack((prev) => prev.slice(0, prev.length - 2));
        setGameState(previousState);
      } else {
        const previousState = historyStack[0];
        setHistoryStack([]);
        setGameState(previousState);
      }
    } else {
      const previousState = historyStack[historyStack.length - 1];
      setHistoryStack((prev) => prev.slice(0, prev.length - 1));
      setGameState(previousState);
    }

    setSelectedPieceId(null);
    setLegalMoves([]);
    sound.playSelect();
  };

  // Reset / New Game
  const handleRestart = (config = rulesConfig, isRemote = false) => {
    aiBusyRef.current = false;
    hasSavedToDbRef.current = false;
    setLastEarnedPoints(0);
    gameStartTimeRef.current = Date.now();
    const fresh = createInitialState(config);
    setGameState(fresh);
    setSelectedPieceId(null);
    setLegalMoves([]);
    setHistoryStack([]);
    setShowGameOver(false);
    setIsAiThinking(false);
    sound.playSelect();
    if (gameMode === 'online' && !isRemote) {
      onlineMatch.broadcastRestart();
    }
  };

  // Piece counts
  const p1Count = Object.values(gameState.pieces).filter((p) => p.owner === 'P1').length;
  const p2Count = Object.values(gameState.pieces).filter((p) => p.owner === 'P2').length;
  const p1Captured = 16 - p2Count;
  const p2Captured = 16 - p1Count;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* ZONA 1 — COMPACT TOP NAVBAR */}
      <header className="border-b border-stone-800/80 bg-stone-900/95 backdrop-blur-md sticky top-0 z-40 px-2 sm:px-4 py-1.5 sm:py-2">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Mode Pill */}
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Maen Dam-Daman Logo"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl shadow-md shrink-0 object-contain ring-1 ring-amber-500/30"
            />
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-extrabold tracking-tight font-serif text-stone-100 hidden min-[380px]:inline">
                {t.title}
              </h1>

              {/* Match Mode Pill (Clickable -> Opens Game Mode Modal) */}
              <button
                onClick={() => setShowGameModeModal(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-stone-800/90 hover:bg-stone-700/90 active:scale-95 border border-stone-700/60 text-xs font-semibold text-amber-300 transition"
                title={lang === 'en' ? 'Change Game Mode / Difficulty' : 'Ganti Mode Permainan / Tingkat AI'}
              >
                {gameMode === 'ai' ? (
                  <>
                    <Bot size={13} className="text-amber-400" />
                    <span>vs {t[aiDifficulty]}</span>
                    {aiDifficulty === 'master' && <Crown size={11} className="text-yellow-400" />}
                  </>
                ) : gameMode === 'pvp' ? (
                  <>
                    <Users size={13} className="text-amber-400" />
                    <span>{t.pvp}</span>
                  </>
                ) : (
                  <>
                    <Globe size={13} className="text-emerald-400" />
                    <span className="font-mono text-emerald-300">{onlineConfig?.roomId || 'Online'}</span>
                  </>
                )}
                <ChevronDown size={12} className="text-stone-400" />
              </button>
            </div>
          </div>

          {/* Quick Action Utilities */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Player Profile & Hero Avatar Button */}
            <button
              onClick={() => setShowNameModal(true)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-xs font-semibold text-stone-200 border border-stone-700/60 transition group"
              title={t.playerProfile}
              aria-label="Profile"
            >
              <img
                src={getHeroById(playerAvatar).image}
                alt="Hero"
                className="w-4 h-4 rounded-md object-cover ring-1 ring-amber-500/40"
              />
              <span className="text-[11px] max-w-[65px] sm:max-w-[80px] truncate hidden min-[360px]:inline">
                {playerName || (lang === 'en' ? 'Profile' : 'Profil')}
              </span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
              className="px-2 py-1 rounded-xl bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-[11px] font-bold text-stone-300 border border-stone-700/60 flex items-center gap-1 transition"
              title="Ganti Bahasa / Switch Language"
            >
              <span>{lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-stone-300 transition border border-stone-700/60"
              title={soundEnabled ? t.soundOn : t.soundOff}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? (
                <Volume2 size={15} className="text-emerald-400" />
              ) : (
                <VolumeX size={15} className="text-stone-500" />
              )}
            </button>

            {/* Help / Tutorial */}
            <button
              onClick={() => setShowTutorial(true)}
              className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-amber-400 transition border border-stone-700/60"
              title={t.howToPlay}
              aria-label="Tutorial"
            >
              <HelpCircle size={15} />
            </button>

            {/* Match History (IndexedDB) */}
            <button
              onClick={() => setShowGameHistory(true)}
              className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-emerald-400 transition border border-stone-700/60 hidden min-[440px]:flex"
              title={t.gameHistory}
              aria-label="History"
            >
              <History size={15} />
            </button>

            {/* Global Leaderboard & Rankings */}
            <button
              onClick={() => setShowLeaderboard(true)}
              className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-yellow-400 hover:text-yellow-300 transition border border-stone-700/60"
              title={t.leaderboardTitle}
              aria-label="Leaderboard & Rankings"
            >
              <Trophy size={15} />
            </button>

            {/* Ethnomathematics */}
            <button
              onClick={() => setShowEtnomatematika(true)}
              className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-sky-400 transition border border-stone-700/60 hidden min-[440px]:flex"
              title={t.ethnomathematics}
              aria-label="Ethnomathematics"
            >
              <GraduationCap size={15} />
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 active:scale-95 text-stone-300 transition border border-stone-700/60"
              title={t.settings}
              aria-label="Settings"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container — Chess.com Mobile Sandwich Layout */}
      <main className="flex-1 max-w-xl w-full mx-auto px-2 py-1 sm:py-2 flex flex-col justify-between min-h-0 select-none overflow-hidden relative">
        {/* ZONA 2 — OPPONENT PLAYER BAR (At Top of Board) */}
        <div
          className={`px-3 py-2 rounded-2xl border transition-all flex items-center justify-between ${
            gameState.currentPlayer === 'P2'
              ? 'bg-gradient-to-r from-sky-950/70 via-stone-900 to-sky-950/50 border-sky-500 shadow-md shadow-sky-950/30'
              : 'bg-stone-900/60 border-stone-800/80 opacity-80'
          }`}
        >
          {/* Opponent Info */}
          <div className="flex items-center gap-2.5">
            {gameMode === 'pvp' ? (
              <button
                onClick={() => setShowNameModal(true)}
                className="relative group transition-transform active:scale-95 shrink-0"
                title={lang === 'en' ? 'Edit player profile & hero' : 'Ubah profil & hero pemain'}
              >
                <img
                  src={getHeroById(p2Avatar).image}
                  alt={getHeroById(p2Avatar).nameId}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-sky-400 shadow-md ring-2 ring-sky-500/30 group-hover:ring-sky-400 transition"
                />
                <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-sky-600 text-[9px] font-black text-white border border-stone-900 leading-none py-0.5">
                  P2
                </span>
              </button>
            ) : (
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 shadow transition-all shrink-0 ${
                  gameMode === 'ai' && aiDifficulty === 'master'
                    ? 'bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 border-amber-300 ring-2 ring-amber-500/40 shadow-amber-950/50'
                    : 'bg-gradient-to-br from-sky-500 to-blue-700 border-sky-300'
                }`}
              >
                <span className="font-bold text-[11px] text-white flex items-center">
                  {gameMode === 'ai' ? (
                    aiDifficulty === 'master' ? (
                      <Crown size={15} className="text-stone-950 fill-amber-300" />
                    ) : (
                      'AI'
                    )
                  ) : (
                    'P2'
                  )}
                </span>
              </div>
            )}

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-stone-100 flex items-center gap-1">
                  {gameMode === 'online' && onlineConfig
                    ? onlineConfig.myRole === 'P2'
                      ? `${playerName || t.player2} (${lang === 'en' ? 'You' : 'Anda'})`
                      : onlineConfig.opponentName
                    : gameMode === 'ai'
                    ? `AI (${t[aiDifficulty]})`
                    : (p2CustomName || t.player2)}
                </span>
                {gameMode === 'online' && (
                  <span className={`w-2 h-2 rounded-full ${isOpponentConnected ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-stone-400 font-medium">
                  {p2Count} {t.pieces}
                </span>
                {p2Captured > 0 && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: Math.min(6, p2Captured) }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-400/90 shadow-xs" />
                    ))}
                    {p2Captured > 6 && <span className="text-[8px] text-stone-500 font-mono">+{p2Captured - 6}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Turn Badge / Thinking Indicator */}
          <div>
            {gameState.currentPlayer === 'P2' ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] bg-sky-500/25 border border-sky-500/50 text-sky-300 font-bold flex items-center gap-1 animate-pulse">
                {isAiThinking ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                    <span>{t.thinking}</span>
                  </>
                ) : (
                  t.turn
                )}
              </span>
            ) : (
              <span className="text-[10px] text-stone-500 font-mono">
                {t.movePrefix}{gameState.moveHistory.length}
              </span>
            )}
          </div>
        </div>

        {/* Live Step Mini-Ticker (Non-displacing) */}
        {gameState.moveHistory.length > 0 && (() => {
          const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
          const actor =
            lastMove.player === 'P1'
              ? (playerName || t.player1)
              : gameMode === 'ai'
              ? t.playerAi
              : (p2CustomName || t.player2);
          const formatted = formatMoveDescription(
            actor,
            lastMove.fromNodeId,
            lastMove.toNodeId,
            lastMove.isCapture,
            lastMove.capturedNodeId,
            lang
          );
          return (
            <div className="flex items-center justify-between px-2.5 py-0.5 text-[10px] text-stone-400 font-medium">
              <span className="truncate">
                {lastMove.isCapture ? '⚔️' : '👣'} <strong>{actor}</strong>: {formatted}
              </span>
              {gameMode === 'online' && onlineConfig && (
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {['👋', '😂', '👏', '🔥'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onlineMatch.broadcastReaction(emoji);
                        setReactionToast({ emoji, sender: playerName || 'Saya' });
                        setTimeout(() => setReactionToast(null), 2500);
                      }}
                      className="hover:scale-125 active:scale-95 transition text-[11px]"
                      title={`Kirim ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* ZONA 3 — RESPONSIVE GAME BOARD (Centered & Auto-Fit) */}
        <div className="flex-1 flex items-center justify-center min-h-0 w-full relative overflow-hidden my-0.5">
          <Board
            gameState={gameState}
            selectedPieceId={selectedPieceId}
            legalMovesForSelected={legalMoves}
            onSelectPiece={handleSelectPiece}
            onSelectDestination={handleSelectDestination}
            boardTheme={boardTheme}
            orientation={orientation}
            onToggleOrientation={() =>
              setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')
            }
            isFlipped={isFlipped}
            onToggleFlip={() => setIsFlipped(!isFlipped)}
            boardScale={boardScale}
            onScaleChange={setBoardScale}
            showNodeLabels={showNodeLabels}
            onToggleNodeLabels={() => setShowNodeLabels(!showNodeLabels)}
            disabled={isAiThinking}
            lang={lang}
            gameMode={gameMode}
          />
        </div>

        {/* ZONA 4 — PLAYER 1 BAR (At Bottom of Board) */}
        <div
          className={`px-3 py-2 rounded-2xl border transition-all flex items-center justify-between ${
            gameState.currentPlayer === 'P1'
              ? 'bg-gradient-to-r from-orange-950/70 via-stone-900 to-orange-950/50 border-orange-500 shadow-md shadow-orange-950/30'
              : 'bg-stone-900/60 border-stone-800/80 opacity-80'
          }`}
        >
          {/* Player 1 Info */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowNameModal(true)}
              className="relative group transition-transform active:scale-95 shrink-0"
              title={lang === 'en' ? 'Edit player profile & hero' : 'Ubah profil & hero pemain'}
            >
              <img
                src={getHeroById(playerAvatar).image}
                alt={getHeroById(playerAvatar).nameId}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-orange-400 shadow-md ring-2 ring-orange-500/30 group-hover:ring-orange-400 transition"
              />
              <span className="absolute -bottom-1 -right-1 px-1 rounded-full bg-orange-600 text-[9px] font-black text-white border border-stone-900 leading-none py-0.5">
                P1
              </span>
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-stone-100">
                  {gameMode === 'online' && onlineConfig
                    ? onlineConfig.myRole === 'P1'
                      ? `${playerName || t.player1} (${lang === 'en' ? 'You' : 'Anda'})`
                      : onlineConfig.myName
                    : (playerName || t.player1)}
                </span>
                <button
                  onClick={() => setShowNameModal(true)}
                  className="p-1 text-stone-400 hover:text-amber-300 rounded-lg hover:bg-stone-800/60 transition"
                  title={lang === 'en' ? 'Edit player profile & hero' : 'Ubah profil & hero pemain'}
                >
                  <User size={12} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-amber-300/90 font-medium">
                  {lang === 'en' ? getHeroById(playerAvatar).nameEn : getHeroById(playerAvatar).nameId}
                </span>
                <span className="text-[10px] text-stone-600">•</span>
                <span className="text-[10px] text-stone-400 font-medium">
                  {p1Count} {t.pieces}
                </span>
                {p1Captured > 0 && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: Math.min(6, p1Captured) }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-sky-400/90 shadow-xs" />
                    ))}
                    {p1Captured > 6 && <span className="text-[8px] text-stone-500 font-mono">+{p1Captured - 6}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Slot: DAM Penalty Claim / Multi-jump Finish / Turn Status */}
          <div className="flex items-center gap-2">
            {/* Special Action: Claim DAM Penalty */}
            {gameState.opponentMissedCapture && rulesConfig.damPenaltyClaim && !gameState.damClaimedThisTurn && (
              <button
                onClick={handleClaimDam}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-orange-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-xs shadow-lg animate-pulse flex items-center gap-1 transition active:scale-95"
                title={t.damPenaltyDesc}
              >
                <AlertTriangle size={14} />
                <span>{t.claimDamButton} (+3)</span>
              </button>
            )}

            {/* Special Action: Multi-jump Pass */}
            {gameState.consecutivePieceId && (
              <button
                onClick={handlePassJump}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 text-white font-extrabold text-xs shadow-md transition active:scale-95 flex items-center gap-1"
              >
                <span>⚡ {t.finishJumpButton}</span>
              </button>
            )}

            {/* Standard Turn Indicator */}
            {gameState.currentPlayer === 'P1' && !gameState.opponentMissedCapture && !gameState.consecutivePieceId && (
              <span className="px-2.5 py-1 rounded-full text-[10px] bg-orange-500/25 border border-orange-500/50 text-orange-300 font-bold">
                {t.turn}
              </span>
            )}
          </div>
        </div>

        {/* ZONA 5 — BOTTOM ACTION BAR (Thumb Zone Ergonomics) */}
        <div className="grid grid-cols-4 gap-1 sm:gap-2 p-1 sm:p-1.5 bg-stone-900/95 border border-stone-800 rounded-2xl backdrop-blur-md shadow-lg text-xs mt-1">
          {/* Slot 1: Mode / Match Setup */}
          <button
            onClick={() => setShowGameModeModal(true)}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800/80 active:scale-95 transition"
            title="Pilih Mode Permainan"
          >
            <Gamepad2 size={16} className="text-amber-400" />
            <span className="text-[10px] font-bold mt-0.5">Mode</span>
          </button>

          {/* Slot 2: Undo */}
          <button
            onClick={handleUndo}
            disabled={historyStack.length === 0 || isAiThinking}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800/80 active:scale-95 transition disabled:opacity-30 disabled:pointer-events-none"
            title={t.undo}
          >
            <RotateCcw size={16} className="text-stone-300" />
            <span className="text-[10px] font-bold mt-0.5">{t.undo}</span>
          </button>

          {/* Slot 3: Moves Drawer Toggle */}
          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition active:scale-95 ${
              showHistoryDrawer
                ? 'bg-amber-600/30 text-amber-300'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/80'
            }`}
            title={t.moveHistoryTitle}
          >
            <History size={16} className="text-emerald-400" />
            <span className="text-[10px] font-bold mt-0.5">
              {t.moves} ({gameState.moveHistory.length})
            </span>
          </button>

          {/* Slot 4: Reset Match */}
          <button
            onClick={() => {
              if (window.confirm(t.resetConfirm)) {
                handleRestart();
              }
            }}
            className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 active:scale-95 transition"
            title={t.reset}
          >
            <RefreshCw size={16} />
            <span className="text-[10px] font-bold mt-0.5">{t.reset}</span>
          </button>
        </div>

        {/* Collapsible Move History Log (Floating Drawer) */}
        {showHistoryDrawer && (
          <div className="absolute bottom-16 left-2 right-2 z-40 bg-stone-900/98 border border-stone-700 rounded-2xl p-3 shadow-2xl max-h-48 overflow-y-auto space-y-1.5 text-xs backdrop-blur-md animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between font-bold text-stone-300 border-b border-stone-800 pb-1.5">
              <span className="text-amber-400">{t.moveHistoryTitle}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-500 font-mono">
                  {gameState.moveHistory.length} {t.moves}
                </span>
                <button
                  onClick={() => setShowHistoryDrawer(false)}
                  className="text-stone-400 hover:text-stone-200 px-1 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
            {gameState.moveHistory.length === 0 ? (
              <p className="text-stone-500 italic py-2 text-center">{t.noMovesYet}</p>
            ) : (
              gameState.moveHistory.map((m, idx) => {
                const actor =
                  m.player === 'P1'
                    ? (playerName || t.player1)
                    : gameMode === 'ai'
                    ? t.playerAi
                    : (p2CustomName || t.player2);
                const formatted = formatMoveDescription(
                  actor,
                  m.fromNodeId,
                  m.toNodeId,
                  m.isCapture,
                  m.capturedNodeId,
                  lang
                );
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-stone-950/60 text-stone-300 border border-stone-800/60"
                  >
                    <span className="font-mono text-stone-500 text-[10px] min-w-5">#{idx + 1}</span>
                    <span
                      className={`font-bold text-[11px] ${
                        m.player === 'P1' ? 'text-orange-400' : 'text-sky-400'
                      }`}
                    >
                      {m.player}:
                    </span>
                    <span className="flex-1 text-[11px]">{formatted}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <ModalGameMode
        isOpen={showGameModeModal}
        onClose={() => setShowGameModeModal(false)}
        gameMode={gameMode}
        onSelectMode={(mode) => {
          if (mode === 'ai') {
            setGameMode('ai');
            onlineMatch.cleanup();
            setOnlineConfig(null);
            handleRestart();
          } else if (mode === 'pvp') {
            setGameMode('pvp');
            onlineMatch.cleanup();
            setOnlineConfig(null);
            handleRestart();
          }
        }}
        aiDifficulty={aiDifficulty}
        onSelectDifficulty={(diff) => {
          setAiDifficulty(diff);
        }}
        lang={lang}
        onOpenOnlineLobby={() => setShowOnlineLobby(true)}
      />
      <ModalTutorial
        isOpen={showTutorial}
        onClose={handleCloseTutorial}
        lang={lang}
        onChangeLang={setLang}
      />
      <ModalPlayerName
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
        onSaveProfile={handleSaveProfile}
        gameMode={gameMode}
        currentP1Name={playerName}
        currentP1Avatar={playerAvatar}
        currentP2Name={p2CustomName}
        currentP2Avatar={p2Avatar}
        lang={lang}
        onChangeLang={setLang}
      />
      <ModalGameHistory
        isOpen={showGameHistory}
        onClose={() => setShowGameHistory(false)}
        lang={lang}
      />
      <ModalEtnomatematika isOpen={showEtnomatematika} onClose={() => setShowEtnomatematika(false)} lang={lang} />
      <ModalSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        rulesConfig={rulesConfig}
        onChangeRulesConfig={(newConfig) => {
          setRulesConfig(newConfig);
          handleRestart(newConfig);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        boardTheme={boardTheme}
        onChangeTheme={setBoardTheme}
        onResetGame={() => handleRestart()}
        lang={lang}
        onChangeLang={setLang}
      />
      <ModalGameOver
        isOpen={showGameOver}
        gameState={gameState}
        gameMode={gameMode}
        onPlayAgain={() => handleRestart()}
        onClose={() => setShowGameOver(false)}
        lang={lang}
        playerName={playerName || t.player1}
        opponentName={
          gameMode === 'online' && onlineConfig
            ? onlineConfig.opponentName
            : gameMode === 'ai'
            ? `AI (${t[aiDifficulty]})`
            : (p2CustomName || t.player2)
        }
        earnedPoints={lastEarnedPoints}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
      />
      <ModalLeaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        playerName={playerName || (lang === 'en' ? 'Player 1' : 'Pemain 1')}
        playerAvatar={playerAvatar}
        lang={lang}
      />
      <ModalOnlineLobby
        isOpen={showOnlineLobby}
        onClose={() => setShowOnlineLobby(false)}
        playerName={playerName || (lang === 'en' ? 'Player 1' : 'Pemain 1')}
        lang={lang}
        initialRoomCode={urlRoomCode}
        onStartOnlineGame={(cfg) => {
          setOnlineConfig(cfg);
          setGameMode('online');
          setIsOpponentConnected(true);
          if (cfg.myRole === 'P2') {
            setIsFlipped(true);
          } else {
            setIsFlipped(false);
          }
          handleRestart(rulesConfig, true);
        }}
      />
      {/* Floating Reaction Toast */}
      {reactionToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-stone-900/95 border border-amber-500/50 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-stone-100 text-xs animate-in zoom-in-95 duration-200">
          <span className="text-2xl">{reactionToast.emoji}</span>
          <div>
            <strong className="text-amber-400 block">{reactionToast.sender}</strong>
            <span className="text-[10px] text-stone-400">{lang === 'en' ? 'sent a reaction' : 'mengirim reaksi'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
