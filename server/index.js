import WebSocket, { WebSocketServer } from 'ws';
import { CONFIG } from './config.js';
import { Game } from './game.js';
import { Bet } from './bet.js';
const wss = new WebSocketServer({ port: CONFIG.PORT });
const game = new Game();

console.log(`🚀 WebSocket server running on ws://${CONFIG.HOST}:${CONFIG.PORT}/ws`);

wss.on('connection', (ws) => {
  console.log('👾 New client connected');
  ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome to GalacticGamble!' }));
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      console.log('📩 Received:', data);
      if (!game.isRunning) {
        if (data.type === 'admin_start_round') game.startRound();
        else if (data.type === 'admin_add_bet') {
          game.addBet(new Bet(data.user, data.amount, data.cashOut));
        }
      }
    } catch {
      console.log('⚠️ Malformed message:', msg.toString());
    }
  });

  ws.on('close', () => console.log('❌ Client disconnected'));
});

// --- reenviar los eventos del juego a todos los clientes ---
game.on('multiplier', (data) => broadcast({ type: 'multiplier', ...data }));
game.on('crash', (data) => broadcast({ type: 'crash', ...data }));
game.on('round_start', (data) => {
  broadcast({ type: 'round_start', ...data });
  broadcast({type : 'update_bets', bets: game.getBetsByAmount().map(b => b.toJSONInGame())})
});
game.on('new_bet', (bet) => {
  console.log({type : 'update_bets', bets: game.getBetsByAmount().map(b=> b.toJSONPreGame())});
  broadcast({ type: 'new_bet', ...bet.toJSONAdmin() })
  broadcast({type : 'update_bets', bets: game.getBetsByAmount().map(b=> b.toJSONPreGame())})
})
game.on('user_win', (data) => {
  broadcast({ type: 'user_win', ...data })
  broadcast({type : 'update_bets', bets: game.getBetsByProfit().map(b => b.toJSONInGame())})
})
game.on('user_lost', (data) => broadcast({ type: 'user_lost', ...data }))

function broadcast(msg) {
  const text = JSON.stringify(msg);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(text);
  });
}
