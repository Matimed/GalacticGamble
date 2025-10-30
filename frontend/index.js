const ws = new WebSocket('ws://localhost:8080/ws');
const messagesDiv = document.getElementById('messages');

ws.onopen = () => console.log('Connected to WS server');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'multiplier') {
        const doc = document.getElementById('multiplier');
        doc.textContent = `Multiplier: x${data.value}`;
    } else if (data.type === 'crash') {
        const doc = document.getElementById('crash');
        doc.textContent = `💥 Crash at x${data.value}!`;
    } else if (data.type === 'round_start') {
        const doc = document.getElementById('crash');
        doc.textContent = `🕹️ New round started)`;
    } else {
        log(JSON.stringify(data));
    }
};
