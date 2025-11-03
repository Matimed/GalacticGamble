import { CONFIG } from '../config.js'
import {updateMultiplier, displayCrashes, updateBets, showMessage, closeOverlay}  from './game/hud.js';
import {Ignition} from './game/ignition.js';
import { OuterSpace } from './game/stars.js';


const ws = new WebSocket(`ws://${CONFIG.WS_HOST}:${CONFIG.WS_PORT}/ws`);
const ignition = new Ignition(600);
const outerspace = new OuterSpace(150);
showMessage('Server Disconected');

ws.onopen = () => { showMessage('Waiting for connection...');}

ws.onmessage = (event) => {
    closeOverlay();
    const data = JSON.parse(event.data);
    if (data.type === 'multiplier') updateMultiplier(data.value)
    else if (data.type === 'crash') {updateMultiplier(data.value, 1); ignition.stop(); outerspace.stop();}
    else if (data.type === 'update_crash_history') displayCrashes(data.crashes);
    else if (data.type === 'update_bets'){ updateBets(data.bets, data.totals);}
    else if (data.type === 'round_start') { ignition.start();outerspace.start() } 
    // else if (data.type === 'user_win'){
        // } else if (data.type === 'user_lost'){
}

