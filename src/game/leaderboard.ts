/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Global Leaderboard & Local Statistics Synchronization Engine for Maen Dam-Daman.
 * 
 * Scoring Rules (Upon Winning):
 * - vs AI (Easy): 1 point
 * - vs AI (Medium): 2 points
 * - vs AI (Hard): 3 points
 * - vs AI (Master / Dewa): 5 points
 * - vs Player (Offline PvP): 2 points
 * - vs Player (Online): 2 points
 * 
 * Storage:
 * - Local: IndexedDB ('DamDamanDB' -> 'player_stats' & 'leaderboard_cache')
 * - Cloud: Supabase Database ('public.player_rankings')
 * - Seamless 100% offline-first fallback with optimistic UI
 */

import { supabase } from './supabaseClient';
import { AIDifficulty } from './aiEngine';

export interface PlayerStats {
  playerId: string;
  playerName: string;
  playerAvatar: string;
  totalPoints: number;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number; // percentage (0 - 100)
  aiEasyWins: number;
  aiMediumWins: number;
  aiHardWins: number;
  aiMasterWins: number;
  pvpWins: number;
  onlineWins: number;
  lastUpdated: number;
}

export interface LeaderboardEntry {
  rank?: number;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  totalPoints: number;
  wins: number;
  losses: number;
  draws: number;
  totalMatches: number;
  winRate: number;
  isCurrentPlayer?: boolean;
}

const PLAYER_ID_STORAGE_KEY = 'damdaman_player_id';
const DB_NAME = 'DamDamanDB';
const DB_VERSION = 2;
const STATS_STORE = 'player_stats';
const CACHE_STORE = 'leaderboard_cache';
const HISTORY_STORE = 'game_history';

/**
 * Retrieve or generate persistent unique player ID for this browser
 */
export function getOrCreatePlayerId(): string {
  try {
    let id = localStorage.getItem(PLAYER_ID_STORAGE_KEY);
    if (!id) {
      id = 'dam_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
      localStorage.setItem(PLAYER_ID_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'dam_local_user';
  }
}

/**
 * Calculate earned points based on official rules
 */
export function calculateMatchPoints(
  result: 'menang' | 'kalah' | 'draw',
  gameMode: 'ai' | 'pvp' | 'online',
  aiDifficulty?: AIDifficulty
): number {
  if (result !== 'menang') return 0;

  if (gameMode === 'ai') {
    switch (aiDifficulty) {
      case 'easy':
        return 1;
      case 'medium':
        return 2;
      case 'hard':
        return 3;
      case 'master':
        return 5;
      default:
        return 2;
    }
  }

  // Melawan pemain lain offline maupun online dapat 2 poin
  if (gameMode === 'pvp' || gameMode === 'online') {
    return 2;
  }

  return 0;
}

/**
 * Open IndexedDB with v2 schema support
 */
function openStatsDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Existing History Store
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        const historyStore = db.createObjectStore(HISTORY_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Player Stats Store
      if (!db.objectStoreNames.contains(STATS_STORE)) {
        db.createObjectStore(STATS_STORE, { keyPath: 'playerId' });
      }

      // Leaderboard Cache Store
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: 'playerId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get initial default stats object
 */
export function createDefaultPlayerStats(
  playerId: string,
  playerName: string,
  playerAvatar: string
): PlayerStats {
  return {
    playerId,
    playerName: playerName || 'Pemain Dam-Daman',
    playerAvatar: playerAvatar || 'pria-batik',
    totalPoints: 0,
    totalMatches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
    aiEasyWins: 0,
    aiMediumWins: 0,
    aiHardWins: 0,
    aiMasterWins: 0,
    pvpWins: 0,
    onlineWins: 0,
    lastUpdated: Date.now(),
  };
}

/**
 * Get current player statistics from local IndexedDB
 */
export async function getLocalPlayerStats(
  playerName: string,
  playerAvatar: string
): Promise<PlayerStats> {
  const playerId = getOrCreatePlayerId();
  try {
    const db = await openStatsDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STATS_STORE, 'readonly');
      const store = tx.objectStore(STATS_STORE);
      const request = store.get(playerId);

      request.onsuccess = () => {
        if (request.result) {
          const stats = request.result as PlayerStats;
          // Update name/avatar if changed
          if (playerName) stats.playerName = playerName;
          if (playerAvatar) stats.playerAvatar = playerAvatar;
          resolve(stats);
        } else {
          const fresh = createDefaultPlayerStats(playerId, playerName, playerAvatar);
          saveLocalPlayerStats(fresh).then(() => resolve(fresh));
        }
      };

      request.onerror = () => {
        resolve(createDefaultPlayerStats(playerId, playerName, playerAvatar));
      };
    });
  } catch {
    return createDefaultPlayerStats(playerId, playerName, playerAvatar);
  }
}

/**
 * Save player stats to local IndexedDB
 */
export async function saveLocalPlayerStats(stats: PlayerStats): Promise<void> {
  try {
    const db = await openStatsDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STATS_STORE, 'readwrite');
      const store = tx.objectStore(STATS_STORE);
      const request = store.put(stats);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Could not save stats to IndexedDB:', err);
  }
}

/**
 * Synchronize player stats to Supabase Cloud
 */
export async function syncPlayerStatsToCloud(stats: PlayerStats): Promise<boolean> {
  try {
    const row = {
      player_id: stats.playerId,
      player_name: stats.playerName,
      player_avatar: stats.playerAvatar,
      total_points: stats.totalPoints,
      wins: stats.wins,
      losses: stats.losses,
      draws: stats.draws,
      total_matches: stats.totalMatches,
      win_rate: stats.winRate,
      ai_easy_wins: stats.aiEasyWins,
      ai_medium_wins: stats.aiMediumWins,
      ai_hard_wins: stats.aiHardWins,
      ai_master_wins: stats.aiMasterWins,
      pvp_wins: stats.pvpWins,
      online_wins: stats.onlineWins,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('player_rankings')
      .upsert(row, { onConflict: 'player_id' });

    if (error) {
      console.warn('Supabase ranking sync notification:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase offline or unreachable:', err);
    return false;
  }
}

/**
 * Fallback baseline champions to ensure leaderboard is always vibrant even before Supabase table has entries
 */
const BASELINE_CHAMPIONS: LeaderboardEntry[] = [
  { playerId: 'bot_001', playerName: 'Ki Ageng Dam', playerAvatar: 'pak-haji', totalPoints: 45, wins: 12, losses: 1, draws: 0, totalMatches: 13, winRate: 92.3 },
  { playerId: 'bot_002', playerName: 'Siti Kebaya', playerAvatar: 'wanita-kebaya', totalPoints: 32, wins: 9, losses: 2, draws: 1, totalMatches: 12, winRate: 75.0 },
  { playerId: 'bot_003', playerName: 'Pendekar Pasuruan', playerAvatar: 'preman-pria-marah', totalPoints: 26, wins: 8, losses: 3, draws: 0, totalMatches: 11, winRate: 72.7 },
  { playerId: 'bot_004', playerName: 'Budi Santoso', playerAvatar: 'pria-batik', totalPoints: 18, wins: 6, losses: 2, draws: 2, totalMatches: 10, winRate: 60.0 },
  { playerId: 'bot_005', playerName: 'Bu Haji Damdaman', playerAvatar: 'bu-haji', totalPoints: 15, wins: 5, losses: 1, draws: 0, totalMatches: 6, winRate: 83.3 },
  { playerId: 'bot_006', playerName: 'Petani Cerdas', playerAvatar: 'petani-pria', totalPoints: 12, wins: 4, losses: 2, draws: 1, totalMatches: 7, winRate: 57.1 },
  { playerId: 'bot_007', playerName: 'Putri Srikandi', playerAvatar: 'wanita-dewasa', totalPoints: 9, wins: 3, losses: 2, draws: 0, totalMatches: 5, winRate: 60.0 },
  { playerId: 'bot_008', playerName: 'Jagoan Cilik', playerAvatar: 'anak-laki-laki', totalPoints: 6, wins: 3, losses: 3, draws: 1, totalMatches: 7, winRate: 42.9 },
];

/**
 * Fetch global leaderboard from Supabase with fallback to local cache & baseline
 */
export async function getGlobalLeaderboard(currentPlayerStats: PlayerStats): Promise<{
  entries: LeaderboardEntry[];
  myRank: number;
  isLiveCloud: boolean;
}> {
  let entries: LeaderboardEntry[] = [];
  let isLiveCloud = false;

  try {
    const { data, error } = await supabase
      .from('player_rankings')
      .select('*')
      .order('total_points', { ascending: false })
      .order('wins', { ascending: false })
      .limit(50);

    if (!error && data && data.length > 0) {
      isLiveCloud = true;
      entries = data.map((row: any) => ({
        playerId: row.player_id,
        playerName: row.player_name,
        playerAvatar: row.player_avatar || 'pria-batik',
        totalPoints: Number(row.total_points) || 0,
        wins: Number(row.wins) || 0,
        losses: Number(row.losses) || 0,
        draws: Number(row.draws) || 0,
        totalMatches: Number(row.total_matches) || 0,
        winRate: Number(row.win_rate) || 0,
      }));

      // RECONCILIATION: Check if current player already exists in Supabase Cloud
      const cloudPlayer = data.find((row: any) => row.player_id === currentPlayerStats.playerId);
      if (cloudPlayer) {
        // Cloud is authoritative! If superuser edited score in Supabase, update local IndexedDB!
        const cloudPoints = Number(cloudPlayer.total_points) || 0;
        const cloudWins = Number(cloudPlayer.wins) || 0;
        const cloudMatches = Number(cloudPlayer.total_matches) || 0;

        if (
          currentPlayerStats.totalPoints !== cloudPoints ||
          currentPlayerStats.wins !== cloudWins ||
          currentPlayerStats.totalMatches !== cloudMatches
        ) {
          currentPlayerStats.totalPoints = cloudPoints;
          currentPlayerStats.wins = cloudWins;
          currentPlayerStats.totalMatches = cloudMatches;
          currentPlayerStats.losses = Number(cloudPlayer.losses) || 0;
          currentPlayerStats.draws = Number(cloudPlayer.draws) || 0;
          currentPlayerStats.winRate = Number(cloudPlayer.win_rate) || 0;
          saveLocalPlayerStats(currentPlayerStats).catch(() => {});
        }
      } else if (currentPlayerStats && currentPlayerStats.playerId && currentPlayerStats.playerName) {
        // Player is new and not in Cloud yet: register them in Supabase Cloud now
        syncPlayerStatsToCloud(currentPlayerStats).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('Using local leaderboard fallback:', err);
  }

  // If cloud table is not ready or returned empty, merge baseline champions
  if (entries.length === 0) {
    entries = [...BASELINE_CHAMPIONS];
  }

  // Ensure current player is included in ranking list
  const existingIndex = entries.findIndex((e) => e.playerId === currentPlayerStats.playerId);
  if (existingIndex >= 0) {
    entries[existingIndex].isCurrentPlayer = true;
  } else {
    entries.push({
      playerId: currentPlayerStats.playerId,
      playerName: currentPlayerStats.playerName,
      playerAvatar: currentPlayerStats.playerAvatar,
      totalPoints: currentPlayerStats.totalPoints,
      wins: currentPlayerStats.wins,
      losses: currentPlayerStats.losses,
      draws: currentPlayerStats.draws,
      totalMatches: currentPlayerStats.totalMatches,
      winRate: currentPlayerStats.winRate,
      isCurrentPlayer: true,
    });
  }

  // Sort descending by points, then by wins
  entries.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    return b.wins - a.wins;
  });

  // Assign 1-based ranks
  let myRank = 1;
  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
    if (entry.playerId === currentPlayerStats.playerId) {
      entry.isCurrentPlayer = true;
      myRank = idx + 1;
    }
  });

  return {
    entries,
    myRank,
    isLiveCloud,
  };
}

/**
 * Record completed match into both local IndexedDB & Supabase
 */
export async function recordMatchPointsAndStats(
  result: 'menang' | 'kalah' | 'draw',
  gameMode: 'ai' | 'pvp' | 'online',
  aiDifficulty: AIDifficulty,
  playerName: string,
  playerAvatar: string
): Promise<{
  pointsEarned: number;
  newStats: PlayerStats;
  isCloudSynced: boolean;
}> {
  const currentStats = await getLocalPlayerStats(playerName, playerAvatar);
  const pointsEarned = calculateMatchPoints(result, gameMode, aiDifficulty);

  // Update statistics
  const newMatches = currentStats.totalMatches + 1;
  const newWins = currentStats.wins + (result === 'menang' ? 1 : 0);
  const newLosses = currentStats.losses + (result === 'kalah' ? 1 : 0);
  const newDraws = currentStats.draws + (result === 'draw' ? 1 : 0);
  const newPoints = currentStats.totalPoints + pointsEarned;
  const newWinRate = Number(((newWins / newMatches) * 100).toFixed(1));

  let easyWins = currentStats.aiEasyWins;
  let mediumWins = currentStats.aiMediumWins;
  let hardWins = currentStats.aiHardWins;
  let masterWins = currentStats.aiMasterWins;
  let pvpWins = currentStats.pvpWins;
  let onlineWins = currentStats.onlineWins;

  if (result === 'menang') {
    if (gameMode === 'ai') {
      if (aiDifficulty === 'easy') easyWins += 1;
      else if (aiDifficulty === 'medium') mediumWins += 1;
      else if (aiDifficulty === 'hard') hardWins += 1;
      else if (aiDifficulty === 'master') masterWins += 1;
    } else if (gameMode === 'pvp') {
      pvpWins += 1;
    } else if (gameMode === 'online') {
      onlineWins += 1;
    }
  }

  const updatedStats: PlayerStats = {
    playerId: currentStats.playerId,
    playerName: playerName || currentStats.playerName,
    playerAvatar: playerAvatar || currentStats.playerAvatar,
    totalPoints: newPoints,
    totalMatches: newMatches,
    wins: newWins,
    losses: newLosses,
    draws: newDraws,
    winRate: newWinRate,
    aiEasyWins: easyWins,
    aiMediumWins: mediumWins,
    aiHardWins: hardWins,
    aiMasterWins: masterWins,
    pvpWins: pvpWins,
    onlineWins: onlineWins,
    lastUpdated: Date.now(),
  };

  // 1. Save to local IndexedDB
  await saveLocalPlayerStats(updatedStats);

  // 2. Sync to Supabase Cloud in the background
  const isCloudSynced = await syncPlayerStatsToCloud(updatedStats);

  return {
    pointsEarned,
    newStats: updatedStats,
    isCloudSynced,
  };
}
