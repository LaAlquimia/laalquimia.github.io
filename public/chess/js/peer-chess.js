/**
 * PeerChessClient (WebRTC P2P Multiplayer Manager)
 * Zero-backend Peer-to-Peer online and LAN chess multiplayer using PeerJS & WebRTC.
 * 
 * Features:
 * - Room hosting with 4-character codes (e.g. "K7A9") & direct join links
 * - Color assignment negotiation (White, Black, Random)
 * - Real-time move synchronization via RTCDataChannel (< 20ms latency)
 * - Live Ping / Latency counter & automatic connection health checks
 * - Draw offers, Undo requests, Resignation, Rematch coordination
 * - Live floating emoji reactions & chat gestures
 * - Safe fallback & graceful disconnection handling
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
      this.playerName = options.playerName || 'Player';
      this.opponentName = 'Opponent';

      this.status = 'disconnected'; // 'disconnected' | 'connecting' | 'waiting' | 'connected' | 'error'
      this.pingMs = 0;
      this._pingTimer = null;
      this._lastPingTimestamp = 0;
      this._handshakeTimer = null;

      // Event listeners
      this._listeners = new Map();
    }

    /**
     * Event subscription: 'connected', 'disconnected', 'status', 'move', 'emoji',
     * 'draw_offered', 'draw_response', 'undo_requested', 'undo_response', 'resign', 'rematch', 'ping'
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
     * Host creates a new room with a random 4-letter code
     * 
     * @param {Object} [config]
     * @param {string} [config.preferredColor='random'] 'w', 'b', or 'random'
     * @param {string} [config.playerName='Host']
     * @returns {Promise<{roomCode: string, shareLink: string}>}
     */
    createRoom(config = {}) {
      this.leaveRoom();

      this.isHost = true;
      this.preferredColor = config.preferredColor || 'random';
      this.playerName = config.playerName || this.playerName || 'Host';
      this.roomCode = generateRoomCode();
      this.peerId = roomCodeToPeerId(this.roomCode);

      this._setStatus('connecting', `Creating room ${this.roomCode}...`);

      return new Promise((resolve, reject) => {
        if (typeof Peer === 'undefined') {
          const err = new Error('PeerJS library is not loaded.');
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
          this._setStatus('waiting', `Room ${this.roomCode} created. Waiting for opponent...`);
          resolve({
            roomCode: this.roomCode,
            shareLink: getShareableLink(this.roomCode)
          });
        });

        this.peer.on('connection', (conn) => {
          // If already connected, reject incoming duplicate connections
          if (this.conn && this.conn.open) {
            conn.close();
            return;
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
          this._setStatus('error', err.message || 'Connection error');
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
     * 
     * @param {string} roomCode 4-letter room code (e.g. "K7A9")
     * @param {Object} [config]
     * @param {string} [config.playerName='Guest']
     * @returns {Promise<boolean>}
     */
    joinRoom(roomCode, config = {}) {
      this.leaveRoom();

      this.isHost = false;
      this.roomCode = sanitizeRoomCode(roomCode);
      this.playerName = config.playerName || this.playerName || 'Guest';

      if (!this.roomCode || this.roomCode.length < 3) {
        const err = new Error('Invalid room code.');
        this._setStatus('error', err.message);
        return Promise.reject(err);
      }

      this.peerId = null; // Random client peer ID
      const hostPeerId = roomCodeToPeerId(this.roomCode);

      this._setStatus('connecting', `Connecting to room ${this.roomCode}...`);

      return new Promise((resolve, reject) => {
        if (typeof Peer === 'undefined') {
          const err = new Error('PeerJS library is not loaded.');
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
            const err = new Error('No se pudo conectar con el anfitrión. Verifica que el código de sala sea correcto.');
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

          this._setupConnection(conn);

          const onConnectedHandler = () => {
            clearTimeout(connectionTimeout);
            this.off('connected', onConnectedHandler);
            resolve(true);
          };
          this.on('connected', onConnectedHandler);
        });

        this.peer.on('error', (err) => {
          clearTimeout(connectionTimeout);
          console.warn('PeerJS Guest Error:', err);
          if (err.type === 'peer-unavailable') {
            const friendlyErr = new Error(`Sala "${this.roomCode}" no encontrada. Verifica el código.`);
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
     * Bind connection events for DataChannel
     */
    _setupConnection(conn) {
      this.conn = conn;

      conn.on('open', () => {
        if (this.isHost) {
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
              hostName: this.playerName
            }
          });

          this._onConnected();
        } else {
          // Guest sends initial HELLO handshake to Host
          const sendHello = () => {
            this._send({
              type: 'HELLO',
              payload: {
                guestName: this.playerName
              }
            });
          };

          sendHello();

          // Resilient retry: keep sending HELLO every 500ms until WELCOME arrives
          this._stopHandshakeTimer();
          let helloCount = 0;
          this._handshakeTimer = setInterval(() => {
            if (this.status === 'connected' || helloCount >= 10) {
              this._stopHandshakeTimer();
              return;
            }
            helloCount++;
            sendHello();
          }, 500);
        }
      });

      conn.on('data', (data) => {
        this._handleIncomingMessage(data);
      });

      conn.on('close', () => {
        this._onDisconnected('El rival se ha desconectado.');
      });

      conn.on('error', (err) => {
        console.warn('PeerConnection Error:', err);
        this._onDisconnected(err.message || 'Conexión perdida');
      });
    }

    _handleIncomingMessage(msg) {
      if (!msg || !msg.type) return;

      switch (msg.type) {
        case 'HELLO':
          if (this.isHost) {
            if (msg.payload && msg.payload.guestName) {
              this.opponentName = msg.payload.guestName;
              this._emit('opponent_info', { name: this.opponentName });
            }
            // Always reply with WELCOME so guest is guaranteed to receive it
            this._send({
              type: 'WELCOME',
              payload: {
                hostColor: this.assignedColor,
                guestColor: this.opponentColor,
                hostName: this.playerName
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

            // Send acknowledgment back to Host
            this._send({
              type: 'WELCOME_ACK',
              payload: {
                guestName: this.playerName
              }
            });

            this._onConnected();
          }
          break;

        case 'WELCOME_ACK':
          if (this.isHost) {
            this._stopHandshakeTimer();
            if (msg.payload && msg.payload.guestName) {
              this.opponentName = msg.payload.guestName;
            }
            this._onConnected();
          }
          break;

        case 'MOVE':
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
          // Reply immediately with PONG
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

    _stopHandshakeTimer() {
      if (this._handshakeTimer) {
        clearInterval(this._handshakeTimer);
        this._handshakeTimer = null;
      }
    }

    _onConnected() {
      if (this.status === 'connected') return;
      this._stopHandshakeTimer();
      this._setStatus('connected', `Connected with ${this.opponentName}`);
      this._startPingInterval();
      this._emit('connected', {
        isHost: this.isHost,
        roomCode: this.roomCode,
        assignedColor: this.assignedColor,
        opponentColor: this.opponentColor,
        opponentName: this.opponentName
      });
    }

    _onDisconnected(reason = 'Disconnected') {
      this._stopHandshakeTimer();
      this._stopPingInterval();
      const wasConnected = (this.status === 'connected');
      this._setStatus('disconnected', reason);
      if (wasConnected) {
        this._emit('disconnected', { reason });
      }
    }

    _send(messageObj) {
      if (this.conn && this.conn.open) {
        try {
          messageObj.timestamp = Date.now();
          this.conn.send(messageObj);
          return true;
        } catch (err) {
          console.warn('Peer send error:', err);
        }
      }
      return false;
    }

    /**
     * Send chess move to opponent
     */
    sendMove(moveData) {
      return this._send({
        type: 'MOVE',
        payload: {
          from: moveData.from,
          to: moveData.to,
          promotion: moveData.promotion || 'Q',
          san: moveData.san || '',
          fen: moveData.fen || ''
        }
      });
    }

    /**
     * Send animated emoji reaction
     */
    sendEmoji(emojiChar) {
      return this._send({
        type: 'EMOJI',
        payload: { emoji: emojiChar }
      });
    }

    /**
     * Offer draw to opponent
     */
    sendDrawOffer() {
      return this._send({ type: 'DRAW_OFFER', payload: {} });
    }

    /**
     * Respond to draw offer (accepted: true|false)
     */
    sendDrawResponse(accepted) {
      return this._send({ type: 'DRAW_RESPONSE', payload: { accepted: !!accepted } });
    }

    /**
     * Request undo from opponent
     */
    sendUndoRequest() {
      return this._send({ type: 'UNDO_REQUEST', payload: {} });
    }

    /**
     * Respond to undo request (accepted: true|false)
     */
    sendUndoResponse(accepted) {
      return this._send({ type: 'UNDO_RESPONSE', payload: { accepted: !!accepted } });
    }

    /**
     * Notify opponent of resignation
     */
    sendResign() {
      return this._send({ type: 'RESIGN', payload: { color: this.assignedColor } });
    }

    /**
     * Propose or accept rematch
     */
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
    }

    _stopPingInterval() {
      if (this._pingTimer) {
        clearInterval(this._pingTimer);
        this._pingTimer = null;
      }
    }

    /**
     * Leave current room and close connections
     */
    leaveRoom() {
      this._stopHandshakeTimer();
      this._stopPingInterval();
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
      this.isHost = false;
      this.roomCode = null;
      this.peerId = null;
      this.status = 'disconnected';
      this.pingMs = 0;
      this._setStatus('disconnected', 'Left room');
    }

    /**
     * Check if currently connected in a live room
     */
    isConnected() {
      return (this.status === 'connected' && this.conn && this.conn.open);
    }
  }

  // Helper static utilities
  PeerChessClient.generateRoomCode = generateRoomCode;
  PeerChessClient.sanitizeRoomCode = sanitizeRoomCode;
  PeerChessClient.getShareableLink = getShareableLink;
  PeerChessClient.roomCodeToPeerId = roomCodeToPeerId;
  PeerChessClient.peerIdToRoomCode = peerIdToRoomCode;

  // Export to global window and module exports
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PeerChessClient, generateRoomCode, sanitizeRoomCode, getShareableLink, roomCodeToPeerId, peerIdToRoomCode };
  }
  if (typeof global !== 'undefined') {
    global.PeerChessClient = PeerChessClient;
  }

})(typeof window !== 'undefined' ? window : global);
