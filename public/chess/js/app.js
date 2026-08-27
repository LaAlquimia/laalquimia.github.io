/**
 * ChessApp - Master Application Controller
 * Handles UI rendering, user interaction, drag & drop, sound, Stockfish AI, settings, and responsive layout.
 */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'chess_app_settings_v2';

  const DIFFICULTY_MAP = {
    beginner: { level: 1, name: 'Beginner', depth: 2, movetime: 250 },
    easy:     { level: 2, name: 'Easy', depth: 4, movetime: 450 },
    medium:   { level: 3, name: 'Medium', depth: 8, movetime: 850 },
    hard:     { level: 4, name: 'Hard', depth: 12, movetime: 1600 },
    expert:   { level: 5, name: 'Expert', depth: 16, movetime: 2600 },
    maximum:  { level: 6, name: 'Maximum', depth: 20, movetime: 4000 }
  };

  class ChessApp {
    constructor() {
      // 1. Core Engines
      this.game = new ChessGame();
      this.ai = new StockfishAI({
        workerPath: './stockfish.js',
        onError: (err) => console.warn('AI Engine notice:', err)
      });
      this.audio = ChessAudio;
      this.pieces = ChessPieces;

      // 2. Application State & Settings
      this.settings = this._loadSettings();
      this.mode = this.settings.gameMode || 'ai'; // 'ai' | 'pvp'
      this.playerColor = this.settings.playerColor || 'w'; // 'w' | 'b'
      this.boardFlipped = (this.playerColor === 'b');
      this.difficulty = this.settings.difficulty || 'medium';

      // 3. Interaction State
      this.selectedSquare = null; // {x, y}
      this.legalMovesForSelected = []; // array of move objects
      this.lastMove = null; // { from: {x,y}, to: {x,y} }
      this.pendingPromotionMove = null; // { from: {x,y}, to: {x,y} }
      this.isAiThinking = false;
      this.isCustomGameOver = false;
      this.evalScore = 0.0;
      this.pointerInteraction = null;
      this._ignoreNextClick = false;

      this._boundPointerMove = (e) => this._onPointerMove(e);
      this._boundPointerUp = (e) => this._onPointerUp(e);
      this._boundPointerCancel = (e) => this._onPointerCancel(e);

      // 4. Cache DOM Elements
      this._cacheDOM();

      // 5. Apply Initial Settings & Theme
      this._applySettingsToDOM();

      // 6. Build Board Grid & Bind Listeners
      this._buildBoardDOM();
      this._bindEvents();

      // 7. Initial Render
      this.render();

      // 8. Online Multiplayer P2P Client Init
      this._initPeerClient();

      // 9. Check URL query parameter ?room=XXXX
      if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        const roomCode = urlParams.get('room');
        if (roomCode) {
          setTimeout(() => {
            this.openOnlineModal('join');
            if (this.dom.joinRoomInput) this.dom.joinRoomInput.value = roomCode.toUpperCase();
            this.joinOnlineRoom(roomCode);
          }, 400);
        }
      }

      // 10. If Player is Black vs AI, trigger AI initial move
      if (this.mode === 'ai' && this.playerColor === 'b' && this.game.getTurn() === 'w') {
        setTimeout(() => this.triggerAIMove(), 600);
      }
    }

    /* --------------------------------------------------------------------------
       SETTINGS & LOCAL STORAGE
       -------------------------------------------------------------------------- */
    _loadSettings() {
      const defaults = {
        boardTheme: 'green',
        pieceStyle: 'standard',
        soundTheme: 'wood',
        volume: 0.5,
        isMuted: false,
        difficulty: 'medium',
        gameMode: 'ai',
        playerColor: 'w',
        faceToFace: true
      };

      // Check URL query parameters for mode preset (e.g., pvp.html or ?mode=pvp)
      if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mode') === 'pvp' || window.location.pathname.endsWith('pvp.html')) {
          defaults.gameMode = 'pvp';
        }
      }

      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return { ...defaults, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      return defaults;
    }

    _saveSettings() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }

    _applySettingsToDOM() {
      // Board Theme
      document.body.setAttribute('data-board-theme', this.settings.boardTheme);

      // Sound Engine
      this.audio.setSoundTheme(this.settings.soundTheme);
      this.audio.setVolume(this.settings.volume);
      if (this.settings.isMuted && !this.audio.isMuted()) {
        this.audio.toggleMute();
      }

      // Sync form controls in Settings Modal
      this._syncSettingsFormControls();
    }

    _syncSettingsFormControls() {
      // Theme swatches
      document.querySelectorAll('.theme-swatch-card').forEach(el => {
        el.classList.toggle('active', el.dataset.theme === this.settings.boardTheme);
      });

      // Piece styles
      document.querySelectorAll('.piece-style-card').forEach(el => {
        el.classList.toggle('active', el.dataset.style === this.settings.pieceStyle);
      });

      // Sound Theme Select
      const soundSelect = document.getElementById('setting-sound-theme');
      if (soundSelect) soundSelect.value = this.settings.soundTheme;

      // Volume Slider
      const volumeSlider = document.getElementById('setting-volume-slider');
      if (volumeSlider) volumeSlider.value = this.settings.volume;

      // Difficulty Pills
      document.querySelectorAll('.diff-pill-btn').forEach(el => {
        el.classList.toggle('active', el.dataset.diff === this.settings.difficulty);
      });

      // Side chooser (White / Black)
      document.querySelectorAll('.settings-side-btn, [data-side]').forEach(el => {
        if (el.dataset.side) {
          el.classList.toggle('active', el.dataset.side === this.playerColor);
        }
      });

      // Mode badge
      if (this.dom.modeBadge) {
        this.dom.modeBadge.textContent = (this.mode === 'ai') ? 'VS STOCKFISH' : 'PASS & PLAY';
        this.dom.modeBadge.className = 'mode-badge ' + (this.mode === 'ai' ? 'ai' : 'pvp');
      }

      // Mute Icon button
      if (this.dom.btnHeaderMute) {
        this.dom.btnHeaderMute.classList.toggle('active', !this.audio.isMuted());
      }

      // Face-to-Face Tabletop Toggle & Header Button
      const faceToFaceToggle = document.getElementById('setting-face-to-face');
      if (faceToFaceToggle) {
        faceToFaceToggle.checked = (this.settings.faceToFace !== false);
      }
      if (this.dom.btnHeaderTabletop) {
        this.dom.btnHeaderTabletop.classList.toggle('active', (this.settings.faceToFace !== false));
      }
    }

    /* --------------------------------------------------------------------------
       DOM CACHING
       -------------------------------------------------------------------------- */
    _cacheDOM() {
      this.dom = {
        // Board container
        chessboard: document.getElementById('chessboard'),
        chessboardWrapper: document.getElementById('chessboard-wrapper'),

        // Player Bars
        topPlayerBar: document.getElementById('top-player-bar'),
        topPlayerName: document.getElementById('top-player-name'),
        topPlayerAvatar: document.getElementById('top-player-avatar'),
        topPlayerStatus: document.getElementById('top-player-status'),
        topCapturedList: document.getElementById('top-captured-list'),
        topMaterialDiff: document.getElementById('top-material-diff'),

        bottomPlayerBar: document.getElementById('bottom-player-bar'),
        bottomPlayerName: document.getElementById('bottom-player-name'),
        bottomPlayerAvatar: document.getElementById('bottom-player-avatar'),
        bottomPlayerStatus: document.getElementById('bottom-player-status'),
        bottomCapturedList: document.getElementById('bottom-captured-list'),
        bottomMaterialDiff: document.getElementById('bottom-material-diff'),

        // Move History
        moveHistoryList: document.getElementById('move-history-list'),

        // Evaluation & Status
        evalFillWhite: document.getElementById('eval-fill-white'),
        evalScoreText: document.getElementById('eval-score-text'),
        mobileEvalFillWhite: document.getElementById('mobile-eval-fill-white'),
        mobileEvalScoreText: document.getElementById('mobile-eval-score-text'),
        modeBadge: document.getElementById('mode-badge'),

        // Modals
        modalSettings: document.getElementById('modal-settings'),
        modalPromotion: document.getElementById('modal-promotion'),
        promotionPiecesContainer: document.getElementById('promotion-pieces-container'),
        modalGameOver: document.getElementById('modal-gameover'),
        gameOverTitle: document.getElementById('gameover-title'),
        gameOverReason: document.getElementById('gameover-reason'),
        gameOverIcon: document.getElementById('gameover-icon'),

        // Header and Dock buttons
        btnHeaderOnline: document.getElementById('btn-header-online'),
        btnHeaderSettings: document.getElementById('btn-header-settings'),
        btnHeaderFlip: document.getElementById('btn-header-flip'),
        btnHeaderNewGame: document.getElementById('btn-header-newgame'),
        btnHeaderMute: document.getElementById('btn-header-mute'),
        btnHeaderTheme: document.getElementById('btn-header-theme'),
        btnHeaderTabletop: document.getElementById('btn-header-tabletop'),

        btnDockDraw: document.getElementById('btn-dock-draw'),
        btnDockResign: document.getElementById('btn-dock-resign'),
        btnDockOnline: document.getElementById('btn-dock-online'),
        btnDockUndo: document.getElementById('btn-dock-undo'),
        btnDockNewGame: document.getElementById('btn-dock-newgame'),
        btnDockFlip: document.getElementById('btn-dock-flip'),
        btnDockSettings: document.getElementById('btn-dock-settings'),

        // Online P2P Elements
        onlineStatusHud: document.getElementById('online-status-hud'),
        onlineStatusText: document.getElementById('online-status-text'),
        onlineReactionBar: document.getElementById('online-reaction-bar'),
        reactionPillToggle: document.getElementById('reaction-pill-toggle'),
        reactionEmojisList: document.getElementById('reaction-emojis-list'),
        modalOnline: document.getElementById('modal-online'),
        tabBtnCreate: document.getElementById('tab-btn-create'),
        tabBtnJoin: document.getElementById('tab-btn-join'),
        tabPaneCreate: document.getElementById('tab-pane-create'),
        tabPaneJoin: document.getElementById('tab-pane-join'),
        btnCreateRoom: document.getElementById('btn-create-room'),
        hostRoomDetails: document.getElementById('host-room-details'),
        hostRoomCode: document.getElementById('host-room-code'),
        hostWaitingStatus: document.getElementById('host-waiting-status'),
        onlineQrcodeContainer: document.getElementById('online-qrcode-container'),
        btnCopyRoomLink: document.getElementById('btn-copy-room-link'),
        btnShareRoomLink: document.getElementById('btn-share-room-link'),
        joinRoomInput: document.getElementById('join-room-input'),
        btnPasteRoomCode: document.getElementById('btn-paste-room-code'),
        btnJoinRoom: document.getElementById('btn-join-room'),
        joinStatusContainer: document.getElementById('join-status-container'),
        joinWaitingStatus: document.getElementById('join-waiting-status'),
        joinStatusText: document.getElementById('join-status-text'),

        // Sidebar action buttons
        btnSidebarNewGame: document.getElementById('btn-sidebar-newgame'),
        btnSidebarUndo: document.getElementById('btn-sidebar-undo'),
        btnSidebarFlip: document.getElementById('btn-sidebar-flip'),
        btnSidebarSettings: document.getElementById('btn-sidebar-settings'),
        btnSidebarResign: document.getElementById('btn-sidebar-resign'),
        btnSidebarDraw: document.getElementById('btn-sidebar-draw'),

        // Toast Container
        toastContainer: document.getElementById('toast-container')
      };
    }

    /* --------------------------------------------------------------------------
       BUILD BOARD GRID DOM
       -------------------------------------------------------------------------- */
    _buildBoardDOM() {
      if (!this.dom.chessboard) return;
      this.dom.chessboard.innerHTML = '';
      this.squareElements = [];

      // Create 64 square elements
      for (let i = 0; i < 64; i++) {
        const sq = document.createElement('div');
        sq.className = 'square';
        sq.setAttribute('role', 'button');
        sq.setAttribute('tabindex', '0');
        this.dom.chessboard.appendChild(sq);
        this.squareElements.push(sq);
      }
    }

    /* --------------------------------------------------------------------------
       MAIN RENDER METHOD
       -------------------------------------------------------------------------- */
    render() {
      this._renderSquares();
      this._renderPlayerBars();
      this._renderMoveHistory();
      this._renderEvaluation();
    }

    /**
     * Render the 64 squares with pieces, highlights, dots, and coordinates
     */
    _renderSquares() {
      const flipped = this.boardFlipped;
      const turn = this.game.getTurn();
      const inCheck = this.game.isCheck(turn);
      const checkedKingCoords = inCheck ? this.game.findKing(turn) : null;

      for (let visualRow = 0; visualRow < 8; visualRow++) {
        for (let visualCol = 0; visualCol < 8; visualCol++) {
          const index = visualRow * 8 + visualCol;
          const sq = this.squareElements[index];

          // Board coordinate translation based on orientation
          const x = flipped ? (7 - visualCol) : visualCol;
          const y = flipped ? (7 - visualRow) : visualRow;
          const squareName = String.fromCharCode(97 + x) + (8 - y);

          sq.dataset.x = x;
          sq.dataset.y = y;
          sq.dataset.square = squareName;

          // Color pattern: (x + y) % 2 === 0 is light square
          const isLight = (x + y) % 2 === 0;
          sq.className = `square ${isLight ? 'light' : 'dark'}`;

          // Selection highlight
          if (this.selectedSquare && this.selectedSquare.x === x && this.selectedSquare.y === y) {
            sq.classList.add('selected-square');
          }

          // Last move highlight
          if (this.lastMove) {
            const isFrom = (this.lastMove.from.x === x && this.lastMove.from.y === y);
            const isTo = (this.lastMove.to.x === x && this.lastMove.to.y === y);
            if (isFrom || isTo) {
              sq.classList.add('last-move-square');
            }
          }

          // King in check highlight
          if (checkedKingCoords && checkedKingCoords.x === x && checkedKingCoords.y === y) {
            sq.classList.add('in-check');
          }

          // Dragging state highlight (semi-transparent origin square)
          if (this.pointerInteraction && this.pointerInteraction.dragInitiated &&
              this.pointerInteraction.startSquare.x === x && this.pointerInteraction.startSquare.y === y) {
            sq.classList.add('is-dragging');
          }

          // Clear square inner contents
          sq.innerHTML = '';

          // 1. Edge Coordinate labels
          // Rank label (on leftmost column of view)
          if (visualCol === 0) {
            const rankLabel = document.createElement('span');
            rankLabel.className = 'coord-label coord-rank';
            rankLabel.textContent = (8 - y).toString();
            sq.appendChild(rankLabel);
          }
          // File label (on bottom row of view)
          if (visualRow === 7) {
            const fileLabel = document.createElement('span');
            fileLabel.className = 'coord-label coord-file';
            fileLabel.textContent = String.fromCharCode(97 + x);
            sq.appendChild(fileLabel);
          }

          // 2. Piece SVG
          const piece = this.game.getPiece(x, y);
          if (piece) {
            const pieceSvgString = this.pieces.getPieceSVG(piece, this.settings.pieceStyle);
            if (pieceSvgString) {
              const pieceWrapper = document.createElement('div');
              pieceWrapper.className = 'piece-svg';

              // Face-to-Face Tabletop mode: Rotate top player pieces 180° so opponent sees them right-side-up
              const isWhitePiece = (piece === piece.toUpperCase());
              const isTopPiece = flipped ? isWhitePiece : !isWhitePiece;
              const isFaceToFace = (this.settings.faceToFace !== false) && (this.mode === 'pvp' || this.settings.alwaysFaceToFace);
              if (isFaceToFace && isTopPiece) {
                pieceWrapper.classList.add('rotated-piece');
              }

              pieceWrapper.innerHTML = pieceSvgString;
              sq.appendChild(pieceWrapper);
            }
          }

          // 3. Legal Move Indicator (Dot or Capture Ring)
          const legalMove = this.legalMovesForSelected.find(m => m.x === x && m.y === y);
          if (legalMove) {
            if (legalMove.isCapture) {
              const ring = document.createElement('div');
              ring.className = 'legal-capture-ring';
              sq.appendChild(ring);
            } else {
              const dot = document.createElement('div');
              dot.className = 'legal-move-dot';
              sq.appendChild(dot);
            }
          }
        }
      }
    }

    /**
     * Render Player Information Bars (Top vs Bottom)
     */
    _renderPlayerBars() {
      const turn = this.game.getTurn();
      const materialScore = this.game.getMaterialScore();
      const flipped = this.boardFlipped;

      // Determine who is top and who is bottom based on orientation
      const topColor = flipped ? 'w' : 'b';
      const bottomColor = flipped ? 'b' : 'w';

      // Face-to-Face Tabletop mode check
      const isFaceToFace = (this.settings.faceToFace !== false) && (this.mode === 'pvp' || this.settings.alwaysFaceToFace);

      // Top Player Data
      const topIsActive = (turn === topColor);
      let topName = 'Player 2';
      let bottomName = 'Player 1';

      if (this.mode === 'ai') {
        topName = (topColor === this.playerColor ? 'You' : `Stockfish (${DIFFICULTY_MAP[this.difficulty]?.name || 'AI'})`);
        bottomName = (bottomColor === this.playerColor ? 'You' : `Stockfish (${DIFFICULTY_MAP[this.difficulty]?.name || 'AI'})`);
      } else if (this.mode === 'online') {
        topName = (topColor === this.playerColor ? 'Tú (Local)' : (this.peerClient?.opponentName || 'Rival Online'));
        bottomName = (bottomColor === this.playerColor ? 'Tú (Local)' : (this.peerClient?.opponentName || 'Rival Online'));
      } else {
        topName = (topColor === 'w' ? 'White (Player 1)' : 'Black (Player 2)');
        bottomName = (bottomColor === 'w' ? 'White (Player 1)' : 'Black (Player 2)');
      }

      if (this.dom.topPlayerBar) {
        this.dom.topPlayerBar.classList.toggle('active-turn', topIsActive);
        this.dom.topPlayerBar.classList.toggle('face-to-face-top', isFaceToFace);
      }
      if (this.dom.topPlayerName) {
        this.dom.topPlayerName.textContent = topName;
      }
      if (this.dom.topPlayerAvatar) {
        this.dom.topPlayerAvatar.className = `player-avatar avatar-${topColor === 'w' ? 'white' : 'black'}`;
        this.dom.topPlayerAvatar.innerHTML = `${topColor === 'w' ? '♔' : '♚'}<span class="turn-glow-dot"></span>`;
      }
      if (this.dom.topPlayerStatus) {
        if (this.isAiThinking && topColor !== this.playerColor) {
          this.dom.topPlayerStatus.innerHTML = `<span class="thinking-indicator">Thinking<span class="thinking-dot"></span><span class="thinking-dot"></span><span class="thinking-dot"></span></span>`;
        } else {
          this.dom.topPlayerStatus.textContent = topIsActive ? 'Active Turn' : 'Waiting';
        }
      }

      // Bottom Player Data
      const bottomIsActive = (turn === bottomColor);

      if (this.dom.bottomPlayerBar) {
        this.dom.bottomPlayerBar.classList.toggle('active-turn', bottomIsActive);
      }
      if (this.dom.bottomPlayerName) {
        this.dom.bottomPlayerName.textContent = bottomName;
      }
      if (this.dom.bottomPlayerAvatar) {
        this.dom.bottomPlayerAvatar.className = `player-avatar avatar-${bottomColor === 'w' ? 'white' : 'black'}`;
        this.dom.bottomPlayerAvatar.innerHTML = `${bottomColor === 'w' ? '♔' : '♚'}<span class="turn-glow-dot"></span>`;
      }
      if (this.dom.bottomPlayerStatus) {
        if (this.isAiThinking && bottomColor !== this.playerColor) {
          this.dom.bottomPlayerStatus.innerHTML = `<span class="thinking-indicator">Thinking<span class="thinking-dot"></span><span class="thinking-dot"></span><span class="thinking-dot"></span></span>`;
        } else {
          this.dom.bottomPlayerStatus.textContent = bottomIsActive ? 'Active Turn' : 'Waiting';
        }
      }

      // Render Captured Pieces
      this._renderCapturedPiecesTray(this.dom.topCapturedList, materialScore.capturedPieces[topColor]);
      this._renderCapturedPiecesTray(this.dom.bottomCapturedList, materialScore.capturedPieces[bottomColor]);

      // Render Material Advantage Score Badges
      const diff = materialScore.difference; // Positive = White ahead, Negative = Black ahead
      const topDiff = (topColor === 'w') ? diff : -diff;
      const bottomDiff = (bottomColor === 'w') ? diff : -diff;

      if (this.dom.topMaterialDiff) {
        this.dom.topMaterialDiff.classList.toggle('visible', topDiff > 0);
        this.dom.topMaterialDiff.classList.toggle('positive', topDiff > 0);
        this.dom.topMaterialDiff.textContent = topDiff > 0 ? `+${topDiff}` : '';
      }
      if (this.dom.bottomMaterialDiff) {
        this.dom.bottomMaterialDiff.classList.toggle('visible', bottomDiff > 0);
        this.dom.bottomMaterialDiff.classList.toggle('positive', bottomDiff > 0);
        this.dom.bottomMaterialDiff.textContent = bottomDiff > 0 ? `+${bottomDiff}` : '';
      }
    }

    _renderCapturedPiecesTray(container, piecesArray) {
      if (!container) return;
      container.innerHTML = '';
      if (!piecesArray || piecesArray.length === 0) return;

      piecesArray.forEach(p => {
        const svg = this.pieces.getPieceSVG(p, this.settings.pieceStyle);
        if (svg) {
          const item = document.createElement('div');
          item.className = 'captured-piece-mini';
          item.innerHTML = svg;
          container.appendChild(item);
        }
      });
    }

    /**
     * Render Move History Table
     */
    _renderMoveHistory() {
      if (!this.dom.moveHistoryList) return;
      const history = this.game.getHistory();
      this.dom.moveHistoryList.innerHTML = '';

      if (history.length === 0) {
        const emptyNotice = document.createElement('div');
        emptyNotice.style.padding = '12px 6px';
        emptyNotice.style.color = 'var(--text-muted)';
        emptyNotice.style.fontSize = '0.8rem';
        emptyNotice.style.textAlign = 'center';
        emptyNotice.textContent = 'Moves will appear here as you play.';
        this.dom.moveHistoryList.appendChild(emptyNotice);
        return;
      }

      // Group into move pairs (White / Black)
      for (let i = 0; i < history.length; i += 2) {
        const moveNum = Math.floor(i / 2) + 1;
        const whiteMove = history[i];
        const blackMove = history[i + 1];

        const row = document.createElement('div');
        row.className = 'move-row';

        const numCell = document.createElement('span');
        numCell.className = 'move-num';
        numCell.textContent = `${moveNum}.`;
        row.appendChild(numCell);

        const whiteCell = document.createElement('span');
        whiteCell.className = 'move-san' + (i === history.length - 1 ? ' current-move' : '');
        whiteCell.textContent = whiteMove ? whiteMove.san : '';
        row.appendChild(whiteCell);

        const blackCell = document.createElement('span');
        blackCell.className = 'move-san' + (i + 1 === history.length - 1 ? ' current-move' : '');
        blackCell.textContent = blackMove ? blackMove.san : '';
        row.appendChild(blackCell);

        this.dom.moveHistoryList.appendChild(row);
      }

      // Auto-scroll to bottom of move list
      this.dom.moveHistoryList.scrollTop = this.dom.moveHistoryList.scrollHeight;
    }

    /**
     * Render Evaluation Score Bar (Desktop and Mobile)
     */
    _renderEvaluation() {
      const score = this.evalScore || 0;
      // Convert centipawn to fill percentage (clamp -10 to +10 cp)
      const clamped = Math.max(-10, Math.min(10, score));
      // 0 cp = 50%, +10 cp = 95%, -10 cp = 5%
      const percentage = 50 + (clamped / 10) * 45;
      const sign = score > 0 ? '+' : '';
      const scoreStr = (Math.abs(score) < 0.05) ? '0.0' : `${sign}${score.toFixed(1)}`;

      // Desktop Eval Meter
      if (this.dom.evalFillWhite) {
        this.dom.evalFillWhite.style.width = `${percentage}%`;
      }
      if (this.dom.evalScoreText) {
        this.dom.evalScoreText.textContent = scoreStr;
      }

      // Mobile Eval Meter (Above Bottom Dock)
      if (this.dom.mobileEvalFillWhite) {
        this.dom.mobileEvalFillWhite.style.width = `${percentage}%`;
      }
      if (this.dom.mobileEvalScoreText) {
        this.dom.mobileEvalScoreText.textContent = scoreStr;
      }
    }

    /* --------------------------------------------------------------------------
       CLICK & TOUCH INTERACTIONS (Unified Pointer System)
       -------------------------------------------------------------------------- */
    _bindEvents() {
      // 1. Board Interaction (Pointer events for drag & tap)
      this._setupBoardInteractions();

      // 2. Header Action Buttons
      if (this.dom.btnHeaderOnline) this.dom.btnHeaderOnline.addEventListener('click', () => this.openOnlineModal('create'));
      if (this.dom.btnHeaderSettings) this.dom.btnHeaderSettings.addEventListener('click', () => this.openSettingsModal());
      if (this.dom.btnHeaderFlip) this.dom.btnHeaderFlip.addEventListener('click', () => this.flipBoard());
      if (this.dom.btnHeaderNewGame) this.dom.btnHeaderNewGame.addEventListener('click', () => this.restartGame());
      if (this.dom.btnHeaderMute) this.dom.btnHeaderMute.addEventListener('click', () => this.toggleMute());
      if (this.dom.btnHeaderTheme) this.dom.btnHeaderTheme.addEventListener('click', () => this.cycleBoardTheme());
      if (this.dom.btnHeaderTabletop) this.dom.btnHeaderTabletop.addEventListener('click', () => this.toggleFaceToFace());

      // 3. Mobile Bottom Dock
      if (this.dom.btnDockDraw) this.dom.btnDockDraw.addEventListener('click', () => this.handleOfferDraw());
      if (this.dom.btnDockResign) this.dom.btnDockResign.addEventListener('click', () => this.handleResign());
      if (this.dom.btnDockOnline) this.dom.btnDockOnline.addEventListener('click', () => this.openOnlineModal('create'));
      if (this.dom.btnDockUndo) this.dom.btnDockUndo.addEventListener('click', () => this.undoMove());
      if (this.dom.btnDockNewGame) this.dom.btnDockNewGame.addEventListener('click', () => this.restartGame());
      if (this.dom.btnDockFlip) this.dom.btnDockFlip.addEventListener('click', () => this.flipBoard());
      if (this.dom.btnDockSettings) this.dom.btnDockSettings.addEventListener('click', () => this.openSettingsModal());

      // 4. Online Modal Event Listeners
      if (this.dom.tabBtnCreate) this.dom.tabBtnCreate.addEventListener('click', () => this.switchOnlineTab('create'));
      if (this.dom.tabBtnJoin) this.dom.tabBtnJoin.addEventListener('click', () => this.switchOnlineTab('join'));

      // Online Side Chooser
      document.querySelectorAll('.online-side-btn, [data-online-side]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.online-side-btn, [data-online-side]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });

      // Create Room
      if (this.dom.btnCreateRoom) {
        this.dom.btnCreateRoom.addEventListener('click', () => {
          const activeSideBtn = document.querySelector('.online-side-btn.active, [data-online-side].active');
          const side = (activeSideBtn && activeSideBtn.dataset.onlineSide) ? activeSideBtn.dataset.onlineSide : 'random';
          this.createOnlineRoom(side);
        });
      }

      // Copy Room Link
      if (this.dom.btnCopyRoomLink) {
        this.dom.btnCopyRoomLink.addEventListener('click', () => {
          if (this.peerClient && this.peerClient.roomCode) {
            const link = PeerChessClient.getShareableLink(this.peerClient.roomCode);
            navigator.clipboard.writeText(link).then(() => {
              this.showToast('¡Enlace de sala copiado! 📋', 'success');
            }).catch(() => {
              this.showToast(link, 'info');
            });
          }
        });
      }

      // Share Room Link
      if (this.dom.btnShareRoomLink) {
        this.dom.btnShareRoomLink.addEventListener('click', () => {
          if (this.peerClient && this.peerClient.roomCode) {
            const link = PeerChessClient.getShareableLink(this.peerClient.roomCode);
            if (navigator.share) {
              navigator.share({
                title: 'Partida de Ajedrez Online',
                text: '¡Únete a mi partida de ajedrez en vivo!',
                url: link
              }).catch(() => {});
            } else {
              navigator.clipboard.writeText(link).then(() => {
                this.showToast('¡Enlace copiado al portapapeles! 📋', 'success');
              });
            }
          }
        });
      }

      // Paste Room Code
      if (this.dom.btnPasteRoomCode) {
        this.dom.btnPasteRoomCode.addEventListener('click', () => {
          navigator.clipboard.readText().then(text => {
            if (this.dom.joinRoomInput && text) {
              this.dom.joinRoomInput.value = text.trim().toUpperCase();
            }
          }).catch(() => {
            this.showToast('No se pudo leer el portapapeles', 'info');
          });
        });
      }

      // Join Room
      if (this.dom.btnJoinRoom) {
        this.dom.btnJoinRoom.addEventListener('click', () => {
          const code = this.dom.joinRoomInput ? this.dom.joinRoomInput.value : '';
          this.joinOnlineRoom(code);
        });
      }
      if (this.dom.joinRoomInput) {
        this.dom.joinRoomInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            this.joinOnlineRoom(this.dom.joinRoomInput.value);
          }
        });
      }

      // Emoji Reactions
      const reactionToggle = this.dom.reactionPillToggle || document.getElementById('reaction-pill-toggle');
      const reactionBar = this.dom.onlineReactionBar || document.getElementById('online-reaction-bar');

      if (reactionToggle && reactionBar) {
        reactionToggle.addEventListener('click', (e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          reactionBar.classList.toggle('expanded');
        });
      }

      if (typeof document !== 'undefined' && document.addEventListener) {
        document.addEventListener('click', (e) => {
          if (reactionBar && reactionBar.classList && reactionBar.classList.contains('expanded')) {
            if (reactionBar.contains && typeof reactionBar.contains === 'function') {
              if (!reactionBar.contains(e.target)) {
                reactionBar.classList.remove('expanded');
              }
            } else if (e.target !== reactionBar && e.target !== reactionToggle) {
              reactionBar.classList.remove('expanded');
            }
          }
        });
      }

      document.querySelectorAll('.reaction-emoji-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          const emoji = btn.dataset ? btn.dataset.emoji : btn.getAttribute('data-emoji');
          
          if (btn.classList) {
            btn.classList.add('clicked');
            setTimeout(() => {
              if (btn.classList) btn.classList.remove('clicked');
            }, 400);
          }

          if (emoji && this.peerClient && typeof this.peerClient.sendEmoji === 'function' && this.peerClient.isConnected()) {
            this.peerClient.sendEmoji(emoji);
            this.showFloatingEmoji(emoji);
            if (this.audio && this.audio.play) this.audio.play('move');
          } else if (emoji) {
            this.showFloatingEmoji(emoji);
          }
        });
      });

      // 5. Desktop Sidebar Buttons
      if (this.dom.btnSidebarNewGame) this.dom.btnSidebarNewGame.addEventListener('click', () => this.restartGame());
      if (this.dom.btnSidebarUndo) this.dom.btnSidebarUndo.addEventListener('click', () => this.undoMove());
      if (this.dom.btnSidebarFlip) this.dom.btnSidebarFlip.addEventListener('click', () => this.flipBoard());
      if (this.dom.btnSidebarSettings) this.dom.btnSidebarSettings.addEventListener('click', () => this.openSettingsModal());
      if (this.dom.btnSidebarResign) this.dom.btnSidebarResign.addEventListener('click', () => this.handleResign());
      if (this.dom.btnSidebarDraw) this.dom.btnSidebarDraw.addEventListener('click', () => this.handleOfferDraw());

      // 6. Settings Form Listeners
      this._bindSettingsFormEvents();

      // 7. Keyboard Shortcuts
      document.addEventListener('keydown', (e) => this._handleKeyboardShortcuts(e));
    }

    _setupBoardInteractions() {
      if (!this.dom.chessboard) return;

      this.dom.chessboard.addEventListener('pointerdown', (e) => this._onPointerDown(e));
      this.dom.chessboard.addEventListener('click', (e) => this._handleBoardClick(e));
    }

    _onPointerDown(e) {
      // Only accept primary pointer button (left click or touch)
      if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;

      if (this.isAiThinking) {
        this.showToast('Stockfish is calculating...', 'info');
        return;
      }

      if (this.game.isGameOver()) return;

      const squareEl = e.target.closest('.square');
      if (!squareEl) return;

      const x = parseInt(squareEl.dataset.x, 10);
      const y = parseInt(squareEl.dataset.y, 10);
      if (isNaN(x) || isNaN(y)) return;

      const turn = this.game.getTurn();
      if (this.mode === 'ai' && turn !== this.playerColor) {
        return;
      }
      if (this.mode === 'online') {
        if (!this.peerClient || !this.peerClient.isConnected()) {
          this.showToast('Conéctate a una sala online para jugar.', 'info');
          return;
        }
        if (turn !== this.playerColor) {
          this.showToast('Es el turno de tu rival.', 'info');
          return;
        }
      }

      const piece = this.game.getPiece(x, y);
      const isOwnPiece = piece && (
        (turn === 'w' && piece === piece.toUpperCase()) ||
        (turn === 'b' && piece === piece.toLowerCase())
      );

      // If clicking an opponent piece or empty square when no piece is selected, return immediately so drag/interaction cannot start
      if (!isOwnPiece && !this.selectedSquare) {
        return;
      }

      // Clean up any lingering drag state
      this._cleanupDragGhost();

      this.pointerInteraction = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startSquare: { x, y },
        isOwnPiece: !!isOwnPiece,
        dragInitiated: false,
        ghostEl: null,
        originSquareEl: squareEl,
        piece: piece
      };

      window.addEventListener('pointermove', this._boundPointerMove, { passive: false });
      window.addEventListener('pointerup', this._boundPointerUp);
      window.addEventListener('pointercancel', this._boundPointerCancel);
    }

    _onPointerMove(e) {
      if (!this.pointerInteraction) return;
      if (e.pointerId !== this.pointerInteraction.pointerId) return;

      const state = this.pointerInteraction;
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      const dist = Math.hypot(dx, dy);

      // Initiate drag if threshold passed (> 6px) and pointer started on player's own piece
      if (!state.dragInitiated && dist > 6) {
        if (state.isOwnPiece) {
          state.dragInitiated = true;

          // Select starting piece if not selected yet
          this.selectedSquare = { x: state.startSquare.x, y: state.startSquare.y };
          this.legalMovesForSelected = this.game.getLegalMoves(state.startSquare.x, state.startSquare.y);
          this.render();

          // Mark origin square as dragging
          const refreshedOrigin = this._getSquareElement(state.startSquare.x, state.startSquare.y);
          if (refreshedOrigin) {
            refreshedOrigin.classList.add('is-dragging');
            state.originSquareEl = refreshedOrigin;
          }

          // Create floating drag ghost
          const ghost = document.createElement('div');
          ghost.className = 'drag-ghost';

          // Rotate ghost if piece is rotated in face-to-face mode
          const isWhitePiece = (state.piece === state.piece.toUpperCase());
          const isTopPiece = this.boardFlipped ? isWhitePiece : !isWhitePiece;
          const isFaceToFace = (this.settings.faceToFace !== false) && (this.mode === 'pvp' || this.settings.alwaysFaceToFace);
          if (isFaceToFace && isTopPiece) {
            ghost.classList.add('rotated-piece');
          }

          ghost.innerHTML = this.pieces.getPieceSVG(state.piece, this.settings.pieceStyle);
          ghost.style.left = `${e.clientX}px`;
          ghost.style.top = `${e.clientY}px`;
          document.body.appendChild(ghost);
          state.ghostEl = ghost;
        }
      }

      if (state.dragInitiated && state.ghostEl) {
        state.ghostEl.style.left = `${e.clientX}px`;
        state.ghostEl.style.top = `${e.clientY}px`;
      }
    }

    _onPointerUp(e) {
      if (!this.pointerInteraction) return;
      if (e.pointerId !== this.pointerInteraction.pointerId) return;

      const state = this.pointerInteraction;
      this.pointerInteraction = null;

      window.removeEventListener('pointermove', this._boundPointerMove);
      window.removeEventListener('pointerup', this._boundPointerUp);
      window.removeEventListener('pointercancel', this._boundPointerCancel);

      // Clean up visual drag indicators
      if (state.ghostEl) {
        state.ghostEl.remove();
        state.ghostEl = null;
      }
      if (state.originSquareEl) {
        state.originSquareEl.classList.remove('is-dragging');
      }

      // Suppress subsequent synthetic click events
      this._ignoreNextClick = true;
      setTimeout(() => {
        this._ignoreNextClick = false;
      }, 100);

      if (state.dragInitiated) {
        // --- DRAG AND DROP RESOLUTION ---
        if (!state.isOwnPiece) {
          this.selectedSquare = null;
          this.legalMovesForSelected = [];
          this.render();
          return;
        }

        const turn = this.game.getTurn();
        const isPieceOfTurn = state.piece && (
          (turn === 'w' && state.piece === state.piece.toUpperCase()) ||
          (turn === 'b' && state.piece === state.piece.toLowerCase())
        );
        if (!isPieceOfTurn) {
          this.selectedSquare = null;
          this.legalMovesForSelected = [];
          this.render();
          return;
        }

        if (this.mode === 'ai' && turn !== this.playerColor) {
          this.selectedSquare = null;
          this.legalMovesForSelected = [];
          this.render();
          return;
        }

        if (this.mode === 'online' && turn !== this.playerColor) {
          this.selectedSquare = null;
          this.legalMovesForSelected = [];
          this.render();
          return;
        }

        const target = this._getSquareFromPoint(e.clientX, e.clientY);

        if (target) {
          const tx = target.x;
          const ty = target.y;

          // Check if drop target is in legal moves
          const legalMove = this.legalMovesForSelected.find(m => m.x === tx && m.y === ty);
          if (legalMove) {
            if (legalMove.isPromotion) {
              this.pendingPromotionMove = {
                from: { ...state.startSquare },
                to: { x: tx, y: ty }
              };
              this.openPromotionModal(this.game.getTurn());
              return;
            }

            const from = { ...state.startSquare };
            this.selectedSquare = null;
            this.legalMovesForSelected = [];
            this.executeMove(from, { x: tx, y: ty });
            return;
          }
        }

        // Dropped on invalid square or same square -> cancel drag & keep piece selected
        this.selectedSquare = { ...state.startSquare };
        this.legalMovesForSelected = this.game.getLegalMoves(state.startSquare.x, state.startSquare.y);
        this.render();
      } else {
        // --- TAP / CLICK RESOLUTION ---
        this.handleSquareSelect(state.startSquare.x, state.startSquare.y);
      }
    }

    _onPointerCancel(e) {
      if (!this.pointerInteraction) return;
      const state = this.pointerInteraction;
      this.pointerInteraction = null;

      window.removeEventListener('pointermove', this._boundPointerMove);
      window.removeEventListener('pointerup', this._boundPointerUp);
      window.removeEventListener('pointercancel', this._boundPointerCancel);

      if (state.ghostEl) {
        state.ghostEl.remove();
      }
      if (state.originSquareEl) {
        state.originSquareEl.classList.remove('is-dragging');
      }
      this.render();
    }

    _cleanupDragGhost() {
      if (this.pointerInteraction && this.pointerInteraction.ghostEl) {
        this.pointerInteraction.ghostEl.remove();
        this.pointerInteraction.ghostEl = null;
      }
      if (typeof document !== 'undefined') {
        document.querySelectorAll('.drag-ghost').forEach(el => el.remove());
        document.querySelectorAll('.square.is-dragging').forEach(el => el.classList.remove('is-dragging'));
      }
    }

    _getSquareElement(x, y) {
      if (!this.dom.chessboard) return null;
      return this.dom.chessboard.querySelector(`.square[data-x="${x}"][data-y="${y}"]`);
    }

    _getSquareFromPoint(clientX, clientY) {
      // 1. Try DOM elementFromPoint
      if (typeof document !== 'undefined' && document.elementFromPoint) {
        const el = document.elementFromPoint(clientX, clientY);
        const sq = el ? el.closest('.square') : null;
        if (sq) {
          const x = parseInt(sq.dataset.x, 10);
          const y = parseInt(sq.dataset.y, 10);
          if (!isNaN(x) && !isNaN(y)) {
            return { x, y, el: sq };
          }
        }
      }

      // 2. Fallback: calculate from chessboard bounding rect
      if (this.dom.chessboard && typeof this.dom.chessboard.getBoundingClientRect === 'function') {
        const rect = this.dom.chessboard.getBoundingClientRect();
        if (
          clientX >= rect.left && clientX <= rect.right &&
          clientY >= rect.top && clientY <= rect.bottom &&
          rect.width > 0 && rect.height > 0
        ) {
          const col = Math.floor((clientX - rect.left) / (rect.width / 8));
          const row = Math.floor((clientY - rect.top) / (rect.height / 8));
          if (col >= 0 && col < 8 && row >= 0 && row < 8) {
            const x = this.boardFlipped ? (7 - col) : col;
            const y = this.boardFlipped ? (7 - row) : row;
            const sqEl = this._getSquareElement(x, y);
            return { x, y, el: sqEl };
          }
        }
      }

      return null;
    }

    _handleBoardClick(e) {
      if (this._ignoreNextClick) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Accessible keyboard click support
      const squareEl = e.target.closest('.square');
      if (!squareEl) return;

      const x = parseInt(squareEl.dataset.x, 10);
      const y = parseInt(squareEl.dataset.y, 10);
      if (isNaN(x) || isNaN(y)) return;

      this.handleSquareSelect(x, y);
    }

    /**
     * Core move selection & execution logic
     */
    handleSquareSelect(x, y) {
      if (this.isAiThinking) {
        this.showToast('Stockfish is calculating...', 'info');
        return;
      }

      if (this.game.isGameOver()) return;

      if (this.mode === 'online') {
        if (!this.peerClient || !this.peerClient.isConnected()) {
          this.showToast('Conéctate a una sala online para jugar.', 'info');
          return;
        }
        if (this.game.getTurn() !== this.playerColor) {
          this.showToast('Es el turno de tu rival.', 'info');
          return;
        }
      }

      if (this.mode === 'ai' && this.game.getTurn() !== this.playerColor) {
        return;
      }

      const turn = this.game.getTurn();
      const clickedPiece = this.game.getPiece(x, y);
      const isPieceOfCurrentTurn = clickedPiece && (
        (turn === 'w' && clickedPiece === clickedPiece.toUpperCase()) ||
        (turn === 'b' && clickedPiece === clickedPiece.toLowerCase())
      );

      // Scenario 1: Piece is already selected
      if (this.selectedSquare) {
        // 1a. Clicking the SAME square deselects it
        if (this.selectedSquare.x === x && this.selectedSquare.y === y) {
          this.selectedSquare = null;
          this.legalMovesForSelected = [];
          this.render();
          return;
        }

        // 1b. Clicking a legal destination square executes the move
        const legalMove = this.legalMovesForSelected.find(m => m.x === x && m.y === y);
        if (legalMove) {
          // Check for Pawn Promotion
          if (legalMove.isPromotion) {
            this.pendingPromotionMove = {
              from: { ...this.selectedSquare },
              to: { x, y }
            };
            this.openPromotionModal(turn);
            return;
          }

          // Execute normal move
          const from = { ...this.selectedSquare };
          this.selectedSquare = null;
          this.legalMovesForSelected = [];
          this.executeMove(from, { x, y });
          return;
        }

        // 1c. Clicking ANOTHER piece of the current turn switches selection
        if (isPieceOfCurrentTurn) {
          this.selectedSquare = { x, y };
          this.legalMovesForSelected = this.game.getLegalMoves(x, y);
          this.render();
          return;
        }

        // 1d. Clicking an empty or invalid square clears selection
        this.selectedSquare = null;
        this.legalMovesForSelected = [];
        this.render();
        return;
      }

      // Scenario 2: No piece selected yet -> Clicking own piece selects it and reveals legal moves
      if (isPieceOfCurrentTurn) {
        this.selectedSquare = { x, y };
        this.legalMovesForSelected = this.game.getLegalMoves(x, y);
        this.render();
        return;
      }
    }

    /**
     * Execute a move on the board and handle sound & AI triggers
     */
    executeMove(from, to, promotion = 'Q', isRemote = false) {
      const moveResult = this.game.makeMove(from, to, promotion);
      if (!moveResult) {
        this.audio.play('illegal');
        return false;
      }

      // If online mode and move was made locally by the player, transmit via WebRTC DataChannel
      if (this.mode === 'online' && !isRemote && this.peerClient && this.peerClient.isConnected()) {
        this.peerClient.sendMove({
          from,
          to,
          promotion,
          san: moveResult.san,
          fen: this.game.getFEN()
        });
      }

      // Update Last Move
      this.lastMove = {
        from: { ...from },
        to: { ...to }
      };

      // Play Sound FX
      if (moveResult.isCheckmate || this.game.isGameOver()) {
        this.audio.play('game_end');
      } else if (moveResult.isCheck) {
        this.audio.play('check');
      } else if (moveResult.isPromotion) {
        this.audio.play('promote');
      } else if (moveResult.isCastle) {
        this.audio.play('castle');
      } else if (moveResult.isCapture) {
        this.audio.play('capture');
      } else {
        this.audio.play('move');
      }

      // Update UI
      this.render();

      // Recalculate evaluation if in PvP or Online mode or human move against AI
      if (this.mode === 'pvp' || this.mode === 'online' || (this.mode === 'ai' && this.game.getTurn() === this.playerColor)) {
        this.recalculateEvaluation();
      }

      // Check Game Over
      if (this.game.isGameOver()) {
        setTimeout(() => this.showGameOverModal(), 400);
        return true;
      }

      // Trigger Stockfish AI if AI Mode & it's AI's turn
      if (this.mode === 'ai' && this.game.getTurn() !== this.playerColor) {
        setTimeout(() => this.triggerAIMove(), 150);
      }

      return true;
    }

    /* --------------------------------------------------------------------------
       STOCKFISH AI INTEGRATION
       -------------------------------------------------------------------------- */
    triggerAIMove() {
      if (this.game.isGameOver() || this.mode !== 'ai') return;
      if (this.game.getTurn() === this.playerColor) return;

      this.isAiThinking = true;
      this.render();

      const fen = this.game.getFEN();
      const diffPreset = DIFFICULTY_MAP[this.difficulty] || DIFFICULTY_MAP.medium;

      this.ai.findBestMove(
        fen,
        diffPreset,
        (bestMove, ponder, evaluation) => {
          this.isAiThinking = false;
          if (evaluation && evaluation.score) {
            this.evalScore = evaluation.score.whiteValue || 0;
          }

          if (bestMove && bestMove !== '(none)') {
            this.executeAIMove(bestMove);
          } else {
            // Fallback random legal move if engine produced none
            const allMoves = this.game.getAllLegalMoves();
            if (allMoves.length > 0) {
              const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
              this.executeMove(randomMove.from, randomMove.to, randomMove.promotion || 'Q');
            }
          }
        },
        (evalInfo) => {
          if (evalInfo && evalInfo.score) {
            this.evalScore = evalInfo.score.whiteValue || 0;
            this._renderEvaluation();
          }
        }
      ).catch(err => {
        console.warn('AI search error, fallback:', err);
        this.isAiThinking = false;
        const allMoves = this.game.getAllLegalMoves();
        if (allMoves.length > 0) {
          const m = allMoves[0];
          this.executeMove(m.from, m.to, m.promotion || 'Q');
        }
      });
    }

    executeAIMove(uci) {
      if (!uci || uci.length < 4) return;
      const fSquare = uci.slice(0, 2);
      const tSquare = uci.slice(2, 4);
      const promo = uci.length >= 5 ? uci[4].toUpperCase() : 'Q';

      const from = this._squareToCoords(fSquare);
      const to = this._squareToCoords(tSquare);
      if (!from || !to) return;

      this.executeMove(from, to, promo);
    }

    _squareToCoords(sq) {
      if (typeof sq !== 'string' || sq.length < 2) return null;
      const file = sq.charCodeAt(0) - 97;
      const rank = 8 - parseInt(sq[1], 10);
      return { x: file, y: rank };
    }

    /**
     * Recalculate evaluation score after move, undo, or position change
     */
    recalculateEvaluation() {
      const history = this.game.getHistory();
      if (history.length === 0) {
        this.evalScore = 0.0;
        this._renderEvaluation();
        return;
      }

      // Check Game Over evaluation
      if (this.game.isGameOver()) {
        const turn = this.game.getTurn();
        if (this.game.isCheckmate(turn)) {
          this.evalScore = (turn === 'w') ? -10.0 : 10.0;
        } else {
          this.evalScore = 0.0;
        }
        this._renderEvaluation();
        return;
      }

      // Immediate baseline from material difference
      const mat = this.game.getMaterialScore();
      const materialDiff = mat.difference || 0;
      this.evalScore = materialDiff;
      this._renderEvaluation();

      // If Stockfish engine is available and not currently calculating an AI move
      if (this.ai && this.ai.isAvailable && !this.isAiThinking) {
        const fen = this.game.getFEN();
        this.ai.evaluate(fen, 10, (evalInfo) => {
          if (evalInfo && evalInfo.score) {
            this.evalScore = evalInfo.score.whiteValue || 0;
            this._renderEvaluation();
          }
        }).then(res => {
          if (res && res.evaluation && res.evaluation.score) {
            this.evalScore = res.evaluation.score.whiteValue || 0;
            this._renderEvaluation();
          }
        }).catch(() => {
          this.evalScore = materialDiff;
          this._renderEvaluation();
        });
      }
    }

    /* --------------------------------------------------------------------------
       CONTROLS: UNDO, FLIP, RESTART, RESIGN, DRAW
       -------------------------------------------------------------------------- */
    undoMove() {
      this._cleanupDragGhost();
      if (this.isAiThinking) {
        this.ai.stop();
        this.isAiThinking = false;
      }

      if (this.mode === 'online') {
        if (!this.peerClient || !this.peerClient.isConnected()) {
          this.showToast('No estás conectado a una sala online.', 'error');
          return;
        }
        this.peerClient.sendUndoRequest();
        this.showToast('Solicitud para deshacer enviada al rival... ⏳', 'info');
        return;
      }

      const history = this.game.getHistory();
      if (history.length === 0) {
        this.showToast('No moves to undo.', 'info');
        return;
      }

      if (this.mode === 'ai') {
        // In AI mode, undo 2 plies if AI has replied, or 1 ply if it was only user's turn
        this.game.undo();
        if (this.game.getTurn() !== this.playerColor && this.game.getHistory().length > 0) {
          this.game.undo();
        }
      } else {
        this.game.undo();
      }

      this.selectedSquare = null;
      this.legalMovesForSelected = [];
      const updatedHistory = this.game.getHistory();
      this.lastMove = updatedHistory.length > 0 
        ? { from: updatedHistory[updatedHistory.length - 1].from, to: updatedHistory[updatedHistory.length - 1].to } 
        : null;

      // Reset or recalculate evaluation score
      if (updatedHistory.length === 0) {
        this.evalScore = 0.0;
        this._renderEvaluation();
      } else {
        this.recalculateEvaluation();
      }

      this.render();
      this.showToast('Move undone', 'info');
    }

    flipBoard() {
      this._cleanupDragGhost();
      this.boardFlipped = !this.boardFlipped;
      this.render();
      this.showToast(this.boardFlipped ? 'Board flipped: Black at bottom' : 'Board flipped: White at bottom', 'info');
    }

    restartGame() {
      this._cleanupDragGhost();
      this.game.resetGame();
      this.ai.newGame();
      this.selectedSquare = null;
      this.legalMovesForSelected = [];
      this.lastMove = null;
      this.pendingPromotionMove = null;
      this.isAiThinking = false;
      this.evalScore = 0.0;

      this.render();
      this.showToast('New game started', 'info');

      // If AI mode and playing as Black, AI plays White first move
      if (this.mode === 'ai' && this.playerColor === 'b') {
        setTimeout(() => this.triggerAIMove(), 500);
      }
    }

    handleResign() {
      if (this.game.isGameOver()) return;
      if (this.mode === 'online' && this.peerClient && this.peerClient.isConnected()) {
        this.peerClient.sendResign();
        const winner = (this.playerColor === 'w') ? 'Black' : 'White';
        this.audio.play('game_end');
        this.showGameOverModalCustom(`${winner} Wins!`, 'Has abandonado la partida.', '🏳️');
        return;
      }
      const turn = this.game.getTurn();
      const winner = turn === 'w' ? 'Black' : 'White';
      this.audio.play('game_end');
      this.showGameOverModalCustom(`${winner} Wins!`, `${turn === 'w' ? 'White' : 'Black'} resigned the game.`, '🏳️');
    }

    handleOfferDraw() {
      if (this.game.isGameOver()) return;
      if (this.mode === 'online' && this.peerClient && this.peerClient.isConnected()) {
        this.peerClient.sendDrawOffer();
        this.showToast('Oferta de tablas enviada a tu rival... 🤝', 'info');
        return;
      }
      this.audio.play('game_end');
      this.showGameOverModalCustom('Game Drawn', 'Agreement by both players.', '🤝');
    }

    cycleBoardTheme() {
      const themes = ['green', 'wood', 'dark', 'blue', 'cyber', 'coral'];
      const nextIdx = (themes.indexOf(this.settings.boardTheme) + 1) % themes.length;
      this.setBoardTheme(themes[nextIdx]);
      this.showToast(`Theme: ${themes[nextIdx].toUpperCase()}`, 'info');
    }

    toggleMute() {
      const isMuted = this.audio.toggleMute();
      this.settings.isMuted = isMuted;
      this._saveSettings();
      this._syncSettingsFormControls();
      this.showToast(isMuted ? 'Muted 🔇' : 'Sound ON 🔊', 'info');
    }

    /* --------------------------------------------------------------------------
       MODALS: SETTINGS, PROMOTION, GAME OVER
       -------------------------------------------------------------------------- */
    _bindSettingsFormEvents() {
      // Board Theme Swatches
      document.querySelectorAll('.theme-swatch-card').forEach(el => {
        el.addEventListener('click', () => {
          this.setBoardTheme(el.dataset.theme);
        });
      });

      // Piece Style Cards
      document.querySelectorAll('.piece-style-card').forEach(el => {
        el.addEventListener('click', () => {
          this.setPieceStyle(el.dataset.style);
        });
      });

      // Sound Theme Selector
      const soundSelect = document.getElementById('setting-sound-theme');
      if (soundSelect) {
        soundSelect.addEventListener('change', (e) => {
          this.setSoundTheme(e.target.value);
        });
      }

      // Test Sound Button
      const btnTestSound = document.getElementById('btn-test-sound');
      if (btnTestSound) {
        btnTestSound.addEventListener('click', () => {
          this.audio.play('move');
        });
      }

      // Volume Slider
      const volumeSlider = document.getElementById('setting-volume-slider');
      if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
          const val = parseFloat(e.target.value);
          this.setVolume(val);
        });
      }

      // Difficulty Pills
      document.querySelectorAll('.diff-pill-btn').forEach(el => {
        el.addEventListener('click', () => {
          this.setDifficulty(el.dataset.diff);
        });
      });

      // Side Chooser (White / Black) in Settings Modal
      document.querySelectorAll('.settings-side-btn, [data-side]').forEach(el => {
        el.addEventListener('click', () => {
          if (el.dataset.side) {
            this.setPlayerColor(el.dataset.side);
          }
        });
      });

      // Mode Switcher (AI vs PvP)
      const modeSelect = document.getElementById('setting-game-mode');
      if (modeSelect) {
        modeSelect.addEventListener('change', (e) => {
          this.setGameMode(e.target.value);
        });
      }

      // Face-to-Face Tabletop Toggle
      const faceToFaceToggle = document.getElementById('setting-face-to-face');
      if (faceToFaceToggle) {
        faceToFaceToggle.addEventListener('change', (e) => {
          this.setFaceToFace(e.target.checked);
        });
      }

      // Close buttons
      document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const modal = e.target.closest('.modal-backdrop');
          if (modal) modal.classList.remove('open');
        });
      });
    }

    setFaceToFace(enabled) {
      this.settings.faceToFace = !!enabled;
      this._saveSettings();
      this._syncSettingsFormControls();
      this.render();
      this.showToast(this.settings.faceToFace ? 'Modo Mesa activado (fichas rival giradas 180°)' : 'Orientación estándar activada', 'info');
    }

    toggleFaceToFace() {
      this.setFaceToFace(!this.settings.faceToFace);
    }

    setBoardTheme(theme) {
      this.settings.boardTheme = theme;
      this._saveSettings();
      document.body.setAttribute('data-board-theme', theme);
      this._syncSettingsFormControls();
    }

    setPieceStyle(style) {
      this.settings.pieceStyle = style;
      this._saveSettings();
      this._syncSettingsFormControls();
      this.render();
    }

    setSoundTheme(theme) {
      this.settings.soundTheme = theme;
      this.audio.setSoundTheme(theme);
      this._saveSettings();
      this.audio.play('move');
    }

    setVolume(val) {
      this.settings.volume = val;
      this.audio.setVolume(val);
      this._saveSettings();
    }

    setDifficulty(diff) {
      this.settings.difficulty = diff;
      this.difficulty = diff;
      this._saveSettings();
      this._syncSettingsFormControls();
      this.render();
      this.showToast(`AI Difficulty: ${DIFFICULTY_MAP[diff]?.name || diff}`, 'info');
    }

    setPlayerColor(side) {
      this.playerColor = side;
      this.settings.playerColor = side;
      this.boardFlipped = (side === 'b');
      this._saveSettings();
      this._syncSettingsFormControls();
      this.restartGame();
    }

    setGameMode(mode, reset = true) {
      this.mode = mode;
      this.settings.gameMode = mode;
      this._saveSettings();
      this._syncSettingsFormControls();

      // Show/hide floating reaction bar based on mode
      if (this.dom.onlineReactionBar) {
        const isOnline = mode === 'online';
        this.dom.onlineReactionBar.classList.toggle('visible', isOnline);
        if (!isOnline) {
          this.dom.onlineReactionBar.classList.remove('expanded');
        }
      }
      if (this.dom.onlineStatusHud) {
        this.dom.onlineStatusHud.style.display = (mode === 'online') ? 'inline-flex' : 'none';
      }

      if (reset) {
        this.restartGame();
      }
    }

    /* --------------------------------------------------------------------------
       ONLINE MULTIPLAYER / PEERJS P2P INTEGRATION
       -------------------------------------------------------------------------- */
    _initPeerClient() {
      if (typeof PeerChessClient === 'undefined') return;

      this.peerClient = new PeerChessClient({ playerName: 'Jugador' });

      this.peerClient.on('status', (info) => {
        this._updateOnlineStatusHUD(info);
      });

      this.peerClient.on('connected', (info) => {
        this.setGameMode('online', false);
        this.playerColor = info.assignedColor;
        this.boardFlipped = (this.playerColor === 'b');
        this.game.resetGame();
        this.evalScore = 0.0;
        this.lastMove = null;
        this.selectedSquare = null;
        this.legalMovesForSelected = [];
        this.render();

        // Close online modal
        if (this.dom.modalOnline) this.dom.modalOnline.classList.remove('open');
        this.showToast(`¡Conectado! Juegas con ${this.playerColor === 'w' ? 'Blancas ♔' : 'Negras ♚'}`, 'success');
      });

      this.peerClient.on('disconnected', (info) => {
        this.showToast(info.reason || 'El rival se ha desconectado.', 'error');
        this._updateOnlineStatusHUD({ status: 'disconnected', message: 'Desconectado' });
      });

      this.peerClient.on('move', (data) => {
        this._onRemoteMove(data);
      });

      this.peerClient.on('emoji', (data) => {
        if (data && data.emoji) {
          this.showFloatingEmoji(data.emoji);
          this.audio.play('move');
        }
      });

      this.peerClient.on('draw_offered', () => {
        this._handleRemoteDrawOffer();
      });

      this.peerClient.on('draw_response', (data) => {
        if (data.accepted) {
          this.showToast('¡Tu rival ha aceptado las tablas! Partida empatada.', 'info');
          this.showGameOverModalCustom('Partida Empatada', 'Acuerdo mutuo de tablas.', '🤝');
        } else {
          this.showToast('Tu rival ha rechazado la oferta de tablas.', 'info');
        }
      });

      this.peerClient.on('undo_requested', () => {
        this._handleRemoteUndoRequest();
      });

      this.peerClient.on('undo_response', (data) => {
        if (data.accepted) {
          this.game.undo();
          this.game.undo();
          this.lastMove = null;
          this.render();
          this.recalculateEvaluation();
          this.showToast('Se deshizo la última jugada.', 'info');
        } else {
          this.showToast('Tu rival no aceptó deshacer la jugada.', 'info');
        }
      });

      this.peerClient.on('resign', (data) => {
        const winner = (data.color === 'w') ? 'Black' : 'White';
        this.audio.play('game_end');
        this.showToast('¡Tu rival se ha rendido! Has ganado.', 'success');
        this.showGameOverModalCustom(`${winner} Wins!`, 'Tu rival abandonó la partida.', '🏆');
      });

      this.peerClient.on('rematch', (data) => {
        if (data.accepted) {
          // Switch colors for rematch
          this.playerColor = (this.playerColor === 'w') ? 'b' : 'w';
          this.boardFlipped = (this.playerColor === 'b');
          this.game.resetGame();
          this.lastMove = null;
          this.evalScore = 0.0;
          this.render();
          this.showToast('¡Revancha iniciada! Colores intercambiados.', 'success');
          if (this.dom.modalGameOver) this.dom.modalGameOver.classList.remove('open');
        } else {
          this._handleRemoteRematchRequest();
        }
      });

      this.peerClient.on('ping', (data) => {
        if (this.dom.onlineStatusText) {
          this.dom.onlineStatusText.textContent = `Online (${data.pingMs}ms)`;
        }
      });

      this.peerClient.on('error', (err) => {
        this.showToast(err.message || 'Error de conexión P2P', 'error');
      });
    }

    _updateOnlineStatusHUD(info) {
      if (!this.dom.onlineStatusHud || !this.dom.onlineStatusText) return;

      this.dom.onlineStatusHud.className = `online-status-pill ${info.status}`;
      if (info.status === 'connected') {
        this.dom.onlineStatusHud.style.display = 'inline-flex';
        this.dom.onlineStatusText.textContent = `Online (${info.pingMs || 15}ms)`;
      } else if (info.status === 'waiting') {
        this.dom.onlineStatusHud.style.display = 'inline-flex';
        this.dom.onlineStatusText.textContent = 'Esperando rival...';
      } else if (info.status === 'connecting') {
        this.dom.onlineStatusHud.style.display = 'inline-flex';
        this.dom.onlineStatusText.textContent = 'Conectando...';
      } else if (this.mode === 'online') {
        this.dom.onlineStatusHud.style.display = 'inline-flex';
        this.dom.onlineStatusText.textContent = 'Desconectado';
      } else {
        this.dom.onlineStatusHud.style.display = 'none';
      }
    }

    _onRemoteMove(data) {
      if (!data || !data.from || !data.to) return;
      const executed = this.executeMove(data.from, data.to, data.promotion || 'Q', true);
      if (!executed && data.fen) {
        // Fallback sync FEN if state diverged
        this.game.loadFEN(data.fen);
        this.render();
      }
    }

    _handleRemoteDrawOffer() {
      const accept = confirm('Tu rival te ofrece tablas (empate). ¿Aceptas?');
      if (this.peerClient) {
        this.peerClient.sendDrawResponse(accept);
      }
      if (accept) {
        this.audio.play('game_end');
        this.showGameOverModalCustom('Partida Empatada', 'Acuerdo mutuo de tablas.', '🤝');
      }
    }

    _handleRemoteUndoRequest() {
      const accept = confirm('Tu rival solicita deshacer la última jugada. ¿Aceptas?');
      if (this.peerClient) {
        this.peerClient.sendUndoResponse(accept);
      }
      if (accept) {
        this.game.undo();
        this.game.undo();
        this.lastMove = null;
        this.render();
        this.recalculateEvaluation();
        this.showToast('Se deshizo la última jugada.', 'info');
      }
    }

    _handleRemoteRematchRequest() {
      const accept = confirm('¡Tu rival solicita una revancha! ¿Deseas jugar otra partida?');
      if (this.peerClient) {
        this.peerClient.sendRematch(accept);
      }
      if (accept) {
        this.playerColor = (this.playerColor === 'w') ? 'b' : 'w';
        this.boardFlipped = (this.playerColor === 'b');
        this.game.resetGame();
        this.lastMove = null;
        this.evalScore = 0.0;
        this.render();
        this.showToast('¡Revancha iniciada! Colores intercambiados.', 'success');
        if (this.dom.modalGameOver) this.dom.modalGameOver.classList.remove('open');
      }
    }

    createOnlineRoom(preferredColor = 'random') {
      if (!this.peerClient) return;

      if (this.dom.btnCreateRoom) this.dom.btnCreateRoom.disabled = true;
      if (this.dom.hostRoomDetails) this.dom.hostRoomDetails.style.display = 'none';

      this.peerClient.createRoom({ preferredColor })
        .then(result => {
          if (this.dom.btnCreateRoom) this.dom.btnCreateRoom.disabled = false;
          if (this.dom.hostRoomCode) this.dom.hostRoomCode.textContent = result.roomCode;
          if (this.dom.hostRoomDetails) this.dom.hostRoomDetails.style.display = 'flex';

          // Generate QR code
          if (this.dom.onlineQrcodeContainer && typeof QRCode !== 'undefined') {
            this.dom.onlineQrcodeContainer.innerHTML = '';
            new QRCode(this.dom.onlineQrcodeContainer, {
              text: result.shareLink,
              width: 140,
              height: 140,
              colorDark: '#0f172a',
              colorLight: '#ffffff',
              correctLevel: QRCode.CorrectLevel.M
            });
          }

          this.showToast(`Sala ${result.roomCode} creada. Esperando rival...`, 'info');
        })
        .catch(err => {
          if (this.dom.btnCreateRoom) this.dom.btnCreateRoom.disabled = false;
          this.showToast(`Error al crear sala: ${err.message}`, 'error');
        });
    }

    joinOnlineRoom(code) {
      if (!this.peerClient) return;
      const sanitized = PeerChessClient.sanitizeRoomCode(code);
      if (!sanitized) {
        this.showToast('Ingresa un código de sala válido.', 'error');
        return;
      }

      if (this.dom.joinStatusContainer) this.dom.joinStatusContainer.style.display = 'block';
      if (this.dom.btnJoinRoom) this.dom.btnJoinRoom.disabled = true;

      this.peerClient.joinRoom(sanitized)
        .then(() => {
          if (this.dom.btnJoinRoom) this.dom.btnJoinRoom.disabled = false;
          if (this.dom.joinStatusContainer) this.dom.joinStatusContainer.style.display = 'none';
        })
        .catch(err => {
          if (this.dom.btnJoinRoom) this.dom.btnJoinRoom.disabled = false;
          if (this.dom.joinStatusContainer) this.dom.joinStatusContainer.style.display = 'none';
          this.showToast(err.message || 'No se pudo conectar a la sala.', 'error');
        });
    }

    openOnlineModal(tab = 'create') {
      if (this.dom.modalOnline) {
        this.dom.modalOnline.classList.add('open');
        this.switchOnlineTab(tab);
      }
    }

    switchOnlineTab(tab) {
      if (this.dom.tabBtnCreate && this.dom.tabBtnJoin) {
        this.dom.tabBtnCreate.classList.toggle('active', tab === 'create');
        this.dom.tabBtnJoin.classList.toggle('active', tab === 'join');
      }
      if (this.dom.tabPaneCreate && this.dom.tabPaneJoin) {
        this.dom.tabPaneCreate.classList.toggle('active', tab === 'create');
        this.dom.tabPaneJoin.classList.toggle('active', tab === 'join');
      }
    }

    showFloatingEmoji(emoji) {
      if (!emoji || typeof document === 'undefined' || !document.createElement || !document.body) return;
      const bubble = document.createElement('div');
      bubble.className = 'floating-reaction-bubble';
      bubble.textContent = emoji;

      const innerW = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 800;
      const innerH = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight : 600;
      const randomX = Math.floor(Math.random() * Math.max(100, innerW - 120)) + 60;
      const randomY = Math.floor(Math.random() * Math.max(100, innerH / 2)) + Math.floor(innerH / 3);
      bubble.style.left = `${randomX}px`;
      bubble.style.top = `${randomY}px`;
      document.body.appendChild(bubble);

      setTimeout(() => {
        if (bubble && typeof bubble.remove === 'function') {
          bubble.remove();
        }
      }, 2300);
    }

    openSettingsModal() {
      if (this.dom.modalSettings) {
        this._syncSettingsFormControls();
        this.dom.modalSettings.classList.add('open');
      }
    }

    openPromotionModal(color) {
      if (!this.dom.modalPromotion || !this.dom.promotionPiecesContainer) return;
      this.dom.promotionPiecesContainer.innerHTML = '';

      const choices = ['Q', 'R', 'B', 'N'];
      choices.forEach(p => {
        const pieceChar = (color === 'w') ? p : p.toLowerCase();
        const btn = document.createElement('button');
        btn.className = 'promotion-piece-btn';
        btn.innerHTML = this.pieces.getPieceSVG(pieceChar, this.settings.pieceStyle);
        btn.addEventListener('click', () => {
          this.dom.modalPromotion.classList.remove('open');
          if (this.pendingPromotionMove) {
            this.executeMove(this.pendingPromotionMove.from, this.pendingPromotionMove.to, p);
            this.pendingPromotionMove = null;
            this.selectedSquare = null;
            this.legalMovesForSelected = [];
          }
        });
        this.dom.promotionPiecesContainer.appendChild(btn);
      });

      this.dom.modalPromotion.classList.add('open');
    }

    showGameOverModal() {
      const state = this.game.getGameState();
      let title = 'Game Over';
      let reason = 'Game concluded.';
      let icon = '🏆';

      if (state.isCheckmate) {
        const winner = (state.turn === 'w') ? 'Black' : 'White';
        title = `${winner} Wins!`;
        reason = `Checkmate delivered. Outstanding performance!`;
        icon = '👑';
      } else if (state.isStalemate) {
        title = 'Draw by Stalemate';
        reason = 'No legal moves available and King is not in check.';
        icon = '⚖️';
      } else if (state.isInsufficientMaterial) {
        title = 'Draw: Insufficient Material';
        reason = 'Neither player has enough pieces to deliver checkmate.';
        icon = '⚖️';
      } else if (state.isFiftyMoveRule) {
        title = 'Draw by 50-Move Rule';
        reason = '50 moves passed without any capture or pawn movement.';
        icon = '⏱️';
      } else if (state.isThreefoldRepetition) {
        title = 'Draw by Repetition';
        reason = 'The exact position occurred 3 times.';
        icon = '🔄';
      }

      this.showGameOverModalCustom(title, reason, icon);
    }

    showGameOverModalCustom(title, reason, icon) {
      if (!this.dom.modalGameOver) return;
      if (this.dom.gameOverTitle) this.dom.gameOverTitle.textContent = title;
      if (this.dom.gameOverReason) this.dom.gameOverReason.textContent = reason;
      if (this.dom.gameOverIcon) this.dom.gameOverIcon.textContent = icon;

      const btnRematch = document.getElementById('btn-gameover-rematch');
      if (btnRematch) {
        btnRematch.onclick = () => {
          this.dom.modalGameOver.classList.remove('open');
          this.restartGame();
        };
      }

      const btnCopyFEN = document.getElementById('btn-gameover-copy-fen');
      if (btnCopyFEN) {
        btnCopyFEN.onclick = () => {
          this.copyFENToClipboard();
        };
      }

      this.dom.modalGameOver.classList.add('open');
    }

    copyFENToClipboard() {
      const fen = this.game.getFEN();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(fen).then(() => {
          this.showToast('FEN copied to clipboard! 📋', 'info');
        }).catch(() => {
          this.showToast(fen, 'info');
        });
      } else {
        this.showToast(fen, 'info');
      }
    }

    showToast(message, type = 'info') {
      if (!this.dom.toastContainer) return;
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
      this.dom.toastContainer.appendChild(toast);

      setTimeout(() => {
        if (toast && toast.parentNode) {
          toast.remove();
        }
      }, 2700);
    }

    _handleKeyboardShortcuts(e) {
      // Don't intercept when typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach(m => m.classList.remove('open'));
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'f') {
        this.flipBoard();
      } else if (key === 'z') {
        this.undoMove();
      } else if (key === 'r') {
        this.restartGame();
      } else if (key === 'm') {
        this.toggleMute();
      } else if (key === 's') {
        this.openSettingsModal();
      }
    }
  }

  // Initialize on DOM Ready
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      global.chessAppInstance = new ChessApp();
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessApp;
  }
  global.ChessApp = ChessApp;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
