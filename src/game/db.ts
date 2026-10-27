/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * IndexedDB storage service for Maen Dam-Daman match history.
 * Stores:
 * - playerName: Name of the player
 * - opponentName: Name of opponent / AI difficulty
 * - gameMode: 'ai' | 'pvp'
 * - date: DDMMYYYY formatted string
 * - time: HH:MM:SS formatted time string
 * - durationMinutes: Duration in minutes (e.g. 2.4 or 3)
 * - result: 'menang' | 'kalah' | 'draw'
 * - movesCount: Total number of moves played
 * - p1Remaining: Player 1 pieces remaining
 * - p2Remaining: Player 2 / AI pieces remaining
 * - timestamp: Epoch millisecond timestamp for ordering
 */

export interface GameHistoryRecord {
  id?: number;
  playerName: string;
  opponentName: string;
  gameMode: 'ai' | 'pvp' | 'online';
  date: string; // DDMMYYYY format, e.g. "26102026"
  dateFormatted: string; // Display friendly format, e.g. "26/10/2026"
  time: string; // e.g. "14:15:30"
  durationMinutes: number; // e.g. 2.5
  durationFormatted: string; // e.g. "2m 30s" or "3 menit"
  result: 'menang' | 'kalah' | 'draw';
  winner: string | null;
  movesCount: number;
  p1Remaining: number;
  p2Remaining: number;
  timestamp: number;
}

const DB_NAME = 'DamDamanDB';
const DB_VERSION = 1;
const STORE_NAME = 'game_history';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported on this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('playerName', 'playerName', { unique: false });
        store.createIndex('result', 'result', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Format a Date object to DDMMYYYY string (e.g. 26102026)
 */
export function formatDDMMYYYY(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear());
  return `${d}${m}${y}`;
}

/**
 * Format a Date object to human-friendly DD/MM/YYYY
 */
export function formatDisplayDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear());
  return `${d}/${m}/${y}`;
}

/**
 * Format time to HH:mm:ss
 */
export function formatTime(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

/**
 * Save a completed game match into IndexedDB
 */
export async function saveGameHistory(record: Omit<GameHistoryRecord, 'id'>): Promise<number> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(record);

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve all matches sorted with newest first
 */
export async function getAllGameHistory(): Promise<GameHistoryRecord[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const request = index.openCursor(null, 'prev'); // descending order

    const results: GameHistoryRecord[] = [];
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        results.push(cursor.value);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear all game history records
 */
export async function clearAllGameHistory(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a specific game record by ID
 */
export async function deleteGameHistory(id: number): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
