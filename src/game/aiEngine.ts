/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * High-performance, responsive AI Engine for Maen Dam-Daman.
 * Complies with GDD specifications:
 * - Easy: random legal move with slight capture preference
 * - Medium: 1-ply tactical evaluation (material, safety, mobility, center control)
 * - Hard: Minimax with Alpha-Beta pruning (depth 3)
 * - Fast & non-blocking execution with natural 250-350ms thinking cadence.
 */

import { BOARD_NODES } from './boardData';
import {
  applyMove,
  detectWinner,
  getAllCaptureMoves,
  getAllLegalMoves,
  GameState,
  Move,
  PlayerId,
} from './rulesEngine';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Main AI entry point with natural slight delay for realism
 */
export async function getAIMove(
  state: GameState,
  playerId: PlayerId,
  difficulty: AIDifficulty
): Promise<Move | null> {
  const legalMoves = getAllLegalMoves(state, playerId);
  if (legalMoves.length === 0) return null;

  // Natural brief reaction delay (200-300ms)
  const delay = difficulty === 'easy' ? 220 : difficulty === 'medium' ? 280 : 320;
  await new Promise((res) => setTimeout(res, delay));

  switch (difficulty) {
    case 'easy':
      return chooseEasyMove(legalMoves);
    case 'medium':
      return chooseMediumMove(state, legalMoves, playerId);
    case 'hard':
      return chooseHardMove(state, legalMoves, playerId);
  }
}

/**
 * Easy: Random with mild preference for captures
 */
function chooseEasyMove(legalMoves: Move[]): Move {
  const captures = legalMoves.filter((m) => m.isCapture);
  if (captures.length > 0 && Math.random() < 0.7) {
    return captures[Math.floor(Math.random() * captures.length)];
  }
  return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

/**
 * Board evaluation function
 */
function evaluateState(state: GameState, forPlayer: PlayerId): number {
  const opponent: PlayerId = forPlayer === 'P1' ? 'P2' : 'P1';

  let myScore = 0;
  let oppScore = 0;

  for (const piece of Object.values(state.pieces)) {
    let pieceVal = 100;
    if (piece.isKing) pieceVal += 60;

    const node = BOARD_NODES[piece.nodeId];
    if (node) {
      if (node.degree >= 8) pieceVal += 8;
      else if (node.degree >= 5) pieceVal += 4;
    }

    if (piece.owner === forPlayer) {
      myScore += pieceVal;
    } else {
      oppScore += pieceVal;
    }
  }

  // Captures available bonus
  const myCaptures = getAllCaptureMoves(state, forPlayer);
  myScore += myCaptures.length * 20;

  return myScore - oppScore;
}

/**
 * Medium: 1-ply tactical search with danger evasion
 */
function chooseMediumMove(
  state: GameState,
  legalMoves: Move[],
  playerId: PlayerId
): Move {
  let bestMove = legalMoves[0];
  let bestScore = -Infinity;

  const opponent: PlayerId = playerId === 'P1' ? 'P2' : 'P1';

  for (const move of legalMoves) {
    let moveScore = 0;
    if (move.isCapture) moveScore += 60;

    try {
      const nextState = applyMove(state, move, true);
      const evalScore = evaluateState(nextState, playerId);
      moveScore += evalScore;

      // Check if this move places the piece in immediate jeopardy
      const oppCaptures = getAllCaptureMoves(nextState, opponent);
      const landsInDanger = oppCaptures.some((m) => m.capturedPieceId === move.pieceId);
      if (landsInDanger) {
        moveScore -= 50;
      }
    } catch {
      continue;
    }

    moveScore += (Math.random() - 0.5) * 6;

    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMove = move;
    }
  }

  return bestMove;
}

/**
 * Hard: Minimax with Alpha-Beta pruning (Depth 3)
 */
function chooseHardMove(
  state: GameState,
  legalMoves: Move[],
  playerId: PlayerId
): Move {
  let bestMove = legalMoves[0];
  let bestScore = -Infinity;
  const depth = 3;

  // Move ordering: captures first to improve alpha-beta cutoff
  const sortedMoves = [...legalMoves].sort((a, b) => {
    if (a.isCapture && !b.isCapture) return -1;
    if (!a.isCapture && b.isCapture) return 1;
    return 0;
  });

  for (const move of sortedMoves) {
    try {
      const nextState = applyMove(state, move, true);
      const score = minimax(nextState, depth - 1, -Infinity, Infinity, false, playerId);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } catch {
      continue;
    }
  }

  return bestMove;
}

/**
 * Recursive Minimax with Alpha-Beta
 */
function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: PlayerId
): number {
  const win = detectWinner(state);
  if (win.isGameOver) {
    if (win.winner === aiPlayer) return 10000 + depth;
    if (win.winner !== null) return -10000 - depth;
    return 0;
  }

  if (depth === 0) {
    return evaluateState(state, aiPlayer);
  }

  const currentPlayer = state.currentPlayer;
  const legalMoves = getAllLegalMoves(state, currentPlayer);

  if (legalMoves.length === 0) {
    return isMaximizing ? -9000 : 9000;
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      try {
        const nextState = applyMove(state, move, true);
        const evalScore = minimax(nextState, depth - 1, alpha, beta, false, aiPlayer);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      } catch {
        continue;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of legalMoves) {
      try {
        const nextState = applyMove(state, move, true);
        const evalScore = minimax(nextState, depth - 1, alpha, beta, true, aiPlayer);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      } catch {
        continue;
      }
    }
    return minEval;
  }
}
