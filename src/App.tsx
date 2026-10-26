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
} from 'lucide-react';
import { Language, translations, formatMoveDescription } from './i18n';
import { ModalPlayerName } from './components/ModalPlayerName';
import { ModalGameHistory } from './components/ModalGameHistory';
import { ModalOnlineLobby } from './components/ModalOnlineLobby';
import {
  saveGameHistory,
  formatDDMMYYYY,
  formatDisplayDate,
  formatTime,
} from './game/db';
import { initMasterBrain, learnFromFinishedMatch } from './game/aiMemory';
import { onlineMatch, OnlineMatchConfig } from './game/onlineMatch';

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

  // Player Name State
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem('damdaman_player_name') || '';
    } catch {}
    return '';
  });
  const [p2CustomName, setP2CustomName] = useState<string>('');

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
      handleRestart();
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

  const handleSaveName = (p1: string, p2?: string) => {
    setPlayerName(p1);
    try {
      localStorage.setItem('damdaman_player_name', p1);
    } catch {}
    if (p2) setP2CustomName(p2);
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
      {/* Top Navigation Bar */}
      <header className="border-b border-stone-800/80 bg-stone-900/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-md shadow-orange-950/40">
              <span className="font-serif text-base sm:text-lg">D</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight font-serif text-stone-100">
                {t.title}
              </h1>
              <p className="text-[10px] sm:text-xs text-amber-400 font-medium">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Action Navigation & Language Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Selector Pill */}
            <div className="flex bg-stone-900 border border-stone-700/80 rounded-xl p-0.5 text-xs shadow-inner">
              <button
                onClick={() => setLang('id')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  lang === 'id'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Bahasa Indonesia (Default)"
              >
                <span>🇮🇩</span>
                <span>ID</span>
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  lang === 'en'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="English (International)"
              >
                <span>🇬🇧</span>
                <span>EN</span>
              </button>
            </div>

            <button
              onClick={() => setShowTutorial(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-800/90 hover:bg-stone-700 active:scale-95 text-stone-200 transition border border-stone-700/60"
              title={t.howToPlay}
            >
              <HelpCircle size={14} className="text-amber-400" />
              <span className="hidden sm:inline">{t.howToPlay}</span>
            </button>

            <button
              onClick={() => setShowGameHistory(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-800/90 hover:bg-stone-700 active:scale-95 text-stone-200 transition border border-stone-700/60"
              title={t.gameHistory}
            >
              <History size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">{t.gameHistory}</span>
            </button>

            <button
              onClick={() => setShowEtnomatematika(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-800/90 hover:bg-stone-700 active:scale-95 text-stone-200 transition border border-stone-700/60"
              title={t.ethnomathematics}
            >
              <GraduationCap size={14} className="text-sky-400" />
              <span className="hidden sm:inline">{t.ethnomathematics}</span>
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold bg-stone-800/90 hover:bg-stone-700 active:scale-95 text-stone-200 transition border border-stone-700/60 flex items-center gap-1"
              title={t.settings}
            >
              <Settings size={14} className="text-stone-400" />
              <span className="hidden sm:inline">{t.settings}</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-xs font-semibold bg-stone-800/90 hover:bg-stone-700 active:scale-95 text-stone-300 transition border border-stone-700/60"
              title={soundEnabled ? t.soundOn : t.soundOff}
              aria-label="Toggle Sound"
            >
              {soundEnabled ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} className="text-stone-500" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-2 sm:p-3 flex flex-col gap-2">
        {/* Game Mode & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5">
            <div className="flex bg-stone-900 border border-stone-800 rounded-xl p-0.5 text-xs shadow-inner">
              <button
                onClick={() => {
                  setGameMode('ai');
                  onlineMatch.cleanup();
                  setOnlineConfig(null);
                  handleRestart();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition text-xs ${
                  gameMode === 'ai'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Bot size={13} />
                {t.vsAi}
              </button>
              <button
                onClick={() => {
                  setGameMode('pvp');
                  onlineMatch.cleanup();
                  setOnlineConfig(null);
                  handleRestart();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition text-xs ${
                  gameMode === 'pvp'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Users size={13} />
                {t.pvp}
              </button>
              <button
                onClick={() => {
                  setShowOnlineLobby(true);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition text-xs ${
                  gameMode === 'online'
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Globe size={13} />
                {t.online}
              </button>
            </div>

            {/* Online Room Info & Reaction Emojis */}
            {gameMode === 'online' && onlineConfig && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1 text-xs">
                  <span className="font-mono text-amber-400 font-bold">{onlineConfig.roomId}</span>
                  <span className="text-stone-600">•</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <span className={`w-2 h-2 rounded-full ${isOpponentConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    <span className={isOpponentConnected ? 'text-emerald-300 font-medium' : 'text-rose-300'}>
                      {isOpponentConnected
                        ? (lang === 'en' ? 'Online' : 'Terhubung')
                        : (lang === 'en' ? 'Offline' : 'Terputus')}
                    </span>
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-xl px-1.5 py-0.5">
                  {['👋', '😂', '👏', '👑', '🔥', '☕'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onlineMatch.broadcastReaction(emoji);
                        setReactionToast({ emoji, sender: playerName || 'Saya' });
                        setTimeout(() => setReactionToast(null), 2500);
                      }}
                      className="hover:scale-125 active:scale-95 transition text-xs p-1"
                      title={`Kirim ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gameMode === 'ai' && (
              <div className="flex items-center gap-0.5 bg-stone-900 border border-stone-800 rounded-xl px-1.5 py-0.5 text-xs">
                {(['easy', 'medium', 'hard', 'master'] as AIDifficulty[]).map((level) => {
                  const isSelected = aiDifficulty === level;
                  const isMaster = level === 'master';
                  return (
                    <button
                      key={level}
                      onClick={() => setAiDifficulty(level)}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition flex items-center gap-0.5 ${
                        isSelected
                          ? isMaster
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-950 font-black shadow-xs'
                            : 'bg-stone-700 text-amber-300 font-bold'
                          : isMaster
                          ? 'text-amber-400/80 hover:text-amber-300'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                      title={isMaster ? 'Level Dewa: Grandmaster AI + Continuous Learning' : undefined}
                    >
                      {isMaster && <Crown size={11} className={isSelected ? 'text-stone-950' : 'text-amber-400'} />}
                      <span>{t[level]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Controls: Undo & Reset */}
          <div className="flex items-center gap-1.5 text-xs">
            {historyStack.length > 0 && (
              <button
                onClick={handleUndo}
                disabled={isAiThinking}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition active:scale-95 disabled:opacity-40"
              >
                <RotateCcw size={13} />
                <span>{t.undo}</span>
              </button>
            )}

            <button
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition active:scale-95"
            >
              <History size={13} />
              <span>{t.moves} ({gameState.moveHistory.length})</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(t.resetConfirm)) {
                  handleRestart();
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-rose-400 hover:text-rose-300 transition active:scale-95 font-medium"
            >
              {t.reset}
            </button>
          </div>
        </div>

        {/* Player Turn Cards */}
        <div className="grid grid-cols-2 gap-2 items-stretch">
          {/* Player 1 Card (At bottom on board) */}
          <div
            className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between ${
              gameState.currentPlayer === 'P1'
                ? 'bg-gradient-to-r from-orange-950/60 to-stone-900 border-orange-500/80 shadow-md shadow-orange-950/20'
                : 'bg-stone-900/50 border-stone-800/80 opacity-70'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-700 flex items-center justify-center border-2 border-orange-300 shadow">
                <span className="font-bold text-[11px] text-white">P1</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-stone-100">
                    {gameMode === 'online' && onlineConfig
                      ? onlineConfig.myRole === 'P1'
                        ? `${playerName || t.player1} (${lang === 'en' ? 'You' : 'Anda'})`
                        : onlineConfig.myName
                      : (playerName || t.player1)}
                  </span>
                  <button
                    onClick={() => setShowNameModal(true)}
                    className="p-0.5 text-stone-400 hover:text-amber-300 rounded transition"
                    title={lang === 'en' ? 'Edit player name' : 'Ubah nama pemain'}
                  >
                    <User size={11} />
                  </button>
                  {gameState.currentPlayer === 'P1' && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-orange-500/30 text-orange-300 font-bold">
                      {t.turn}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-stone-400">
                    {p1Count} {t.pieces} • {p1Captured} {t.captured}
                  </span>
                  {p1Captured > 0 && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: Math.min(6, p1Captured) }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-sky-400/80 shadow-xs" />
                      ))}
                      {p1Captured > 6 && <span className="text-[8px] text-stone-500 font-mono">+{p1Captured - 6}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Player 2 Card (At top on board) */}
          <div
            className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between ${
              gameState.currentPlayer === 'P2'
                ? 'bg-gradient-to-l from-sky-950/60 to-stone-900 border-sky-500/80 shadow-md shadow-sky-950/20'
                : 'bg-stone-900/50 border-stone-800/80 opacity-70'
            }`}
          >
            <div className="flex items-center gap-2 flex-row-reverse text-right w-full justify-between">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow transition-all ${
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
              <div>
                <div className="flex items-center gap-1 justify-end">
                  {gameState.currentPlayer === 'P2' && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-sky-500/30 text-sky-300 font-bold">
                      {isAiThinking ? t.thinking : t.turn}
                    </span>
                  )}
                  <span className="font-bold text-xs text-stone-100 flex items-center gap-1">
                    {gameMode === 'online' && onlineConfig
                      ? onlineConfig.myRole === 'P2'
                        ? `${playerName || t.player2} (${lang === 'en' ? 'You' : 'Anda'})`
                        : onlineConfig.opponentName
                      : gameMode === 'ai'
                      ? `AI (${t[aiDifficulty]})`
                      : (p2CustomName || t.player2)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 justify-end mt-0.5">
                  {p2Captured > 0 && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: Math.min(6, p2Captured) }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-400/80 shadow-xs" />
                      ))}
                      {p2Captured > 6 && <span className="text-[8px] text-stone-500 font-mono">+{p2Captured - 6}</span>}
                    </div>
                  )}
                  <span className="text-[10px] text-stone-400">
                    {p2Count} {t.pieces} • {p2Captured} {t.captured}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Step & Capture Notification Banner */}
        {gameState.moveHistory.length > 0 && (() => {
          const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
          const actor = lastMove.player === 'P1'
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
            <div
              className={`px-3 py-1.5 rounded-xl text-xs flex items-center justify-between border transition-all ${
                lastMove.isCapture
                  ? 'bg-rose-950/40 border-rose-600/40 text-rose-200'
                  : 'bg-stone-900/60 border-stone-800 text-stone-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-sm">
                  {lastMove.isCapture ? '⚔️' : '👣'}
                </span>
                <span>
                  <strong>{actor}</strong>: {formatted}
                </span>
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {t.movePrefix}{gameState.moveHistory.length}
              </span>
            </div>
          );
        })()}

        {/* Special Action Alert: DAM Penalty Claim (Only if enabled in settings) */}
        {gameState.opponentMissedCapture && rulesConfig.damPenaltyClaim && !gameState.damClaimedThisTurn && (
          <div className="bg-gradient-to-r from-rose-950/70 via-amber-950/60 to-stone-900 border border-amber-500/70 p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-amber-400 shrink-0" size={16} />
              <div className="text-xs">
                <strong className="text-amber-300">{t.damPenaltyTitle}</strong>{' '}
                <span className="text-stone-300">{t.damPenaltyDesc}</span>
              </div>
            </div>
            <button
              onClick={handleClaimDam}
              className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 text-white shadow transition active:scale-95"
            >
              {t.claimDamButton}
            </button>
          </div>
        )}

        {/* Multi-jump Notice */}
        {gameState.consecutivePieceId && (
          <div className="bg-sky-950/90 border border-sky-500/80 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="text-xs text-sky-200">
              <strong className="text-amber-300 block text-sm">{t.multiJumpTitle}</strong>
              <span className="text-stone-300">{t.multiJumpDesc}</span>
            </div>
            <button
              onClick={handlePassJump}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 text-white shadow-md transition active:scale-95 shrink-0"
            >
              {t.finishJumpButton}
            </button>
          </div>
        )}

        {/* Dynamic Scalable Board with Portrait Default */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
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

        {/* Collapsible Move History Log */}
        {showHistoryDrawer && (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-3 shadow-xl max-h-40 overflow-y-auto space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-bold text-stone-400 border-b border-stone-800 pb-1">
              <span>{t.moveHistoryTitle}</span>
              <span>{gameState.moveHistory.length} {t.moves}</span>
            </div>
            {gameState.moveHistory.length === 0 ? (
              <p className="text-stone-500 italic py-1">{t.noMovesYet}</p>
            ) : (
              gameState.moveHistory.map((m, idx) => {
                const actor = m.player === 'P1'
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
                    className="flex items-center gap-2 p-1 rounded bg-stone-950/50 text-stone-300"
                  >
                    <span className="font-mono text-stone-500 text-[10px]">#{idx + 1}</span>
                    <span
                      className={`font-bold ${
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
      <ModalTutorial isOpen={showTutorial} onClose={handleCloseTutorial} lang={lang} />
      <ModalPlayerName
        isOpen={showNameModal}
        onSaveName={handleSaveName}
        gameMode={gameMode}
        currentP1Name={playerName}
        currentP2Name={p2CustomName}
        lang={lang}
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
