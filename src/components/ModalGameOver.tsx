/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Game Over & Victory Summary Modal for Maen Dam-Daman.
 * Supports bilingual (ID & EN).
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Eye, Award } from 'lucide-react';
import { GameState } from '../game/rulesEngine';
import { Language, translations } from '../i18n';

interface ModalGameOverProps {
  isOpen: boolean;
  gameState: GameState;
  gameMode: 'ai' | 'pvp';
  onPlayAgain: () => void;
  onClose: () => void;
  lang?: Language;
}

export const ModalGameOver: React.FC<ModalGameOverProps> = ({
  isOpen,
  gameState,
  gameMode,
  onPlayAgain,
  onClose,
  lang = 'id',
}) => {
  useEffect(() => {
    if (isOpen && gameState.gameStatus === 'won') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ea580c', '#38bdf8', '#fbbf24', '#22c55e'],
        });
      } catch {}
    }
  }, [isOpen, gameState.gameStatus]);

  if (!isOpen) return null;
  const t = translations[lang];

  const isWon = gameState.gameStatus === 'won';
  const isDraw = gameState.gameStatus === 'draw';
  const winner = gameState.winner;

  // Title in appropriate language
  let title = t.gameOverTitle;

  if (isWon) {
    if (gameMode === 'ai') {
      title = winner === 'P1' ? t.youWin : t.aiWins;
    } else {
      title = winner === 'P1' ? t.p1Wins : t.p2Wins;
    }
  } else if (isDraw) {
    title = t.drawGame;
  }

  // Reason translation fallback
  let reason = gameState.winReason || t.matchFinished;
  if (lang === 'en') {
    if (reason.includes('Seluruh bidak Pemain 1 telah habis')) {
      reason = 'All Player 1 pieces have been captured.';
    } else if (reason.includes('Seluruh bidak Pemain 2 telah habis')) {
      reason = 'All Player 2 pieces have been captured.';
    } else if (reason.includes('Kebuntuan')) {
      reason = 'Stalemate! The active player has no legal moves remaining.';
    } else if (reason.includes('giliran tanpa pemakanan')) {
      reason = 'Draw: Move limit reached without any piece capture.';
    } else if (reason.includes('Posisi papan yang sama berulang')) {
      reason = 'Draw: Threefold repetition of the same board position.';
    }
  }

  const p1Remaining = Object.values(gameState.pieces).filter(p => p.owner === 'P1').length;
  const p2Remaining = Object.values(gameState.pieces).filter(p => p.owner === 'P2').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-700 rounded-3xl shadow-2xl overflow-hidden p-6 text-center space-y-5">
        {/* Trophy / Result Icon */}
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-stone-800 border-2 border-amber-500/40 shadow-inner">
          {isWon ? (
            <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          ) : (
            <Award className="w-8 h-8 text-stone-400" />
          )}
        </div>

        {/* Title and Reason */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-extrabold text-stone-100 tracking-tight font-serif">
            {title}
          </h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
            {reason}
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="p-3 bg-stone-950/70 border border-orange-950/60 rounded-2xl">
            <span className="text-[11px] text-stone-400 block">{t.player1}</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-mono font-bold text-orange-400">{p1Remaining}</span>
              <span className="text-[10px] text-stone-500">{t.remainingPieces}</span>
            </div>
          </div>

          <div className="p-3 bg-stone-950/70 border border-sky-950/60 rounded-2xl">
            <span className="text-[11px] text-stone-400 block">
              {gameMode === 'ai' ? t.playerAi : t.player2}
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-mono font-bold text-sky-400">{p2Remaining}</span>
              <span className="text-[10px] text-stone-500">{t.remainingPieces}</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-stone-400 bg-stone-950/40 py-2 px-3 rounded-xl border border-stone-800/60 flex items-center justify-between">
          <span>{lang === 'en' ? 'Total Moves Played:' : 'Total Langkah Dimainkan:'}</span>
          <span className="font-mono text-stone-200 font-bold">{gameState.moveHistory.length}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-amber-900/30 transition"
          >
            <RefreshCw size={16} />
            {t.playAgain}
          </button>
          
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300 font-semibold text-xs border border-stone-700 transition"
          >
            <Eye size={15} />
            {lang === 'en' ? 'Inspect Board' : 'Lihat Papan'}
          </button>
        </div>
      </div>
    </div>
  );
};
