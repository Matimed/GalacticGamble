const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const TARGET_MS = 1000 / 60; // 16.67ms — baseline frame budget

// ─── Debug overlay ────────────────────────────────────────────────────────────
// Hide by default. Toggle at runtime in the browser console:
//   window.__starsDebug = true    → show
//   window.__starsDebug = false   → hide again
const DEBUG_DEFAULT = false;

class Star {
    STAR_TYPES = [
        { mod: 1, size: [1, 2], weight: [0.8, 1.6] },
        { mod: 3, size: [1.5, 3], weight: [0.5, 1] },
        { mod: 7, size: [1.5, 3.5], weight: [0.3, 0.6] },
        { mod: 13, size: [2, 4.2], weight: [0.1, 0.3] },
    ];

    randRange = (min, max) => min + Math.random() * (max - min);

    constructor(seed) {
        this.spawn();

        let type = this.STAR_TYPES.find(t => seed % t.mod === 0);
        this.baseSize = this.randRange(type.size[0], type.size[1]);
        this.baseWeight = this.randRange(type.weight[0], type.weight[1]);
        this.weight = this.baseWeight;

        this.phase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = this.randRange(0.02, 0.08);
        this.twinkleAmplitude = this.randRange(0.1, 0.4);

        this.frame = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
    }

    // dt: ratio of actual elapsed ms to target ms (1.0 = perfect 60fps)
    twinkle(dt) {
        this.frame += dt;
        const twinkle = Math.sin(this.frame * this.twinkleSpeed + this.phase);
        this.size = this.baseSize * (1 + twinkle * this.twinkleAmplitude);
    }

    fall(dt) {
        const MAX_WEIGHT = 20;
        // Growth per frame scaled by dt so it's frame-rate independent
        this.weight *= Math.pow(1.0005, dt);
        this.weight = Math.min(this.weight, MAX_WEIGHT);
        this.y += this.weight * dt;
        if (this.y > canvas.height - this.size) this.spawn(true);
    }

    spawn(isRespawn = false) {
        this.x = Math.random() * canvas.width;
        this.y = isRespawn ? 0 : Math.random() * canvas.height;
    }

    stop() {
        this.weight = this.baseWeight;
    }
}

export class OuterSpace {
    constructor(numOfstars = 150) {
        this.active = false;
        this._animate = this._animate.bind(this);
        this.numOfstars = numOfstars;
        this.stars = [];
        this._lastTime = null;
        this._debug = new DebugOverlay();

        for (let i = 0; i < this.numOfstars; i++) {
            const star = new Star(i);
            this.stars.push(star);
            star.draw();
        }
    }

    start() {
        if (this.active) return;
        this.active = true;
        this._lastTime = null;      // reset so first delta is clean
        this._animate();
    }

    stop() {
        this.active = false;
        for (let i = 0; i < this.numOfstars; i++) this.stars[i].stop();
    }

    _animate(now = 0) {
        let dt = 1;
        if (this._lastTime !== null) {
            const elapsed = now - this._lastTime;
            dt = Math.min(elapsed / TARGET_MS, 4); // max 4× to avoid teleport

            if (window.__starsDebug ?? DEBUG_DEFAULT) {
                const avgW = this.stars.reduce((s, st) => s + st.weight, 0) / this.numOfstars;
                this._debug.update(elapsed, avgW);
            }

        }
        this._lastTime = now;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < this.numOfstars; i++) {
            this.stars[i].twinkle(dt);
            if (this.active) this.stars[i].fall(dt);
            this.stars[i].draw();
        }
        requestAnimationFrame(this._animate);
    }
}

class DebugOverlay {
    constructor() {
        this.el = document.createElement('div');
        Object.assign(this.el.style, {
            position: 'fixed',
            bottom: '12px',
            right: '12px',
            background: 'rgba(0,0,0,0.65)',
            color: '#00e5ff',
            fontFamily: 'monospace',
            fontSize: '12px',
            padding: '8px 12px',
            borderRadius: '6px',
            zIndex: '9999',
            lineHeight: '1.6',
            pointerEvents: 'none',
            whiteSpace: 'pre',
        });
        document.body.appendChild(this.el);
        this._buf = [];
        this._MAX = 60;
        this._visible = DEBUG_DEFAULT;
        this._applyVisibility(DEBUG_DEFAULT);

        // Intercept window.__starsDebug assignments from the console
        let _val = DEBUG_DEFAULT;
        Object.defineProperty(window, '__starsDebug', {
            configurable: true,
            get: () => _val,
            set: (v) => { _val = !!v; this._applyVisibility(_val); },
        });
    }

    _applyVisibility(visible) {
        this._visible = visible;
        this.el.style.display = visible ? 'block' : 'none';
    }

    update(deltaMs, avgWeight) {
        if (!this._visible) return;  // skip work entirely when hidden
        this._buf.push(deltaMs);
        if (this._buf.length > this._MAX) this._buf.shift();
        const avgDelta = this._buf.reduce((a, b) => a + b, 0) / this._buf.length;
        this.el.textContent =
            `⭐ Stars debug\n` +
            `FPS         ${(1000 / avgDelta).toFixed(1)}\n` +
            `avg weight  ${avgWeight.toFixed(3)} px / 60fps-frame`;
    }
}