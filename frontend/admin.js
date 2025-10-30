const WS = new WebSocket('ws://localhost:8080/ws');
const STARTBTN = document.getElementById('startBtn');
const STATUS = document.getElementById('status');

function updateStatus(msg) {
    STATUS.textContent = msg;
}

WS.onopen = () => updateStatus('✅ Connected to WS server');

WS.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if(data.type == 'round_start') updateStatus("🚀 Round in progress")
    else if (data.type == 'crash') updateStatus("🏁 Round ended")
};  

STARTBTN.onclick = () => {
    const msg = { type: 'admin_start_round' };
    WS.send(JSON.stringify(msg));
    updateStatus('⚡ Sended start round');
};