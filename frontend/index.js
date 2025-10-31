import { CONFIG } from './config.js'

const ws = new WebSocket(`ws://${CONFIG.WS_HOST}:${CONFIG.WS_PORT}/ws`);
const DOM = {
    multiplier: document.getElementById('multiplier'),
    crash: document.getElementById('crash'),
    messages: document.getElementById('messages'),
    betsTableBody: document.querySelector('#betsTable tbody')
};

function updateMultiplier(newValue){
    DOM.multiplier.textContent = `Multiplier: x${newValue}`;
}

ws.onopen = () => console.log('Connected to WS server');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'multiplier') {
        updateMultiplier(data.value)
    } else if (data.type === 'crash') {
        updateMultiplier(data.value)
        DOM.crash.textContent = `💥 Crash at x${data.value}!`;
    } else if (data.type === 'round_start') {
        DOM.crash.textContent = `⚡ Round in progress`;
        DOM.messages.replaceChildren();
    } else if (data.type === 'user_win'){
        const p = document.createElement('p');
        p.textContent = `${data.user} gano ${data.profit}`;
        DOM.messages.appendChild(p);
    } else if (data.type === 'user_lost'){
        const p = document.createElement('p');
        p.textContent = `${data.user} perdio su dinero`;
        DOM.messages.appendChild(p);
    }
    else if (data.type === 'update_bets'){
        displayBets(data.bets);
    }
}

function displayBets(bets){
    DOM.betsTableBody.replaceChildren();
    bets.forEach(bet => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bet.user}</td>
            <td>${bet.cashOut? bet.cashOut : ''}</td>
            <td>${bet.amount ? bet.amount : bet.profit}</td>
        `;
        DOM.betsTableBody.appendChild(row);
    });
}
