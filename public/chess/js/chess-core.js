/**
 * Chess Core Engine (ChessGame)
 * Full standard chess rules implementation in vanilla JavaScript (ES6+).
 * 
 * Features:
 * - 8x8 Board representation
 * - Legal move generation for Pawn, Knight, Bishop, Rook, Queen, King
 * - Full castling logic (King & Rook movement check, path clearance, attack detection)
 * - En-passant capture tracking and execution
 * - Pawn promotion (Q, R, B, N)
 * - Check, checkmate, stalemate, 50-move rule, 3-fold repetition, insufficient material
 * - Standard Algebraic Notation (SAN) with disambiguation, +, #
 * - Move execution and undo with full state restoration
 * - Captured pieces tracker & material balance score calculation
 * - FEN generator (export) and FEN loader (import)
 * - UI helper methods (getLegalMoves, isSquareAttacked, etc.)
 */

(function (global) {
  'use strict';

  // Constants
  const WHITE = 'w';
  const BLACK = 'b';

  const PIECE_VALUES = {
    p: 1, P: 1,
    n: 3, N: 3,
    b: 3, B: 3,
    r: 5, R: 5,
    q: 9, Q: 9,
    k: 0, K: 0
  };

  const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  const KNIGHT_OFFSETS = [
    { x: -1, y: -2 }, { x: 1, y: -2 },
    { x: -2, y: -1 }, { x: 2, y: -1 },
    { x: -2, y: 1 },  { x: 2, y: 1 },
    { x: -1, y: 2 },  { x: 1, y: 2 }
  ];

  const BISHOP_DIRECTIONS = [
    { x: -1, y: -1 }, { x: 1, y: -1 },
    { x: -1, y: 1 },  { x: 1, y: 1 }
  ];

  const ROOK_DIRECTIONS = [
    { x: 0, y: -1 }, { x: 0, y: 1 },
    { x: -1, y: 0 }, { x: 1, y: 0 }
  ];

  const QUEEN_DIRECTIONS = [
    ...BISHOP_DIRECTIONS,
    ...ROOK_DIRECTIONS
  ];

  const KING_OFFSETS = [
    { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
    { x: -1, y: 0 },                   { x: 1, y: 0 },
    { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 }
  ];

  /**
   * Helper: Convert file char and rank number to coordinates {x, y}
   * e.g., 'a8' -> {x: 0, y: 0}, 'e4' -> {x: 4, y: 4}, 'h1' -> {x: 7, y: 7}
   */
  function squareToCoords(square) {
    if (typeof square !== 'string' || square.length < 2) return null;
    const file = square.charCodeAt(0) - 97; // 'a' -> 0
    const rank = 8 - parseInt(square[1], 10); // '8' -> 0, '1' -> 7
    if (file < 0 || file > 7 || rank < 0 || rank > 7 || isNaN(rank)) return null;
    return { x: file, y: rank };
  }

  /**
   * Helper: Convert coordinates {x, y} to square notation e.g. {x: 4, y: 4} -> 'e4'
   */
  function coordsToSquare(x, y) {
    if (x < 0 || x > 7 || y < 0 || y > 7) return '';
    const file = String.fromCharCode(97 + x);
    const rank = (8 - y).toString();
    return file + rank;
  }

  /**
   * Helper: Is piece uppercase (White)
   */
  function isWhitePiece(p) {
    return p !== ' ' && p === p.toUpperCase();
  }

  /**
   * Helper: Is piece lowercase (Black)
   */
  function isBlackPiece(p) {
    return p !== ' ' && p === p.toLowerCase();
  }

  /**
   * Helper: Get piece color ('w', 'b', or null)
   */
  function getPieceColor(p) {
    if (!p || p === ' ') return null;
    return isWhitePiece(p) ? WHITE : BLACK;
  }

  /**
   * Helper: Check if coords are inside the 8x8 board
   */
  function inBounds(x, y) {
    return x >= 0 && x <= 7 && y >= 0 && y <= 7;
  }

  class ChessGame {
    constructor(fen = STARTING_FEN) {
      this.resetGame();
      if (fen !== STARTING_FEN) {
        this.loadFEN(fen);
      }
    }

    /**
     * Resets the game to the starting position
     */
    resetGame() {
      // 8x8 grid: y=0 (rank 8, black backrank) to y=7 (rank 1, white backrank)
      this.board = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
      ];

      this.turn = WHITE;
      this.castling = { K: true, Q: true, k: true, q: true };
      this.enPassant = null; // {x, y} coordinates of the target en-passant square
      this.halfMoves = 0;    // 50-move rule counter
      this.fullMoves = 1;    // Full move counter
      this.history = [];     // Array of executed move objects
      this.capturedPieces = { w: [], b: [] }; // w: black pieces captured by white, b: white pieces captured by black
      this.positionHistory = new Map(); // For 3-fold repetition tracking

      this._recordPosition();
    }

    // Alias for resetGame
    reset() {
      this.resetGame();
    }

    /**
     * Get piece at (x, y) or 'e4'
     */
    getPiece(x, y) {
      if (typeof x === 'string') {
        const c = squareToCoords(x);
        if (!c) return null;
        x = c.x;
        y = c.y;
      }
      if (!inBounds(x, y)) return null;
      const p = this.board[y][x];
      return p === ' ' ? null : p;
    }

    /**
     * Set piece at (x, y) or 'e4'
     */
    setPiece(x, y, piece) {
      if (typeof x === 'string') {
        const c = squareToCoords(x);
        if (!c) return false;
        piece = y;
        x = c.x;
        y = c.y;
      }
      if (!inBounds(x, y)) return false;
      this.board[y][x] = piece || ' ';
      return true;
    }

    /**
     * Get current active turn ('w' or 'b')
     */
    getTurn() {
      return this.turn;
    }

    /**
     * Get move history
     */
    getHistory() {
      return [...this.history];
    }

    /**
     * Get captured pieces by side
     * returns { w: [...], b: [...], white: [...], black: [...] }
     */
    getCapturedPieces() {
      return {
        w: [...this.capturedPieces.w],
        b: [...this.capturedPieces.b],
        white: [...this.capturedPieces.w],
        black: [...this.capturedPieces.b]
      };
    }

    /**
     * Calculate material scores and advantage
     * White captured pieces are black pieces ('p','n','b','r','q')
     * Black captured pieces are white pieces ('P','N','B','R','Q')
     */
    getMaterialScore() {
      let whiteMaterial = 0;
      let blackMaterial = 0;

      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece = this.board[y][x];
          if (piece === ' ') continue;
          const val = PIECE_VALUES[piece] || 0;
          if (isWhitePiece(piece)) {
            whiteMaterial += val;
          } else {
            blackMaterial += val;
          }
        }
      }

      const diff = whiteMaterial - blackMaterial;
      let advantage = 'equal';
      if (diff > 0) advantage = 'white';
      else if (diff < 0) advantage = 'black';

      // Sort captured pieces descending by value for clean UI display
      const sortPieces = (arr) => [...arr].sort((a, b) => (PIECE_VALUES[b] || 0) - (PIECE_VALUES[a] || 0));

      return {
        white: whiteMaterial,
        black: blackMaterial,
        difference: diff,
        absDiff: Math.abs(diff),
        advantage: advantage,
        capturedPieces: {
          w: sortPieces(this.capturedPieces.w),
          b: sortPieces(this.capturedPieces.b),
          white: sortPieces(this.capturedPieces.w),
          black: sortPieces(this.capturedPieces.b)
        }
      };
    }

    /**
     * Check if square (x, y) is attacked by a given color ('w' or 'b')
     */
    isSquareAttacked(x, y, byColor) {
      if (!inBounds(x, y)) return false;

      // 1. Attacked by Pawn
      const pawnDir = (byColor === WHITE) ? 1 : -1; // White pawns attack from y + 1 (lower rank), Black pawns from y - 1
      const pawnChar = (byColor === WHITE) ? 'P' : 'p';
      const pY = y + pawnDir;
      if (inBounds(x - 1, pY) && this.board[pY][x - 1] === pawnChar) return true;
      if (inBounds(x + 1, pY) && this.board[pY][x + 1] === pawnChar) return true;

      // 2. Attacked by Knight
      const knightChar = (byColor === WHITE) ? 'N' : 'n';
      for (const off of KNIGHT_OFFSETS) {
        const nx = x + off.x;
        const ny = y + off.y;
        if (inBounds(nx, ny) && this.board[ny][nx] === knightChar) return true;
      }

      // 3. Attacked by King
      const kingChar = (byColor === WHITE) ? 'K' : 'k';
      for (const off of KING_OFFSETS) {
        const kx = x + off.x;
        const ky = y + off.y;
        if (inBounds(kx, ky) && this.board[ky][kx] === kingChar) return true;
      }

      // 4. Attacked by Bishop or Queen (Diagonals)
      const bishopChar = (byColor === WHITE) ? 'B' : 'b';
      const queenChar = (byColor === WHITE) ? 'Q' : 'q';
      for (const dir of BISHOP_DIRECTIONS) {
        let curX = x + dir.x;
        let curY = y + dir.y;
        while (inBounds(curX, curY)) {
          const piece = this.board[curY][curX];
          if (piece !== ' ') {
            if (piece === bishopChar || piece === queenChar) return true;
            break; // Blocked
          }
          curX += dir.x;
          curY += dir.y;
        }
      }

      // 5. Attacked by Rook or Queen (Orthogonals)
      const rookChar = (byColor === WHITE) ? 'R' : 'r';
      for (const dir of ROOK_DIRECTIONS) {
        let curX = x + dir.x;
        let curY = y + dir.y;
        while (inBounds(curX, curY)) {
          const piece = this.board[curY][curX];
          if (piece !== ' ') {
            if (piece === rookChar || piece === queenChar) return true;
            break; // Blocked
          }
          curX += dir.x;
          curY += dir.y;
        }
      }

      return false;
    }

    /**
     * Find King coordinates for a given color
     */
    findKing(color) {
      const kingChar = (color === WHITE) ? 'K' : 'k';
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          if (this.board[y][x] === kingChar) {
            return { x, y };
          }
        }
      }
      return null;
    }

    /**
     * Check if a player's king is in check
     */
    isCheck(color = this.turn) {
      const king = this.findKing(color);
      if (!king) return false;
      const enemyColor = (color === WHITE) ? BLACK : WHITE;
      return this.isSquareAttacked(king.x, king.y, enemyColor);
    }

    // Alias for isCheck
    inCheck(color) {
      return this.isCheck(color);
    }

    /**
     * Get raw pseudo-legal moves for piece at (x, y) without king safety check
     */
    _getPseudoLegalMoves(x, y) {
      if (!inBounds(x, y)) return [];
      const piece = this.board[y][x];
      if (piece === ' ') return [];

      const color = getPieceColor(piece);
      const enemyColor = (color === WHITE) ? BLACK : WHITE;
      const moves = [];
      const lower = piece.toLowerCase();

      // PAWN
      if (lower === 'p') {
        const dir = (color === WHITE) ? -1 : 1;
        const startRank = (color === WHITE) ? 6 : 1;
        const promoRank = (color === WHITE) ? 0 : 7;

        // 1-square push
        const nextY = y + dir;
        if (inBounds(x, nextY) && this.board[nextY][x] === ' ') {
          if (nextY === promoRank) {
            for (const promo of ['Q', 'R', 'B', 'N']) {
              moves.push({
                from: { x, y },
                to: { x, y: nextY },
                isCapture: false,
                isPromotion: true,
                promotion: promo,
                isEnPassant: false,
                isCastle: false
              });
            }
          } else {
            moves.push({
              from: { x, y },
              to: { x, y: nextY },
              isCapture: false,
              isPromotion: false,
              isEnPassant: false,
              isCastle: false
            });

            // 2-square double push from start rank
            const doubleY = y + (dir * 2);
            if (y === startRank && this.board[doubleY][x] === ' ') {
              moves.push({
                from: { x, y },
                to: { x, y: doubleY },
                isCapture: false,
                isPromotion: false,
                isEnPassant: false,
                isCastle: false,
                isDoublePush: true
              });
            }
          }
        }

        // Diagonal captures
        for (const dx of [-1, 1]) {
          const capX = x + dx;
          const capY = y + dir;
          if (inBounds(capX, capY)) {
            const targetPiece = this.board[capY][capX];
            // Normal capture
            if (targetPiece !== ' ' && getPieceColor(targetPiece) === enemyColor) {
              if (capY === promoRank) {
                for (const promo of ['Q', 'R', 'B', 'N']) {
                  moves.push({
                    from: { x, y },
                    to: { x: capX, y: capY },
                    isCapture: true,
                    capturedPiece: targetPiece,
                    isPromotion: true,
                    promotion: promo,
                    isEnPassant: false,
                    isCastle: false
                  });
                }
              } else {
                moves.push({
                  from: { x, y },
                  to: { x: capX, y: capY },
                  isCapture: true,
                  capturedPiece: targetPiece,
                  isPromotion: false,
                  isEnPassant: false,
                  isCastle: false
                });
              }
            }
            // En-passant capture
            else if (this.enPassant && this.enPassant.x === capX && this.enPassant.y === capY) {
              const epCapturedPiece = (color === WHITE) ? 'p' : 'P';
              moves.push({
                from: { x, y },
                to: { x: capX, y: capY },
                isCapture: true,
                capturedPiece: epCapturedPiece,
                isPromotion: false,
                isEnPassant: true,
                isCastle: false
              });
            }
          }
        }
      }

      // KNIGHT
      else if (lower === 'n') {
        for (const off of KNIGHT_OFFSETS) {
          const tx = x + off.x;
          const ty = y + off.y;
          if (inBounds(tx, ty)) {
            const target = this.board[ty][tx];
            if (target === ' ') {
              moves.push({ from: { x, y }, to: { x: tx, y: ty }, isCapture: false, isCastle: false });
            } else if (getPieceColor(target) === enemyColor) {
              moves.push({ from: { x, y }, to: { x: tx, y: ty }, isCapture: true, capturedPiece: target, isCastle: false });
            }
          }
        }
      }

      // BISHOP
      else if (lower === 'b') {
        this._addRayMoves(moves, x, y, BISHOP_DIRECTIONS, enemyColor);
      }

      // ROOK
      else if (lower === 'r') {
        this._addRayMoves(moves, x, y, ROOK_DIRECTIONS, enemyColor);
      }

      // QUEEN
      else if (lower === 'q') {
        this._addRayMoves(moves, x, y, QUEEN_DIRECTIONS, enemyColor);
      }

      // KING
      else if (lower === 'k') {
        // Normal 1-step moves
        for (const off of KING_OFFSETS) {
          const tx = x + off.x;
          const ty = y + off.y;
          if (inBounds(tx, ty)) {
            const target = this.board[ty][tx];
            if (target === ' ') {
              moves.push({ from: { x, y }, to: { x: tx, y: ty }, isCapture: false, isCastle: false });
            } else if (getPieceColor(target) === enemyColor) {
              moves.push({ from: { x, y }, to: { x: tx, y: ty }, isCapture: true, capturedPiece: target, isCastle: false });
            }
          }
        }

        // Castling moves
        const rank = (color === WHITE) ? 7 : 0;
        const kRight = (color === WHITE) ? this.castling.K : this.castling.k;
        const qRight = (color === WHITE) ? this.castling.Q : this.castling.q;
        const rookChar = (color === WHITE) ? 'R' : 'r';

        // Only consider castling if king is on its initial square
        if (x === 4 && y === rank) {
          // Kingside (O-O): Squares 5 and 6 must be empty, square 7 has rook
          if (kRight &&
              this.board[rank][5] === ' ' &&
              this.board[rank][6] === ' ' &&
              this.board[rank][7] === rookChar) {
            // King cannot castle out of check, through check, or into check
            if (!this.isSquareAttacked(4, rank, enemyColor) &&
                !this.isSquareAttacked(5, rank, enemyColor) &&
                !this.isSquareAttacked(6, rank, enemyColor)) {
              moves.push({
                from: { x: 4, y: rank },
                to: { x: 6, y: rank },
                isCapture: false,
                isCastle: 'kingside',
                isPromotion: false,
                isEnPassant: false
              });
            }
          }

          // Queenside (O-O-O): Squares 1, 2, 3 must be empty, square 0 has rook
          if (qRight &&
              this.board[rank][1] === ' ' &&
              this.board[rank][2] === ' ' &&
              this.board[rank][3] === ' ' &&
              this.board[rank][0] === rookChar) {
            // King cannot castle out of check, through check (d1/d8), or into check (c1/c8)
            // Note: b1/b8 square does NOT need to be unattacked, only empty!
            if (!this.isSquareAttacked(4, rank, enemyColor) &&
                !this.isSquareAttacked(3, rank, enemyColor) &&
                !this.isSquareAttacked(2, rank, enemyColor)) {
              moves.push({
                from: { x: 4, y: rank },
                to: { x: 2, y: rank },
                isCapture: false,
                isCastle: 'queenside',
                isPromotion: false,
                isEnPassant: false
              });
            }
          }
        }
      }

      return moves;
    }

    _addRayMoves(moves, x, y, directions, enemyColor) {
      for (const dir of directions) {
        let tx = x + dir.x;
        let ty = y + dir.y;
        while (inBounds(tx, ty)) {
          const target = this.board[ty][tx];
          if (target === ' ') {
            moves.push({ from: { x, y }, to: { x: tx, y: ty }, isCapture: false, isCastle: false });
          } else {
            if (getPieceColor(target) === enemyColor) {
              moves.push({ from: { x, y }, to: { x: tx, y: ty }, isCapture: true, capturedPiece: target, isCastle: false });
            }
            break; // Stop ray on any piece collision
          }
          tx += dir.x;
          ty += dir.y;
        }
      }
    }

    /**
     * Test a move internally and verify if it leaves the king in check
     */
    _isMoveSafe(move, color) {
      const { from, to, isEnPassant, isCastle, promotion } = move;
      const piece = this.board[from.y][from.x];
      const target = this.board[to.y][to.x];

      // Make temporary move
      this.board[from.y][from.x] = ' ';
      this.board[to.y][to.x] = promotion ? ((color === WHITE) ? promotion.toUpperCase() : promotion.toLowerCase()) : piece;

      let epPawnX = -1, epPawnY = -1, epPawnPiece = ' ';
      if (isEnPassant) {
        epPawnX = to.x;
        epPawnY = from.y;
        epPawnPiece = this.board[epPawnY][epPawnX];
        this.board[epPawnY][epPawnX] = ' ';
      }

      let rookFromX = -1, rookFromY = -1, rookToX = -1, rookToY = -1, rookPiece = ' ';
      if (isCastle === 'kingside') {
        rookFromX = 7; rookFromY = from.y;
        rookToX = 5;   rookToY = from.y;
        rookPiece = this.board[rookFromY][rookFromX];
        this.board[rookFromY][rookFromX] = ' ';
        this.board[rookToY][rookToX] = rookPiece;
      } else if (isCastle === 'queenside') {
        rookFromX = 0; rookFromY = from.y;
        rookToX = 3;   rookToY = from.y;
        rookPiece = this.board[rookFromY][rookFromX];
        this.board[rookFromY][rookFromX] = ' ';
        this.board[rookToY][rookToX] = rookPiece;
      }

      // Check king safety
      const inCheck = this.isCheck(color);

      // Revert temporary move
      this.board[from.y][from.x] = piece;
      this.board[to.y][to.x] = target;

      if (isEnPassant) {
        this.board[epPawnY][epPawnX] = epPawnPiece;
      }

      if (isCastle) {
        this.board[rookToY][rookToX] = ' ';
        this.board[rookFromY][rookFromX] = rookPiece;
      }

      return !inCheck;
    }

    /**
     * Get all strictly legal moves for piece at (x, y) or square 'e4'
     * Returns array of move objects with coordinates, capture info, etc.
     */
    getLegalMoves(x, y) {
      if (typeof x === 'string') {
        const c = squareToCoords(x);
        if (!c) return [];
        x = c.x;
        y = c.y;
      }
      if (!inBounds(x, y)) return [];

      const piece = this.board[y][x];
      if (piece === ' ') return [];

      const color = getPieceColor(piece);
      const pseudoMoves = this._getPseudoLegalMoves(x, y);
      const legalMoves = [];

      for (const move of pseudoMoves) {
        if (this._isMoveSafe(move, color)) {
          legalMoves.push({
            x: move.to.x,
            y: move.to.y,
            from: { x: move.from.x, y: move.from.y },
            to: { x: move.to.x, y: move.to.y },
            fromSquare: coordsToSquare(move.from.x, move.from.y),
            toSquare: coordsToSquare(move.to.x, move.to.y),
            isCapture: !!move.isCapture,
            capturedPiece: move.capturedPiece || null,
            isEnPassant: !!move.isEnPassant,
            isCastle: move.isCastle || false,
            isPromotion: !!move.isPromotion,
            promotion: move.promotion || null
          });
        }
      }

      return legalMoves;
    }

    /**
     * Get all legal moves for a color (defaults to active player's turn)
     */
    getAllLegalMoves(color = this.turn) {
      const moves = [];
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const piece = this.board[y][x];
          if (piece !== ' ' && getPieceColor(piece) === color) {
            const pieceMoves = this.getLegalMoves(x, y);
            moves.push(...pieceMoves);
          }
        }
      }
      return moves;
    }

    /**
     * Generate SAN (Standard Algebraic Notation) for a legal move
     */
    _generateSAN(move, legalMovesForPiece) {
      const { from, to, isCastle, isPromotion, promotion, isCapture } = move;
      const piece = this.board[from.y][from.x];
      const upperPiece = piece.toUpperCase();

      if (isCastle === 'kingside') {
        return this._appendCheckSuffix('O-O', move);
      }
      if (isCastle === 'queenside') {
        return this._appendCheckSuffix('O-O-O', move);
      }

      let san = '';

      if (upperPiece === 'P') {
        if (isCapture) {
          san += String.fromCharCode(97 + from.x) + 'x' + coordsToSquare(to.x, to.y);
        } else {
          san += coordsToSquare(to.x, to.y);
        }
        if (isPromotion && promotion) {
          san += '=' + promotion.toUpperCase();
        }
      } else {
        san += upperPiece;

        // Disambiguation
        // Find other friendly pieces of the same type that can also legally move to the same square
        const candidates = [];
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            if (x === from.x && y === from.y) continue;
            if (this.board[y][x] === piece) {
              const otherMoves = this.getLegalMoves(x, y);
              if (otherMoves.some(m => m.x === to.x && m.y === to.y)) {
                candidates.push({ x, y });
              }
            }
          }
        }

        if (candidates.length > 0) {
          const sameFile = candidates.some(c => c.x === from.x);
          const sameRank = candidates.some(c => c.y === from.y);

          if (!sameFile) {
            // File is unique
            san += String.fromCharCode(97 + from.x);
          } else if (!sameRank) {
            // Rank is unique
            san += (8 - from.y).toString();
          } else {
            // Both file and rank are needed
            san += coordsToSquare(from.x, from.y);
          }
        }

        if (isCapture) {
          san += 'x';
        }
        san += coordsToSquare(to.x, to.y);
      }

      return this._appendCheckSuffix(san, move);
    }

    _appendCheckSuffix(san, move) {
      // Temporarily make the move to test if enemy is in check / checkmate
      const color = this.turn;
      const enemyColor = (color === WHITE) ? BLACK : WHITE;

      const snapshot = this._takeSnapshot();
      this._applyMove(move);

      const inCheck = this.isCheck(enemyColor);
      const enemyMoves = this.getAllLegalMoves(enemyColor);
      const isCheckmate = inCheck && enemyMoves.length === 0;

      this._restoreSnapshot(snapshot);

      if (isCheckmate) return san + '#';
      if (inCheck) return san + '+';
      return san;
    }

    /**
     * Execute a move on the board
     * Accepts:
     * - Object: { from: {x, y}, to: {x, y}, promotion: 'Q' }
     * - Object with squares: { from: 'e2', to: 'e4', promotion: 'Q' }
     * - String UCI: "e2e4", "e7e8q"
     * - Function arguments: (fromSquare, toSquare, promotion)
     */
    makeMove(from, to, promotion = 'Q') {
      let moveObj = null;

      // Helper to normalize coordinate/square input to { x, y }
      const parseCoord = (c) => {
        if (!c) return null;
        if (typeof c === 'string') return squareToCoords(c);
        if (typeof c === 'object' && typeof c.x === 'number' && typeof c.y === 'number') return { x: c.x, y: c.y };
        return null;
      };

      // Format 1: makeMove("e2e4") or makeMove("e7e8q")
      if (typeof from === 'string' && from.length >= 4 && !to) {
        const uci = from;
        const f = squareToCoords(uci.slice(0, 2));
        const t = squareToCoords(uci.slice(2, 4));
        const p = uci.length >= 5 ? uci[4].toUpperCase() : 'Q';
        if (!f || !t) return null;
        moveObj = { from: f, to: t, promotion: p };
      }
      // Format 2: Single move object: makeMove({ from: ..., to: ..., promotion: ... })
      else if (typeof from === 'object' && from !== null && (from.from !== undefined || from.to !== undefined)) {
        const f = parseCoord(from.from);
        const t = parseCoord(from.to);
        const p = (from.promotion || to || 'Q').toString().toUpperCase();
        if (!f || !t) return null;
        moveObj = { from: f, to: t, promotion: p };
      }
      // Format 3: Two arguments: makeMove(from, to, promotion) where from and to can be {x, y} or 'e2'
      else if (from && to) {
        const f = parseCoord(from);
        const t = parseCoord(to);
        const p = (promotion || 'Q').toString().toUpperCase();
        if (!f || !t) return null;
        moveObj = { from: f, to: t, promotion: p };
      }

      if (!moveObj || !inBounds(moveObj.from.x, moveObj.from.y) || !inBounds(moveObj.to.x, moveObj.to.y)) {
        return null;
      }

      const piece = this.board[moveObj.from.y][moveObj.from.x];
      if (piece === ' ' || getPieceColor(piece) !== this.turn) {
        return null;
      }

      // Check if move is legal
      const legalMoves = this.getLegalMoves(moveObj.from.x, moveObj.from.y);
      const matchedMove = legalMoves.find(m => {
        if (m.x !== moveObj.to.x || m.y !== moveObj.to.y) return false;
        if (m.isPromotion) {
          const reqPromo = (moveObj.promotion || 'Q').toUpperCase();
          return (m.promotion || 'Q').toUpperCase() === reqPromo;
        }
        return true;
      });

      if (!matchedMove) {
        return null;
      }

      // Generate SAN before state mutation
      const san = this._generateSAN(matchedMove, legalMoves);

      // Create move record for history
      const prevCastling = { ...this.castling };
      const prevEnPassant = this.enPassant ? { ...this.enPassant } : null;
      const prevHalfMoves = this.halfMoves;
      const prevFullMoves = this.fullMoves;
      const movingPiece = piece;
      let capturedPiece = matchedMove.isCapture ? (matchedMove.capturedPiece || this.board[moveObj.to.y][moveObj.to.x]) : null;

      // Apply move
      this._applyMove(matchedMove);

      // Update captured pieces record
      if (matchedMove.isCapture && capturedPiece && capturedPiece !== ' ') {
        if (this.turn === BLACK) { // Move was made by White, turn has flipped to Black
          this.capturedPieces.w.push(capturedPiece);
        } else {
          this.capturedPieces.b.push(capturedPiece);
        }
      }

      const isCheck = this.isCheck(this.turn);
      const allNextMoves = this.getAllLegalMoves(this.turn);
      const isCheckmate = isCheck && allNextMoves.length === 0;
      const isStalemate = !isCheck && allNextMoves.length === 0;

      // Record move into history
      const uciPromo = matchedMove.isPromotion ? (matchedMove.promotion || 'q').toLowerCase() : '';
      const uci = coordsToSquare(matchedMove.from.x, matchedMove.from.y) +
                  coordsToSquare(matchedMove.to.x, matchedMove.to.y) +
                  uciPromo;

      const executedRecord = {
        from: { x: matchedMove.from.x, y: matchedMove.from.y },
        to: { x: matchedMove.to.x, y: matchedMove.to.y },
        fromSquare: coordsToSquare(matchedMove.from.x, matchedMove.from.y),
        toSquare: coordsToSquare(matchedMove.to.x, matchedMove.to.y),
        piece: movingPiece,
        captured: capturedPiece,
        isCapture: matchedMove.isCapture,
        isEnPassant: matchedMove.isEnPassant,
        isCastle: matchedMove.isCastle,
        isPromotion: matchedMove.isPromotion,
        promotion: matchedMove.promotion,
        san: san,
        uci: uci,
        isCheck: isCheck,
        isCheckmate: isCheckmate,
        isStalemate: isStalemate,
        prevCastling: prevCastling,
        prevEnPassant: prevEnPassant,
        prevHalfMoves: prevHalfMoves,
        prevFullMoves: prevFullMoves,
        fen: this.getFEN()
      };

      this.history.push(executedRecord);
      this._recordPosition();

      return executedRecord;
    }

    /**
     * Applies a validated move to the board and updates flags
     */
    _applyMove(move) {
      const { from, to, isEnPassant, isCastle, isPromotion, promotion } = move;
      const piece = this.board[from.y][from.x];
      const color = getPieceColor(piece);
      const target = this.board[to.y][to.x];

      // Handle 50-move clock: reset on pawn move or capture, otherwise increment
      if (piece.toLowerCase() === 'p' || target !== ' ' || isEnPassant) {
        this.halfMoves = 0;
      } else {
        this.halfMoves++;
      }

      // 1. Move piece
      this.board[from.y][from.x] = ' ';
      if (isPromotion && promotion) {
        this.board[to.y][to.x] = (color === WHITE) ? promotion.toUpperCase() : promotion.toLowerCase();
      } else {
        this.board[to.y][to.x] = piece;
      }

      // 2. Handle En-passant pawn removal
      if (isEnPassant) {
        this.board[from.y][to.x] = ' ';
      }

      // 3. Handle Castling rook move
      if (isCastle === 'kingside') {
        this.board[from.y][7] = ' ';
        this.board[from.y][5] = (color === WHITE) ? 'R' : 'r';
      } else if (isCastle === 'queenside') {
        this.board[from.y][0] = ' ';
        this.board[from.y][3] = (color === WHITE) ? 'R' : 'r';
      }

      // 4. Update Castling rights
      // King moved
      if (piece === 'K') { this.castling.K = false; this.castling.Q = false; }
      if (piece === 'k') { this.castling.k = false; this.castling.q = false; }

      // Rook moved from initial square
      if (from.x === 0 && from.y === 7) this.castling.Q = false;
      if (from.x === 7 && from.y === 7) this.castling.K = false;
      if (from.x === 0 && from.y === 0) this.castling.q = false;
      if (from.x === 7 && from.y === 0) this.castling.k = false;

      // Rook captured on its initial square
      if (to.x === 0 && to.y === 7) this.castling.Q = false;
      if (to.x === 7 && to.y === 7) this.castling.K = false;
      if (to.x === 0 && to.y === 0) this.castling.q = false;
      if (to.x === 7 && to.y === 0) this.castling.k = false;

      // 5. Update En-passant square
      if (piece.toLowerCase() === 'p' && Math.abs(to.y - from.y) === 2) {
        this.enPassant = { x: from.x, y: (from.y + to.y) / 2 };
      } else {
        this.enPassant = null;
      }

      // 6. Update Fullmoves and Turn
      if (color === BLACK) {
        this.fullMoves++;
      }
      this.turn = (color === WHITE) ? BLACK : WHITE;
    }

    /**
     * Undo the last move played
     * Restores the exact board, turn, castling rights, en-passant, history, captured pieces, 50-move clock
     * Returns the undone move object, or null if history was empty
     */
    undoMove() {
      if (this.history.length === 0) return null;

      const lastMove = this.history.pop();
      const { from, to, piece, captured, isEnPassant, isCastle, prevCastling, prevEnPassant, prevHalfMoves, prevFullMoves } = lastMove;

      // Restore position map count
      this._unrecordPosition();

      // Restore piece to 'from'
      this.board[from.y][from.x] = piece;

      // Restore piece to 'to' (or empty if not a normal capture)
      if (isEnPassant) {
        this.board[to.y][to.x] = ' ';
        // Restore captured pawn at [from.y][to.x]
        this.board[from.y][to.x] = captured;
      } else {
        this.board[to.y][to.x] = captured || ' ';
      }

      // Restore castling rook
      if (isCastle === 'kingside') {
        const rookChar = (piece === 'K') ? 'R' : 'r';
        this.board[from.y][5] = ' ';
        this.board[from.y][7] = rookChar;
      } else if (isCastle === 'queenside') {
        const rookChar = (piece === 'K') ? 'R' : 'r';
        this.board[from.y][3] = ' ';
        this.board[from.y][0] = rookChar;
      }

      // Restore state variables
      this.castling = { ...prevCastling };
      this.enPassant = prevEnPassant ? { ...prevEnPassant } : null;
      this.halfMoves = prevHalfMoves;
      this.fullMoves = prevFullMoves;
      this.turn = getPieceColor(piece);

      // Restore captured piece list
      if (lastMove.isCapture && captured) {
        if (this.turn === WHITE) {
          this.capturedPieces.w.pop();
        } else {
          this.capturedPieces.b.pop();
        }
      }

      return lastMove;
    }

    // Alias for undoMove
    undo() {
      return this.undoMove();
    }

    /**
     * Snapshot helpers for temporary simulations
     */
    _takeSnapshot() {
      return {
        board: this.board.map(row => [...row]),
        turn: this.turn,
        castling: { ...this.castling },
        enPassant: this.enPassant ? { ...this.enPassant } : null,
        halfMoves: this.halfMoves,
        fullMoves: this.fullMoves
      };
    }

    _restoreSnapshot(s) {
      this.board = s.board.map(row => [...row]);
      this.turn = s.turn;
      this.castling = { ...s.castling };
      this.enPassant = s.enPassant ? { ...s.enPassant } : null;
      this.halfMoves = s.halfMoves;
      this.fullMoves = s.fullMoves;
    }

    /**
     * Record position key for 3-fold repetition check
     */
    _getPositionKey() {
      // Key includes board layout, active turn, castling rights, and en-passant square
      let boardStr = '';
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          boardStr += this.board[y][x];
        }
      }
      const cStr = (this.castling.K ? 'K' : '') +
                   (this.castling.Q ? 'Q' : '') +
                   (this.castling.k ? 'k' : '') +
                   (this.castling.q ? 'q' : '');
      const epStr = this.enPassant ? coordsToSquare(this.enPassant.x, this.enPassant.y) : '-';
      return `${boardStr}_${this.turn}_${cStr}_${epStr}`;
    }

    _recordPosition() {
      const key = this._getPositionKey();
      this.positionHistory.set(key, (this.positionHistory.get(key) || 0) + 1);
    }

    _unrecordPosition() {
      const key = this._getPositionKey();
      const count = this.positionHistory.get(key) || 0;
      if (count <= 1) {
        this.positionHistory.delete(key);
      } else {
        this.positionHistory.set(key, count - 1);
      }
    }

    /**
     * Game End Checks
     */
    isCheckmate() {
      return this.isCheck(this.turn) && this.getAllLegalMoves(this.turn).length === 0;
    }

    isStalemate() {
      return !this.isCheck(this.turn) && this.getAllLegalMoves(this.turn).length === 0;
    }

    isFiftyMoveRule() {
      return this.halfMoves >= 100;
    }

    isThreefoldRepetition() {
      const key = this._getPositionKey();
      return (this.positionHistory.get(key) || 0) >= 3;
    }

    isInsufficientMaterial() {
      const pieces = [];
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const p = this.board[y][x];
          if (p !== ' ') {
            pieces.push({ piece: p, x, y, isLightSquare: (x + y) % 2 === 0 });
          }
        }
      }

      // K vs K
      if (pieces.length === 2) return true;

      // K+B vs K or K+N vs K
      if (pieces.length === 3) {
        const nonKings = pieces.filter(p => p.piece.toLowerCase() !== 'k');
        if (nonKings.length === 1) {
          const type = nonKings[0].piece.toLowerCase();
          if (type === 'n' || type === 'b') return true;
        }
      }

      // K+B vs K+B (bishops on the same color square)
      if (pieces.length === 4) {
        const bishops = pieces.filter(p => p.piece.toLowerCase() === 'b');
        if (bishops.length === 2) {
          const b1 = bishops[0];
          const b2 = bishops[1];
          // Check if one is white and one is black, and they are on the same square color
          if (getPieceColor(b1.piece) !== getPieceColor(b2.piece) && b1.isLightSquare === b2.isLightSquare) {
            return true;
          }
        }
      }

      return false;
    }

    isDraw() {
      return this.isStalemate() ||
             this.isInsufficientMaterial() ||
             this.isFiftyMoveRule() ||
             this.isThreefoldRepetition();
    }

    isGameOver() {
      return this.isCheckmate() || this.isDraw();
    }

    /**
     * Get detailed status of the game
     */
    getGameState() {
      const inCheck = this.isCheck(this.turn);
      const isCheckmate = this.isCheckmate();
      const isStalemate = this.isStalemate();
      const isInsufficient = this.isInsufficientMaterial();
      const is50 = this.isFiftyMoveRule();
      const isRepetition = this.isThreefoldRepetition();
      const isDraw = isStalemate || isInsufficient || is50 || isRepetition;
      const isGameOver = isCheckmate || isDraw;

      let result = '*';
      let reason = null;

      if (isCheckmate) {
        result = (this.turn === WHITE) ? '0-1' : '1-0';
        reason = 'checkmate';
      } else if (isStalemate) {
        result = '1/2-1/2';
        reason = 'stalemate';
      } else if (isInsufficient) {
        result = '1/2-1/2';
        reason = 'insufficient_material';
      } else if (is50) {
        result = '1/2-1/2';
        reason = '50_moves';
      } else if (isRepetition) {
        result = '1/2-1/2';
        reason = 'threefold_repetition';
      }

      return {
        turn: this.turn,
        inCheck: inCheck,
        isCheckmate: isCheckmate,
        isStalemate: isStalemate,
        isInsufficientMaterial: isInsufficient,
        isFiftyMoveRule: is50,
        isThreefoldRepetition: isRepetition,
        isDraw: isDraw,
        isGameOver: isGameOver,
        result: result,
        reason: reason
      };
    }

    /**
     * FEN Export (getFEN / fen)
     */
    getFEN() {
      let fen = '';

      // 1. Piece placement
      for (let y = 0; y < 8; y++) {
        let emptyCount = 0;
        for (let x = 0; x < 8; x++) {
          const piece = this.board[y][x];
          if (piece === ' ') {
            emptyCount++;
          } else {
            if (emptyCount > 0) {
              fen += emptyCount;
              emptyCount = 0;
            }
            fen += piece;
          }
        }
        if (emptyCount > 0) fen += emptyCount;
        if (y < 7) fen += '/';
      }

      // 2. Active color
      fen += ' ' + this.turn;

      // 3. Castling rights
      let castlingStr = '';
      if (this.castling.K) castlingStr += 'K';
      if (this.castling.Q) castlingStr += 'Q';
      if (this.castling.k) castlingStr += 'k';
      if (this.castling.q) castlingStr += 'q';
      fen += ' ' + (castlingStr || '-');

      // 4. En-passant square
      if (this.enPassant) {
        fen += ' ' + coordsToSquare(this.enPassant.x, this.enPassant.y);
      } else {
        fen += ' -';
      }

      // 5. Halfmove clock
      fen += ' ' + this.halfMoves;

      // 6. Fullmove number
      fen += ' ' + this.fullMoves;

      return fen;
    }

    // Alias for getFEN
    fen() {
      return this.getFEN();
    }

    /**
     * FEN Import (loadFEN / load)
     */
    loadFEN(fenString) {
      if (typeof fenString !== 'string') return false;
      const tokens = fenString.trim().split(/\s+/);
      if (tokens.length < 1) return false;

      const pieceRows = tokens[0].split('/');
      if (pieceRows.length !== 8) return false;

      const newBoard = [];
      for (let y = 0; y < 8; y++) {
        const row = [];
        const fenRow = pieceRows[y];
        for (let i = 0; i < fenRow.length; i++) {
          const ch = fenRow[i];
          if (ch >= '1' && ch <= '8') {
            const count = parseInt(ch, 10);
            for (let e = 0; e < count; e++) row.push(' ');
          } else if ('pnbrqkPNBRQK'.includes(ch)) {
            row.push(ch);
          } else {
            return false; // Invalid char
          }
        }
        if (row.length !== 8) return false;
        newBoard.push(row);
      }

      // Active color
      const turn = (tokens[1] === 'b') ? BLACK : WHITE;

      // Castling
      const castlingToken = tokens[2] || '-';
      const castling = {
        K: castlingToken.includes('K'),
        Q: castlingToken.includes('Q'),
        k: castlingToken.includes('k'),
        q: castlingToken.includes('q')
      };

      // En-passant
      let enPassant = null;
      if (tokens[3] && tokens[3] !== '-') {
        enPassant = squareToCoords(tokens[3]);
      }

      // Halfmoves
      const halfMoves = tokens[4] ? parseInt(tokens[4], 10) || 0 : 0;

      // Fullmoves
      const fullMoves = tokens[5] ? parseInt(tokens[5], 10) || 1 : 1;

      // Apply loaded state
      this.board = newBoard;
      this.turn = turn;
      this.castling = castling;
      this.enPassant = enPassant;
      this.halfMoves = halfMoves;
      this.fullMoves = fullMoves;
      this.history = [];
      this.positionHistory = new Map();

      // Calculate captured pieces relative to full starting piece counts
      const standardCount = {
        P: 8, N: 2, B: 2, R: 2, Q: 1,
        p: 8, n: 2, b: 2, r: 2, q: 1
      };
      const currentCount = {
        P: 0, N: 0, B: 0, R: 0, Q: 0,
        p: 0, n: 0, b: 0, r: 0, q: 0
      };

      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const p = this.board[y][x];
          if (p !== ' ' && currentCount[p] !== undefined) {
            currentCount[p]++;
          }
        }
      }

      this.capturedPieces = { w: [], b: [] };
      for (const [p, cnt] of Object.entries(standardCount)) {
        const missing = Math.max(0, cnt - (currentCount[p] || 0));
        for (let i = 0; i < missing; i++) {
          if (isWhitePiece(p)) {
            this.capturedPieces.b.push(p);
          } else {
            this.capturedPieces.w.push(p);
          }
        }
      }

      this._recordPosition();
      return true;
    }

    // Alias for loadFEN
    load(fen) {
      return this.loadFEN(fen);
    }

    /**
     * ASCII Board Representation for debugging
     */
    ascii() {
      let s = '  +-----------------+\n';
      for (let y = 0; y < 8; y++) {
        s += (8 - y) + ' | ';
        for (let x = 0; x < 8; x++) {
          const p = this.board[y][x];
          s += (p === ' ' ? '.' : p) + ' ';
        }
        s += '|\n';
      }
      s += '  +-----------------+\n';
      s += '    a b c d e f g h\n';
      s += `Turn: ${this.turn === WHITE ? 'White' : 'Black'}, FEN: ${this.getFEN()}`;
      return s;
    }
  }

  // Export to global / window or module.exports
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ChessGame, squareToCoords, coordsToSquare };
  }
  if (typeof window !== 'undefined') {
    window.ChessGame = ChessGame;
  }
})(typeof window !== 'undefined' ? window : globalThis);
