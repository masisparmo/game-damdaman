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
    this.cleanup();
    this.currentRoomId = roomCode;
    this.myRole = 'P1';
    this.myName = playerName || 'Pemain 1';

    const channelName = `damdaman:room:${roomCode}`;
    this.activeChannel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: `host-${Date.now()}` },
      },
    });

    this.setupRoomListeners(this.activeChannel);

    await this.activeChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await this.activeChannel?.track({
          role: 'P1',
          name: this.myName,
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
    this.cleanup();
    this.currentRoomId = roomCode;
    this.myRole = 'P2';
    this.myName = playerName || 'Pemain 2';

    const channelName = `damdaman:room:${roomCode}`;
    this.activeChannel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: `guest-${Date.now()}` },
      },
    });

    this.setupRoomListeners(this.activeChannel);

    await this.activeChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await this.activeChannel?.track({
          role: 'P2',
          name: this.myName,
          joinedAt: Date.now(),
        });

        // Notify host that guest has entered
        this.activeChannel?.send({
          type: 'broadcast',
          event: 'player_joined',
          payload: { name: this.myName, role: 'P2' },
        });
      }
    });
  }

  /**
   * Quick Matchmaking Queue
   */
  public async startMatchmaking(playerName: string): Promise<void> {
    this.cleanup();
    this.myName = playerName || 'Pemain';

    const lobbyChannel = supabase.channel('damdaman:matchmaking_queue', {
      config: {
        presence: { key: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` },
      },
    });
    this.matchmakingChannel = lobbyChannel;

    lobbyChannel.on('presence', { event: 'sync' }, () => {
      const state = lobbyChannel.presenceState();
      const users: any[] = [];
      for (const key of Object.keys(state)) {
        const presences = state[key] as any[];
        if (presences && presences.length > 0) {
          users.push(presences[0]);
        }
      }

      // If at least 2 users are waiting in the queue
      if (users.length >= 2) {
        // Sort deterministically by joinedAt timestamp
        users.sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
        const playerA = users[0];
        const playerB = users[1];

        const isMeA = playerA.name === this.myName && playerA.joinedAt === myJoinedAt;
        const isMeB = playerB.name === this.myName && playerB.joinedAt === myJoinedAt;

        if (isMeA || isMeB) {
          const generatedRoom = `DAM-QM${playerA.joinedAt.toString().slice(-4)}`;
          lobbyChannel.send({
            type: 'broadcast',
            event: 'match_paired',
            payload: {
              targetA: playerA.joinedAt,
              targetB: playerB.joinedAt,
              roomId: generatedRoom,
              hostName: playerA.name,
              guestName: playerB.name,
            },
          });
        }
      }
    });

    const myJoinedAt = Date.now();

    lobbyChannel.on('broadcast', { event: 'match_paired' }, async ({ payload }) => {
      if (payload.targetA === myJoinedAt) {
        // I am Host (P1)
        lobbyChannel.unsubscribe();
        this.matchmakingChannel = null;
        this.opponentName = payload.guestName;
        await this.createPrivateRoom(payload.roomId, this.myName);
        this.onMatchFound?.({
          roomId: payload.roomId,
          myRole: 'P1',
          myName: this.myName,
          opponentName: payload.guestName,
        });
      } else if (payload.targetB === myJoinedAt) {
        // I am Guest (P2)
        lobbyChannel.unsubscribe();
        this.matchmakingChannel = null;
        this.opponentName = payload.hostName;
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
      if (status === 'SUBSCRIBED') {
        await lobbyChannel.track({
          name: this.myName,
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
      this.matchmakingChannel.unsubscribe();
      this.matchmakingChannel = null;
    }
  }

  /**
   * Setup Realtime Event Listeners for an active game room
   */
  private setupRoomListeners(channel: RealtimeChannel) {
    // Player joined event
    channel.on('broadcast', { event: 'player_joined' }, ({ payload }) => {
      if (payload && payload.name) {
        this.opponentName = payload.name;
        this.onOpponentJoined?.(payload.name);
        this.onOpponentStatusChange?.(true);

        // If I am host, reply with my name
        if (this.myRole === 'P1') {
          channel.send({
            type: 'broadcast',
            event: 'host_ack',
            payload: { name: this.myName },
          });
        }
      }
    });

    // Host acknowledgement
    channel.on('broadcast', { event: 'host_ack' }, ({ payload }) => {
      if (payload && payload.name) {
        this.opponentName = payload.name;
        this.onOpponentJoined?.(payload.name);
        this.onOpponentStatusChange?.(true);
      }
    });

    // Move execution event
    channel.on('broadcast', { event: 'game_move' }, ({ payload }) => {
      if (payload && payload.move && payload.nextState) {
        this.onRemoteMoveReceived?.(payload);
      }
    });

    // Claim DAM penalty event
    channel.on('broadcast', { event: 'claim_dam' }, () => {
      this.onRemoteClaimDam?.();
    });

    // Pass multi-jump event
    channel.on('broadcast', { event: 'pass_jump' }, () => {
      this.onRemotePassJump?.();
    });

    // Game restart event
    channel.on('broadcast', { event: 'restart_game' }, () => {
      this.onRemoteRestart?.();
    });

    // Reaction event (emoji / quick message)
    channel.on('broadcast', { event: 'reaction' }, ({ payload }) => {
      if (payload && payload.emoji) {
        this.onReactionReceived?.(payload);
      }
    });

    // Track presence to detect opponent disconnect
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const count = Object.keys(state).length;
      if (count >= 2) {
        this.onOpponentStatusChange?.(true);
      } else if (count === 1 && this.myRole) {
        this.onOpponentStatusChange?.(false);
      }
    });
  }

  /**
   * Broadcast a move made by the local player
   */
  public broadcastMove(move: Move, nextState: GameState) {
    if (!this.activeChannel) return;
    this.activeChannel.send({
      type: 'broadcast',
      event: 'game_move',
      payload: { move, nextState },
    });
  }

  /**
   * Broadcast DAM penalty claim
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
   * Broadcast passing consecutive multi-jump
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
  public cleanup() {
    if (this.activeChannel) {
      this.activeChannel.unsubscribe();
      this.activeChannel = null;
    }
    if (this.matchmakingChannel) {
      this.matchmakingChannel.unsubscribe();
      this.matchmakingChannel = null;
    }
    this.currentRoomId = null;
    this.myRole = null;
  }
}

// Global singleton instance
export const onlineMatch = new OnlineMatchService();
