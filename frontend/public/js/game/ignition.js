const canvas = document.getElementById('ignition');
const ctx = canvas.getContext('2d');

const TARGET_MS = 1000 / 60; // 16.67ms baseline

class Particle {
    constructor() {
        this.energy = 0;
        // energyGrowth is expressed as growth-per-TARGET_MS frame
        this.energyGrowth = 0.0003;
        this.spawn();
    }

    spawn() {
        this.y = 0;
        this.x = 343 + Math.floor((Math.random() * canvas.width) / 7);
        this.size = Math.random() * 20 + 2;
        // aliveTime is in "equivalent 60fps frames", not real ms
        this.aliveTime = Math.random() * 2 + 1 + this.energy * 4;
    }


    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

        const gradient = ctx.createLinearGradient(200, 300, 400, 0);
        const getHeatColor = (t) => {
            if (t < 0.3) return this.lerpColor('#ff0000', '#ff8c00', t / 0.3);
            if (t < 0.6) return this.lerpColor('#ff8c00', '#ffff00', (t - 0.3) / 0.3);
            return this.lerpColor('#ffff00', '#00e5ff', (t - 0.6) / 0.4);
        };
        gradient.addColorStop(0, getHeatColor(this.energy));
        gradient.addColorStop(1, '#ffffff');

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.lineWidth = this.aliveTime;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    }

    // dt: ratio of actual frame time to TARGET_MS
    update(dt) {
        this.size += 0.1 * dt;
        this.y += (Math.random() * 15 + 5) * dt;
        this.energy = Math.min(1, this.energy + this.energyGrowth * dt);
        this.aliveTime -= 0.1 * dt;
        if (this.aliveTime < 0) this.spawn();
    }

    lerpColor(c1, c2, t) {
        const lerp = (a, b, t) => a + (b - a) * t;
        const c1Num = parseInt(c1.slice(1), 16);
        const c2Num = parseInt(c2.slice(1), 16);
        const r = Math.round(lerp((c1Num >> 16) & 255, (c2Num >> 16) & 255, t));
        const g = Math.round(lerp((c1Num >> 8) & 255, (c2Num >> 8) & 255, t));
        const b = Math.round(lerp(c1Num & 255, c2Num & 255, t));
        return `rgb(${r},${g},${b})`;
    }
}

export class Ignition {
    constructor(numOfpartlces = 600) {
        this.numOfpartlces = numOfpartlces;
        this._animate = this._animate.bind(this);
        this._lastTime = null;
        this.init();
    }

    init() {
        this.particles = [];
        this.active = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < this.numOfpartlces; i++) this.particles.push(new Particle());
    }

    start() {
        if (this.active) return;
        this.init();
        this.active = true;
        this._lastTime = null;   // reset clock on each new round
        this._animate();
    }

    stop() {
        if (!this.active) return;
        this.active = false;
    }

    _animate(now = 0) {
        // Compute dt; clamp so a tabbed-out page doesn't explode particles
        let dt = 1;
        if (this._lastTime !== null) {
            const elapsed = now - this._lastTime;
            dt = Math.min(elapsed / TARGET_MS, 4);
        }
        this._lastTime = now;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (this.active) {
            for (let i = 0; i < this.numOfpartlces; i++) {
                this.particles[i].update(dt);
                this.particles[i].draw();
            }
            requestAnimationFrame(this._animate);
        }
    }
}
