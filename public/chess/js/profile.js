/**
 * Player Profile & Session Storage Manager (PlayerProfile)
 * Manages player identity, unique persistent playerId, active online rooms, match history, and win/loss stats.
 * 
 * Features:
 * - Persistent UUID/player identifier across browser sessions
 * - Custom player nickname and avatar emoji selection
 * - Active online rooms tracker for instant reconnection after page refresh or network drop
 * - Match history log with FEN, moves, outcomes, and timestamps
 * - Win/Loss/Draw counter statistics
 */

(function (global) {
  'use strict';

  const STORAGE_KEY_PROFILE = 'alquichess_player_profile_v1';
  const STORAGE_KEY_ACTIVE_SESSION = 'alquichess_active_online_session_v1';

  const DEFAULT_AVATARS = [
    '🧙‍♂️', '👑', '⚔️', '♟️', '🐉', '⚡', 
    '🦅', '🐺', '🦁', '🛡️', '🔥', '🏆', 
    '🎩', '🤖', '🦊', '🦄'
  ];

  /**
   * Helper: Generate a unique short player ID (e.g. "usr_a8f2c9")
   */
  function generatePlayerId() {
    const randomHex = Math.random().toString(16).substring(2, 8) + Date.now().toString(16).slice(-4);
    return `usr_${randomHex}`;
  }

  class PlayerProfileManager {
    constructor() {
      this.profile = this.loadProfile();
    }

    /**
     * Load profile from localStorage or create default
     */
    loadProfile() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
          if (raw) {
            const data = JSON.parse(raw);
            return {
              playerId: data.playerId || generatePlayerId(),
              playerName: data.playerName || 'Alquimista',
              avatar: data.avatar || '🧙‍♂️',
              stats: {
                wins: data.stats?.wins || 0,
                losses: data.stats?.losses || 0,
                draws: data.stats?.draws || 0,
                totalGames: data.stats?.totalGames || 0
              },
              activeRooms: Array.isArray(data.activeRooms) ? data.activeRooms : [],
              history: Array.isArray(data.history) ? data.history : []
            };
          }
        }
      } catch (e) {
        console.warn('PlayerProfile: localStorage read error:', e);
      }

      // Default new profile
      const newProfile = {
        playerId: generatePlayerId(),
        playerName: 'Alquimista',
        avatar: '🧙‍♂️',
        stats: { wins: 0, losses: 0, draws: 0, totalGames: 0 },
        activeRooms: [],
        history: []
      };

      this.saveProfile(newProfile);
      return newProfile;
    }

    /**
     * Save profile to localStorage
     */
    saveProfile(profileData = null) {
      if (profileData) {
        this.profile = { ...this.profile, ...profileData };
      }
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(this.profile));
        }
      } catch (e) {
        console.warn('PlayerProfile: localStorage write error:', e);
      }
      return this.profile;
    }

    /**
     * Update player nickname & avatar
     */
    updateIdentity(playerName, avatar) {
      if (playerName && typeof playerName === 'string') {
        this.profile.playerName = playerName.trim().slice(0, 20);
      }
      if (avatar && typeof avatar === 'string') {
        this.profile.avatar = avatar;
      }
      return this.saveProfile();
    }

    /**
     * Record an active or ongoing online room for reconnection
     */
    saveActiveRoom(roomInfo) {
      if (!roomInfo || !roomInfo.roomCode) return;

      const roomCode = roomInfo.roomCode.trim().toUpperCase();
      const index = this.profile.activeRooms.findIndex(r => r.roomCode === roomCode);

      const entry = {
        roomCode: roomCode,
        role: roomInfo.role || 'host', // 'host' or 'guest'
        assignedColor: roomInfo.assignedColor || 'w',
        opponentName: roomInfo.opponentName || 'Rival Online',
        opponentAvatar: roomInfo.opponentAvatar || '♟️',
        fen: roomInfo.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        moveHistory: Array.isArray(roomInfo.moveHistory) ? roomInfo.moveHistory : [],
        turn: roomInfo.turn || 'w',
        lastActivity: Date.now(),
        createdAt: roomInfo.createdAt || Date.now(),
        status: roomInfo.status || 'active'
      };

      if (index >= 0) {
        this.profile.activeRooms[index] = { ...this.profile.activeRooms[index], ...entry };
      } else {
        // Keep at most 10 active rooms
        this.profile.activeRooms.unshift(entry);
        if (this.profile.activeRooms.length > 10) {
          this.profile.activeRooms.pop();
        }
      }

      this.saveProfile();

      // Also store current active session pointer
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_ACTIVE_SESSION, JSON.stringify(entry));
        }
      } catch (e) {}

      return entry;
    }

    /**
     * Remove an active room (when game is finished or user abandons)
     */
    removeActiveRoom(roomCode) {
      if (!roomCode) return;
      const code = roomCode.trim().toUpperCase();
      this.profile.activeRooms = this.profile.activeRooms.filter(r => r.roomCode !== code);
      this.saveProfile();

      try {
        if (typeof localStorage !== 'undefined') {
          const current = this.getActiveSession();
          if (current && current.roomCode === code) {
            localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
          }
        }
      } catch (e) {}
    }

    /**
     * Get active session pointer if one exists
     */
    getActiveSession() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
          if (raw) return JSON.parse(raw);
        }
      } catch (e) {}
      return null;
    }

    /**
     * Clear active session pointer
     */
    clearActiveSession() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY_ACTIVE_SESSION);
        }
      } catch (e) {}
    }

    /**
     * Record completed game result in stats and history
     */
    recordMatch(resultData) {
      if (!resultData) return;

      const outcome = resultData.result; // 'win' | 'loss' | 'draw'
      if (outcome === 'win') this.profile.stats.wins++;
      else if (outcome === 'loss') this.profile.stats.losses++;
      else if (outcome === 'draw') this.profile.stats.draws++;
      this.profile.stats.totalGames++;

      const historyEntry = {
        id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        date: new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        roomCode: resultData.roomCode || null,
        mode: resultData.mode || 'online',
        opponentName: resultData.opponentName || 'Rival',
        opponentAvatar: resultData.opponentAvatar || '♟️',
        myColor: resultData.myColor || 'w',
        result: outcome,
        reason: resultData.reason || 'Fin de partida',
        movesCount: resultData.movesCount || 0,
        fen: resultData.fen || ''
      };

      this.profile.history.unshift(historyEntry);
      // Keep last 30 games
      if (this.profile.history.length > 30) {
        this.profile.history.pop();
      }

      // If this match was tied to an active room, remove it
      if (resultData.roomCode) {
        this.removeActiveRoom(resultData.roomCode);
      }

      this.saveProfile();
      return historyEntry;
    }

    getProfile() {
      return this.profile;
    }

    getActiveRooms() {
      return this.profile.activeRooms || [];
    }

    getHistory() {
      return this.profile.history || [];
    }

    getStats() {
      return this.profile.stats || { wins: 0, losses: 0, draws: 0, totalGames: 0 };
    }
  }

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerProfileManager;
    module.exports.PlayerProfileManager = PlayerProfileManager;
    module.exports.DEFAULT_AVATARS = DEFAULT_AVATARS;
  }
  if (typeof window !== 'undefined') {
    window.PlayerProfileManager = PlayerProfileManager;
    window.DEFAULT_AVATARS = DEFAULT_AVATARS;
    window.playerProfile = new PlayerProfileManager();
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : globalThis));
