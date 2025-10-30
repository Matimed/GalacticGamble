import WebSocket, { WebSocketServer } from 'ws';
import {Game} from './game.js'

const PORT = 8080;

const wss = new WebSocketServer({ port: PORT });
const game = new Game();

console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log('Received:', message.toString());

    // Reenviar mensaje a todos los clientes
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        const parsedData = JSON.parse(message)
        if(parsedData.type == 'ping') client.send(message.toString());
        else if(parsedData.type == 'fly') client.send(game.fly().toFixed(2));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
