import { CONFIG } from '../config.js'
import {updateMultiplier, displayCrashes, updateBets, showMessage, closeOverlay}  from './game/hud.js';
import {Ignition} from './game/ignition.js';
import { OuterSpace } from './game/stars.js';
import { Sounds } from './game/sounds.js';

const ws = new WebSocket(CONFIG.WS_URL);
const ignition = new Ignition(600);
const outerspace = new OuterSpace(150);
const sounds = new Sounds();
showMessage('Server Disconected');

ws.onopen = () => { showMessage('Waiting for connection...');}

ws.onmessage = (event) => {
    closeOverlay();
    const data = JSON.parse(event.data);
    if (data.type === 'multiplier') {
        updateMultiplier(data.value)
        animationStart();
    }
    else if (data.type === 'crash') {updateMultiplier(data.value, 1); animationStop();}
    else if (data.type === 'update_crash_history') displayCrashes(data.crashes);
    else if (data.type === 'update_bets'){ updateBets(data.bets, data.totals);}
    else if (data.type === 'round_start') { animationStart();} 
    // else if (data.type === 'user_win'){
        // } else if (data.type === 'user_lost'){
}

function animationStart(){
    document.getElementById('rocket').style.display = 'block',
    ignition.start();
    outerspace.start()
    sounds.start()
}

function animationStop(){
    document.getElementById('rocket').style.display = 'none',
    ignition.stop();
    outerspace.stop();
    sounds.stop()
}
