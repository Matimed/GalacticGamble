import { CONFIG } from '../config.js'

const ws = new WebSocket(`ws://${CONFIG.WS_HOST}:${CONFIG.WS_PORT}/ws`);
const DOM = {
    multiplier: document.getElementById('multiplier'),
    crash: document.getElementById('crash'),
    betsTableBody: document.querySelector('#betsTable tbody'),
    historyStrip: document.getElementById('historyStrip'),
    betsSummary: document.getElementById('betsSummary'),
    overlay: document.getElementById('connectionOverlay'),
    connectionMsg: document.getElementById('connectionMsg'),

};

function updateMultiplier(newValue, hasCrashed = 0){
    DOM.multiplier.textContent = `${newValue}x`;
    
    if(hasCrashed){ DOM.multiplier.classList.add('crashed'); return;}
    DOM.multiplier.classList.remove('crashed');
    categorizeMultiplier(DOM.multiplier, newValue);
    
    let t = Math.min(newValue / 5, 1); 
    let r = Math.floor(255 * t);
    let g = Math.floor(255 * (1 - t/2)); 
    let b = 0;

    DOM.multiplier.style.boxShadow = `0 0 15px rgba(${r},${g},${b},0.6), 0 0 30px rgba(${r},${g},${b},0.4)`;
    
    multiplier.classList.add('hit');
    setTimeout(() => { multiplier.classList.remove('hit');}, 50);      
}

ws.onopen = () => {  DOM.connectionMsg.textContent = 'Waiting for connection...' }

ws.onmessage = (event) => {
    DOM.overlay.style.display = 'none';
    const data = JSON.parse(event.data);
    if (data.type === 'multiplier') updateMultiplier(data.value)
    else if (data.type === 'crash') updateMultiplier(data.value, 1)
    else if (data.type === 'update_crash_history') displayCrashes(data.crashes);
    else if (data.type === 'update_bets'){
        displayBets(data.bets);
        updateBetsSummary(data.totals);
    }
    // else if (data.type === 'round_start') {
    // } else if (data.type === 'user_win'){
    // } else if (data.type === 'user_lost'){
}

function displayBets(bets){
    DOM.betsTableBody.replaceChildren();
    bets.forEach(bet => {
        const row = document.createElement('tr');
        row.appendChild(createTableElement(bet.user));
        row.appendChild(createTableElement(bet.cashOut));
        if(bet.amount) row.appendChild(createTableElement(bet.amount));
        else row.appendChild(createTableElement(bet.profit, ['success-text']));
        DOM.betsTableBody.appendChild(row);
    });
}

function updateBetsSummary(totals) {
    DOM.betsSummary.replaceChildren();
    if(!totals) return;
    DOM.betsSummary.appendChild(createTableElement(`👥 ${totals.users}`));
    DOM.betsSummary.appendChild(createTableElement(''));
    DOM.betsSummary.appendChild(createTableElement(`💸 $${totals.amount}`));

  
    DOM.betsSummary.style.transform = "scale(1.2)";
    DOM.betsSummary.style.opacity = "0.7";
    setTimeout(() => {
      DOM.betsSummary.style.transform = "scale(1)";
      DOM.betsSummary.style.opacity = "1";
    }, 100);
  }
  

function createTableElement(value, styles = []){
    const td = document.createElement('td');
    if(value) td.textContent = value;
    styles.forEach(style => td.classList.add(style));
    return td;
}

function displayCrashes(crashes){
    historyStrip.innerHTML = '';
    crashes.reverse().slice(0,15).forEach(value => {
      const div = document.createElement('div');
      div.classList.add('history-box');
      categorizeMultiplier(div, value);
      div.textContent = `${value.toFixed(2)}x`;
      historyStrip.appendChild(div);
    });
}

function categorizeMultiplier(htmlMultiplier, multiplierValue){
    const classes = htmlMultiplier.classList;
    classes.remove('low');
    classes.remove('mid');
    classes.remove('high');
    if (multiplierValue < 2) htmlMultiplier.classList.add('low');
    else if (multiplierValue < 3.5) htmlMultiplier.classList.add('mid');
    else htmlMultiplier.classList.add('high');
}
