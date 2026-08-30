const assert = require('assert');
const fs = require('fs');

const paths = [
  '/Users/laalquimia/Projects/chess-html/js/pieces.js',
  '/Users/laalquimia/Projects/laalquimia.github.io/public/chess/js/pieces.js',
  '/Users/laalquimia/Projects/laalquimia.github.io/dist/chess/js/pieces.js'
];

console.log('Running ChessPieces Comprehensive Test Suite...\n');

paths.forEach((filePath) => {
  console.log(`Checking ${filePath}...`);
  assert.ok(fs.existsSync(filePath), `File exists: ${filePath}`);

  // Require fresh
  delete require.cache[require.resolve(filePath)];
  const mod = require(filePath);
  const ChessPieces = (mod && mod.getPieceSVG) ? mod : (globalThis.ChessPieces || mod);

  assert.ok(ChessPieces, 'ChessPieces module exported');
  assert.strictEqual(typeof ChessPieces.getPieceSVG, 'function', 'getPieceSVG is a function');
  assert.strictEqual(typeof ChessPieces.getPieceDataURL, 'function', 'getPieceDataURL is a function');
  assert.ok(Array.isArray(ChessPieces.styles), 'styles is an array');

  const themes = ChessPieces.styles;
  assert.deepStrictEqual(themes, ['standard', 'modern', 'wood', 'neon'], 'Available themes match expected');

  const pieces = ['P', 'N', 'B', 'R', 'Q', 'K', 'p', 'n', 'b', 'r', 'q', 'k'];

  themes.forEach(theme => {
    pieces.forEach(p => {
      const svg = ChessPieces.getPieceSVG(p, theme);
      assert.ok(svg && typeof svg === 'string', `Piece ${p} in theme ${theme} returns a valid string`);
      assert.ok(!svg.includes('undefined'), `Piece ${p} in theme ${theme} does not contain undefined`);
      assert.ok(!svg.includes('NaN'), `Piece ${p} in theme ${theme} does not contain NaN`);
      assert.ok(svg.includes('viewBox="0 0 45 45"'), `Piece ${p} in theme ${theme} has correct viewBox`);
      
      const dataUrl = ChessPieces.getPieceDataURL(p, theme);
      assert.ok(dataUrl.startsWith('data:image/svg+xml;utf8,'), `Data URL created for ${p} in theme ${theme}`);
    });
  });

  // Verify Standard King ('K' and 'k') specifics
  const whiteKing = ChessPieces.getPieceSVG('K', 'standard');
  const blackKing = ChessPieces.getPieceSVG('k', 'standard');

  // White King assertions
  assert.ok(whiteKing.includes('fill="#ffffff"'), 'White King has #ffffff fill');
  assert.ok(whiteKing.includes('stroke="#000000"'), 'White King has #000000 stroke');
  assert.ok(whiteKing.includes('22.5,11.63 L 22.5,6'), 'White King has apex cross');
  assert.ok(whiteKing.includes('M 12.5,37 C 18,40.5 27,40.5 32.5,37'), 'White King has Staunton stepped base');
  assert.ok(!whiteKing.includes('36.5,28.5 C 36.5,28.5 38.5,24'), 'White King bulbous outline removed');

  // Black King assertions
  assert.ok(blackKing.includes('fill="#1e1e1e"'), 'Black King has #1e1e1e fill');
  assert.ok(blackKing.includes('stroke="#000000"'), 'Black King has #000000 stroke');
  assert.ok(blackKing.includes('stroke="#ececec"'), 'Black King has #ececec accents');
  assert.ok(blackKing.includes('22.5,11.63 L 22.5,6'), 'Black King has apex cross');
  assert.ok(blackKing.includes('M 12.5,37 C 18,40.5 27,40.5 32.5,37'), 'Black King has Staunton stepped base');
  assert.ok(!blackKing.includes('36.5,28.5 C 36.5,28.5 38.5,24'), 'Black King bulbous outline removed');

  console.log(`✓ All checks passed for ${filePath}\n`);
});

console.log('ALL PIECES TEST SUITES PASSED! 🎉');
