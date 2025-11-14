const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

class Star {
  constructor(x, y, size, weight, boolean) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.weight = weight;
    this.boolean = boolean;
    this.update();
  }

  draw = () => {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    // ctx.shadowBlur = Math.floor(Math.random() * 10 + 1);
    // ctx.shadowColor = 'white';
    ctx.fill();
  };

  update = () => {
    if (this.boolean % 13 == 0) {
      this.size = Math.random() * 2.2 + 2; ///twinkle
      this.weight = Math.random() * 0.2 + 0.1;
    } else if (this.boolean % 7 == 0) {
      this.size = Math.random() * 2 + 1.5;
      this.weight = Math.random() * 0.3 + 0.3;
    } else if (this.boolean % 3 == 0) {
      this.size = Math.random() * 1.5 + 1.5;
      this.weight = Math.random() * 0.5 + 0.5;
    } else {
      this.size = Math.random() * 1 + 1; ///twinkle
      this.weight = Math.random() * 0.8 + 0.8;
    }
    this.y += this.weight;
    // this.weight += 0.01; //////acceleration
    if (this.y > canvas.height - this.size) {
      // this.weight *= -1; /////bounce
      this.y = 0;
    }
  };
}

export class OuterSpace {
    constructor(numOfstars=150){
        this.active = false
        this._animate = this._animate.bind(this);
        this.numOfstars = numOfstars
        this.stars = [];
        
        for (let i = 0; i < this.numOfstars; i++) {
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            let size = Math.random() * 10 + 2;
            let weight = 0.7; //////weight is speeddddddd
            let boolean = i;
            let star = new Star(x, y, size, weight, boolean)
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
    }

    _animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < this.numOfstars; i++) {
            this.stars[i].update();
            this.stars[i].draw();
        }
        if(this.active) requestAnimationFrame(this._animate);
    }
};

