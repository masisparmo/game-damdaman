/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Bilingual (ID / EN) Internationalization system for Maen Dam-Daman.
 * Default language: Indonesian ('id').
 */

import React from 'react';

export type Language = 'id' | 'en';

export const translations = {
  id: {
    // Top Bar
    title: 'Maen Dam-Daman',
    subtitle: 'Catur Tradisional Jawa & Graf Etnomatematika',
    howToPlay: 'Cara Bermain',
    ethnomathematics: 'Etnomatematika',
    settings: 'Pengaturan',
    gameHistory: 'Riwayat Game',
    leaderboardTitle: 'Papan Peringkat & Statistik',
    leaderboardTab: 'Peringkat Global',
    statsTab: 'Statistik Pribadi',
    rulesTab: 'Ketentuan Nilai',
    myRank: 'Peringkat Saya',
    points: 'Poin',
    winRate: 'Rasio Menang',
    rankHeader: 'Peringkat',
    playerHeader: 'Pemain',
    scoreHeader: 'Total Poin',
    statsHeader: 'Statistik Laga',
    cloudSynced: 'Tersinkronisasi Online',
    offlineSync: 'Tersimpan di Perangkat Ini',
    refreshLeaderboard: 'Perbarui Peringkat',
    ptsEarnedBadge: (pts: number) => `+${pts} Poin Peringkat!`,
    soundOn: 'Matikan Suara',
    soundOff: 'Aktifkan Suara',
    languageToggle: 'Bahasa: Indonesia',

    // Game Mode & Actions
    vsAi: 'Lawan AI',
    pvp: '2 Pemain',
    online: 'Main Online 🌐',
    easy: 'Mudah',
    medium: 'Sedang',
    hard: 'Sulit',
    master: 'Dewa 👑',
    undo: 'Urung',
    moves: 'Langkah',
    reset: 'Reset',
    resetConfirm: 'Mulai pertandingan baru?',
    aiMemoryTitle: 'Memori Kecerdasan AI (Otak Induk)',
    aiMemoryDesc: 'AI belajar terus dari setiap pertandingan dan terhubung ke Master Brain',
    matchesLearnedLabel: 'Laga Dipelajari:',
    openingsLearnedLabel: 'Pola Taktik Terdaftar:',
    blundersAvoidedLabel: 'Blunder Dihindari:',
    exportBrainBtn: 'Ekspor Otak AI (JSON)',
    resetBrainBtn: 'Reset Memori Belajar',
    brainResetConfirm: 'Kembalikan memori AI ke setelan awal Otak Induk?',

    // Turn Cards
    player1: 'Pemain 1',
    player2: 'Pemain 2',
    playerAi: 'Lawan AI',
    turn: 'Giliran',
    thinking: 'Berpikir...',
    pieces: 'bidak',
    captured: 'dimakan',

    // History & Live log
    movePrefix: 'Langkah #',
    noMovesYet: 'Belum ada langkah yang dimainkan.',
    moveHistoryTitle: 'Riwayat Langkah',

    // Special In-game Alerts
    damPenaltyTitle: 'Pinalti DAM Terbuka!',
    damPenaltyDesc: 'Lawan melewatkan pemakanan. Ambil 3 bidak lawan sekarang!',
    claimDamButton: 'Klaim Pinalti DAM!',
    multiJumpTitle: '✨ Lompatan Beruntun Tersedia!',
    multiJumpDesc: 'Pilih sasaran lompat berikutnya yang menyala, atau klik tombol di sebelah untuk menyelesaikan giliran.',
    finishJumpButton: 'Selesai Melompat ✓',

    // Board controls
    portrait: 'Tegak (Portrait)',
    landscape: 'Mendatar (Landscape)',
    flip: 'Putar Papan 180°',
    zoomIn: 'Perbesar',
    zoomOut: 'Perkecil',
    resetZoom: 'Reset Skala',
    nodeLabels: 'Label Simpul',
    boardTopTerritory: (isFlipped: boolean, isAi: boolean) =>
      isFlipped
        ? 'WILAYAH ATAS (PEMAIN 1)'
        : isAi
        ? 'WILAYAH ATAS (AI / P2)'
        : 'WILAYAH ATAS (PEMAIN 2)',
    boardBottomTerritory: (isFlipped: boolean, isAi: boolean) =>
      isFlipped
        ? isAi
          ? 'WILAYAH BAWAH (AI / P2)'
          : 'WILAYAH BAWAH (PEMAIN 2)'
        : 'WILAYAH BAWAH (PEMAIN 1)',
    boardLandscapeSubtitle: 'CATUR JAWA TRADISIONAL',

    // Modal Common
    close: 'Tutup',
    ok: 'OK',
    okPlay: 'OK, Mulai Main!',
    prev: 'Sebelumnya',
    next: 'Selanjutnya',
    pageOf: (current: number, total: number) => `Halaman ${current}/${total}`,

    // Modal GameOver
    gameOverTitle: 'Permainan Berakhir',
    youWin: 'Selamat! Anda Menang!',
    aiWins: 'AI Memenangkan Permainan!',
    p1Wins: 'Pemain 1 (Oranye) Menang!',
    p2Wins: 'Pemain 2 (Biru) Menang!',
    drawGame: 'Permainan Berakhir Seri',
    matchFinished: 'Pertandingan selesai.',
    playAgain: 'Main Lagi',
    remainingPieces: 'bidak tersisa',

    // Profile & Heroes
    playerProfile: 'Profil Pemain',
    editProfile: 'Ubah Profil & Hero',
    chooseHero: 'Pilih Hero Karakter',
    heroAvatar: 'Hero Karakter',
    saveProfile: 'Simpan Profil',
    playerNameLabel: 'Nama Pemain:',
    heroSelected: 'Hero Dipilih:',

    // Modal Settings
    settingsTitle: 'Pengaturan & Pengujian QA',
    audioVisualHeader: 'Tema & Efek Suara',
    soundEffectsTitle: 'Efek Suara Sintetis',
    soundEffectsDesc: 'Ketukan kayu, lompatan & pinalti DAM',
    soundActive: 'Aktif',
    soundInactive: 'Mati',
    boardThemeLabel: 'Gaya Tampilan Papan:',
    themeGreen: 'Hijau Beludru & Emas (Klasik Modern)',
    themeWood: 'Kayu Jati Tradisional (Vintage Jawa)',
    themeObsidian: 'Batu Obsidian & Neon Slate (Dark Mode)',
    rulesHeader: 'Aturan Khusus Dam-Daman',
    ruleMultiCapture: 'Lompatan Beruntun (Multi-Jump)',
    ruleMultiCaptureDesc: 'Bisa makan beruntun dengan bidak yang sama bila jalur makan masih terbuka.',
    ruleKing: 'Variasi Bidak Raja',
    ruleKingDesc: 'Bidak yang mencapai segitiga ujung lawan dipromosikan bermahkota emas.',
    ruleDamClaim: 'Pinalti "DAM" (Dam Ora Mangan)',
    ruleDamClaimDesc: 'Pemain berhak klaim 3 bidak lawan jika lawan lupa/melewatkan pemakanan.',
    ruleForcedCapture: 'Wajib Makan (Forced Capture)',
    ruleForcedCaptureDesc: 'Jika ada peluang makan, pemain wajib memakannya.',
    ruleMaxMoves: 'Batas Langkah Tanpa Makan (Remis):',
    ruleMaxMovesSuffix: 'giliran setengah (Half-moves)',
    languageHeader: 'Pilihan Bahasa (Language)',
    qaHeader: 'Pengujian Mutu Otomatis (QA Test Harness)',
    runQaButton: 'Jalankan Pengujian Otomatis',
    runningQa: 'Sedang Menguji...',
    qaSuccess: (passed: number, total: number) => `Semua ${passed}/${total} pengujian aturan berhasil lolos!`,

    // Modal Ethnomathematics
    ethnoTitle: 'Etnomatematika & Teori Graf',
    ethnoSubtitle: 'Kajian Ilmiah Papan Dam-Daman Pasuruan & Jabar',
    ethnoSourceTitle: 'Sumber Penelitian Akademik:',
    ethnoSourceCitation: '"Studi Etnomatematika: Konsep Graf pada Permainan Dam-daman Kabupaten Pasuruan" (Salsabila & Marhayati, 2024. Math Didactic: Jurnal Pendidikan Matematika).',
    ethnoGraphChar: 'Karakteristik Graf Papan Dam-Daman',
    ethnoOrder: 'Orde Graf (Titik)',
    ethnoOrderValue: '37 Simpul',
    ethnoSize: 'Ukuran Graf (Garis)',
    ethnoSizeValue: '76 Sisi',
    ethnoDegree: 'Derajat Titik (Degree)',
    ethnoDegreeValue: '2, 3, 4, 5, 8',
    ethnoPoint1Title: 'Graf Terhubung & Sederhana:',
    ethnoPoint1Desc: 'Setiap simpul saling terhubung oleh tepat satu sisi tanpa sisi ganda dan tanpa gelang (loop).',
    ethnoPoint2Title: 'Graf Semi-Hamilton:',
    ethnoPoint2Desc: 'Terdapat lintasan yang melewati semua 37 simpul tepat satu kali dari ujung ke ujung.',
    ethnoPoint3Title: 'Graf Berkromatik-3:',
    ethnoPoint3Desc: 'Seluruh 37 simpul dapat diwarnai hanya dengan 3 warna berbeda sedemikian rupa sehingga simpul bersebelahan selalu berbeda warna.',
    ethnoPoint4Title: 'Simpul Strategis Berderajat 8:',
    ethnoPoint4Desc: 'Titik C, Q, S, A1, W, U, K memiliki 8 sisi (maksimal) yang menjadi simpul perebutan paling krusial dalam adu strategi.',
    ethnoPhilosophyTitle: 'Filosofi Budaya Nusantara:',
    ethnoPhilosophyDesc: 'Permainan ini mengajarkan kalkulasi langkah, kesabaran dalam bertahan, dan kecermatan membaca peluang ("eling lan waspada") agar tidak terkena pinalti DAM.',
  },

  en: {
    // Top Bar
    title: 'Maen Dam-Daman',
    subtitle: 'Javanese Traditional Board Game & Graph Ethnomathematics',
    howToPlay: 'How to Play',
    ethnomathematics: 'Ethnomathematics',
    settings: 'Settings',
    gameHistory: 'History',
    leaderboardTitle: 'Leaderboard & Statistics',
    leaderboardTab: 'Global Leaderboard',
    statsTab: 'Personal Statistics',
    rulesTab: 'Scoring Rules',
    myRank: 'My Ranking',
    points: 'Points',
    winRate: 'Win Rate',
    rankHeader: 'Rank',
    playerHeader: 'Player',
    scoreHeader: 'Total Points',
    statsHeader: 'Match Stats',
    cloudSynced: 'Synced Online',
    offlineSync: 'Saved on this Device',
    refreshLeaderboard: 'Refresh Leaderboard',
    ptsEarnedBadge: (pts: number) => `+${pts} Ranking Points!`,
    soundOn: 'Mute Sound',
    soundOff: 'Enable Sound',
    languageToggle: 'Language: English',

    // Game Mode & Actions
    vsAi: 'vs AI',
    pvp: '2 Players',
    online: 'Play Online 🌐',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    master: 'Master 👑',
    undo: 'Undo',
    moves: 'Moves',
    reset: 'Reset',
    resetConfirm: 'Start a new match?',
    aiMemoryTitle: 'AI Intelligence Memory (Master Brain)',
    aiMemoryDesc: 'AI continuously learns from every match, linked to the Master Brain',
    matchesLearnedLabel: 'Matches Studied:',
    openingsLearnedLabel: 'Tactical Patterns:',
    blundersAvoidedLabel: 'Blunders Avoided:',
    exportBrainBtn: 'Export AI Brain (JSON)',
    resetBrainBtn: 'Reset Local Learning',
    brainResetConfirm: 'Reset AI memory back to the default factory Master Brain?',

    // Turn Cards
    player1: 'Player 1',
    player2: 'Player 2',
    playerAi: 'AI Opponent',
    turn: 'Turn',
    thinking: 'Thinking...',
    pieces: 'pieces',
    captured: 'captured',

    // History & Live log
    movePrefix: 'Move #',
    noMovesYet: 'No moves played yet.',
    moveHistoryTitle: 'Move History',

    // Special In-game Alerts
    damPenaltyTitle: 'DAM Penalty Available!',
    damPenaltyDesc: 'Opponent missed a legal capture. Claim 3 opponent pieces now!',
    claimDamButton: 'Claim DAM Penalty!',
    multiJumpTitle: '✨ Multi-Jump Available!',
    multiJumpDesc: 'Select the next glowing target, or click the button to finish your turn.',
    finishJumpButton: 'Finish Jumps ✓',

    // Board controls
    portrait: 'Portrait',
    landscape: 'Landscape',
    flip: 'Flip Board 180°',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    resetZoom: 'Reset Zoom',
    nodeLabels: 'Node Labels',
    boardTopTerritory: (isFlipped: boolean, isAi: boolean) =>
      isFlipped
        ? 'TOP TERRITORY (PLAYER 1)'
        : isAi
        ? 'TOP TERRITORY (AI / P2)'
        : 'TOP TERRITORY (PLAYER 2)',
    boardBottomTerritory: (isFlipped: boolean, isAi: boolean) =>
      isFlipped
        ? isAi
          ? 'BOTTOM TERRITORY (AI / P2)'
          : 'BOTTOM TERRITORY (PLAYER 2)'
        : 'BOTTOM TERRITORY (PLAYER 1)',
    boardLandscapeSubtitle: 'TRADITIONAL JAVANESE CHESS',

    // Modal Common
    close: 'Close',
    ok: 'OK',
    okPlay: 'OK, Start Playing!',
    prev: 'Previous',
    next: 'Next',
    pageOf: (current: number, total: number) => `Page ${current}/${total}`,

    // Modal GameOver
    gameOverTitle: 'Game Over',
    youWin: 'Congratulations! You Won!',
    aiWins: 'AI Won the Game!',
    p1Wins: 'Player 1 (Orange) Won!',
    p2Wins: 'Player 2 (Blue) Won!',
    drawGame: 'Game Ended in a Draw',
    matchFinished: 'Match concluded.',
    playAgain: 'Play Again',
    remainingPieces: 'pieces remaining',

    // Profile & Heroes
    playerProfile: 'Player Profile',
    editProfile: 'Edit Profile & Hero',
    chooseHero: 'Choose Hero Character',
    heroAvatar: 'Hero Character',
    saveProfile: 'Save Profile',
    playerNameLabel: 'Player Name:',
    heroSelected: 'Hero Selected:',

    // Modal Settings
    settingsTitle: 'Settings & QA Test Harness',
    audioVisualHeader: 'Theme & Sound Effects',
    soundEffectsTitle: 'Procedural Audio Effects',
    soundEffectsDesc: 'Wood taps, jumps & DAM penalty sounds',
    soundActive: 'Enabled',
    soundInactive: 'Muted',
    boardThemeLabel: 'Board Visual Style:',
    themeGreen: 'Emerald Velvet & Gold (Modern Classic)',
    themeWood: 'Traditional Teak Wood (Javanese Vintage)',
    themeObsidian: 'Obsidian Stone & Neon Slate (Dark Mode)',
    rulesHeader: 'Custom Dam-Daman Rules',
    ruleMultiCapture: 'Consecutive Jumps (Multi-Jump)',
    ruleMultiCaptureDesc: 'Allows chaining multiple jumps with the same piece if targets remain open.',
    ruleKing: 'King Piece Variation',
    ruleKingDesc: 'Pieces reaching the opponent’s apex triangle are crowned as King.',
    ruleDamClaim: '"DAM" Penalty (Dam Ora Mangan)',
    ruleDamClaimDesc: 'Players may claim 3 opponent pieces if the opponent overlooks a capture.',
    ruleForcedCapture: 'Forced Capture Rule',
    ruleForcedCaptureDesc: 'If a jump capture is available, the player must take it.',
    ruleMaxMoves: 'Max Moves Without Capture (Draw Limit):',
    ruleMaxMovesSuffix: 'half-moves',
    languageHeader: 'Language Selection',
    qaHeader: 'Automated QA Test Harness',
    runQaButton: 'Run Automated Tests',
    runningQa: 'Testing in progress...',
    qaSuccess: (passed: number, total: number) => `All ${passed}/${total} rule tests passed successfully!`,

    // Modal Ethnomathematics
    ethnoTitle: 'Ethnomathematics & Graph Theory',
    ethnoSubtitle: 'Scientific Analysis of Pasuruan & West Java Dam-Daman Board',
    ethnoSourceTitle: 'Academic Research Citation:',
    ethnoSourceCitation: '"Ethnomathematics Study: Graph Concepts in the Dam-daman Game of Pasuruan Regency" (Salsabila & Marhayati, 2024. Math Didactic: Journal of Mathematics Education).',
    ethnoGraphChar: 'Dam-Daman Graph Properties',
    ethnoOrder: 'Graph Order (Vertices)',
    ethnoOrderValue: '37 Nodes',
    ethnoSize: 'Graph Size (Edges)',
    ethnoSizeValue: '76 Edges',
    ethnoDegree: 'Vertex Degree',
    ethnoDegreeValue: '2, 3, 4, 5, 8',
    ethnoPoint1Title: 'Connected & Simple Graph:',
    ethnoPoint1Desc: 'Every node is connected by exactly one edge with no multiple edges and no self-loops.',
    ethnoPoint2Title: 'Semi-Hamiltonian Graph:',
    ethnoPoint2Desc: 'Contains a path that traverses all 37 vertices exactly once from end to end.',
    ethnoPoint3Title: '3-Chromatic Graph:',
    ethnoPoint3Desc: 'All 37 vertices can be colored using only 3 distinct colors such that adjacent nodes never share the same color.',
    ethnoPoint4Title: 'Strategic Hubs of Degree 8:',
    ethnoPoint4Desc: 'Nodes C, Q, S, A1, W, U, K have 8 edges (maximum) and act as the most critical contested crossroads.',
    ethnoPhilosophyTitle: 'Indonesian Cultural Philosophy:',
    ethnoPhilosophyDesc: 'The game fosters strategic forethought, defensive resilience, and mindful alertness ("eling lan waspada") to avoid the dreaded DAM penalty.',
  },
};

/**
 * Tutorial Slides Content in ID & EN
 */
export const getTutorialSlides = (lang: Language) => {
  if (lang === 'en') {
    return [
      {
        title: '1. Origins & The Dam-Daman Board',
        subtitle: 'Authentic Board Layout & Setup',
        text: (
          <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
            <p>
              <strong className="text-amber-300">Dam-Daman</strong> (also known as{' '}
              <em>Damdas</em>, <em>Bas-Basan</em>, or <em>Javanese Chess</em>) is an authentic Indonesian traditional
              strategy board game popular since the 20th century, cherished for developing tactical thinking, calculation, and patience.
            </p>
            <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800">
              <h4 className="font-semibold text-stone-200 mb-1 flex items-center gap-1.5">
                <span>Authentic Board Layout</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-stone-400 text-xs">
                <li>Consists of <strong>37 intersection points</strong> and <strong>76 connecting lines</strong>.</li>
                <li>The center board is a 5x5 square grid with diagonal lines across each quadrant.</li>
                <li>Both opposing ends feature triangular wings (known as <em>Dapur</em>, <em>Gunungan</em>, or <em>Tail</em>).</li>
                <li>Each player commands <strong>16 pieces</strong>. The middle vertical row (5 points) begins empty.</li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        title: '2. Movement & Navigating Pieces',
        subtitle: 'Legal Steps Along Connected Paths',
        text: (
          <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
            <p>
              Players take turns advancing <strong>one piece</strong> to an immediately adjacent point connected by a line on the board.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
                <span className="font-semibold text-emerald-400 block mb-1">✓ Legal Move:</span>
                <p className="text-stone-400">
                  A piece can only move to an adjacent empty node connected by an authentic straight line (horizontal, vertical, or valid diagonal).
                </p>
              </div>
              <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
                <span className="font-semibold text-rose-400 block mb-1">✗ Not Allowed:</span>
                <p className="text-stone-400">
                  Cannot jump points without connecting lines, and cannot move into a spot occupied by any friendly or enemy piece.
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-400 italic">
              Tip: Click on your piece to see vibrant green rings indicating all available legal destinations.
            </p>
          </div>
        ),
      },
      {
        title: '3. Jumping & Capturing Opponents',
        subtitle: 'Linear Jumps & Multi-Capture Combos',
        text: (
          <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
            <p>
              Capturing is performed by <strong>jumping over an opponent's piece</strong> that sits on an adjacent node, landing on the empty space directly behind it along the straight line.
            </p>
            <div className="bg-amber-950/30 border border-amber-800/50 p-3 rounded-xl text-xs space-y-1.5">
              <p className="font-semibold text-amber-300">Jump Capture Rules:</p>
              <ol className="list-decimal list-inside space-y-1 text-stone-300">
                <li>Your piece and the enemy piece must be along an authentic straight path.</li>
                <li>The node immediately following the enemy piece must be unoccupied.</li>
                <li>The jumped enemy piece is permanently removed from the board.</li>
              </ol>
            </div>
            <div className="p-2.5 bg-stone-900/70 rounded-lg text-xs text-stone-300">
              <strong className="text-amber-400">Multi-Jump Combos:</strong> If another jump target is immediately available from the landing node with the same piece, you can chain additional jumps in the same turn!
            </div>
          </div>
        ),
      },
      {
        title: '4. The Legendary "DAM" Penalty',
        subtitle: 'The "Dam Ora Mangan" Heritage Rule',
        text: (
          <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
            <p>
              This is the hallmark rule behind the game's name: <strong>"Dam-Daman"</strong>! In Javanese and Sundanese tradition, there is the famous rule of <em>"Dam ora mangan"</em> (forgetting to capture open prey).
            </p>
            <div className="bg-rose-950/30 border border-rose-800/50 p-3 rounded-xl text-xs space-y-2">
              <h5 className="font-bold text-rose-300">Penalty for Overlooking a Capture:</h5>
              <p className="text-stone-300">
                If a player has a legal opportunity to capture an opponent’s piece but makes a regular move or neglects the jump, the opponent can shout <strong>"DAM!"</strong> and immediately <strong>claim 3 of the offender's pieces</strong> as a free penalty!
              </p>
            </div>
            <p className="text-xs text-stone-400">
              In this digital game, when the opponent misses an open capture, the <strong>"Claim DAM Penalty!"</strong> banner will illuminate for you to collect.
            </p>
          </div>
        ),
      },
      {
        title: '5. King Pieces & Victory Conditions',
        subtitle: 'Promotions, Checkmates, and Draws',
        text: (
          <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
            <div className="space-y-1.5">
              <h4 className="font-semibold text-yellow-300 text-xs">King (Raja) Variation:</h4>
              <p className="text-xs text-stone-300">
                When enabled in Settings, a regular piece that successfully invades all the way to the enemy's rear triangular apex is promoted to a golden-crowned <strong>King</strong> with extended movement privileges.
              </p>
            </div>

            <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800 space-y-1.5 text-xs">
              <h4 className="font-semibold text-stone-200">Victory & Draw Conditions:</h4>
              <ul className="list-disc list-inside space-y-1 text-stone-400">
                <li><strong className="text-stone-200">Decisive Victory:</strong> Capture all 16 opponent pieces.</li>
                <li><strong className="text-stone-200">Stalemate Victory:</strong> The opponent is completely blocked with zero legal moves on their turn.</li>
                <li><strong className="text-stone-200">Draw (Remis):</strong> 40 half-moves pass without any captures, or the exact board position repeats 3 times.</li>
              </ul>
            </div>
          </div>
        ),
      },
    ];
  }

  // Indonesian Default
  return [
    {
      title: '1. Asal Usul & Papan Dam-Daman',
      subtitle: 'Bentuk Papan & Penataan Awal',
      text: (
        <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
          <p>
            <strong className="text-amber-300">Dam-Daman</strong> (atau dikenal juga sebagai{' '}
            <em>Damdas</em>, <em>Bas-Basan</em>, atau <em>Catur Jawa</em>) adalah permainan papan strategi
            tradisional asli Indonesia yang populer sejak abad ke-20 untuk melatih ketangkasan berpikir,
            kecermatan kalkulasi, dan kesabaran.
          </p>
          <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800">
            <h4 className="font-semibold text-stone-200 mb-1 flex items-center gap-1.5">
              <span>Bentuk Papan Permainan</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-stone-400 text-xs">
              <li>Terdiri dari <strong>37 titik temu garis</strong> dan <strong>76 garis lintasan</strong>.</li>
              <li>Papan tengah berbentuk bujur sangkar 5x5 dengan garis diagonal di setiap kuadran.</li>
              <li>Kedua ujung memiliki sayap segitiga (dikenal sebagai <em>Dapur</em>, <em>Gunungan</em>, atau <em>Ekor</em>).</li>
              <li>Masing-masing pemain dibekali <strong>16 bidak</strong>. Kolom tengah (5 titik) dikosongkan saat mulai.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: '2. Cara Melangkah & Menggerakkan Bidak',
      subtitle: 'Gerakan Sah Mengikuti Garis Terhubung',
      text: (
        <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
          <p>
            Pemain bergantian melangkahkan <strong>satu bidak</strong> ke titik tetangga yang langsung
            terhubung oleh garis pada papan permainan.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
              <span className="font-semibold text-emerald-400 block mb-1">✓ Gerakan Sah:</span>
              <p className="text-stone-400">
                Bidak hanya boleh berpindah ke titik kosong yang dihubungkan langsung oleh garis lurus (horizontal, vertikal, atau diagonal yang sah).
              </p>
            </div>
            <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
              <span className="font-semibold text-rose-400 block mb-1">✗ Tidak Diizinkan:</span>
              <p className="text-stone-400">
                Tidak boleh melompati titik tanpa garis, tidak boleh menggeser bidak ke titik yang sudah ada bidak teman atau lawan.
              </p>
            </div>
          </div>
          <p className="text-xs text-stone-400 italic">
            Tip: Klik bidak Anda untuk melihat lingkaran hijau sebagai penanda arah langkah yang sah.
          </p>
        </div>
      ),
    },
    {
      title: '3. Cara Melompat & Memakan Lawan',
      subtitle: 'Lompatan Garis Lurus & Multi-Makan',
      text: (
        <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
          <p>
            Pemakanan dilakukan dengan cara <strong>melompati bidak lawan</strong> yang berada tepat di
            titik sebelahnya, menuju ke titik kosong tepat di belakangnya sepanjang satu jalur garis lurus.
          </p>
          <div className="bg-amber-950/30 border border-amber-800/50 p-3 rounded-xl text-xs space-y-1.5">
            <p className="font-semibold text-amber-300">Syarat Lompatan Makan:</p>
            <ol className="list-decimal list-inside space-y-1 text-stone-300">
              <li>Bidak Anda dan bidak lawan harus berada di garis lurus yang terhubung pada papan.</li>
              <li>Titik persis setelah bidak lawan harus kosong (tidak terhalang bidak lain).</li>
              <li>Bidak lawan yang dilompati dikeluarkan dari papan permainan.</li>
            </ol>
          </div>
          <div className="p-2.5 bg-stone-900/70 rounded-lg text-xs text-stone-300">
            <strong className="text-amber-400">Pemakanan Beruntun (Multi-Jump):</strong> Jika setelah melompat masih tersedia sasaran makan berikutnya dengan bidak yang sama, Anda dapat langsung melompat lagi!
          </div>
        </div>
      ),
    },
    {
      title: '4. Aturan Pinalti "DAM" (Dam Ora Mangan)',
      subtitle: 'Ciri Khas Filosofi "Eling lan Waspada"',
      text: (
        <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
          <p>
            Inilah keunikan khas nama <strong>"Dam-Daman"</strong>! Dalam tradisi Jawa Barat dan Jawa Timur,
            terdapat pepatah <em>"Dam ora mangan"</em> (karena lupa atau tidak memakan bidak lawan yang terbuka).
          </p>
          <div className="bg-rose-950/30 border border-rose-800/50 p-3 rounded-xl text-xs space-y-2">
            <h5 className="font-bold text-rose-300">Konsekuensi Melalaikan Makan:</h5>
            <p className="text-stone-300">
              Jika seorang pemain memiliki kesempatan sah untuk memakan bidak lawan tetapi justru melangkahkan bidak lain atau tidak memakannya, pemain lawan berhak berseru <strong>"DAM!"</strong> dan <strong>mengambil 3 bidak lawan</strong> secara cuma-cuma sebagai penalti!
            </p>
          </div>
          <p className="text-xs text-stone-400">
            Di dalam game ini, saat lawan melewatkan kesempatan makan, tombol <strong>"Klaim Pinalti DAM!"</strong> akan menyala untuk Anda klaim.
          </p>
        </div>
      ),
    },
    {
      title: '5. Bidak Raja & Syarat Menang',
      subtitle: 'Promosi Raja, Kemenangan Mutlak & Seri',
      text: (
        <div className="space-y-3 text-stone-300 text-sm leading-relaxed">
          <div className="space-y-1.5">
            <h4 className="font-semibold text-yellow-300 text-xs">Variasi Bidak Raja:</h4>
            <p className="text-xs text-stone-300">
              Jika variasi Raja diaktifkan di Pengaturan, bidak biasa yang berhasil menembus ke puncak segitiga paling belakang wilayah lawan akan dipromosikan menjadi <strong>Raja</strong> bermahkota emas dengan keistimewaan langkah.
            </p>
          </div>

          <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800 space-y-1.5 text-xs">
            <h4 className="font-semibold text-stone-200">Kondisi Kemenangan & Seri:</h4>
            <ul className="list-disc list-inside space-y-1 text-stone-400">
              <li><strong className="text-stone-200">Menang Mutlak:</strong> Berhasil menghabiskan seluruh 16 bidak lawan.</li>
              <li><strong className="text-stone-200">Menang Kebuntuan (Stalemate):</strong> Lawan terkunci dan tidak memiliki satu pun gerakan legal saat gilirannya tiba.</li>
              <li><strong className="text-stone-200">Hasil Seri:</strong> Tidak ada pemakanan selama 40 giliran, atau pengulangan posisi yang sama sebanyak 3 kali berturut-turut.</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];
};

/**
 * Format dynamic move descriptions into appropriate language
 */
export const formatMoveDescription = (
  player: string,
  fromNode: string,
  toNode: string,
  isCapture: boolean,
  capturedNode: string | undefined,
  lang: Language
): string => {
  if (lang === 'en') {
    if (isCapture && capturedNode) {
      return `${player} jumped from ${fromNode} to ${toNode} (captured at ${capturedNode})`;
    }
    return `${player} moved from ${fromNode} to ${toNode}`;
  }
  // Indonesian
  if (isCapture && capturedNode) {
    return `${player} lompat dari ${fromNode} ke ${toNode} (memakan bidak di ${capturedNode})`;
  }
  return `${player} melangkah dari ${fromNode} ke ${toNode}`;
};
