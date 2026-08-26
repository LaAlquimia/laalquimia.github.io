/**
 * Stockfish AI Bridge (StockfishAI)
 * Robust Web Worker bridge for Stockfish UCI chess engine in JavaScript (ES6+).
 * 
 * Features:
 * - Clean async/callback API for Stockfish Web Worker communication
 * - Configurable difficulty levels (Skill Level 0-20, search depths, time limits)
 * - Named difficulty presets ('beginner', 'easy', 'medium', 'hard', 'expert', 'maximum')
 * - Real-time evaluation streaming (score cp / mate, depth, pv, nodes)
 * - Promise and callback support for findBestMove() and evaluate()
 * - Safe fallback engine if Web Worker is unsupported or fails to load
 * - Graceful cancellation via stop() and restart()
 */

(function (global) {
  'use strict';

  // Difficulty configurations mapping
  const DIFFICULTY_PRESETS = {
    beginner: { skill: 0, depth: 2, movetime: 200 },
    easy: { skill: 3, depth: 4, movetime: 400 },
    medium: { skill: 8, depth: 8, movetime: 800 },
    hard: { skill: 14, depth: 12, movetime: 1500 },
    expert: { skill: 18, depth: 16, movetime: 2500 },
    maximum: { skill: 20, depth: 20, movetime: 4000 },
    max: { skill: 20, depth: 20, movetime: 4000 }
  };

  /**
   * Helper: Parse difficulty parameter into skill, depth, and movetime
   */
  function parseDifficulty(diff) {
    if (typeof diff === 'string') {
      const lower = diff.toLowerCase().trim();
      if (DIFFICULTY_PRESETS[lower]) {
        return { ...DIFFICULTY_PRESETS[lower] };
      }
      const num = parseInt(lower, 10);
      if (!isNaN(num)) diff = num;
    }

    if (typeof diff === 'number') {
      // Map 1-25 numeric values
      const skill = Math.max(0, Math.min(20, Math.round(diff * 0.8)));
      const depth = Math.max(1, Math.min(22, Math.round(diff)));
      const movetime = Math.min(4000, Math.max(200, depth * 150));
      return { skill, depth, movetime };
    }

    // Default to medium
    return { ...DIFFICULTY_PRESETS.medium };
  }

  /**
   * Helper: Parse UCI info line for evaluation metrics
   */
  function parseInfoLine(line, activeTurn = 'w') {
    const info = {
      depth: 0,
      seldepth: 0,
      score: null,       // { type: 'cp'|'mate', value: number, whiteValue: number }
      nodes: 0,
      nps: 0,
      time: 0,
      pv: '',
      currmove: '',
      raw: line
    };

    const tokens = line.split(/\s+/);
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token === 'depth' && tokens[i + 1]) {
        info.depth = parseInt(tokens[i + 1], 10);
      } else if (token === 'seldepth' && tokens[i + 1]) {
        info.seldepth = parseInt(tokens[i + 1], 10);
      } else if (token === 'score' && tokens[i + 1] && tokens[i + 2]) {
        const type = tokens[i + 1]; // 'cp' or 'mate'
        const val = parseInt(tokens[i + 2], 10);
        if (!isNaN(val)) {
          // Centipawn or mate score
          // In UCI, score is from active player's perspective.
          const whiteMultiplier = (activeTurn === 'w' || activeTurn === 'white') ? 1 : -1;
          info.score = {
            type: type,
            value: (type === 'cp') ? val / 100 : val,
            cp: (type === 'cp') ? val : null,
            mate: (type === 'mate') ? val : null,
            whiteValue: (type === 'cp') ? (val * whiteMultiplier) / 100 : (val * whiteMultiplier)
          };
        }
      } else if (token === 'nodes' && tokens[i + 1]) {
        info.nodes = parseInt(tokens[i + 1], 10);
      } else if (token === 'nps' && tokens[i + 1]) {
        info.nps = parseInt(tokens[i + 1], 10);
      } else if (token === 'time' && tokens[i + 1]) {
        info.time = parseInt(tokens[i + 1], 10);
      } else if (token === 'currmove' && tokens[i + 1]) {
        info.currmove = tokens[i + 1];
      } else if (token === 'pv') {
        info.pv = tokens.slice(i + 1).join(' ');
        break;
      }
    }

    return info;
  }

  class StockfishAI {
    /**
     * @param {Object} options Configuration options
     * @param {string} options.workerPath Path to stockfish.js worker file (default: './stockfish.js')
     * @param {Function} options.onLog Optional logging callback for UCI traffic
     * @param {Function} options.onError Optional error callback
     */
    constructor(options = {}) {
      this.workerPath = options.workerPath || './stockfish.js';
      this.onLog = options.onLog || null;
      this.onError = options.onError || null;

      this.worker = null;
      this.isReady = false;
      this.isSearching = false;
      this.isAvailable = false;
      this.currentSkillLevel = null;

      // Pending search callbacks
      this._searchCallbacks = {
        onBestMove: null,
        onEvaluation: null,
        resolve: null,
        reject: null,
        activeTurn: 'w',
        lastEval: null
      };

      this._readyResolvers = [];

      this._initWorker();
    }

    /**
     * Initializes the Web Worker and performs UCI handshake
     */
    _initWorker() {
      if (typeof Worker === 'undefined') {
        console.warn('StockfishAI: Web Workers are not supported in this environment. Fallback will be used.');
        this.isAvailable = false;
        return;
      }

      try {
        this.worker = new Worker(this.workerPath);
        this.isAvailable = true;

        this.worker.onmessage = (e) => this._handleWorkerMessage(e.data);
        this.worker.onerror = (err) => {
          console.warn('StockfishAI Worker error:', err);
          this.isAvailable = false;
          if (this.onError) this.onError(err);
          this._flushReadyResolvers(false);
          this._handleSearchError(err);
        };

        // Send UCI handshake
        this._send('uci');
        this._send('isready');
      } catch (err) {
        console.warn('StockfishAI: Failed to instantiate Web Worker:', err);
        this.isAvailable = false;
        if (this.onError) this.onError(err);
      }
    }

    /**
     * Internal: Send command to Stockfish worker
     */
    _send(cmd) {
      if (this.onLog) this.onLog(`> ${cmd}`);
      if (this.worker && this.isAvailable) {
        try {
          this.worker.postMessage(cmd);
        } catch (e) {
          console.warn('StockfishAI: postMessage failed:', e);
        }
      }
    }

    /**
     * Handle incoming lines from Stockfish
     */
    _handleWorkerMessage(line) {
      if (typeof line !== 'string') return;
      line = line.trim();
      if (this.onLog) this.onLog(`< ${line}`);

      // Ready checks
      if (line === 'uciok' || line === 'readyok') {
        this.isReady = true;
        this._flushReadyResolvers(true);
        return;
      }

      // Evaluation / Search Info
      if (line.startsWith('info ') && this.isSearching) {
        const info = parseInfoLine(line, this._searchCallbacks.activeTurn);
        if (info.score !== null) {
          this._searchCallbacks.lastEval = info;
        }
        if (this._searchCallbacks.onEvaluation) {
          try {
            this._searchCallbacks.onEvaluation(info);
          } catch (err) {
            console.error('Error in onEvaluation callback:', err);
          }
        }
      }

      // Bestmove line
      if (line.startsWith('bestmove')) {
        this.isSearching = false;
        const tokens = line.split(/\s+/);
        const bestMove = tokens[1] !== '(none)' ? tokens[1] : null;
        const ponder = tokens[2] === 'ponder' ? tokens[3] : null;
        const finalEval = this._searchCallbacks.lastEval;

        const onBestMove = this._searchCallbacks.onBestMove;
        const resolve = this._searchCallbacks.resolve;

        // Reset callbacks
        this._searchCallbacks = {
          onBestMove: null,
          onEvaluation: null,
          resolve: null,
          reject: null,
          activeTurn: 'w',
          lastEval: null
        };

        if (onBestMove) {
          try {
            onBestMove(bestMove, ponder, finalEval);
          } catch (err) {
            console.error('Error in onBestMove callback:', err);
          }
        }

        if (resolve) {
          resolve({
            bestMove: bestMove,
            ponder: ponder,
            evaluation: finalEval
          });
        }
      }
    }

    _flushReadyResolvers(success) {
      while (this._readyResolvers.length > 0) {
        const resolver = this._readyResolvers.shift();
        resolver(success);
      }
    }

    _handleSearchError(err) {
      if (this.isSearching) {
        this.isSearching = false;
        if (this._searchCallbacks.reject) {
          this._searchCallbacks.reject(err);
        }
      }
    }

    /**
     * Wait for Stockfish engine to be ready
     */
    waitUntilReady() {
      if (this.isReady) return Promise.resolve(true);
      if (!this.isAvailable) return Promise.resolve(false);

      return new Promise((resolve) => {
        this._readyResolvers.push(resolve);
        this._send('isready');
      });
    }

    /**
     * Set engine skill level (0 - 20)
     */
    setSkillLevel(skill) {
      const clamped = Math.max(0, Math.min(20, Math.round(skill)));
      if (this.currentSkillLevel !== clamped) {
        this.currentSkillLevel = clamped;
        this._send(`setoption name Skill Level value ${clamped}`);
      }
    }

    /**
     * Find best move for a given FEN position
     * Supports both Promise-based and Callback-based patterns.
     * 
     * @param {string} fen Standard FEN string of the position
     * @param {number|string|Object} difficulty Level (1-20 or 'beginner', 'medium', etc.)
     * @param {Function} [onBestMoveCallback] Callback (bestMove, ponder, eval)
     * @param {Function} [onEvaluationCallback] Callback (evalInfo)
     * @returns {Promise<{bestMove: string, ponder: string, evaluation: Object}>}
     */
    findBestMove(fen, difficulty = 'medium', onBestMoveCallback = null, onEvaluationCallback = null) {
      return new Promise((resolve, reject) => {
        // If worker is unavailable, execute fallback
        if (!this.isAvailable || !this.worker) {
          const fallbackResult = this._executeFallback(fen);
          if (onBestMoveCallback) onBestMoveCallback(fallbackResult.bestMove, null, fallbackResult.evaluation);
          return resolve(fallbackResult);
        }

        // Stop any running search
        if (this.isSearching) {
          this.stop();
        }

        const config = typeof difficulty === 'object' && difficulty !== null
          ? { ...DIFFICULTY_PRESETS.medium, ...difficulty }
          : parseDifficulty(difficulty);

        // Active player turn from FEN
        const activeTurn = (fen && fen.split(' ')[1] === 'b') ? 'b' : 'w';

        this.isSearching = true;
        this._searchCallbacks = {
          onBestMove: onBestMoveCallback,
          onEvaluation: onEvaluationCallback,
          resolve: resolve,
          reject: reject,
          activeTurn: activeTurn,
          lastEval: null
        };

        // Configure Stockfish
        this.setSkillLevel(config.skill);
        this._send(`position fen ${fen}`);

        if (config.movetime && config.depth) {
          this._send(`go depth ${config.depth} movetime ${config.movetime}`);
        } else if (config.depth) {
          this._send(`go depth ${config.depth}`);
        } else if (config.movetime) {
          this._send(`go movetime ${config.movetime}`);
        } else {
          this._send('go depth 10');
        }
      });
    }

    /**
     * Continuous evaluation mode for analyzing positions / eval bar
     * 
     * @param {string} fen FEN string
     * @param {number} depth Depth to search (default: 12)
     * @param {Function} onEvaluationCallback Callback streaming evaluation info
     * @returns {Promise<Object>} Final evaluation
     */
    evaluate(fen, depth = 12, onEvaluationCallback = null) {
      return this.findBestMove(fen, { skill: 20, depth: depth, movetime: null }, null, onEvaluationCallback);
    }

    /**
     * Halt current search calculation immediately
     */
    stop() {
      if (this.isSearching) {
        this._send('stop');
        this.isSearching = false;
      }
    }

    /**
     * Start a new game session in Stockfish
     */
    newGame() {
      this.stop();
      this._send('ucinewgame');
      this._send('isready');
    }

    /**
     * Terminate the Web Worker
     */
    terminate() {
      this.stop();
      if (this.worker) {
        try {
          this.worker.terminate();
        } catch (e) {
          // ignore
        }
        this.worker = null;
      }
      this.isReady = false;
      this.isAvailable = false;
    }

    /**
     * Restart the Web Worker
     */
    restart() {
      this.terminate();
      this._initWorker();
    }

    /**
     * Built-in fallback AI when Web Worker is disabled or unavailable
     */
    _executeFallback(fen) {
      let bestMove = null;

      // If ChessGame is available in environment, select the best legal move using basic heuristics
      const ChessEngine = (typeof global.ChessGame !== 'undefined')
        ? global.ChessGame
        : (typeof require === 'function' ? require('./chess-core.js').ChessGame : null);

      if (ChessEngine) {
        try {
          const game = new ChessEngine(fen);
          const legalMoves = game.getAllLegalMoves();

          if (legalMoves.length > 0) {
            // Prioritize captures and checks, then random legal moves
            const captures = legalMoves.filter(m => m.isCapture);
            const promotions = legalMoves.filter(m => m.isPromotion);

            let chosenMove = null;
            if (promotions.length > 0) {
              chosenMove = promotions[Math.floor(Math.random() * promotions.length)];
            } else if (captures.length > 0) {
              chosenMove = captures[Math.floor(Math.random() * captures.length)];
            } else {
              chosenMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            }

            const fromSq = (typeof game.coordsToSquare === 'function')
              ? game.coordsToSquare(chosenMove.from.x, chosenMove.from.y)
              : String.fromCharCode(97 + chosenMove.from.x) + (8 - chosenMove.from.y);
            const toSq = (typeof game.coordsToSquare === 'function')
              ? game.coordsToSquare(chosenMove.to.x, chosenMove.to.y)
              : String.fromCharCode(97 + chosenMove.to.x) + (8 - chosenMove.to.y);
            const promo = chosenMove.isPromotion ? (chosenMove.promotion || 'q').toLowerCase() : '';

            bestMove = fromSq + toSq + promo;
          }
        } catch (e) {
          console.warn('StockfishAI fallback error:', e);
        }
      }

      return {
        bestMove: bestMove,
        ponder: null,
        evaluation: {
          depth: 1,
          score: { type: 'cp', value: 0, whiteValue: 0 },
          pv: bestMove || '',
          fallback: true
        }
      };
    }
  }

  // Export to global / window or module.exports
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StockfishAI, DIFFICULTY_PRESETS, parseDifficulty, parseInfoLine };
  }
  if (typeof window !== 'undefined') {
    window.StockfishAI = StockfishAI;
  }
})(typeof window !== 'undefined' ? window : globalThis);
