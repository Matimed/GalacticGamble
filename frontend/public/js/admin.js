import { CONFIG } from '../config.js';
const ws = new WebSocket(`ws://${CONFIG.WS_HOST}:${CONFIG.WS_PORT}/ws`);
const DOM = {
    startBtn: document.getElementById('startBtn'),
    status: document.getElementById('status'),
    betsTable: document.getElementById('betsTable'),
    betForm: document.getElementById('betForm'),
    user: document.getElementById('user'),
    amount: document.getElementById('amount'),
    cashOut: document.getElementById('cashOut'),
};

function updateStatus(msg) {
    DOM.status.textContent = msg;
}

function addBetToTable(bet) {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${bet.user}</td><td>${bet.amount}</td><td>${bet.cashOut}</td>`;
    DOM.betsTable.appendChild(row);
  }

ws.onopen = () => updateStatus('✅ Connected to ws server');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if(data.type == 'round_start') updateStatus("🚀 Round in progress")
    else if (data.type == 'crash') {
        updateStatus("🏁 Round ended")
        DOM.betsTable.replaceChildren();
    }
    else if (data.type === 'new_bet') addBetToTable(data);
};  

DOM.startBtn.onclick = () => {
    const msg = { type: 'admin_start_round' };
    ws.send(JSON.stringify(msg));
    updateStatus('⚡ Sended start round');
};

DOM.betForm.onsubmit = (e) => {
    e.preventDefault();
    const user = DOM.user.value;
    const amount = parseFloat(DOM.amount.value).toString();
    const cashOut = parseFloat(DOM.cashOut.value).toString();

    ws.send(JSON.stringify({ type: 'admin_add_bet', user: user, amount: amount, cashOut:cashOut }));
    betForm.reset();
  };