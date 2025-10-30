const WS = new WebSocket('ws://localhost:8080/ws');

function updateMultiplier(newValue){
    const doc = document.getElementById('multiplier');
    doc.textContent = `Multiplier: x${newValue}`;
}

WS.onopen = () => console.log('Connected to WS server');

WS.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'multiplier') {
        updateMultiplier(data.value)
    } else if (data.type === 'crash') {
        updateMultiplier(data.value)
        const doc = document.getElementById('crash');
        doc.textContent = `💥 Crash at x${data.value}!`;
    } else if (data.type === 'round_start') {
        const doc = document.getElementById('crash');
        doc.textContent = `⚡ Round in progress`;
    }
};
