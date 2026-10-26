/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * High-performance, responsive AI Engine for Maen Dam-Daman.
 * Complies with GDD specifications:
 * - Easy: random legal move with slight capture preference
 * - Medium: 1-ply tactical evaluation (material, safety, mobility, center control)
 * - Hard: Minimax with Alpha-Beta pruning (depth 3)
 * - Master / Dewa: Hybrid Grandmaster Engine featuring:
 *   * Opening Book & Collective Master Brain lookup
 *   * Deep Alpha-Beta search with dynamic move ordering
 *   * Quiescence Search (taktik rantai pemakanan hingga stabil)
 *   * Graph Ethnomathematics Degree-8 Strategic Hub valuation
 *   * Blunder Avoidance Memory (Continuous Learning)
 *   * Transposition table caching for sub-second execution
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
import {
  lookupMasterMove,
  isKnownBlunderPosition,
  hashGameState,
} from './aiMemory';

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'master';

// Degree-8 strategic hubs defined in ethnomathematics study
const DEGREE_8_HUBS = new Set(['A1', 'Q', 'S', 'W', 'U', 'C', 'K']);

// Transposition table cache for Master AI
interface TranspositionEntry {
  depth: number;
  score: number;
  flag: 'exact' | 'lower' | 'upper';
}
const transpositionTable = new Map<string, TranspositionEntry>();

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

  // Natural brief reaction delay
  const delay =
    difficulty === 'easy'
      ? 200
      : difficulty === 'medium'
      ? 250
      : difficulty === 'hard'
      ? 300
      : 320;
  await new Promise((res) => setTimeout(res, delay));

  switch (difficulty) {
    case 'easy':
      return chooseEasyMove(legalMoves);
    case 'medium':
      return chooseMediumMove(state, legalMoves, playerId);
    case 'hard':
      return chooseHardMove(state, legalMoves, playerId);
    case 'master':
      return chooseMasterMove(state, legalMoves, playerId);
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
 * Board evaluation function for Medium and Hard
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
      if (node.degree >= 8) pieceVal += 12;
      else if (node.degree >= 5) pieceVal += 6;
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
 * Master (Dewa) Enhanced Evaluation Function
 * Evaluates material, king advancement, degree-8 hub dominance,
 * defensive formation in rear triangle (dapur), and mobility.
 */
function evaluateMasterState(state: GameState, forPlayer: PlayerId): number {
  const opponent: PlayerId = forPlayer === 'P1' ? 'P2' : 'P1';

  let myScore = 0;
  let oppScore = 0;

  for (const piece of Object.values(state.pieces)) {
    let pieceVal = 120;
    if (piece.isKing) pieceVal += 90;

    const nodeId = piece.nodeId;
    const node = BOARD_NODES[nodeId];

    if (node) {
      // Degree-8 strategic hubs control
      if (DEGREE_8_HUBS.has(nodeId)) {
        pieceVal += 26;
      } else if (node.degree >= 5) {
        pieceVal += 10;
      }

      // Center node A1 bonus
      if (nodeId === 'A1') {
        pieceVal += 32;
      }
    }

    if (piece.owner === forPlayer) {
      myScore += pieceVal;
    } else {
      oppScore += pieceVal;
    }
  }

  // Mobility & capture threats
  const myCaptures = getAllCaptureMoves(state, forPlayer);
  const oppCaptures = getAllCaptureMoves(state, opponent);

  myScore += myCaptures.length * 45;
  oppScore += oppCaptures.length * 45;

  // Total legal moves mobility bonus
  const myMoves = getAllLegalMoves(state, forPlayer);
  myScore += myMoves.length * 4;

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
 * Level "Dewa" (Master):
 * 1. Checks Opening Book & Learned Moves from Master Brain
 * 2. Deep Alpha-Beta with Dynamic Depth (Depth 4)
 * 3. Quiescence Search (Pencarian Taktis Tenang) for capture chain resolutions
 * 4. Blunder Avoidance Filter (Memori Kesalahan Masa Lalu)
 * 5. Transposition Table Memory
 */
function chooseMasterMove(
  state: GameState,
  legalMoves: Move[],
  playerId: PlayerId
): Move {
  // 1. Check Master Brain Book (Opening / Learned Openings)
  const masterBookMove = lookupMasterMove(state, legalMoves, playerId);
  if (masterBookMove) {
    return masterBookMove;
  }

  // Clear or prune transposition table if too large (> 50,000 entries)
  if (transpositionTable.size > 50000) {
    transpositionTable.clear();
  }

  let bestMove = legalMoves[0];
  let bestScore = -Infinity;
  const depth = 4;

  // Move Ordering: Captures > Degree-8 Hub destinations > Center A1 > Normal moves
  const sortedMoves = orderMovesForMaster(state, legalMoves, playerId);

  for (const move of sortedMoves) {
    try {
      const nextState = applyMove(state, move, true);
      const nextHash = hashGameState(nextState);

      // Check blunder memory penalty
      const blunderPenalty = isKnownBlunderPosition(nextHash) ? -300 : 0;

      const score =
        minimaxMaster(nextState, depth - 1, -Infinity, Infinity, false, playerId) +
        blunderPenalty;

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
 * Move Ordering function to maximize Alpha-Beta cutoffs for Master AI
 */
function orderMovesForMaster(state: GameState, moves: Move[], playerId: PlayerId): Move[] {
  return [...moves].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.isCapture) scoreA += 100;
    if (b.isCapture) scoreB += 100;

    if (a.promotedToKing) scoreA += 80;
    if (b.promotedToKing) scoreB += 80;

    if (a.toNodeId === 'A1') scoreA += 35;
    if (b.toNodeId === 'A1') scoreB += 35;

    if (DEGREE_8_HUBS.has(a.toNodeId)) scoreA += 25;
    if (DEGREE_8_HUBS.has(b.toNodeId)) scoreB += 25;

    return scoreB - scoreA;
  });
}

/**
 * Quiescence Search:
 * Extends the search strictly for capture sequences to prevent the Horizon Effect.
 */
function quiescenceSearch(
  state: GameState,
  alpha: number,
  beta: number,
  aiPlayer: PlayerId,
  maxQDepth: number = 3
): number {
  const standPat = evaluateMasterState(state, aiPlayer);

  if (maxQDepth <= 0) return standPat;
  if (standPat >= beta) return beta;
  if (alpha < standPat) alpha = standPat;

  const currentPlayer = state.currentPlayer;
  const captureMoves = getAllCaptureMoves(state, currentPlayer);
  if (captureMoves.length === 0) return standPat;

  for (const move of captureMoves) {
    try {
      const nextState = applyMove(state, move, true);
      const score = -quiescenceSearch(
        nextState,
        -beta,
        -alpha,
        aiPlayer,
        maxQDepth - 1
      );

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    } catch {
      continue;
    }
  }

  return alpha;
}

/**
 * Recursive Minimax with Alpha-Beta & Transposition Table for Master AI
 */
function minimaxMaster(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: PlayerId
): number {
  const stateHash = hashGameState(state);
  const cached = transpositionTable.get(stateHash);
  if (cached && cached.depth >= depth) {
    return cached.score;
  }

  const win = detectWinner(state);
  if (win.isGameOver) {
    if (win.winner === aiPlayer) return 15000 + depth;
    if (win.winner !== null) return -15000 - depth;
    return 0;
  }

  // Terminal leaf reached: enter Quiescence Search
  if (depth <= 0) {
    const qScore = quiescenceSearch(state, alpha, beta, aiPlayer, 3);
    transpositionTable.set(stateHash, { depth, score: qScore, flag: 'exact' });
    return qScore;
  }

  const currentPlayer = state.currentPlayer;
  const legalMoves = getAllLegalMoves(state, currentPlayer);

  if (legalMoves.length === 0) {
    return isMaximizing ? -12000 : 12000;
  }

  const sortedMoves = orderMovesForMaster(state, legalMoves, currentPlayer);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of sortedMoves) {
      try {
        const nextState = applyMove(state, move, true);
        const evalScore = minimaxMaster(nextState, depth - 1, alpha, beta, false, aiPlayer);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break; // Beta cut-off
      } catch {
        continue;
      }
    }
    transpositionTable.set(stateHash, { depth, score: maxEval, flag: 'exact' });
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of sortedMoves) {
      try {
        const nextState = applyMove(state, move, true);
        const evalScore = minimaxMaster(nextState, depth - 1, alpha, beta, true, aiPlayer);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break; // Alpha cut-off
      } catch {
        continue;
      }
    }
    transpositionTable.set(stateHash, { depth, score: minEval, flag: 'exact' });
    return minEval;
  }
}

/**
 * Standard Recursive Minimax for Hard mode
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
