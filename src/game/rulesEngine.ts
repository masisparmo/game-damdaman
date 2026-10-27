/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Rules Engine for Maen Dam-Daman.
 * Pure, deterministic functions for move validation, execution, captures,
 * DAM penalty, Raja variations, and win/draw detection.
 */

import {
  ADJACENCY_MAP,
  BOARD_NODES,
  COLLINEAR_JUMPS,
  INITIAL_PIECES_P1,
  INITIAL_PIECES_P2
} from './boardData';

export type PlayerId = 'P1' | 'P2';

export interface Piece {
  id: string;
  owner: PlayerId;
  nodeId: string;
  isKing: boolean;
}

export interface Move {
  pieceId: string;
  fromNodeId: string;
  toNodeId: string;
  isCapture: boolean;
  capturedPieceId?: string;
  capturedNodeId?: string;
  promotedToKing?: boolean;
}

export interface MoveRecord extends Move {
  timestamp: number;
  player: PlayerId;
  description: string;
}

export interface RulesConfig {
  multiCapture: boolean;       // Enable consecutive jumping (default: true)
  kingEnabled: boolean;        // Raja variation (default: false per GDD)
  damPenaltyClaim: boolean;    // "Dam ora mangan" penalty claim (default: true)
  forcedCapture: boolean;      // Forced capture rule like checkers (default: false)
  maxHalfMovesNoCapture: number; // For draw prevention (default: 40)
}

export const DEFAULT_RULES_CONFIG: RulesConfig = {
  multiCapture: true,
  kingEnabled: true, // Variasi Bidak Raja aktif secara default
  damPenaltyClaim: true, // Aturan sakral Pinalti "DAM" (Dam Ora Mangan) AKTIF secara default
  forcedCapture: false,
  maxHalfMovesNoCapture: 40,
};

export interface GameState {
  pieces: Record<string, Piece>;
  nodeOccupancy: Record<string, string | null>; // nodeId -> pieceId
  currentPlayer: PlayerId;
  gameStatus: 'ready' | 'playing' | 'won' | 'draw';
  winner: PlayerId | null;
  winReason: string;
  consecutivePieceId: string | null; // locked to this piece if another jump must be taken
  halfMovesWithoutCapture: number;
  moveHistory: MoveRecord[];
  rulesConfig: RulesConfig;
  positionCounts: Record<string, number>;
  // DAM / DAS penalty tracking:
  opponentMissedCapture: boolean; // True if player who just moved skipped an available capture
  damClaimedThisTurn: boolean;
}

/**
 * Creates a fresh initial game state
 */
export function createInitialState(customConfig?: Partial<RulesConfig>): GameState {
  const config = { ...DEFAULT_RULES_CONFIG, ...customConfig };
  const pieces: Record<string, Piece> = {};
  const nodeOccupancy: Record<string, string | null> = {};

  // Initialize all 37 nodes as empty
  Object.keys(BOARD_NODES).forEach((nodeId) => {
    nodeOccupancy[nodeId] = null;
  });

  // Player 1 Pieces (16)
  INITIAL_PIECES_P1.forEach((nodeId, idx) => {
    const id = `P1_${idx}`;
    pieces[id] = { id, owner: 'P1', nodeId, isKing: false };
    nodeOccupancy[nodeId] = id;
  });

  // Player 2 Pieces (16)
  INITIAL_PIECES_P2.forEach((nodeId, idx) => {
    const id = `P2_${idx}`;
    pieces[id] = { id, owner: 'P2', nodeId, isKing: false };
    nodeOccupancy[nodeId] = id;
  });

  const state: GameState = {
    pieces,
    nodeOccupancy,
    currentPlayer: 'P1',
    gameStatus: 'playing',
    winner: null,
    winReason: '',
    consecutivePieceId: null,
    halfMovesWithoutCapture: 0,
    moveHistory: [],
    rulesConfig: config,
    positionCounts: {},
    opponentMissedCapture: false,
    damClaimedThisTurn: false,
  };

  const key = getPositionKey(state);
  state.positionCounts[key] = 1;
  return state;
}

/**
 * Returns a compact string key representing piece layout and current turn
 */
export function getPositionKey(state: GameState): string {
  const p1Nodes = Object.values(state.pieces)
    .filter(p => p.owner === 'P1')
    .map(p => p.nodeId + (p.isKing ? 'K' : ''))
    .sort()
    .join(',');
  const p2Nodes = Object.values(state.pieces)
    .filter(p => p.owner === 'P2')
    .map(p => p.nodeId + (p.isKing ? 'K' : ''))
    .sort()
    .join(',');
  return `${state.currentPlayer}|P1:${p1Nodes}|P2:${p2Nodes}`;
}

/**
 * Get all available capture jumps for a specific piece
 */
export function getCaptureMoves(state: GameState, pieceId: string): Move[] {
  const piece = state.pieces[pieceId];
  if (!piece) return [];
  const from = piece.nodeId;
  const moves: Move[] = [];
  const opponent = piece.owner === 'P1' ? 'P2' : 'P1';

  // Find all collinear jump paths where `from` matches
  COLLINEAR_JUMPS.forEach((path) => {
    if (path.from === from) {
      const overOccupantId = state.nodeOccupancy[path.over];
      const toOccupantId = state.nodeOccupancy[path.to];

      // Must jump over opponent piece and land on empty node
      if (overOccupantId && toOccupantId === null) {
        const overPiece = state.pieces[overOccupantId];
        if (overPiece && overPiece.owner === opponent) {
          // Check promotion
          const willPromote = state.rulesConfig.kingEnabled && !piece.isKing &&
            ((piece.owner === 'P1' && BOARD_NODES[path.to]?.isKingZoneP1) ||
             (piece.owner === 'P2' && BOARD_NODES[path.to]?.isKingZoneP2));

          moves.push({
            pieceId,
            fromNodeId: from,
            toNodeId: path.to,
            isCapture: true,
            capturedPieceId: overOccupantId,
            capturedNodeId: path.over,
            promotedToKing: willPromote,
          });
        }
      }
    }
  });

  return moves;
}

/**
 * Get regular (non-capture) adjacent slide moves for a piece
 */
export function getRegularMoves(state: GameState, pieceId: string): Move[] {
  const piece = state.pieces[pieceId];
  if (!piece) return [];
  const from = piece.nodeId;
  const neighbors = ADJACENCY_MAP[from] || [];
  const moves: Move[] = [];

  neighbors.forEach((to) => {
    // Target node must be empty
    if (state.nodeOccupancy[to] === null) {
      const willPromote = state.rulesConfig.kingEnabled && !piece.isKing &&
        ((piece.owner === 'P1' && BOARD_NODES[to]?.isKingZoneP1) ||
         (piece.owner === 'P2' && BOARD_NODES[to]?.isKingZoneP2));

      moves.push({
        pieceId,
        fromNodeId: from,
        toNodeId: to,
        isCapture: false,
        promotedToKing: willPromote,
      });
    }
  });

  return moves;
}

/**
 * Get all legal moves for a specific piece
 */
export function getLegalMoves(state: GameState, pieceId: string): Move[] {
  const piece = state.pieces[pieceId];
  if (!piece || piece.owner !== state.currentPlayer) return [];

  // If in consecutive jump phase, ONLY the piece currently jumping can move, and ONLY capture moves
  if (state.consecutivePieceId) {
    if (pieceId !== state.consecutivePieceId) return [];
    return getCaptureMoves(state, pieceId);
  }

  const captures = getCaptureMoves(state, pieceId);

  // If forced capture is configured ON, and any piece of the player has a capture:
  if (state.rulesConfig.forcedCapture) {
    const allCaptures = getAllCaptureMoves(state, state.currentPlayer);
    if (allCaptures.length > 0) {
      return captures; // Must choose capture
    }
  }

  // Otherwise, captures + regular slides are legal
  const regulars = getRegularMoves(state, pieceId);
  return [...captures, ...regulars];
}

/**
 * Get all capture moves for a player
 */
export function getAllCaptureMoves(state: GameState, playerId: PlayerId): Move[] {
  const moves: Move[] = [];
  Object.values(state.pieces).forEach((piece) => {
    if (piece.owner === playerId) {
      moves.push(...getCaptureMoves(state, piece.id));
    }
  });
  return moves;
}

/**
 * Get all legal moves across all pieces of a player
 */
export function getAllLegalMoves(state: GameState, playerId: PlayerId): Move[] {
  if (state.currentPlayer !== playerId) return [];

  // If multi-jump is in progress
  if (state.consecutivePieceId) {
    return getCaptureMoves(state, state.consecutivePieceId);
  }

  // Forced capture check
  if (state.rulesConfig.forcedCapture) {
    const captures = getAllCaptureMoves(state, playerId);
    if (captures.length > 0) return captures;
  }

  const allMoves: Move[] = [];
  Object.values(state.pieces).forEach((piece) => {
    if (piece.owner === playerId) {
      allMoves.push(...getLegalMoves(state, piece.id));
    }
  });
  return allMoves;
}

/**
 * Validates whether a move is legal
 */
export function validateMove(state: GameState, move: Move): boolean {
  if (state.gameStatus !== 'playing') return false;
  const legalMoves = getLegalMoves(state, move.pieceId);
  return legalMoves.some(
    m => m.fromNodeId === move.fromNodeId && m.toNodeId === move.toNodeId && m.isCapture === move.isCapture
  );
}

/**
 * Apply a move to produce a new GameState (immutable)
 */
export function applyMove(prevState: GameState, move: Move, skipValidation: boolean = false): GameState {
  if (!skipValidation && !validateMove(prevState, move)) {
    console.warn(`Peringatan: Gerakan ilegal dari ${move.fromNodeId} ke ${move.toNodeId} diabaikan.`);
    return prevState;
  }

  const state: GameState = {
    ...prevState,
    pieces: { ...prevState.pieces },
    nodeOccupancy: { ...prevState.nodeOccupancy },
    positionCounts: { ...prevState.positionCounts },
    moveHistory: [...prevState.moveHistory],
  };

  const piece = { ...state.pieces[move.pieceId] };
  const player = piece.owner;
  const opponent: PlayerId = player === 'P1' ? 'P2' : 'P1';

  // Check if player had capture moves available BEFORE making a non-capture move
  // Used for traditional DAM penalty ("Dam ora mangan")
  const hadAvailableCaptures = !move.isCapture && getAllCaptureMoves(prevState, player).length > 0;

  // Move the piece
  state.nodeOccupancy[move.fromNodeId] = null;
  state.nodeOccupancy[move.toNodeId] = piece.id;
  piece.nodeId = move.toNodeId;

  // Check promotion to King
  if (move.promotedToKing) {
    piece.isKing = true;
  }
  state.pieces[piece.id] = piece;

  // Handle capture
  if (move.isCapture && move.capturedPieceId && move.capturedNodeId) {
    delete state.pieces[move.capturedPieceId];
    state.nodeOccupancy[move.capturedNodeId] = null;
    state.halfMovesWithoutCapture = 0;
  } else {
    state.halfMovesWithoutCapture += 1;
  }

  // Check consecutive capture continuation
  let nextConsecutiveId: string | null = null;
  if (move.isCapture && state.rulesConfig.multiCapture) {
    const extraCaptures = getCaptureMoves(state, piece.id);
    if (extraCaptures.length > 0) {
      nextConsecutiveId = piece.id;
    }
  }

  // Construct move record
  const desc = move.isCapture
    ? `${player} lompat dari ${move.fromNodeId} ke ${move.toNodeId} (memakan bidak di ${move.capturedNodeId})`
    : `${player} melangkah dari ${move.fromNodeId} ke ${move.toNodeId}`;

  state.moveHistory.push({
    ...move,
    timestamp: Date.now(),
    player,
    description: desc,
  });

  if (nextConsecutiveId) {
    // Continue same turn with next jump
    state.consecutivePieceId = nextConsecutiveId;
    state.opponentMissedCapture = false;
    state.damClaimedThisTurn = false;
  } else {
    // Turn finishes
    state.consecutivePieceId = null;
    state.currentPlayer = opponent;
    state.opponentMissedCapture = hadAvailableCaptures;
    state.damClaimedThisTurn = false;

    // Track position repetition
    const posKey = getPositionKey(state);
    state.positionCounts[posKey] = (state.positionCounts[posKey] || 0) + 1;
  }

  // Check win or draw conditions
  const win = detectWinner(state);
  if (win.isGameOver) {
    state.gameStatus = 'won';
    state.winner = win.winner;
    state.winReason = win.reason;
    return state;
  }

  const draw = detectDraw(state);
  if (draw.isDraw) {
    state.gameStatus = 'draw';
    state.winner = null;
    state.winReason = draw.reason;
    return state;
  }

  return state;
}

/**
 * Traditional DAM Penalty ("Dam ora mangan" / Denda DAS):
 * If the opponent skipped a valid capture on their turn, the current player can
 * claim the penalty. Up to 3 opponent pieces are removed from the board as penalty!
 */
export function claimDamPenalty(
  prevState: GameState,
  targetPieceIds?: string[]
): GameState {
  if (!prevState.opponentMissedCapture || prevState.damClaimedThisTurn) {
    throw new Error('Pinalti DAM tidak tersedia saat ini.');
  }

  const state: GameState = {
    ...prevState,
    pieces: { ...prevState.pieces },
    nodeOccupancy: { ...prevState.nodeOccupancy },
    moveHistory: [...prevState.moveHistory],
  };

  const opponent: PlayerId = state.currentPlayer === 'P1' ? 'P2' : 'P1';
  const opponentPieces = Object.values(state.pieces).filter(p => p.owner === opponent);

  // If specific target pieces are not provided, take up to 3 pieces
  let piecesToRemove: Piece[] = [];
  if (targetPieceIds && targetPieceIds.length > 0) {
    piecesToRemove = targetPieceIds
      .map(id => state.pieces[id])
      .filter((p): p is Piece => Boolean(p && p.owner === opponent))
      .slice(0, 3);
  } else {
    // Take outer/least-defended pieces or random
    piecesToRemove = opponentPieces.slice(0, Math.min(3, opponentPieces.length));
  }

  const removedLabels: string[] = [];
  piecesToRemove.forEach(p => {
    delete state.pieces[p.id];
    state.nodeOccupancy[p.nodeId] = null;
    removedLabels.push(`${p.nodeId}`);
  });

  state.opponentMissedCapture = false;
  state.damClaimedThisTurn = true;
  state.halfMovesWithoutCapture = 0;

  state.moveHistory.push({
    pieceId: 'DAM_PENALTY',
    fromNodeId: 'PENALTI',
    toNodeId: 'LUAR',
    isCapture: true,
    timestamp: Date.now(),
    player: state.currentPlayer,
    description: `Pinalti DAM! ${state.currentPlayer} mengambil ${piecesToRemove.length} bidak lawan di (${removedLabels.join(', ')}) karena lawan lupa memakan!`,
  });

  // Verify if this resulted in win
  const win = detectWinner(state);
  if (win.isGameOver) {
    state.gameStatus = 'won';
    state.winner = win.winner;
    state.winReason = win.reason;
  }

  return state;
}

/**
 * End consecutive jumps voluntarily if allowed
 */
export function passConsecutiveJump(prevState: GameState): GameState {
  if (!prevState.consecutivePieceId) return prevState;

  const opponent: PlayerId = prevState.currentPlayer === 'P1' ? 'P2' : 'P1';
  const state: GameState = {
    ...prevState,
    consecutivePieceId: null,
    currentPlayer: opponent,
    opponentMissedCapture: false,
    damClaimedThisTurn: false,
  };

  const win = detectWinner(state);
  if (win.isGameOver) {
    state.gameStatus = 'won';
    state.winner = win.winner;
    state.winReason = win.reason;
  }

  return state;
}

/**
 * Detect if a player has won
 */
export function detectWinner(state: GameState): {
  isGameOver: boolean;
  winner: PlayerId | null;
  reason: string;
} {
  const p1Pieces = Object.values(state.pieces).filter(p => p.owner === 'P1');
  const p2Pieces = Object.values(state.pieces).filter(p => p.owner === 'P2');

  // Condition 1: All opponent pieces captured
  if (p1Pieces.length === 0) {
    return {
      isGameOver: true,
      winner: 'P2',
      reason: 'Seluruh bidak Pemain 1 telah habis.',
    };
  }
  if (p2Pieces.length === 0) {
    return {
      isGameOver: true,
      winner: 'P1',
      reason: 'Seluruh bidak Pemain 2 telah habis.',
    };
  }

  // Condition 2: Stalemate / No legal moves for current player
  const currentLegalMoves = getAllLegalMoves(state, state.currentPlayer);
  if (currentLegalMoves.length === 0) {
    const victor: PlayerId = state.currentPlayer === 'P1' ? 'P2' : 'P1';
    return {
      isGameOver: true,
      winner: victor,
      reason: `Kebuntuan! ${state.currentPlayer === 'P1' ? 'Pemain 1' : 'Pemain 2'} tidak memiliki gerakan legal lagi.`,
    };
  }

  return { isGameOver: false, winner: null, reason: '' };
}

/**
 * Detect draw conditions
 */
export function detectDraw(state: GameState): { isDraw: boolean; reason: string } {
  // 1. Move limit without capture
  if (state.halfMovesWithoutCapture >= state.rulesConfig.maxHalfMovesNoCapture) {
    return {
      isDraw: true,
      reason: `Permainan Seri: Sudah ${state.rulesConfig.maxHalfMovesNoCapture} giliran tanpa pemakanan bidak.`,
    };
  }

  // 2. Threefold repetition
  const currentKey = getPositionKey(state);
  if ((state.positionCounts[currentKey] || 0) >= 3) {
    return {
      isDraw: true,
      reason: 'Permainan Seri: Posisi papan yang sama berulang 3 kali (Threefold Repetition).',
    };
  }

  return { isDraw: false, reason: '' };
}
