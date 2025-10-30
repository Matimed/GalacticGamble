import WebSocket, { WebSocketServer } from 'ws';
import { Game } from './game.js';

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });
const game = new Game();

console.log(`🚀 WebSocket server running on ws://localhost:${PORT}/ws`);

wss.on('connection', (ws) => {
  console.log('👾 New client connected');
  ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome to GalacticGamble!' }));
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      console.log('📩 Received:', data);
    } catch {
      console.log('⚠️ Malformed message:', msg.toString());
    }
  });

  ws.on('close', () => console.log('❌ Client disconnected'));
});

// --- reenviar los eventos del juego a todos los clientes ---
game.on('multiplier', (data) => broadcast({ type: 'multiplier', ...data }));
game.on('crash', (data) => broadcast({ type: 'crash', ...data }));
game.on('round_start', (data) => broadcast({ type: 'round_start', ...data }));

function broadcast(msg) {
  const text = JSON.stringify(msg);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(text);
  });
}

game.startRound();
