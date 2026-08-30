/**
 * Test Suite: PeerChessClient Protocol & Utilities
 * Validates room code generation, Peer ID mapping, link sharing, and message handling.
 */

const assert = require('assert');
const { PeerChessClient, generateRoomCode, sanitizeRoomCode, getShareableLink, roomCodeToPeerId, peerIdToRoomCode } = require('../js/peer-chess.js');

console.log('Testing PeerChessClient Protocol & Utilities...');

// 1. Room Code Generation
const code1 = generateRoomCode(4);
assert.strictEqual(code1.length, 4, 'Room code must be 4 characters');
assert.match(code1, /^[A-Z0-9]{4}$/, 'Room code must contain only uppercase alphanumeric characters');

const code2 = generateRoomCode(6);
assert.strictEqual(code2.length, 6, 'Custom length room code must work');
console.log('Passed Room Code Generation tests.');

// 2. Sanitization
assert.strictEqual(sanitizeRoomCode('  a7-k9  '), 'A7K9', 'Sanitization must trim, uppercase, and remove special characters');
assert.strictEqual(sanitizeRoomCode('xyz123!'), 'XYZ123');
assert.strictEqual(sanitizeRoomCode(null), '');
console.log('Passed Sanitization tests.');

// 3. Peer ID Conversion
const sampleCode = 'K9A2';
const peerId = roomCodeToPeerId(sampleCode);
assert.strictEqual(peerId, 'laalquimia-chess-k9a2', 'Peer ID must prefix and lowercase room code');
assert.strictEqual(peerIdToRoomCode(peerId), 'K9A2', 'Reversing Peer ID must recover original room code');
console.log('Passed Peer ID conversion tests.');

// 4. Shareable Link Generator
const link = getShareableLink('K9A2');
assert.ok(link.includes('?room=K9A2'), 'Shareable link must contain room query parameter');
console.log('Passed Shareable Link Generator test.');

// 5. Message Event Dispatching & Handshake Simulation
const client = new PeerChessClient({ playerName: 'TestHost' });
let receivedMove = null;
let receivedEmoji = null;
let receivedStatus = null;

client.on('move', (data) => { receivedMove = data; });
client.on('emoji', (data) => { receivedEmoji = data; });
client.on('status', (data) => { receivedStatus = data; });

// Mock incoming MOVE
client._handleIncomingMessage({
  type: 'MOVE',
  payload: { from: { x: 4, y: 6 }, to: { x: 4, y: 4 }, san: 'e4', fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1' }
});
assert.ok(receivedMove, 'Move event must be received');
assert.strictEqual(receivedMove.san, 'e4');

// Mock incoming EMOJI
client._handleIncomingMessage({
  type: 'EMOJI',
  payload: { emoji: '🔥' }
});
assert.ok(receivedEmoji, 'Emoji event must be received');
assert.strictEqual(receivedEmoji.emoji, '🔥');

// Status change
client._setStatus('waiting', 'Waiting for peer');
assert.ok(receivedStatus, 'Status event must be received');
assert.strictEqual(receivedStatus.status, 'waiting');

// 6. Complete 3-Way Handshake Simulation (Host <-> Guest)
const hostClient = new PeerChessClient({ playerName: 'Alice' });
hostClient.isHost = true;
hostClient.preferredColor = 'w';
hostClient.roomCode = 'TEST';
let hostSentMessages = [];
hostClient.conn = {
  open: true,
  send: (msg) => hostSentMessages.push(msg)
};

const guestClient = new PeerChessClient({ playerName: 'Bob' });
guestClient.isHost = false;
guestClient.roomCode = 'TEST';
let guestSentMessages = [];
guestClient.conn = {
  open: true,
  send: (msg) => guestSentMessages.push(msg)
};

let hostConnectedData = null;
let guestConnectedData = null;
hostClient.on('connected', (d) => { hostConnectedData = d; });
guestClient.on('connected', (d) => { guestConnectedData = d; });

// Host receives incoming connection -> assigns colors and sends WELCOME
hostClient.assignedColor = 'w';
hostClient.opponentColor = 'b';
hostClient._send({
  type: 'WELCOME',
  payload: { hostColor: 'w', guestColor: 'b', hostName: 'Alice' }
});
hostClient._onConnected();
assert.strictEqual(hostClient.status, 'connected');
assert.strictEqual(hostSentMessages.length, 1);
assert.strictEqual(hostSentMessages[0].type, 'WELCOME');

// Guest receives WELCOME from Host
guestClient._handleIncomingMessage(hostSentMessages[0]);
assert.strictEqual(guestClient.status, 'connected');
assert.strictEqual(guestClient.assignedColor, 'b');
assert.strictEqual(guestClient.opponentColor, 'w');
assert.strictEqual(guestClient.opponentName, 'Alice');
assert.strictEqual(guestSentMessages.length, 1);
assert.strictEqual(guestSentMessages[0].type, 'WELCOME_ACK');

// Host receives WELCOME_ACK from Guest
hostClient._handleIncomingMessage(guestSentMessages[0]);
assert.strictEqual(hostClient.opponentName, 'Bob');
assert.strictEqual(hostConnectedData.assignedColor, 'w');
assert.strictEqual(guestConnectedData.assignedColor, 'b');

console.log('Passed Complete 3-Way Handshake Simulation test.');

// Clean up all clients
hostClient.leaveRoom();
guestClient.leaveRoom();
client.leaveRoom();

console.log('\nALL PEER CHESS PROTOCOL TESTS PASSED SUCCESSFULLY! 🎉');
process.exit(0);
