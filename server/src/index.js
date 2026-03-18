import WebSocket, { WebSocketServer } from 'ws';
import { CONFIG } from './config.js';
import { Game } from './game.js';
import { GameSimulator } from './gameSimulator.js';
import { Bet } from './bet.js';
const wss = new WebSocketServer({ port: CONFIG.PORT });
const game = new Game();
subscribeToEvents(game);

console.log(`🚀 WebSocket server running on ws://${CONFIG.HOST}:${CONFIG.PORT}/ws`);

wss.on('connection', (ws) => {
  console.log('👾 New client connected');
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      console.log('📩 Received:', data);
      if (!game.isRunning) {
        if (data.type === 'admin_start_round') game.startRound();
        else if (data.type === 'admin_add_bet') {
          game.addBet(new Bet(data.user, data.amount, data.cashOut));
        }
        else if(data.type === 'admin_simulate'){ 
          let gameSim = new GameSimulator
          subscribeToEvents(gameSim)
          if(data.actual) gameSim.simulatePreset(game.crashPointGenerator)
          else gameSim.startSimulation(100, data.fast)
        }
      }
    } catch {
      console.log('⚠️ Malformed message:', msg.toString());
    }
  });

  ws.on('close', () => console.log('❌ Client disconnected'));
});


function subscribeToEvents(game) {
  game.on('multiplier', (data) => broadcast({ type: 'multiplier', ...data }));
  game.on('crash', (data) => {
    broadcast({ type: 'crash', ...data });
    broadcast({ type: 'update_crash_history', crashes: game.getCrashes()});
  });
  game.on('round_start', (data) => {
    broadcast(updateBets(0, game.getBetsByAmount(), (b => b.toJSONInGame())));
    broadcast({ type: 'round_start', ...data });
  });
  game.on('new_bet', (bet) => {
    broadcast({ type: 'new_bet', ...bet.toJSONAdmin() })
    broadcast(updateBets(game.getTotalBets(), game.getBetsByAmount(), ( b => b.toJSONPreGame())));
  })
  game.on('user_win', (data) => {
    broadcast({ type: 'user_win', ...data })
    broadcast(updateBets(game.getTotalProfit(), game.getBetsByProfit(), ( b => b.toJSONInGame())));
  })
  game.on('user_lost', (data) => broadcast({ type: 'user_lost', ...data }))
}

function broadcast(msg) {
  const text = JSON.stringify(msg);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(text);
  });
}

function updateBets(totalAmount, orderedBets, jsonFn){
  return {
    type : 'update_bets', 
    totals: { amount: totalAmount.toFixed(2), users: game.getUsers()}, 
    bets: orderedBets.map(jsonFn)
  }
}

