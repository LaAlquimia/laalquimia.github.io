const { ChessGame, squareToCoords, coordsToSquare } = require('../js/chess-core.js');
const assert = require('assert');

console.log('Testing ChessGame core engine...');

// 1. Initial State & FEN
const game = new ChessGame();
assert.strictEqual(game.getFEN(), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
assert.strictEqual(game.getTurn(), 'w');
assert.strictEqual(game.isCheck(), false);
assert.strictEqual(game.isCheckmate(), false);
assert.strictEqual(game.isStalemate(), false);
assert.strictEqual(game.isGameOver(), false);

// 2. Legal Moves in Start Position (20 moves: 16 pawn + 4 knight)
const whiteMoves = game.getAllLegalMoves('w');
assert.strictEqual(whiteMoves.length, 20, `Expected 20 starting legal moves, got ${whiteMoves.length}`);

// 3. Move Execution & SAN
const move1 = game.makeMove('e2', 'e4');
assert.ok(move1, 'e2-e4 move should succeed');
assert.strictEqual(move1.san, 'e4');
assert.strictEqual(move1.uci, 'e2e4');
assert.strictEqual(game.getTurn(), 'b');
assert.strictEqual(game.getFEN(), 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');

// 4. Black Reply
const move2 = game.makeMove('e7', 'e5');
assert.ok(move2);
assert.strictEqual(move2.san, 'e5');

// 5. Knight Move
const move3 = game.makeMove('g1', 'f3');
assert.strictEqual(move3.san, 'Nf3');

// 6. Black Knight Move
const move4 = game.makeMove('b8', 'c6');
assert.strictEqual(move4.san, 'Nc6');

// 7. Bishop Move
const move5 = game.makeMove('f1', 'c4');
assert.strictEqual(move5.san, 'Bc4');

// 8. Black Knight Move
const move6 = game.makeMove('g8', 'f6');
assert.strictEqual(move6.san, 'Nf6');

// 9. Castling White Kingside
const castleMove = game.makeMove('e1', 'g1');
assert.ok(castleMove, 'Castling O-O should be legal');
assert.strictEqual(castleMove.san, 'O-O');
assert.strictEqual(castleMove.isCastle, 'kingside');
assert.strictEqual(game.getPiece('f1'), 'R');
assert.strictEqual(game.getPiece('g1'), 'K');
assert.strictEqual(game.getPiece('h1'), null);

console.log('Passed opening & castling tests.');

// 10. Undo moves
while (game.history.length > 0) {
  game.undoMove();
}
assert.strictEqual(game.getFEN(), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
console.log('Passed undo to start position test.');

// 11. Fool's Mate Checkmate Test
game.resetGame();
game.makeMove('f2', 'f3');
game.makeMove('e7', 'e5');
game.makeMove('g2', 'g4');
const mateMove = game.makeMove('d8', 'h4');
assert.strictEqual(mateMove.san, 'Qh4#');
assert.strictEqual(mateMove.isCheck, true);
assert.strictEqual(mateMove.isCheckmate, true);
assert.strictEqual(game.isCheckmate(), true);
assert.strictEqual(game.isGameOver(), true);
assert.strictEqual(game.getGameState().result, '0-1');
assert.strictEqual(game.getGameState().reason, 'checkmate');
console.log('Passed Fools Mate checkmate test.');

// 12. Scholar's Mate Test
game.resetGame();
game.makeMove('e2', 'e4');
game.makeMove('e7', 'e5');
game.makeMove('d1', 'h5');
game.makeMove('b8', 'c6');
game.makeMove('f1', 'c4');
game.makeMove('g8', 'f6');
const scholarMate = game.makeMove('h5', 'f7');
assert.strictEqual(scholarMate.san, 'Qxf7#');
assert.strictEqual(game.isCheckmate(), true);
console.log('Passed Scholars Mate test.');

// 13. En Passant Capture Test
game.resetGame();
game.makeMove('e2', 'e4');
game.makeMove('a7', 'a6');
game.makeMove('e4', 'e5');
game.makeMove('d7', 'd5'); // Black pawn jumps 2 squares next to White e5 pawn
assert.ok(game.enPassant, 'En passant target should be set');
assert.strictEqual(coordsToSquare(game.enPassant.x, game.enPassant.y), 'd6');

const epMoves = game.getLegalMoves('e5');
const epMove = epMoves.find(m => m.isEnPassant);
assert.ok(epMove, 'En passant move should be available in getLegalMoves');

const playedEp = game.makeMove('e5', 'd6');
assert.ok(playedEp, 'En passant capture should execute');
assert.strictEqual(playedEp.san, 'exd6');
assert.strictEqual(game.getPiece('d5'), null, 'Captured black pawn at d5 must be removed');
assert.strictEqual(game.getPiece('d6'), 'P', 'White pawn should be on d6');
assert.strictEqual(playedEp.captured, 'p');

// Test undo of en passant
game.undoMove();
assert.strictEqual(game.getPiece('d5'), 'p', 'Black pawn at d5 must be restored');
assert.strictEqual(game.getPiece('e5'), 'P', 'White pawn at e5 must be restored');
assert.strictEqual(game.getPiece('d6'), null);
console.log('Passed En Passant capture and undo test.');

// 14. Promotion Test
game.resetGame();
game.loadFEN('7k/4P3/8/8/8/8/8/4K3 w - - 0 1'); // Black King on h8 (y=0, x=7)
const promoMoves = game.getLegalMoves('e7');
assert.strictEqual(promoMoves.length, 4, 'Should have 4 promotion options (Q, R, B, N)');
const pMove = game.makeMove('e7', 'e8', 'Q');
assert.ok(pMove);
assert.strictEqual(game.getPiece('e8'), 'Q');
assert.strictEqual(pMove.san, 'e8=Q+'); // King on h8 is in check on 8th rank by Queen on e8
assert.strictEqual(game.isCheck(), true);
console.log('Passed Pawn Promotion test.');

// 15. Stalemate Test
game.resetGame();
game.loadFEN('k7/8/1Q6/8/8/8/8/7K b - - 0 1');
assert.strictEqual(game.isStalemate(), true);
assert.strictEqual(game.isGameOver(), true);
assert.strictEqual(game.getGameState().reason, 'stalemate');
console.log('Passed Stalemate test.');

// 16. Insufficient Material Test
game.resetGame();
game.loadFEN('8/8/8/8/8/8/4k3/4K3 w - - 0 1'); // K vs K
assert.strictEqual(game.isInsufficientMaterial(), true);
game.loadFEN('8/8/8/8/8/5N2/4k3/4K3 w - - 0 1'); // K+N vs K
assert.strictEqual(game.isInsufficientMaterial(), true);
game.loadFEN('8/8/8/8/8/5B2/4k3/4K3 w - - 0 1'); // K+B vs K
assert.strictEqual(game.isInsufficientMaterial(), true);
console.log('Passed Insufficient Material test.');

// 17. Material Score & Captured Pieces Test
game.resetGame();
game.makeMove('e2', 'e4');
game.makeMove('d7', 'd5');
game.makeMove('e4', 'd5'); // White captures Black pawn
const mat = game.getMaterialScore();
assert.strictEqual(mat.difference, 1, 'White should have +1 material advantage');
assert.strictEqual(mat.advantage, 'white');
assert.deepStrictEqual(mat.capturedPieces.white, ['p']);
console.log('Passed Material Score and Captured pieces test.');

// 18. Castling restrictions tests (Through check / out of check)
game.resetGame();
// Black Rook attacks f1 (square king must pass through)
game.loadFEN('r3k2r/8/8/8/8/5r2/8/R3K2R w KQkq - 0 1');
const wKingMoves = game.getLegalMoves('e1');
const canCastleKingside = wKingMoves.some(m => m.isCastle === 'kingside');
assert.strictEqual(canCastleKingside, false, 'White should NOT be able to castle kingside through check on f1');
const canCastleQueenside = wKingMoves.some(m => m.isCastle === 'queenside');
assert.strictEqual(canCastleQueenside, true, 'White should be able to castle queenside');

console.log('Passed Castling restrictions tests.');

// 19. Disambiguation Notation Tests
// 19a. Two rooks on same rank (different files) -> file disambiguation
game.resetGame();
game.loadFEN('R6R/8/8/8/5k2/8/8/4K3 w - - 0 1'); // King on f4 (not attacked)
const r1 = game.makeMove('a8', 'd8');
assert.strictEqual(r1.san, 'Rad8');

// 19b. Two rooks on same file (different ranks) -> rank disambiguation
game.resetGame();
game.loadFEN('4R3/8/8/8/5k2/8/8/4R2K w - - 0 1'); // Rooks on e8 and e1
const r2 = game.makeMove('e1', 'e4');
assert.strictEqual(r2.san, 'R1e4+');

// 19c. Three Queens (a1, a4, d1) all moving to d4 -> full square disambiguation
game.resetGame();
// King on b8 (x=1, y=0 - not attacked from d4)
// Queen on a1: can move to d4 (diagonal dx=3, dy=3)
// Queen on a4: can move to d4 (horizontal dx=3, dy=0)
// Queen on d1: can move to d4 (vertical dx=0, dy=3)
game.loadFEN('1k6/8/8/8/Q7/8/8/Q2Q3K w - - 0 1');
const q1 = game.makeMove('a1', 'd4');
assert.strictEqual(q1.san, 'Qa1d4');

console.log('Passed Disambiguation SAN tests.');

// 20. 50-Move Rule Test
game.resetGame();
game.loadFEN('r7/8/8/8/8/4k3/8/R3K3 w - - 99 50');
assert.strictEqual(game.isFiftyMoveRule(), false);
// Make non-pawn non-capture move (e.g. King move)
game.makeMove('e1', 'd1');
assert.strictEqual(game.isFiftyMoveRule(), true);
assert.strictEqual(game.isDraw(), true);
assert.strictEqual(game.getGameState().reason, '50_moves');
console.log('Passed 50-Move Rule test.');

// 21. Threefold Repetition Test
game.resetGame();
// Initial (Count 1)
game.makeMove('g1', 'f3'); // Nf3
game.makeMove('g8', 'f6'); // Nf6
game.makeMove('f3', 'g1'); // Ng1
game.makeMove('f6', 'g8'); // Ng8 (Count 2)
assert.strictEqual(game.isThreefoldRepetition(), false);
game.makeMove('g1', 'f3'); // Nf3
game.makeMove('g8', 'f6'); // Nf6
game.makeMove('f3', 'g1'); // Ng1
game.makeMove('f6', 'g8'); // Ng8 (Count 3)
assert.strictEqual(game.isThreefoldRepetition(), true);
assert.strictEqual(game.isDraw(), true);
assert.strictEqual(game.getGameState().reason, 'threefold_repetition');
console.log('Passed Threefold Repetition test.');

// 22. Black Castling (Kingside and Queenside)
game.resetGame();
game.loadFEN('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1');
const bCastles = game.getLegalMoves('e8');
assert.ok(bCastles.some(m => m.isCastle === 'kingside'), 'Black should have O-O');
assert.ok(bCastles.some(m => m.isCastle === 'queenside'), 'Black should have O-O-O');

const bCastleK = game.makeMove('e8', 'g8');
assert.strictEqual(bCastleK.san, 'O-O');
assert.strictEqual(game.getPiece('f8'), 'r');
assert.strictEqual(game.getPiece('g8'), 'k');
assert.strictEqual(game.getPiece('h8'), null);
game.undoMove();

const bCastleQ = game.makeMove('e8', 'c8');
assert.strictEqual(bCastleQ.san, 'O-O-O');
assert.strictEqual(game.getPiece('d8'), 'r');
assert.strictEqual(game.getPiece('c8'), 'k');
assert.strictEqual(game.getPiece('a8'), null);
console.log('Passed Black Castling tests.');

// 23. Pin Test: Absolute Pin
game.resetGame();
game.loadFEN('4k3/8/8/4r3/8/8/4R3/4K3 b - - 0 1');
// White Rook at e2 pins Black Rook at e5 to Black King at e8
const pinnedMoves = game.getLegalMoves('e5');
// e5 rook can only move along the e-file (e7, e6, e4, e3, e2)
for (const m of pinnedMoves) {
  assert.strictEqual(m.fromSquare[0], 'e');
  assert.strictEqual(m.toSquare[0], 'e', `Pinned piece cannot leave pin file: ${m.fromSquare} to ${m.toSquare}`);
}
console.log('Passed Absolute Pin tests.');

// 24. Bishop Insufficient Material (Same vs Opposite Colors)
game.resetGame();
// Light square bishop vs light square bishop
game.loadFEN('8/8/8/8/2B5/5b2/4k3/4K3 w - - 0 1'); // c4 (light), f3 (light)
assert.strictEqual(game.isInsufficientMaterial(), true, 'Bishops of same square color should be insufficient');

// Light square bishop vs dark square bishop
game.loadFEN('8/8/8/8/2B5/4b3/4k3/4K3 w - - 0 1'); // c4 (light), e3 (dark)
assert.strictEqual(game.isInsufficientMaterial(), false, 'Bishops of opposite square colors can theoretically mate');
console.log('Passed Bishop Insufficient Material nuances.');

// 25. Diverse Input Formats for makeMove
game.resetGame();
assert.ok(game.makeMove('e2e4'));
assert.ok(game.makeMove('e7e5'));
assert.ok(game.makeMove({ from: { x: 6, y: 7 }, to: { x: 5, y: 5 } })); // Nf3
assert.ok(game.makeMove({ from: 'b8', to: 'c6' })); // Nc6
console.log('Passed Flexible makeMove input formats.');

console.log('ALL CHESS GAME ENGINE TESTS PASSED SUCCESSFULLY! 🎉');
