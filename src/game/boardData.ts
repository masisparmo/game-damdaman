/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Board Data & Graph Definition for Maen Dam-Daman.
 * Grounded in:
 * 1. "Studi Etnomatematika: Konsep Graf pada Permainan Dam-daman Kabupaten Pasuruan" (Salsabila & Marhayati, 2024)
 *    - 37 Vertices (Orde 37)
 *    - 76 Edges (Ukuran 76)
 *    - Degrees: 2, 3, 4, 5, 8
 * 2. Traditional Jabar & Jawa Dam-Daman Catalog & Rules
 */

export interface BoardNode {
  id: string;
  label: string;
  x: number; // Normalized 0..1 coordinate (horizontal)
  y: number; // Normalized 0..1 coordinate (vertical)
  region: 'left_wing' | 'square' | 'right_wing';
  col: number; // -2, -1 (left wing), 0..4 (square), 5, 6 (right wing)
  row: number; // 0..4
  degree: number;
  isKingZoneP1: boolean; // Reached by P1 to promote (P2's wing apex/end)
  isKingZoneP2: boolean; // Reached by P2 to promote (P1's wing apex/end)
}

export interface CollinearJumpPath {
  from: string;
  over: string;
  to: string;
}

/**
 * 37 Vertices with precise geometry:
 * Central 5x5 Square:
 * Columns: x = 0.26, 0.38, 0.50, 0.62, 0.74
 * Rows:    y = 0.12, 0.31, 0.50, 0.69, 0.88
 * 
 * Left Wing (Dapur / Gunung Kiri, apex at far left):
 * Outer col (C1, D1, E1): x = 0.05
 * Inner col (B1, G1, F1): x = 0.155
 * Connected to C (square col 0, row 2) at x = 0.26, y = 0.50
 * 
 * Right Wing (Dapur / Gunung Kanan, apex at far right):
 * Inner col (H1, M1, L1): x = 0.845
 * Outer col (I1, J1, K1): x = 0.95
 * Connected to K (square col 4, row 2) at x = 0.74, y = 0.50
 */
export const BOARD_NODES: Record<string, BoardNode> = {
  // --- Left Wing ---
  // Outer column
  C1: { id: 'C1', label: 'C1', x: 0.05, y: 0.20, region: 'left_wing', col: -2, row: 0, degree: 2, isKingZoneP1: false, isKingZoneP2: true },
  D1: { id: 'D1', label: 'D1', x: 0.05, y: 0.50, region: 'left_wing', col: -2, row: 2, degree: 3, isKingZoneP1: false, isKingZoneP2: true },
  E1: { id: 'E1', label: 'E1', x: 0.05, y: 0.80, region: 'left_wing', col: -2, row: 4, degree: 2, isKingZoneP1: false, isKingZoneP2: true },
  // Inner column
  B1: { id: 'B1', label: 'B1', x: 0.155, y: 0.32, region: 'left_wing', col: -1, row: 1, degree: 3, isKingZoneP1: false, isKingZoneP2: false },
  G1: { id: 'G1', label: 'G1', x: 0.155, y: 0.50, region: 'left_wing', col: -1, row: 2, degree: 4, isKingZoneP1: false, isKingZoneP2: false },
  F1: { id: 'F1', label: 'F1', x: 0.155, y: 0.68, region: 'left_wing', col: -1, row: 3, degree: 3, isKingZoneP1: false, isKingZoneP2: false },

  // --- Central 5x5 Square ---
  // Row 0 (Top)
  A: { id: 'A', label: 'A', x: 0.26, y: 0.12, region: 'square', col: 0, row: 0, degree: 3, isKingZoneP1: false, isKingZoneP2: false },
  P: { id: 'P', label: 'P', x: 0.38, y: 0.12, region: 'square', col: 1, row: 0, degree: 3, isKingZoneP1: false, isKingZoneP2: false },
  O: { id: 'O', label: 'O', x: 0.50, y: 0.12, region: 'square', col: 2, row: 0, degree: 5, isKingZoneP1: false, isKingZoneP2: false },
  N: { id: 'N', label: 'N', x: 0.62, y: 0.12, region: 'square', col: 3, row: 0, degree: 3, isKingZoneP1: false, isKingZoneP2: false },
  M: { id: 'M', label: 'M', x: 0.74, y: 0.12, region: 'square', col: 4, row: 0, degree: 3, isKingZoneP1: false, isKingZoneP2: false },

  // Row 1
  B: { id: 'B', label: 'B', x: 0.26, y: 0.31, region: 'square', col: 0, row: 1, degree: 3, isKingZoneP1: false, isKingZoneP2: false },
  Q: { id: 'Q', label: 'Q', x: 0.38, y: 0.31, region: 'square', col: 1, row: 1, degree: 8, isKingZoneP1: false, isKingZoneP2: false },
  Z: { id: 'Z', label: 'Z', x: 0.50, y: 0.31, region: 'square', col: 2, row: 1, degree: 4, isKingZoneP1: false, isKingZoneP2: false },
  W: { id: 'W', label: 'W', x: 0.62, y: 0.31, region: 'square', col: 3, row: 1, degree: 8, isKingZoneP1: false, isKingZoneP2: false },
  L: { id: 'L', label: 'L', x: 0.74, y: 0.31, region: 'square', col: 4, row: 1, degree: 3, isKingZoneP1: false, isKingZoneP2: false },

  // Row 2 (Middle horizontal)
  C: { id: 'C', label: 'C', x: 0.26, y: 0.50, region: 'square', col: 0, row: 2, degree: 8, isKingZoneP1: false, isKingZoneP2: false },
  R: { id: 'R', label: 'R', x: 0.38, y: 0.50, region: 'square', col: 1, row: 2, degree: 5, isKingZoneP1: false, isKingZoneP2: false },
  A1: { id: 'A1', label: 'A1', x: 0.50, y: 0.50, region: 'square', col: 2, row: 2, degree: 8, isKingZoneP1: false, isKingZoneP2: false }, // Center
  V: { id: 'V', label: 'V', x: 0.62, y: 0.50, region: 'square', col: 3, row: 2, degree: 5, isKingZoneP1: false, isKingZoneP2: false },
  K: { id: 'K', label: 'K', x: 0.74, y: 0.50, region: 'square', col: 4, row: 2, degree: 8, isKingZoneP1: false, isKingZoneP2: false },

  // Row 3
  D: { id: 'D', label: 'D', x: 0.26, y: 0.69, region: 'square', col: 0, row: 3, degree: 3, isKingZoneP1: false, isKingZoneP2: false },
  S: { id: 'S', label: 'S', x: 0.38, y: 0.69, region: 'square', col: 1, row: 3, degree: 8, isKingZoneP1: false, isKingZoneP2: false },
  T: { id: 'T', label: 'T', x: 0.50, y: 0.69, region: 'square', col: 2, row: 3, degree: 4, isKingZoneP1: false, isKingZoneP2: false },
  U: { id: 'U', label: 'U', x: 0.62, y: 0.69, region: 'square', col: 3, row: 3, degree: 8, isKingZoneP1: false, isKingZoneP2: false },
  J: { id: 'J', label: 'J', x: 0.74, y: 0.69, region: 'square', col: 4, row: 3, degree: 3, isKingZoneP1: false, isKingZoneP2: false },

  // Row 4 (Bottom)
  E: { id: 'E', label: 'E', x: 0.26, y: 0.88, region: 'square', col: 0, row: 4, degree: 3, isKingZoneP1: false, isKingZoneP2: false },
  F: { id: 'F', label: 'F', x: 0.38, y: 0.88, region: 'square', col: 1, row: 4, degree: 3, isKingZoneP1: false, isKingZoneP2: false },
  G: { id: 'G', label: 'G', x: 0.50, y: 0.88, region: 'square', col: 2, row: 4, degree: 5, isKingZoneP1: false, isKingZoneP2: false },
  H: { id: 'H', label: 'H', x: 0.62, y: 0.88, region: 'square', col: 3, row: 4, degree: 3, isKingZoneP1: false, isKingZoneP2: false },
  I: { id: 'I', label: 'I', x: 0.74, y: 0.88, region: 'square', col: 4, row: 4, degree: 3, isKingZoneP1: false, isKingZoneP2: false },

  // --- Right Wing ---
  // Inner column
  H1: { id: 'H1', label: 'H1', x: 0.845, y: 0.32, region: 'right_wing', col: 5, row: 1, degree: 3, isKingZoneP1: false, isKingZoneP2: false },
  M1: { id: 'M1', label: 'M1', x: 0.845, y: 0.50, region: 'right_wing', col: 5, row: 2, degree: 4, isKingZoneP1: false, isKingZoneP2: false },
  L1: { id: 'L1', label: 'L1', x: 0.845, y: 0.68, region: 'right_wing', col: 5, row: 3, degree: 3, isKingZoneP1: false, isKingZoneP2: false },
  // Outer column
  I1: { id: 'I1', label: 'I1', x: 0.95, y: 0.20, region: 'right_wing', col: 6, row: 0, degree: 2, isKingZoneP1: true, isKingZoneP2: false },
  J1: { id: 'J1', label: 'J1', x: 0.95, y: 0.50, region: 'right_wing', col: 6, row: 2, degree: 3, isKingZoneP1: true, isKingZoneP2: false },
  K1: { id: 'K1', label: 'K1', x: 0.95, y: 0.80, region: 'right_wing', col: 6, row: 4, degree: 2, isKingZoneP1: true, isKingZoneP2: false }
};

/**
 * 76 Undirected Edges exactly matching the mathematical study.
 * Each edge is stored once as [u, v].
 */
export const RAW_EDGES: [string, string][] = [
  // --- Left Wing Edges (10 edges) ---
  ['C1', 'B1'],
  ['C1', 'D1'],
  ['D1', 'G1'],
  ['D1', 'E1'],
  ['E1', 'F1'],
  ['B1', 'G1'],
  ['F1', 'G1'],
  ['B1', 'C'],
  ['G1', 'C'],
  ['F1', 'C'],

  // --- Central 5x5 Square Orthogonal Grid Edges ---
  // Horizontal Rows (4 segments each = 16 edges)
  ['A', 'P'], ['P', 'O'], ['O', 'N'], ['N', 'M'],
  ['B', 'Q'], ['Q', 'Z'], ['Z', 'W'], ['W', 'L'],
  ['C', 'R'], ['R', 'A1'], ['A1', 'V'], ['V', 'K'],
  ['D', 'S'], ['S', 'T'], ['T', 'U'], ['U', 'J'],
  ['E', 'F'], ['F', 'G'], ['G', 'H'], ['H', 'I'],

  // Vertical Columns (4 segments each = 16 edges)
  ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'],
  ['P', 'Q'], ['Q', 'R'], ['R', 'S'], ['S', 'F'],
  ['O', 'Z'], ['Z', 'A1'], ['A1', 'T'], ['T', 'G'],
  ['N', 'W'], ['W', 'V'], ['V', 'U'], ['U', 'H'],
  ['M', 'L'], ['L', 'K'], ['K', 'J'], ['J', 'I'],

  // Quadrant Diagonals (4 x 4 = 16 edges)
  // Top-Left Quadrant center Q:
  ['A', 'Q'], ['P', 'Q'], ['O', 'Q'], ['B', 'Q'], // Note: B-Q and P-Q are orthogonal in grid, wait:
  // Let's list the 4 diagonal lines around Q:
  // A(0,0) - Q(1,1)
  // O(2,0) - Q(1,1)
  // C(0,2) - Q(1,1)
  // A1(2,2) - Q(1,1)
  ['C', 'Q'], ['O', 'Q'], ['A1', 'Q'],

  // Bottom-Left Quadrant center S:
  ['C', 'S'], ['E', 'S'], ['G', 'S'], ['A1', 'S'],

  // Top-Right Quadrant center W:
  ['O', 'W'], ['M', 'W'], ['A1', 'W'], ['K', 'W'],

  // Bottom-Right Quadrant center U:
  ['A1', 'U'], ['K', 'U'], ['G', 'U'], ['I', 'U'],

  // --- Right Wing Edges (10 edges) ---
  ['K', 'H1'],
  ['K', 'M1'],
  ['K', 'L1'],
  ['H1', 'M1'],
  ['M1', 'L1'],
  ['H1', 'I1'],
  ['M1', 'J1'],
  ['L1', 'K1'],
  ['I1', 'J1'],
  ['J1', 'K1'],
];

/**
 * Adjacency Map for quick O(1) neighbor lookup
 */
export const ADJACENCY_MAP: Record<string, string[]> = {};
Object.keys(BOARD_NODES).forEach((id) => {
  ADJACENCY_MAP[id] = [];
});

RAW_EDGES.forEach(([u, v]) => {
  if (!ADJACENCY_MAP[u].includes(v)) ADJACENCY_MAP[u].push(v);
  if (!ADJACENCY_MAP[v].includes(u)) ADJACENCY_MAP[v].push(u);
});

/**
 * Collinear Jump Paths (Length 2 paths along straight lines).
 * Any capture must move from `from` -> over `over` -> to `to`.
 */
export const COLLINEAR_JUMPS: CollinearJumpPath[] = [
  // --- Horizontal Lines ---
  // Row 0: A - P - O - N - M
  { from: 'A', over: 'P', to: 'O' }, { from: 'O', over: 'P', to: 'A' },
  { from: 'P', over: 'O', to: 'N' }, { from: 'N', over: 'O', to: 'P' },
  { from: 'O', over: 'N', to: 'M' }, { from: 'M', over: 'N', to: 'O' },

  // Row 1: B - Q - Z - W - L
  { from: 'B', over: 'Q', to: 'Z' }, { from: 'Z', over: 'Q', to: 'B' },
  { from: 'Q', over: 'Z', to: 'W' }, { from: 'W', over: 'Z', to: 'Q' },
  { from: 'Z', over: 'W', to: 'L' }, { from: 'L', over: 'W', to: 'Z' },

  // Row 2 (Middle horizontal across all 3 regions):
  // D1 - G1 - C - R - A1 - V - K - M1 - J1
  { from: 'D1', over: 'G1', to: 'C' }, { from: 'C', over: 'G1', to: 'D1' },
  { from: 'G1', over: 'C', to: 'R' }, { from: 'R', over: 'C', to: 'G1' },
  { from: 'C', over: 'R', to: 'A1' }, { from: 'A1', over: 'R', to: 'C' },
  { from: 'R', over: 'A1', to: 'V' }, { from: 'V', over: 'A1', to: 'R' },
  { from: 'A1', over: 'V', to: 'K' }, { from: 'K', over: 'V', to: 'A1' },
  { from: 'V', over: 'K', to: 'M1' }, { from: 'M1', over: 'K', to: 'V' },
  { from: 'K', over: 'M1', to: 'J1' }, { from: 'J1', over: 'M1', to: 'K' },

  // Row 3: D - S - T - U - J
  { from: 'D', over: 'S', to: 'T' }, { from: 'T', over: 'S', to: 'D' },
  { from: 'S', over: 'T', to: 'U' }, { from: 'U', over: 'T', to: 'S' },
  { from: 'T', over: 'U', to: 'J' }, { from: 'J', over: 'U', to: 'T' },

  // Row 4: E - F - G - H - I
  { from: 'E', over: 'F', to: 'G' }, { from: 'G', over: 'F', to: 'E' },
  { from: 'F', over: 'G', to: 'H' }, { from: 'H', over: 'G', to: 'F' },
  { from: 'G', over: 'H', to: 'I' }, { from: 'I', over: 'H', to: 'G' },

  // --- Vertical Lines ---
  // Left Wing Outer Col: C1 - D1 - E1
  { from: 'C1', over: 'D1', to: 'E1' }, { from: 'E1', over: 'D1', to: 'C1' },
  // Left Wing Inner Col: B1 - G1 - F1
  { from: 'B1', over: 'G1', to: 'F1' }, { from: 'F1', over: 'G1', to: 'B1' },

  // Square Col 0: A - B - C - D - E
  { from: 'A', over: 'B', to: 'C' }, { from: 'C', over: 'B', to: 'A' },
  { from: 'B', over: 'C', to: 'D' }, { from: 'D', over: 'C', to: 'B' },
  { from: 'C', over: 'D', to: 'E' }, { from: 'E', over: 'D', to: 'C' },

  // Square Col 1: P - Q - R - S - F
  { from: 'P', over: 'Q', to: 'R' }, { from: 'R', over: 'Q', to: 'P' },
  { from: 'Q', over: 'R', to: 'S' }, { from: 'S', over: 'R', to: 'Q' },
  { from: 'R', over: 'S', to: 'F' }, { from: 'F', over: 'S', to: 'R' },

  // Square Col 2: O - Z - A1 - T - G
  { from: 'O', over: 'Z', to: 'A1' }, { from: 'A1', over: 'Z', to: 'O' },
  { from: 'Z', over: 'A1', to: 'T' }, { from: 'T', over: 'A1', to: 'Z' },
  { from: 'A1', over: 'T', to: 'G' }, { from: 'G', over: 'T', to: 'A1' },

  // Square Col 3: N - W - V - U - H
  { from: 'N', over: 'W', to: 'V' }, { from: 'V', over: 'W', to: 'N' },
  { from: 'W', over: 'V', to: 'U' }, { from: 'U', over: 'V', to: 'W' },
  { from: 'V', over: 'U', to: 'H' }, { from: 'H', over: 'U', to: 'V' },

  // Square Col 4: M - L - K - J - I
  { from: 'M', over: 'L', to: 'K' }, { from: 'K', over: 'L', to: 'M' },
  { from: 'L', over: 'K', to: 'J' }, { from: 'J', over: 'K', to: 'L' },
  { from: 'K', over: 'J', to: 'I' }, { from: 'I', over: 'J', to: 'K' },

  // Right Wing Inner Col: H1 - M1 - L1
  { from: 'H1', over: 'M1', to: 'L1' }, { from: 'L1', over: 'M1', to: 'H1' },
  // Right Wing Outer Col: I1 - J1 - K1
  { from: 'I1', over: 'J1', to: 'K1' }, { from: 'K1', over: 'J1', to: 'I1' },

  // --- Diagonal Lines ---
  // Main diagonals of the board:
  // A - Q - A1 - U - I
  { from: 'A', over: 'Q', to: 'A1' }, { from: 'A1', over: 'Q', to: 'A' },
  { from: 'Q', over: 'A1', to: 'U' }, { from: 'U', over: 'A1', to: 'Q' },
  { from: 'A1', over: 'U', to: 'I' }, { from: 'I', over: 'U', to: 'A1' },

  // E - S - A1 - W - M
  { from: 'E', over: 'S', to: 'A1' }, { from: 'A1', over: 'S', to: 'E' },
  { from: 'S', over: 'A1', to: 'W' }, { from: 'W', over: 'A1', to: 'S' },
  { from: 'A1', over: 'W', to: 'M' }, { from: 'M', over: 'W', to: 'A1' },

  // Secondary quadrant diagonals:
  // Top-Left: C - Q - O
  { from: 'C', over: 'Q', to: 'O' }, { from: 'O', over: 'Q', to: 'C' },
  // Bottom-Left: C - S - G
  { from: 'C', over: 'S', to: 'G' }, { from: 'G', over: 'S', to: 'C' },
  // Top-Right: O - W - K
  { from: 'O', over: 'W', to: 'K' }, { from: 'K', over: 'W', to: 'O' },
  // Bottom-Right: G - U - K
  { from: 'G', over: 'U', to: 'K' }, { from: 'K', over: 'U', to: 'G' },

  // --- Diagonal Wing Extensions (Continuations into and within the triangular wings) ---
  // Diagonal across Right Wing: O - W - K - L1 - K1
  { from: 'W', over: 'K', to: 'L1' }, { from: 'L1', over: 'K', to: 'W' },
  { from: 'K', over: 'L1', to: 'K1' }, { from: 'K1', over: 'L1', to: 'K' },

  // Diagonal across Right Wing: G - U - K - H1 - I1
  { from: 'U', over: 'K', to: 'H1' }, { from: 'H1', over: 'K', to: 'U' },
  { from: 'K', over: 'H1', to: 'I1' }, { from: 'I1', over: 'H1', to: 'K' },

  // Diagonal across Left Wing: O - Q - C - F1 - E1
  { from: 'Q', over: 'C', to: 'F1' }, { from: 'F1', over: 'C', to: 'Q' },
  { from: 'C', over: 'F1', to: 'E1' }, { from: 'E1', over: 'F1', to: 'C' },

  // Diagonal across Left Wing: G - S - C - B1 - C1
  { from: 'S', over: 'C', to: 'B1' }, { from: 'B1', over: 'C', to: 'S' },
  { from: 'C', over: 'B1', to: 'C1' }, { from: 'C1', over: 'B1', to: 'C' },
];

/**
 * Initial 16 piece layout for each player according to Dam-Daman tradition.
 * Player 1 (Merah/Orange): 6 in left wing + 5 in Col 0 (A,B,C,D,E) + 5 in Col 1 (P,Q,R,S,F) = 16
 * Player 2 (Biru/Blue):    6 in right wing + 5 in Col 4 (M,L,K,J,I) + 5 in Col 3 (N,W,V,U,H) = 16
 * Center Column (Col 2: O, Z, A1, T, G) is completely empty = 5 empty nodes
 */
export const INITIAL_PIECES_P1: string[] = [
  'C1', 'D1', 'E1', 'B1', 'G1', 'F1', // 6 left wing
  'A', 'B', 'C', 'D', 'E',             // 5 col 0
  'P', 'Q', 'R', 'S', 'F'              // 5 col 1
];

export const INITIAL_PIECES_P2: string[] = [
  'I1', 'J1', 'K1', 'H1', 'M1', 'L1', // 6 right wing
  'M', 'L', 'K', 'J', 'I',             // 5 col 4
  'N', 'W', 'V', 'U', 'H'              // 5 col 3
];

export const INITIAL_EMPTY_NODES: string[] = ['O', 'Z', 'A1', 'T', 'G'];
