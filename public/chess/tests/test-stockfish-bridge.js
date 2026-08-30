const { StockfishAI, DIFFICULTY_PRESETS, parseDifficulty, parseInfoLine } = require('../js/stockfish-bridge.js');
const { ChessGame } = require('../js/chess-core.js');
const assert = require('assert');

// Expose ChessGame globally for fallback
global.ChessGame = ChessGame;

console.log('Testing StockfishAI Bridge...');

// 1. Test parseDifficulty
const beg = parseDifficulty('beginner');
assert.strictEqual(beg.skill, 0);
assert.strictEqual(beg.depth, 2);

const exp = parseDifficulty('expert');
assert.strictEqual(exp.skill, 18);
assert.strictEqual(exp.depth, 16);

const numDiff = parseDifficulty(10);
assert.strictEqual(numDiff.skill, 8);
assert.strictEqual(numDiff.depth, 10);
console.log('Passed parseDifficulty tests.');

// 2. Test parseInfoLine
const info1 = parseInfoLine('info depth 10 seldepth 14 score cp 65 nodes 45000 nps 150000 time 300 pv e2e4 e7e5 g1f3', 'w');
assert.strictEqual(info1.depth, 10);
assert.strictEqual(info1.seldepth, 14);
assert.strictEqual(info1.score.type, 'cp');
assert.strictEqual(info1.score.value, 0.65);
assert.strictEqual(info1.score.whiteValue, 0.65);
assert.strictEqual(info1.score.cp, 65);
assert.strictEqual(info1.pv, 'e2e4 e7e5 g1f3');

// When black is active turn, positive cp means black is ahead, so whiteValue is negative
const infoBlack = parseInfoLine('info depth 12 score cp 80 time 400 pv d7d5', 'b');
assert.strictEqual(infoBlack.score.value, 0.8);
assert.strictEqual(infoBlack.score.whiteValue, -0.8);

// Mate score
const infoMate = parseInfoLine('info depth 5 score mate 2 pv d8h4', 'b');
assert.strictEqual(infoMate.score.type, 'mate');
assert.strictEqual(infoMate.score.mate, 2);
assert.strictEqual(infoMate.score.whiteValue, -2);
console.log('Passed parseInfoLine tests.');

// 3. Test Fallback Mode (in Node environment where Worker is not defined)
const ai = new StockfishAI();
assert.strictEqual(ai.isAvailable, false);

ai.findBestMove('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', 'easy')
  .then(res => {
    assert.ok(res.bestMove, 'Fallback must return a valid legal move');
    assert.strictEqual(typeof res.bestMove, 'string');
    assert.strictEqual(res.bestMove.length >= 4, true);
    console.log('Fallback best move found:', res.bestMove);
    console.log('Passed Fallback AI tests.');
    testMockWorker();
  })
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });

// 4. Test with Mocked Web Worker
function testMockWorker() {
  console.log('Testing Mocked Web Worker...');

  class MockWorker {
    constructor(path) {
      this.path = path;
      this.onmessage = null;
      this.messagesSent = [];
    }

    postMessage(cmd) {
      this.messagesSent.push(cmd);
      // Simulate UCI engine responses asynchronously
      setTimeout(() => {
        if (cmd === 'uci') {
          if (this.onmessage) this.onmessage({ data: 'id name Stockfish 16' });
          if (this.onmessage) this.onmessage({ data: 'uciok' });
        } else if (cmd === 'isready') {
          if (this.onmessage) this.onmessage({ data: 'readyok' });
        } else if (cmd.startsWith('go')) {
          if (this.onmessage) {
            this.onmessage({ data: 'info depth 5 score cp 35 time 50 pv e7e5' });
            this.onmessage({ data: 'bestmove e7e5 ponder g1f3' });
          }
        }
      }, 10);
    }

    terminate() {
      this.terminated = true;
    }
  }

  // Inject MockWorker
  global.Worker = MockWorker;

  const mockAI = new StockfishAI({ workerPath: './stockfish.js' });
  assert.strictEqual(mockAI.isAvailable, true);

  let evalStreamed = false;

  mockAI.findBestMove(
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    'expert',
    (bestMove, ponder, finalEval) => {
      assert.strictEqual(bestMove, 'e7e5');
      assert.strictEqual(ponder, 'g1f3');
    },
    (evalInfo) => {
      evalStreamed = true;
      assert.strictEqual(evalInfo.depth, 5);
    }
  ).then(res => {
    assert.strictEqual(res.bestMove, 'e7e5');
    assert.strictEqual(res.ponder, 'g1f3');
    assert.strictEqual(evalStreamed, true);
    console.log('Passed Mocked Web Worker tests.');
    console.log('ALL STOCKFISH BRIDGE TESTS PASSED SUCCESSFULLY! 🎉');
  });
}
