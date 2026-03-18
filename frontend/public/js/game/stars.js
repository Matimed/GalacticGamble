const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

class Star {
  STAR_TYPES = [
    { mod: 1,  size: [1, 2], weight: [0.8, 1.6] },
    { mod: 3,  size: [1.5, 3], weight: [0.5, 1] },
    { mod: 7,  size: [1.5, 3.5], weight: [0.3, 0.6] },
    { mod: 13, size: [2, 4.2], weight: [0.1, 0.3] },
  ];
  
  randRange = (min, max) => {
    return min + Math.random() * (max - min);
  };

  constructor(seed) {
    this.spawn()
    
    let type = this.STAR_TYPES.find(t => seed % t.mod === 0);
    this.baseSize = this.randRange(type.size[0], type.size[1]);
    this.baseWeight = this.randRange(type.weight[0], type.weight[1]);
    this.weight = this.baseWeight

    this.phase = Math.random() * Math.PI * 2;
    this.twinkleSpeed = this.randRange(0.02, 0.08);
    this.twinkleAmplitude = this.randRange(0.1, 0.4);

    this.frame = 0;
  }

  draw () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  };

  twinkle() {
    this.frame += 1;
    const twinkle = Math.sin(this.frame * this.twinkleSpeed + this.phase);
    this.size = this.baseSize * (1 + twinkle * this.twinkleAmplitude);
  };

  fall(){
    const MAX_WEIGHT = 20;
    this.weight *= 1.0005;
    this.weight = Math.min(this.weight, MAX_WEIGHT)
    this.y += this.weight;
    if (this.y > canvas.height - this.size) this.spawn(true)
  };

  spawn(isRespawn = false){
    this.x = Math.random() * canvas.width;
    this.y = isRespawn ? 0 :  Math.random() * canvas.height;
  }

  stop() {
    this.weight = this.baseWeight
  }
}

export class OuterSpace {
    constructor(numOfstars=150){
        this.active = false
        this._animate = this._animate.bind(this);
        this.numOfstars = numOfstars
        this.stars = [];
        
        for (let i = 0; i < this.numOfstars; i++) {
            let seed = i;
            let star = new Star(seed)
            this.stars.push(star);
            star.draw();
        }
    }

    start() {
        if(this.active) return;
        this.active = true;
        this._animate();
    };

    stop(){
        this.active = false;
        for (let i = 0; i < this.numOfstars; i++) this.stars[i].stop();
    }

    _animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < this.numOfstars; i++) {
            this.stars[i].twinkle();
            if(this.active) this.stars[i].fall();
            this.stars[i].draw();
        }
        requestAnimationFrame(this._animate);
    }
};

