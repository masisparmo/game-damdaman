/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Online Multiplayer Synchronization Engine for Maen Dam-Daman using Supabase Realtime.
 * 
 * Capabilities:
 * 1. Quick Match (Automatic Matchmaking Queue via Presence)
 * 2. Private Rooms (6-digit Code & WhatsApp Shareable Link)
 * 3. Sub-50ms Move Synchronization over WebSocket Broadcast
 * 4. Opponent Connection & Presence Tracking
 * 5. In-game Emoji & Quick Message Reactions
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { GameState, Move, PlayerId } from './rulesEngine';

export type OnlineStatus =
  | 'idle'
  | 'searching_match'
  | 'waiting_for_friend'
  | 'joining'
  | 'playing'
  | 'opponent_disconnected';

export interface OnlineMatchConfig {
  roomId: string;
  myRole: PlayerId; // 'P1' (Host/First) or 'P2' (Guest/Second)
  myName: string;
  opponentName: string;
}

export interface OnlineMovePayload {
  move: Move;
  nextState: GameState;
}

export interface OnlineReactionPayload {
  emoji: string;
  senderName: string;
  senderRole: PlayerId;
}

export class OnlineMatchService {
  private activeChannel: RealtimeChannel | null = null;
  private matchmakingChannel: RealtimeChannel | null = null;
  private currentRoomId: string | null = null;
  private myRole: PlayerId | null = null;
  private myName: string = 'Pemain';
  private opponentName: string = 'Lawan';
  private clientId: string = 'cli_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);

  // Event callbacks
  public onOpponentJoined: ((opponentName: string) => void) | null = null;
  public onRemoteMoveReceived: ((payload: OnlineMovePayload) => void) | null = null;
  public onRemoteClaimDam: (() => void) | null = null;
  public onRemotePassJump: (() => void) | null = null;
  public onRemoteRestart: (() => void) | null = null;
  public onReactionReceived: ((payload: OnlineReactionPayload) => void) | null = null;
  public onOpponentStatusChange: ((connected: boolean) => void) | null = null;
  public onMatchFound: ((config: OnlineMatchConfig) => void) | null = null;

  public setMyName(name: string) {
    this.myName = name || 'Pemain';
  }

  public getMyRole(): PlayerId | null {
    return this.myRole;
  }

  public getRoomId(): string | null {
    return this.currentRoomId;
  }

  public getOpponentName(): string {
    return this.opponentName;
  }

  public getClientId(): string {
    return this.clientId;
  }

  /**
   * Generate a clean 6-digit room code: e.g. DAM-7842
   */
  public generateRoomCode(): string {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `DAM-${randomNum}`;
  }

  /**
   * Host a Private Room for a friend
   */
  public async createPrivateRoom(roomCode: string, playerName: string): Promise<string> {
    console.log(`[OnlineMatch] createPrivateRoom called with roomCode: ${roomCode}, name: ${playerName}`);
    await this.cleanup();
    this.currentRoomId = roomCode;
    this.myRole = 'P1';
    this.myName = playerName || 'Pemain 1';

    const channelName = `damdaman:room:${roomCode}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: this.clientId },
      },
    });
    this.activeChannel = channel;

    this.setupRoomListeners(channel);

    await channel.subscribe(async (status) => {
      console.log(`[OnlineMatch] Host subscribed to ${channelName}: ${status}`);
      if (status === 'SUBSCRIBED') {
        await channel.track({
          role: 'P1',
          name: this.myName,
          clientId: this.clientId,
          joinedAt: Date.now(),
        });
      }
    });

    return roomCode;
  }

  /**
   * Join an existing Private Room using code
   */
  public async joinPrivateRoom(roomCode: string, playerName: string): Promise<void> {
    console.log(`[OnlineMatch] joinPrivateRoom called with roomCode: ${roomCode}, name: ${playerName}`);
    await this.cleanup();
    this.currentRoomId = roomCode;
    this.myRole = 'P2';
    this.myName = playerName || 'Pemain 2';

    const channelName = `damdaman:room:${roomCode}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: this.clientId },
      },
    });
    this.activeChannel = channel;

    this.setupRoomListeners(channel);

    await channel.subscribe(async (status) => {
      console.log(`[OnlineMatch] Guest subscribed to ${channelName}: ${status}`);
      if (status === 'SUBSCRIBED') {
        await channel.track({
          role: 'P2',
          name: this.myName,
          clientId: this.clientId,
          joinedAt: Date.now(),
        });

        // Notify host immediately that guest has entered
        setTimeout(() => {
          channel.send({
            type: 'broadcast',
            event: 'player_joined',
            payload: { name: this.myName, role: 'P2', clientId: this.clientId },
          });
        }, 100);
      }
    });
  }

  /**
   * Quick Matchmaking Queue
   */
  public async startMatchmaking(playerName: string): Promise<void> {
    console.log(`[OnlineMatch] startMatchmaking called for ${playerName} (clientId: ${this.clientId})`);
    await this.cleanup();
    this.myName = playerName || 'Pemain';

    const myJoinedAt = Date.now();
    const myClientId = this.clientId;
    let isMatched = false;

    const lobbyChannel = supabase.channel('damdaman:matchmaking_queue', {
      config: {
        presence: { key: myClientId },
      },
    });
    this.matchmakingChannel = lobbyChannel;

    lobbyChannel.on('presence', { event: 'sync' }, () => {
      if (isMatched) return;
      const state = lobbyChannel.presenceState();
      const users: Array<{ name: string; clientId: string; joinedAt: number }> = [];

      for (const key of Object.keys(state)) {
        const presences = state[key] as any[];
        if (presences && presences.length > 0) {
          users.push(presences[0]);
        }
      }

      console.log(`[OnlineMatch] Queue presence sync: ${users.length} player(s) waiting:`, users.map(u => `${u.name} (${u.clientId})`));

      // If at least 2 distinct clients are waiting in queue
      if (users.length >= 2) {
        // Sort deterministically by joinedAt, then clientId
        users.sort((a, b) => {
          if ((a.joinedAt || 0) !== (b.joinedAt || 0)) {
            return (a.joinedAt || 0) - (b.joinedAt || 0);
          }
          return (a.clientId || '').localeCompare(b.clientId || '');
        });

        const playerA = users[0];
        const playerB = users[1];

        // Ensure playerA and playerB are actually different clients
        if (playerA.clientId === playerB.clientId) return;

        // If I am either Player A or Player B, coordinate room pairing
        if (playerA.clientId === myClientId || playerB.clientId === myClientId) {
          const generatedRoom = `DAM-QM${Math.abs(playerA.joinedAt % 10000).toString().padStart(4, '0')}`;
          console.log(`[OnlineMatch] Pair found! Sending match_paired for room ${generatedRoom}`);
          lobbyChannel.send({
            type: 'broadcast',
            event: 'match_paired',
            payload: {
              targetAId: playerA.clientId,
              targetBId: playerB.clientId,
              roomId: generatedRoom,
              hostName: playerA.name,
              guestName: playerB.name,
            },
          });
        }
      }
    });

    lobbyChannel.on('broadcast', { event: 'match_paired' }, async ({ payload }) => {
      if (isMatched) return;

      if (payload.targetAId === myClientId) {
        // I am Host (P1)
        console.log(`[OnlineMatch] I am HOST (P1) for room ${payload.roomId}`);
        isMatched = true;
        this.cancelMatchmaking();
        this.opponentName = payload.guestName;
        await this.createPrivateRoom(payload.roomId, this.myName);
        this.onMatchFound?.({
          roomId: payload.roomId,
          myRole: 'P1',
          myName: this.myName,
          opponentName: payload.guestName,
        });
      } else if (payload.targetBId === myClientId) {
        // I am Guest (P2)
        console.log(`[OnlineMatch] I am GUEST (P2) for room ${payload.roomId}`);
        isMatched = true;
        this.cancelMatchmaking();
        this.opponentName = payload.hostName;
        // Wait slightly so host creates room first
        await new Promise((r) => setTimeout(r, 200));
        await this.joinPrivateRoom(payload.roomId, this.myName);
        this.onMatchFound?.({
          roomId: payload.roomId,
          myRole: 'P2',
          myName: this.myName,
          opponentName: payload.hostName,
        });
      }
    });

    await lobbyChannel.subscribe(async (status) => {
      console.log(`[OnlineMatch] Matchmaking queue subscribed: ${status}`);
      if (status === 'SUBSCRIBED') {
        await lobbyChannel.track({
          name: this.myName,
          clientId: myClientId,
          joinedAt: myJoinedAt,
        });
      }
    });
  }

  /**
   * Cancel matchmaking queue
   */
  public cancelMatchmaking() {
    if (this.matchmakingChannel) {
      console.log('[OnlineMatch] Cancelling matchmaking queue channel');
      supabase.removeChannel(this.matchmakingChannel);
      this.matchmakingChannel = null;
    }
  }

  /**
   * Setup Realtime Event Listeners for an active game room
   */
  private setupRoomListeners(channel: RealtimeChannel) {
    // Player joined event
    channel.on('broadcast', { event: 'player_joined' }, ({ payload }) => {
      console.log('[OnlineMatch] Received player_joined event:', payload);
      if (payload && payload.clientId !== this.clientId) {
        if (payload.name) {
          this.opponentName = payload.name;
        }
        this.onOpponentJoined?.(this.opponentName);
        this.onOpponentStatusChange?.(true);

        // If I am host, reply with host_ack so guest knows I am here
        if (this.myRole === 'P1') {
          channel.send({
            type: 'broadcast',
            event: 'host_ack',
            payload: { name: this.myName, role: 'P1', clientId: this.clientId },
          });
        }
      }
    });

    // Host acknowledgement
    channel.on('broadcast', { event: 'host_ack' }, ({ payload }) => {
      console.log('[OnlineMatch] Received host_ack event:', payload);
      if (payload && payload.clientId !== this.clientId) {
        if (payload.name) {
          this.opponentName = payload.name;
        }
        this.onOpponentJoined?.(this.opponentName);
        this.onOpponentStatusChange?.(true);
      }
    });

    // Move execution event
    channel.on('broadcast', { event: 'game_move' }, ({ payload }) => {
      console.log('[OnlineMatch] Received game_move from remote opponent:', payload);
      if (payload && payload.move && payload.nextState) {
        this.onRemoteMoveReceived?.(payload);
      }
    });

    // Claim DAM penalty event
    channel.on('broadcast', { event: 'claim_dam' }, () => {
      console.log('[OnlineMatch] Received claim_dam event');
      this.onRemoteClaimDam?.();
    });

    // Pass multi-jump event
    channel.on('broadcast', { event: 'pass_jump' }, () => {
      console.log('[OnlineMatch] Received pass_jump event');
      this.onRemotePassJump?.();
    });

    // Game restart event
    channel.on('broadcast', { event: 'restart_game' }, () => {
      console.log('[OnlineMatch] Received restart_game event');
      this.onRemoteRestart?.();
    });

    // Reaction event (emoji / quick message)
    channel.on('broadcast', { event: 'reaction' }, ({ payload }) => {
      console.log('[OnlineMatch] Received reaction:', payload);
      if (payload && payload.emoji) {
        this.onReactionReceived?.(payload);
      }
    });

    // Track presence state for robust connection detection
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('[OnlineMatch] Room presence sync:', state);
      let foundOpponent = false;

      for (const key of Object.keys(state)) {
        const presences = state[key] as any[];
        for (const p of presences) {
          if (p.clientId && p.clientId !== this.clientId) {
            foundOpponent = true;
            if (p.name) {
              this.opponentName = p.name;
              this.onOpponentJoined?.(p.name);
            }
          }
        }
      }

      this.onOpponentStatusChange?.(foundOpponent);
    });

    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      console.log('[OnlineMatch] Presence leave:', leftPresences);
      const isOpponentLeaving = leftPresences?.some((p: any) => p.clientId !== this.clientId);
      if (isOpponentLeaving) {
        this.onOpponentStatusChange?.(false);
      }
    });
  }

  /**
   * Broadcast a move made by the local player
   */
  public broadcastMove(move: Move, nextState: GameState) {
    if (!this.activeChannel) {
      console.warn('[OnlineMatch] broadcastMove ignored: activeChannel is null!');
      return;
    }
    console.log('[OnlineMatch] Broadcasting move:', move);
    this.activeChannel.send({
      type: 'broadcast',
      event: 'game_move',
      payload: { move, nextState },
    });
  }

  /**
   * Broadcast claim DAM penalty
   */
  public broadcastClaimDam() {
    if (!this.activeChannel) return;
    this.activeChannel.send({
      type: 'broadcast',
      event: 'claim_dam',
      payload: {},
    });
  }

  /**
   * Broadcast passing consecutive jump
   */
  public broadcastPassJump() {
    if (!this.activeChannel) return;
    this.activeChannel.send({
      type: 'broadcast',
      event: 'pass_jump',
      payload: {},
    });
  }

  /**
   * Broadcast match restart
   */
  public broadcastRestart() {
    if (!this.activeChannel) return;
    this.activeChannel.send({
      type: 'broadcast',
      event: 'restart_game',
      payload: {},
    });
  }

  /**
   * Send emoji reaction / quick chat
   */
  public broadcastReaction(emoji: string) {
    if (!this.activeChannel || !this.myRole) return;
    this.activeChannel.send({
      type: 'broadcast',
      event: 'reaction',
      payload: {
        emoji,
        senderName: this.myName,
        senderRole: this.myRole,
      },
    });
  }

  /**
   * Clean up channels
   */
  public async cleanup() {
    console.log('[OnlineMatch] Cleaning up active channels');
    if (this.activeChannel) {
      await supabase.removeChannel(this.activeChannel);
      this.activeChannel = null;
    }
    if (this.matchmakingChannel) {
      await supabase.removeChannel(this.matchmakingChannel);
      this.matchmakingChannel = null;
    }
    this.currentRoomId = null;
    this.myRole = null;
  }
}

// Global singleton instance
export const onlineMatch = new OnlineMatchService();
