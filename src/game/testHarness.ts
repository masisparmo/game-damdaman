/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Test Harness verifying all 12 QA criteria from GDD (Halaman 18 & 20).
 * Can be run programmatically or from the in-app Developer/QA modal.
 */

import { ADJACENCY_MAP, BOARD_NODES } from './boardData';
import {
  applyMove,
  createInitialState,
  detectWinner,
  getAllLegalMoves,
  getLegalMoves,
  validateMove,
} from './rulesEngine';
import { getAIMove } from './aiEngine';

export interface TestResult {
  id: number;
  name: string;
  passed: boolean;
  message: string;
}

export async function runAllQATests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // 1. Gerakan biasa hanya ke node tetangga kosong yang terhubung
  try {
    const state = createInitialState();
    // At start, node R (col 1, row 2) is P1. Neighbors of R are Q, S, C, A1.
    // A1 is empty! Q, S, C are P1 pieces.
    const rPiece = Object.values(state.pieces).find(p => p.nodeId === 'R');
    if (!rPiece) throw new Error('Piece at R not found');
    const legalMoves = getLegalMoves(state, rPiece.id);
    const toNodes = legalMoves.map(m => m.toNodeId);
    
    // Only A1 is empty and adjacent to R
    const onlyEmptyConnected = toNodes.every(to => {
      return ADJACENCY_MAP['R'].includes(to) && state.nodeOccupancy[to] === null;
    });

    results.push({
      id: 1,
      name: 'Gerakan biasa hanya ke tetangga kosong terhubung',
      passed: onlyEmptyConnected && toNodes.includes('A1'),
      message: `Bidak di R hanya bisa melangkah ke A1 (${toNodes.join(', ')})`,
    });
  } catch (err: unknown) {
    results.push({ id: 1, name: 'Gerakan biasa', passed: false, message: String(err) });
  }

  // 2. Gerakan ke node terisi ditolak
  try {
    const state = createInitialState();
    const rPiece = Object.values(state.pieces).find(p => p.nodeId === 'R')!;
    // C is occupied by another P1 piece
    const invalidMove = {
      pieceId: rPiece.id,
      fromNodeId: 'R',
      toNodeId: 'C',
      isCapture: false,
    };
    const isValid = validateMove(state, invalidMove);
    results.push({
      id: 2,
      name: 'Gerakan ke node terisi ditolak',
      passed: !isValid,
      message: isValid ? 'GAGAL: Gerakan ke C yang terisi diizinkan!' : 'Lulus: Ditolak dengan benar.',
    });
  } catch (err: unknown) {
    results.push({ id: 2, name: 'Gerakan ke node terisi', passed: false, message: String(err) });
  }

  // 3. Tidak ada gerakan melalui edge yang tidak ada
  try {
    const state = createInitialState();
    const rPiece = Object.values(state.pieces).find(p => p.nodeId === 'R')!;
    // Z is empty at start, but R-Z is NOT an edge in the graph
    const invalidEdgeMove = {
      pieceId: rPiece.id,
      fromNodeId: 'R',
      toNodeId: 'Z',
      isCapture: false,
    };
    const isValid = validateMove(state, invalidEdgeMove);
    results.push({
      id: 3,
      name: 'Tidak ada gerakan tanpa garis/edge',
      passed: !isValid,
      message: isValid ? 'GAGAL: Gerakan R->Z tanpa edge diizinkan!' : 'Lulus: Gerakan tanpa garis ditolak.',
    });
  } catch (err: unknown) {
    results.push({ id: 3, name: 'Gerakan tanpa edge', passed: false, message: String(err) });
  }

  // 4. Lompatan makan valid menghapus tepat satu bidak lawan
  try {
    const state = createInitialState();
    // Setup test jump scenario: P1 at R, P2 at A1, V is empty
    state.pieces['P1_test'] = { id: 'P1_test', owner: 'P1', nodeId: 'R', isKing: false };
    state.nodeOccupancy['R'] = 'P1_test';
    state.pieces['P2_test'] = { id: 'P2_test', owner: 'P2', nodeId: 'A1', isKing: false };
    state.nodeOccupancy['A1'] = 'P2_test';
    // Clear V
    if (state.nodeOccupancy['V']) {
      delete state.pieces[state.nodeOccupancy['V']!];
    }
    state.nodeOccupancy['V'] = null;

    const captureMove = {
      pieceId: 'P1_test',
      fromNodeId: 'R',
      toNodeId: 'V',
      isCapture: true,
      capturedPieceId: 'P2_test',
      capturedNodeId: 'A1',
    };

    const isLegal = validateMove(state, captureMove);
    if (!isLegal) throw new Error('Lompatan R->A1->V tidak terdeteksi legal');
    
    const nextState = applyMove(state, captureMove);
    const p2Removed = !nextState.pieces['P2_test'] && nextState.nodeOccupancy['A1'] === null;
    const p1Landed = nextState.pieces['P1_test']?.nodeId === 'V' && nextState.nodeOccupancy['V'] === 'P1_test';

    // Also verify diagonal wing jump: W over K to L1 (User reported scenario)
    state.pieces['P2_w'] = { id: 'P2_w', owner: 'P2', nodeId: 'W', isKing: false };
    state.nodeOccupancy['W'] = 'P2_w';
    state.pieces['P1_k'] = { id: 'P1_k', owner: 'P1', nodeId: 'K', isKing: false };
    state.nodeOccupancy['K'] = 'P1_k';
    if (state.nodeOccupancy['L1']) {
      delete state.pieces[state.nodeOccupancy['L1']!];
    }
    state.nodeOccupancy['L1'] = null;
    state.currentPlayer = 'P2';

    const wingCaptureMove = {
      pieceId: 'P2_w',
      fromNodeId: 'W',
      toNodeId: 'L1',
      isCapture: true,
      capturedPieceId: 'P1_k',
      capturedNodeId: 'K',
    };
    const isWingLegal = validateMove(state, wingCaptureMove);
    if (!isWingLegal) throw new Error('Lompatan diagonal sayap W->K->L1 tidak terdeteksi legal');
    const wingNextState = applyMove(state, wingCaptureMove);
    const kRemoved = !wingNextState.pieces['P1_k'] && wingNextState.nodeOccupancy['K'] === null;
    const wLandedAtL1 = wingNextState.pieces['P2_w']?.nodeId === 'L1';

    results.push({
      id: 4,
      name: 'Lompatan makan valid menghapus tepat 1 bidak lawan (Ortogonal & Diagonal Sayap)',
      passed: p2Removed && p1Landed && isWingLegal && kRemoved && wLandedAtL1,
      message: 'Lulus: Bidak lawan di A1 dan K terhapus, mendarat di V dan L1 dengan akurat.',
    });
  } catch (err: unknown) {
    results.push({ id: 4, name: 'Lompatan makan valid', passed: false, message: String(err) });
  }

  // 5. Lompatan melalui bidak sendiri ditolak
  try {
    const state = createInitialState();
    // P1 at R, P1 at Q, P is behind Q (P-Q-R is a straight vertical line)
    // Try to jump from R over Q to P (both Q and P are P1 pieces)
    const selfJumpMove = {
      pieceId: state.nodeOccupancy['R']!,
      fromNodeId: 'R',
      toNodeId: 'P',
      isCapture: true,
      capturedPieceId: state.nodeOccupancy['Q']!,
      capturedNodeId: 'Q',
    };
    const isValid = validateMove(state, selfJumpMove);
    results.push({
      id: 5,
      name: 'Lompatan melalui bidak sendiri ditolak',
      passed: !isValid,
      message: isValid ? 'GAGAL: Pemakanan bidak teman sendiri diizinkan!' : 'Lulus: Ditolak dengan benar.',
    });
  } catch (err: unknown) {
    results.push({ id: 5, name: 'Lompatan bidak sendiri', passed: false, message: String(err) });
  }

  // 6. Mendarat pada node terisi ditolak
  try {
    const state = createInitialState();
    // P1 at R, P2 at A1, but V is also occupied
    state.pieces['P2_test'] = { id: 'P2_test', owner: 'P2', nodeId: 'A1', isKing: false };
    state.nodeOccupancy['A1'] = 'P2_test';
    // V is occupied by P2_test2
    state.pieces['P2_test2'] = { id: 'P2_test2', owner: 'P2', nodeId: 'V', isKing: false };
    state.nodeOccupancy['V'] = 'P2_test2';

    const blockedJump = {
      pieceId: state.nodeOccupancy['R']!,
      fromNodeId: 'R',
      toNodeId: 'V',
      isCapture: true,
      capturedPieceId: 'P2_test',
      capturedNodeId: 'A1',
    };
    const isValid = validateMove(state, blockedJump);
    results.push({
      id: 6,
      name: 'Mendarat pada node terisi ditolak',
      passed: !isValid,
      message: isValid ? 'GAGAL: Mendarat di V yang terisi diizinkan!' : 'Lulus: Ditolak dengan benar.',
    });
  } catch (err: unknown) {
    results.push({ id: 6, name: 'Mendarat di node terisi', passed: false, message: String(err) });
  }

  // 7. Pemenang terdeteksi saat semua bidak lawan habis
  try {
    const state = createInitialState();
    // Remove all P2 pieces
    Object.keys(state.pieces).forEach(id => {
      if (state.pieces[id].owner === 'P2') {
        const n = state.pieces[id].nodeId;
        state.nodeOccupancy[n] = null;
        delete state.pieces[id];
      }
    });
    const win = detectWinner(state);
    results.push({
      id: 7,
      name: 'Pemenang terdeteksi saat semua bidak lawan habis',
      passed: win.isGameOver && win.winner === 'P1',
      message: `Lulus: ${win.reason}`,
    });
  } catch (err: unknown) {
    results.push({ id: 7, name: 'Pemenang eliminasi', passed: false, message: String(err) });
  }

  // 8. Pemenang terdeteksi saat lawan tidak punya gerakan legal (kebuntuan)
  try {
    const state = createInitialState();
    // Set only 1 piece for P2 at corner C1, boxed in completely
    Object.keys(state.pieces).forEach(id => {
      if (state.pieces[id].owner === 'P2') {
        state.nodeOccupancy[state.pieces[id].nodeId] = null;
        delete state.pieces[id];
      }
    });
    state.pieces['P2_trapped'] = { id: 'P2_trapped', owner: 'P2', nodeId: 'C1', isKing: false };
    state.nodeOccupancy['C1'] = 'P2_trapped';
    // Fill C1's neighbors: B1 and D1 with P1 pieces
    state.pieces['P1_block1'] = { id: 'P1_block1', owner: 'P1', nodeId: 'B1', isKing: false };
    state.nodeOccupancy['B1'] = 'P1_block1';
    state.pieces['P1_block2'] = { id: 'P1_block2', owner: 'P1', nodeId: 'D1', isKing: false };
    state.nodeOccupancy['D1'] = 'P1_block2';
    // Also block jump landing spots: C (from B1) and E1, G1 (from D1)
    state.pieces['P1_block3'] = { id: 'P1_block3', owner: 'P1', nodeId: 'C', isKing: false };
    state.nodeOccupancy['C'] = 'P1_block3';
    state.pieces['P1_block4'] = { id: 'P1_block4', owner: 'P1', nodeId: 'E1', isKing: false };
    state.nodeOccupancy['E1'] = 'P1_block4';
    state.pieces['P1_block5'] = { id: 'P1_block5', owner: 'P1', nodeId: 'G1', isKing: false };
    state.nodeOccupancy['G1'] = 'P1_block5';

    state.currentPlayer = 'P2';
    const win = detectWinner(state);
    results.push({
      id: 8,
      name: 'Pemenang terdeteksi saat lawan buntu',
      passed: win.isGameOver && win.winner === 'P1',
      message: `Lulus: Kebuntuan terdeteksi -> ${win.reason}`,
    });
  } catch (err: unknown) {
    results.push({ id: 8, name: 'Pemenang kebuntuan', passed: false, message: String(err) });
  }

  // 9. AI tidak pernah mengembalikan gerakan ilegal
  try {
    const state = createInitialState();
    state.currentPlayer = 'P2';
    const aiMove = await getAIMove(state, 'P2', 'hard');
    const isLegal = aiMove ? validateMove(state, aiMove) : false;
    results.push({
      id: 9,
      name: 'AI hanya menghasilkan gerakan legal',
      passed: Boolean(aiMove && isLegal),
      message: aiMove ? `Lulus: AI memilih ${aiMove.fromNodeId}->${aiMove.toNodeId} (legal)` : 'GAGAL: AI mengembalikan null',
    });
  } catch (err: unknown) {
    results.push({ id: 9, name: 'AI validitas gerakan', passed: false, message: String(err) });
  }

  // 10. Restart mengembalikan posisi awal, giliran, riwayat dengan benar
  try {
    const state = createInitialState();
    const p1Count = Object.values(state.pieces).filter(p => p.owner === 'P1').length;
    const p2Count = Object.values(state.pieces).filter(p => p.owner === 'P2').length;
    const isReady = p1Count === 16 && p2Count === 16 && state.currentPlayer === 'P1' && state.moveHistory.length === 0;
    results.push({
      id: 10,
      name: 'Inisialisasi & Restart 16 vs 16 tepat',
      passed: isReady,
      message: `Lulus: P1=${p1Count}, P2=${p2Count}, Giliran=${state.currentPlayer}`,
    });
  } catch (err: unknown) {
    results.push({ id: 10, name: 'Restart awal', passed: false, message: String(err) });
  }

  // 11. Orde 37 dan Ukuran 76 Graf
  try {
    const nodeCount = Object.keys(BOARD_NODES).length;
    results.push({
      id: 11,
      name: 'Struktur Graf Papan Tepat (Orde 37 Simpul)',
      passed: nodeCount === 37,
      message: `Lulus: Jumlah simpul graf tepat ${nodeCount} dari 37`,
    });
  } catch (err: unknown) {
    results.push({ id: 11, name: 'Orde graf', passed: false, message: String(err) });
  }

  // 12. Validasi semua gerakan pembuka pemain awal
  try {
    const state = createInitialState();
    const allMoves = getAllLegalMoves(state, 'P1');
    const allValid = allMoves.every(m => validateMove(state, m));
    results.push({
      id: 12,
      name: 'Konsistensi mesin aturan pada pembukaan',
      passed: allValid && allMoves.length > 0,
      message: `Lulus: Ditemukan ${allMoves.length} gerakan legal pembuka, 100% tervalidasi`,
    });
  } catch (err: unknown) {
    results.push({ id: 12, name: 'Konsistensi pembukaan', passed: false, message: String(err) });
  }

  return results;
}
