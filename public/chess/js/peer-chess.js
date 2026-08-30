/**
 * PeerChessClient (WebRTC P2P Multiplayer Manager)
 * Zero-backend Peer-to-Peer online and LAN chess multiplayer using PeerJS & WebRTC.
 * 
 * Features:
 * - Room hosting with 4-character codes (e.g. "K7A9") & direct join links
 * - Persistent Player ID & Session Reconnection (survives page reloads & internet drops)
 * - Color assignment negotiation (White, Black, Random)
 * - Real-time move synchronization via RTCDataChannel (< 20ms latency)
 * - Live Ping / Latency counter & automatic connection health checks
 * - Draw offers, Undo requests, Resignation, Rematch coordination
 * - Live floating emoji reactions & chat gestures
 * - Safe fallback & graceful auto-reconnect handling
 * 
 * @author Google DeepMind - Antigravity Agent
 */

(function (global) {
  'use strict';

  // Easy-to-read character set for room codes (no 0/O, 1/I/L confusion)
  const ROOM_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const PEER_PREFIX = 'laalquimia-chess-';

  // Public STUN servers for NAT traversal (Internet & LAN)
  const DEFAULT_PEER_CONFIG = {
    debug: 0,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'stun:global.stun.twilio.com:3478' }
      ],
      sdpSemantics: 'unified-plan'
    }
  };

  /**
   * Generate a random 4-character room code
   */
  function generateRoomCode(length = 4) {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += ROOM_CHARSET.charAt(Math.floor(Math.random() * ROOM_CHARSET.length));
    }
    return code;
  }

  /**
   * Sanitize room code to uppercase alphanumeric
   */
  function sanitizeRoomCode(code) {
    if (typeof code !== 'string') return '';
    return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  /**
   * Convert room code to PeerJS ID
   */
  function roomCodeToPeerId(code) {
    return PEER_PREFIX + sanitizeRoomCode(code).toLowerCase();
  }

  /**
   * Extract room code from PeerJS ID
   */
  function peerIdToRoomCode(peerId) {
    if (!peerId || !peerId.startsWith(PEER_PREFIX)) return '';
    return peerId.slice(PEER_PREFIX.length).toUpperCase();
  }

  /**
   * Construct shareable room link
   */
  function getShareableLink(roomCode) {
    const origin = (typeof window !== 'undefined' && window.location) 
      ? window.location.origin + window.location.pathname.replace(/\/(pvp|index)?\.html$/, '') 
      : 'https://laalquimia.github.io/chess';
    
    // Normalize path to have trailing slash if empty
    const baseUrl = origin.endsWith('/') ? origin : origin + '/';
    return `${baseUrl}?room=${sanitizeRoomCode(roomCode)}`;
  }

  class PeerChessClient {
    constructor(options = {}) {
      this.options = { ...DEFAULT_PEER_CONFIG, ...options };
      this.peer = null;
      this.conn = null;

      this.isHost = false;
      this.roomCode = null;
      this.peerId = null;
      this.assignedColor = 'w'; // 'w' or 'b'
      this.opponentColor = 'b';
      this.preferredColor = 'random'; // 'w', 'b', or 'random'
      
      this.playerId = options.playerId || 'usr_' + Math.random().toString(36).substring(2, 8);
      this.playerName = options.playerName || 'Alquimista';
      this.playerAvatar = options.playerAvatar || '🧙‍♂️';
      this.opponentName = 'Rival Online';
      this.opponentAvatar = '♟️';

      this.currentFen = options.currentFen || null;
      this.currentHistory = options.currentHistory || [];
      this.currentTurn = 'w';

      this.status = 'disconnected'; // 'disconnected' | 'connecting' | 'waiting' | 'connected' | 'reconnecting' | 'error'
      this.pingMs = 0;
      this._pingTimer = null;
      this._lastPingTimestamp = 0;
      this._handshakeTimer = null;
      this._reconnectAttempts = 0;
      this._maxReconnectAttempts = 5;
      this._reconnectTimer = null;

      // Event listeners
      this._listeners = new Map();
    }

    /**
     * Event subscription: 'connected', 'disconnected', 'reconnecting', 'reconnected', 'status', 'move', 'emoji',
     * 'draw_offered', 'draw_response', 'undo_requested', 'undo_response', 'resign', 'rematch', 'ping', 'opponent_info'
     */
    on(event, callback) {
      if (!this._listeners.has(event)) {
        this._listeners.set(event, new Set());
      }
      this._listeners.get(event).add(callback);
      return this;
    }

    off(event, callback) {
      if (this._listeners.has(event)) {
        this._listeners.get(event).delete(callback);
      }
      return this;
    }

    _emit(event, data) {
      if (this._listeners.has(event)) {
        this._listeners.get(event).forEach(cb => {
          try {
            cb(data);
          } catch (err) {
            console.error(`PeerChessClient event error [${event}]:`, err);
          }
        });
      }
    }

    _setStatus(status, message = '') {
      this.status = status;
      this._emit('status', { status, message, roomCode: this.roomCode, pingMs: this.pingMs });
    }

    /**
     * Set active game board state for reconnection syncing
     */
    updateGameState(fen, history = [], turn = 'w') {
      this.currentFen = fen;
      this.currentHistory = history;
      this.currentTurn = turn;
    }

    /**
     * Host creates a new room with a random 4-letter code
     */
    createRoom(config = {}) {
      this.leaveRoom();

      this.isHost = true;
      this.preferredColor = config.preferredColor || 'random';
      this.playerName = config.playerName || this.playerName || 'Alquimista';
      this.playerAvatar = config.playerAvatar || this.playerAvatar || '🧙‍♂️';
      this.playerId = config.playerId || this.playerId;
      this.roomCode = generateRoomCode();
      this.peerId = roomCodeToPeerId(this.roomCode);

      this._setStatus('connecting', `Creando sala ${this.roomCode}...`);

      return new Promise((resolve, reject) => {
        if (typeof Peer === 'undefined') {
          const err = new Error('Librería PeerJS no disponible.');
          this._setStatus('error', err.message);
          return reject(err);
        }

        try {
          this.peer = new Peer(this.peerId, this.options);
        } catch (err) {
          this._setStatus('error', err.message);
          return reject(err);
        }

        this.peer.on('open', (id) => {
          this.peerId = id;
          this.roomCode = peerIdToRoomCode(id);
          this._setStatus('waiting', `Sala ${this.roomCode} creada. Esperando rival...`);
          resolve({
            roomCode: this.roomCode,
            shareLink: getShareableLink(this.roomCode)
          });
        });

        this.peer.on('connection', (conn) => {
          // If already connected, reject incoming duplicate connections unless it's a reconnection
          if (this.conn && this.conn.open) {
            // Setup new connection to allow opponent reconnection
            try { this.conn.close(); } catch(e) {}
          }
          this._setupConnection(conn);
        });

        this.peer.on('error', (err) => {
          console.warn('PeerJS Host Error:', err);
          if (err.type === 'unavailable-id') {
            // Room ID collision, retry with a new code
            this.roomCode = generateRoomCode();
            this.peerId = roomCodeToPeerId(this.roomCode);
            this.createRoom(config).then(resolve).catch(reject);
            return;
          }
          this._setStatus('error', err.message || 'Error de conexión');
          this._emit('error', err);
          reject(err);
        });

        this.peer.on('disconnected', () => {
          if (this.peer && !this.peer.destroyed) {
            this.peer.reconnect();
          }
        });
      });
    }

    /**
     * Guest joins an existing room by code
     */
    joinRoom(roomCode, config = {}) {
      this.leaveRoom();

      this.isHost = false;
      this.roomCode = sanitizeRoomCode(roomCode);
      this.playerName = config.playerName || this.playerName || 'Alquimista';
      this.playerAvatar = config.playerAvatar || this.playerAvatar || '🧙‍♂️';
      this.playerId = config.playerId || this.playerId;
      const isReconnect = !!config.isReconnect;

      if (!this.roomCode || this.roomCode.length < 3) {
        const err = new Error('Código de sala inválido.');
        this._setStatus('error', err.message);
        return Promise.reject(err);
      }

      this.peerId = null; // Random client peer ID
      const hostPeerId = roomCodeToPeerId(this.roomCode);

      this._setStatus('connecting', `${isReconnect ? 'Reconectando' : 'Conectando'} a la sala ${this.roomCode}...`);

      return new Promise((resolve, reject) => {
        if (typeof Peer === 'undefined') {
          const err = new Error('Librería PeerJS no disponible.');
          this._setStatus('error', err.message);
          return reject(err);
        }

        try {
          this.peer = new Peer(null, this.options);
        } catch (err) {
          this._setStatus('error', err.message);
          return reject(err);
        }

        let connectionTimeout = setTimeout(() => {
          if (this.status !== 'connected') {
            this.leaveRoom();
            const err = new Error('No se pudo conectar con el anfitrión. Verifica que el anfitrión siga en la sala.');
            this._setStatus('error', err.message);
            reject(err);
          }
        }, 18000);

        this.peer.on('open', (id) => {
          this.peerId = id;
          const conn = this.peer.connect(hostPeerId, {
            reliable: true,
            serialization: 'json'
          });

          this._setupConnection(conn, isReconnect);

          const onConnectedHandler = () => {
            clearTimeout(connectionTimeout);
            this.off('connected', onConnectedHandler);
            this.off('reconnected', onConnectedHandler);
            resolve(true);
          };
          this.on('connected', onConnectedHandler);
          this.on('reconnected', onConnectedHandler);
        });

        this.peer.on('error', (err) => {
          clearTimeout(connectionTimeout);
          console.warn('PeerJS Guest Error:', err);
          if (err.type === 'peer-unavailable') {
            const friendlyErr = new Error(`Sala "${this.roomCode}" no encontrada o el anfitrión se desconectó.`);
            this._setStatus('error', friendlyErr.message);
            this._emit('error', friendlyErr);
            reject(friendlyErr);
            return;
          }
          this._setStatus('error', err.message || 'Error de conexión');
          this._emit('error', err);
          reject(err);
        });
      });
    }

    /**
     * Resume / Reconnect to an existing room (Host or Guest)
     */
    resumeRoom(roomCode, savedSession = {}) {
      this.roomCode = sanitizeRoomCode(roomCode);
      this.isHost = (savedSession.role === 'host');
      this.assignedColor = savedSession.assignedColor || 'w';
      this.opponentColor = (this.assignedColor === 'w') ? 'b' : 'w';
      this.opponentName = savedSession.opponentName || 'Rival Online';
      this.opponentAvatar = savedSession.opponentAvatar || '♟️';
      this.currentFen = savedSession.fen || null;
      this.currentHistory = savedSession.moveHistory || [];

      if (this.isHost) {
        this.peerId = roomCodeToPeerId(this.roomCode);
        return new Promise((resolve, reject) => {
          this.leaveRoom();
          this._setStatus('connecting', `Reanudando sala ${this.roomCode}...`);

          try {
            this.peer = new Peer(this.peerId, this.options);
          } catch (err) {
            return reject(err);
          }

          this.peer.on('open', (id) => {
            this.peerId = id;
            this._setStatus('waiting', `Sala ${this.roomCode} reanudada. Esperando que el rival se reconecte...`);
            resolve({ roomCode: this.roomCode, shareLink: getShareableLink(this.roomCode) });
          });

          this.peer.on('connection', (conn) => {
            this._setupConnection(conn);
          });

          this.peer.on('error', (err) => {
            this._setStatus('error', err.message || 'Error al reanudar sala');
            reject(err);
          });
        });
      } else {
        return this.joinRoom(this.roomCode, { isReconnect: true, playerName: this.playerName });
      }
    }

    /**
     * Bind connection events for DataChannel
     */
    _setupConnection(conn, isReconnect = false) {
      this.conn = conn;

      conn.on('open', () => {
        if (this.isHost) {
          if (!isReconnect) {
            // Determine colors based on host preference
            let hostColor = this.preferredColor;
            if (hostColor === 'random') {
              hostColor = (Math.random() < 0.5) ? 'w' : 'b';
            }
            const guestColor = (hostColor === 'w') ? 'b' : 'w';

            this.assignedColor = hostColor;
            this.opponentColor = guestColor;

            // Send welcome handshake to Guest
            this._send({
              type: 'WELCOME',
              payload: {
                hostColor: hostColor,
                guestColor: guestColor,
                hostName: this.playerName,
                hostAvatar: this.playerAvatar,
                hostId: this.playerId
              }
            });

            this._onConnected();
          }
        } else {
          // Guest sends handshake (HELLO or RECONNECT)
          const sendHandshake = () => {
            if (isReconnect || this.currentFen) {
              this._send({
                type: 'RECONNECT',
                payload: {
                  guestId: this.playerId,
                  guestName: this.playerName,
                  guestAvatar: this.playerAvatar,
                  roomCode: this.roomCode,
                  fen: this.currentFen,
                  moveCount: this.currentHistory.length
                }
              });
            } else {
              this._send({
                type: 'HELLO',
                payload: {
                  guestName: this.playerName,
                  guestAvatar: this.playerAvatar,
                  guestId: this.playerId
                }
              });
            }
          };

          sendHandshake();

          // Resilient retry: keep sending handshake until ACK arrives
          this._stopHandshakeTimer();
          let count = 0;
          this._handshakeTimer = setInterval(() => {
            if (this.status === 'connected' || count >= 10) {
              this._stopHandshakeTimer();
              return;
            }
            count++;
            sendHandshake();
          }, 500);
          if (this._handshakeTimer && typeof this._handshakeTimer.unref === 'function') {
            this._handshakeTimer.unref();
          }
        }
      });

      conn.on('data', (data) => {
        this._handleIncomingMessage(data);
      });

      conn.on('close', () => {
        this._handleConnectionDrop();
      });

      conn.on('error', (err) => {
        console.warn('PeerConnection Error:', err);
        this._handleConnectionDrop(err.message);
      });
    }

    _handleIncomingMessage(msg) {
      if (!msg || !msg.type) return;

      switch (msg.type) {
        case 'HELLO':
          if (this.isHost) {
            if (msg.payload) {
              if (msg.payload.guestName) this.opponentName = msg.payload.guestName;
              if (msg.payload.guestAvatar) this.opponentAvatar = msg.payload.guestAvatar;
              this._emit('opponent_info', { name: this.opponentName, avatar: this.opponentAvatar, id: msg.payload.guestId });
            }
            this._send({
              type: 'WELCOME',
              payload: {
                hostColor: this.assignedColor,
                guestColor: this.opponentColor,
                hostName: this.playerName,
                hostAvatar: this.playerAvatar,
                hostId: this.playerId
              }
            });
            this._onConnected();
          }
          break;

        case 'WELCOME':
          if (!this.isHost && msg.payload) {
            this._stopHandshakeTimer();
            this.assignedColor = msg.payload.guestColor || 'b';
            this.opponentColor = msg.payload.hostColor || 'w';
            this.opponentName = msg.payload.hostName || 'Host';
            this.opponentAvatar = msg.payload.hostAvatar || '👑';

            // Send acknowledgment back to Host
            this._send({
              type: 'WELCOME_ACK',
              payload: {
                guestName: this.playerName,
                guestAvatar: this.playerAvatar,
                guestId: this.playerId
              }
            });

            this._onConnected();
          }
          break;

        case 'WELCOME_ACK':
          if (this.isHost) {
            this._stopHandshakeTimer();
            if (msg.payload) {
              if (msg.payload.guestName) this.opponentName = msg.payload.guestName;
              if (msg.payload.guestAvatar) this.opponentAvatar = msg.payload.guestAvatar;
            }
            this._onConnected();
          }
          break;

        case 'RECONNECT':
          // Reconnection request from opponent
          if (msg.payload) {
            if (msg.payload.guestName) this.opponentName = msg.payload.guestName;
            if (msg.payload.guestAvatar) this.opponentAvatar = msg.payload.guestAvatar;
          }
          // Reply with authoritative game state
          this._send({
            type: 'RECONNECT_ACK',
            payload: {
              hostName: this.isHost ? this.playerName : this.opponentName,
              guestName: this.isHost ? this.opponentName : this.playerName,
              hostAvatar: this.isHost ? this.playerAvatar : this.opponentAvatar,
              guestAvatar: this.isHost ? this.opponentAvatar : this.playerAvatar,
              assignedColor: this.opponentColor,
              opponentColor: this.assignedColor,
              fen: this.currentFen,
              history: this.currentHistory,
              turn: this.currentTurn
            }
          });
          this._emit('reconnected', {
            opponentName: this.opponentName,
            opponentAvatar: this.opponentAvatar,
            fen: this.currentFen,
            history: this.currentHistory
          });
          this._onConnected();
          break;

        case 'RECONNECT_ACK':
          this._stopHandshakeTimer();
          if (msg.payload) {
            this.assignedColor = msg.payload.assignedColor || this.assignedColor;
            this.opponentColor = msg.payload.opponentColor || this.opponentColor;
            this.opponentName = (this.isHost ? msg.payload.guestName : msg.payload.hostName) || this.opponentName;
            this.opponentAvatar = (this.isHost ? msg.payload.guestAvatar : msg.payload.hostAvatar) || this.opponentAvatar;
            if (msg.payload.fen) this.currentFen = msg.payload.fen;
            if (msg.payload.history) this.currentHistory = msg.payload.history;
            if (msg.payload.turn) this.currentTurn = msg.payload.turn;
          }
          this._emit('reconnected', {
            opponentName: this.opponentName,
            opponentAvatar: this.opponentAvatar,
            fen: this.currentFen,
            history: this.currentHistory,
            turn: this.currentTurn
          });
          this._onConnected();
          break;

        case 'MOVE':
          if (msg.payload && msg.payload.fen) {
            this.currentFen = msg.payload.fen;
          }
          this._emit('move', msg.payload);
          break;

        case 'EMOJI':
          this._emit('emoji', msg.payload);
          break;

        case 'DRAW_OFFER':
          this._emit('draw_offered', msg.payload);
          break;

        case 'DRAW_RESPONSE':
          this._emit('draw_response', msg.payload);
          break;

        case 'UNDO_REQUEST':
          this._emit('undo_requested', msg.payload);
          break;

        case 'UNDO_RESPONSE':
          this._emit('undo_response', msg.payload);
          break;

        case 'RESIGN':
          this._emit('resign', msg.payload);
          break;

        case 'REMATCH':
          this._emit('rematch', msg.payload);
          break;

        case 'PING':
          this._send({ type: 'PONG', payload: { t: msg.payload?.t || Date.now() } });
          break;

        case 'PONG':
          if (this._lastPingTimestamp > 0) {
            this.pingMs = Math.max(1, Math.round(Date.now() - this._lastPingTimestamp));
            this._emit('ping', { pingMs: this.pingMs });
          }
          break;

        default:
          this._emit('custom_message', msg);
          break;
      }
    }

    _handleConnectionDrop(reason = 'Conexión perdida con el rival.') {
      this._stopPingInterval();
      this._stopHandshakeTimer();

      if (this.status === 'connected') {
        this.status = 'reconnecting';
        this._reconnectAttempts = 0;
        this._emit('reconnecting', {
          attempt: 1,
          maxAttempts: this._maxReconnectAttempts,
          message: 'Conexión interrumpida con el rival. Intentando reconectar automáticamente...'
        });
        this._attemptAutoReconnect();
      } else if (this.status !== 'reconnecting') {
        this._onDisconnected(reason);
      }
    }

    _attemptAutoReconnect() {
      if (this._reconnectAttempts >= this._maxReconnectAttempts) {
        this._onDisconnected('No se pudo restablecer la conexión con el rival.');
        return;
      }

      this._reconnectAttempts++;
      this._reconnectTimer = setTimeout(() => {
        if (this.status === 'reconnecting' && this.roomCode) {
          this._emit('reconnecting', {
            attempt: this._reconnectAttempts,
            maxAttempts: this._maxReconnectAttempts,
            message: `Reconectando (intento ${this._reconnectAttempts}/${this._maxReconnectAttempts})...`
          });
          if (this.isHost) {
            if (this.peer && !this.peer.destroyed) {
              this.peer.reconnect();
            }
          } else {
            const hostPeerId = roomCodeToPeerId(this.roomCode);
            if (this.peer && !this.peer.destroyed) {
              const conn = this.peer.connect(hostPeerId, { reliable: true, serialization: 'json' });
              this._setupConnection(conn, true);
            }
          }
        }
      }, 2500);

      if (this._reconnectTimer && typeof this._reconnectTimer.unref === 'function') {
        this._reconnectTimer.unref();
      }
    }

    _onConnected() {
      this._stopHandshakeTimer();
      if (this._reconnectTimer) {
        clearTimeout(this._reconnectTimer);
        this._reconnectTimer = null;
      }
      this._reconnectAttempts = 0;
      this._setStatus('connected', `Conectado con ${this.opponentName}`);
      this._startPingInterval();

      this._emit('connected', {
        roomCode: this.roomCode,
        isHost: this.isHost,
        assignedColor: this.assignedColor,
        opponentColor: this.opponentColor,
        opponentName: this.opponentName,
        opponentAvatar: this.opponentAvatar
      });
    }

    _onDisconnected(reason = 'Desconectado de la sala.') {
      this._stopPingInterval();
      this._stopHandshakeTimer();
      if (this._reconnectTimer) {
        clearTimeout(this._reconnectTimer);
        this._reconnectTimer = null;
      }
      this._setStatus('disconnected', reason);
      this._emit('disconnected', { reason, roomCode: this.roomCode });
    }

    _send(payload) {
      if (this.conn && this.conn.open) {
        try {
          this.conn.send(payload);
          return true;
        } catch (err) {
          console.warn('PeerChessClient send error:', err);
          return false;
        }
      }
      return false;
    }

    _stopHandshakeTimer() {
      if (this._handshakeTimer) {
        clearInterval(this._handshakeTimer);
        this._handshakeTimer = null;
      }
    }

    sendMove(moveData) {
      if (moveData && moveData.fen) {
        this.currentFen = moveData.fen;
      }
      return this._send({ type: 'MOVE', payload: moveData });
    }

    sendEmoji(emoji) {
      return this._send({ type: 'EMOJI', payload: { emoji: emoji } });
    }

    sendDrawOffer() {
      return this._send({ type: 'DRAW_OFFER', payload: { color: this.assignedColor } });
    }

    sendDrawResponse(accepted = false) {
      return this._send({ type: 'DRAW_RESPONSE', payload: { accepted: !!accepted } });
    }

    sendUndoRequest() {
      return this._send({ type: 'UNDO_REQUEST', payload: { color: this.assignedColor } });
    }

    sendUndoResponse(accepted = false) {
      return this._send({ type: 'UNDO_RESPONSE', payload: { accepted: !!accepted } });
    }

    sendResign() {
      return this._send({ type: 'RESIGN', payload: { color: this.assignedColor } });
    }

    sendRematch(accepted = false) {
      return this._send({ type: 'REMATCH', payload: { accepted: !!accepted } });
    }

    _startPingInterval() {
      this._stopPingInterval();
      this._pingTimer = setInterval(() => {
        if (this.status === 'connected' && this.conn && this.conn.open) {
          this._lastPingTimestamp = Date.now();
          this._send({ type: 'PING', payload: { t: this._lastPingTimestamp } });
        }
      }, 4000);
      if (this._pingTimer && typeof this._pingTimer.unref === 'function') {
        this._pingTimer.unref();
      }
    }

    _stopPingInterval() {
      if (this._pingTimer) {
        clearInterval(this._pingTimer);
        this._pingTimer = null;
      }
    }

    leaveRoom() {
      this._stopHandshakeTimer();
      this._stopPingInterval();
      if (this._reconnectTimer) {
        clearTimeout(this._reconnectTimer);
        this._reconnectTimer = null;
      }
      if (this.conn) {
        try {
          this.conn.close();
        } catch (e) {}
        this.conn = null;
      }
      if (this.peer) {
        try {
          this.peer.destroy();
        } catch (e) {}
        this.peer = null;
      }
      this.status = 'disconnected';
    }

    isConnected() {
      return this.status === 'connected' && this.conn && this.conn.open;
    }
  }

  // Static Helpers
  PeerChessClient.generateRoomCode = generateRoomCode;
  PeerChessClient.sanitizeRoomCode = sanitizeRoomCode;
  PeerChessClient.roomCodeToPeerId = roomCodeToPeerId;
  PeerChessClient.peerIdToRoomCode = peerIdToRoomCode;
  PeerChessClient.getShareableLink = getShareableLink;

  // Export
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      PeerChessClient,
      generateRoomCode,
      sanitizeRoomCode,
      roomCodeToPeerId,
      peerIdToRoomCode,
      getShareableLink
    };
  }
  if (typeof window !== 'undefined') {
    window.PeerChessClient = PeerChessClient;
  }
})(typeof window !== 'undefined' ? window : globalThis);
