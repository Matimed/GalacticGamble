const canvas = document.getElementById('ignition');
const ctx = canvas.getContext('2d');


class Particle {
    constructor() {
        this.energy = 0; 
        this.energyGrowth = 0.0003;
        this.spawn()
    }

    spawn() {
        this.y = 0;
        this.x = 343 + Math.floor((Math.random() * canvas.width) / 7);
        this.size = Math.random() * 20 + 2;
        this.aliveTime = Math.random() * 2 + 1 + this.energy * 4; // Alargo la combustion con el tiempo
    }

    draw = () => {
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
        ctx.lineWidth = this.aliveTime; // Hago trazos mas gruesos a las particulas cerca de morir
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    };

    update = () => {
        this.size += 0.1;
        this.y += Math.random() * 15 + 5;
        this.energy = Math.min(1, this.energy + this.energyGrowth);
        this.aliveTime -= 0.1;
        if (this.aliveTime < 0) this.spawn()
    };


    lerpColor(c1, c2, t) {
        const lerp = (a, b, t) => a + (b - a) * t;
        const c1Num = parseInt(c1.slice(1), 16);
        const c2Num = parseInt(c2.slice(1), 16);

        const r1 = (c1Num >> 16) & 255;
        const g1 = (c1Num >> 8) & 255;
        const b1 = c1Num & 255;

        const r2 = (c2Num >> 16) & 255;
        const g2 = (c2Num >> 8) & 255;
        const b2 = c2Num & 255;

        const r = Math.round(lerp(r1, r2, t));
        const g = Math.round(lerp(g1, g2, t));
        const b = Math.round(lerp(b1, b2, t));

        return `rgb(${r},${g},${b})`;
    };
}

export class Ignition {
    constructor(numOfpartlces = 600) {
        this.numOfpartlces = numOfpartlces;
        this._animate = this._animate.bind(this);
        this.init();
    };

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
        this._animate();
    };

    stop() {
        if (!this.active) return;
        this.active = false;
    }

    _animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (this.active) {
            for (let i = 0; i < this.numOfpartlces; i++) {
                this.particles[i].update();
                this.particles[i].draw();
            }
            requestAnimationFrame(this._animate);
        }
    }
}

