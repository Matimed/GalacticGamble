import { CONFIG } from '../config.js';
const ws = new WebSocket(`ws://${CONFIG.WS_HOST}:${CONFIG.WS_PORT}/ws`);
const DOM = {
    startBtn: document.getElementById('startBtn'),
    simulateAllBtn: document.getElementById('simulateAllBtn'),
    simulateFastBtn: document.getElementById('simulateFastBtn'),
    simulateActualBtn: document.getElementById('simulateActualBtn'),
    status: document.getElementById('status'),
    betsTable: document.getElementById('betsTable'),
    betForm: document.getElementById('betForm'),
    user: document.getElementById('user'),
    amount: document.getElementById('amount'),
    cashOut: document.getElementById('cashOut'),
};

function addBetToTable(bet) {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${bet.user}</td><td>${bet.amount}</td><td>${bet.cashOut}</td>`;
    DOM.betsTable.appendChild(row);
}

function sendMsg(msg){
    ws.send(JSON.stringify(msg));
}


ws.onopen = () => DOM.status.textContent ='✅ Connected';

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if(data.type == 'round_start') DOM.status.textContent ="🚀 Round in progress";
    else if (data.type == 'crash') {
        DOM.status.textContent ="🏁 Round ended";
        DOM.betsTable.replaceChildren();
    }
    else if (data.type === 'new_bet') addBetToTable(data);
};  

DOM.startBtn.onclick = () => {
    sendMsg({ type: 'admin_start_round' })
    DOM.status.textContent ='⏳ Sended start round';
};

DOM.simulateAllBtn.onclick = () => {
    sendMsg({ type: 'admin_simulate' , fast: false});
    DOM.status.textContent ='⏳ Sended simulate all';
};

DOM.simulateFastBtn.onclick = () => {
    sendMsg({ type: 'admin_simulate' , fast: true});
    DOM.status.textContent ='⏳ Sended simulate fast';
};

DOM.simulateActualBtn.onclick = () => {
    sendMsg({ type: 'admin_simulate' , actual: true});
    DOM.status.textContent ='⏳ Sended simulate actual';
};

DOM.betForm.onsubmit = (e) => {
    e.preventDefault();
    const user = DOM.user.value;
    const amount = parseFloat(DOM.amount.value).toString();
    const cashOut = parseFloat(DOM.cashOut.value).toString();

    ws.send(JSON.stringify({ type: 'admin_add_bet', user: user, amount: amount, cashOut:cashOut }));
    betForm.reset();
};
