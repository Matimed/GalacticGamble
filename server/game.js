import { EventEmitter } from 'events';

export class Game extends EventEmitter {
  constructor() {
    super();
    this.multiplier = 1.0;
    this.isRunning = false;
  }

  startRound() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.multiplier = 1.0;

    const crashPoint = (Math.random() * 3.5 + 1.5).toFixed(2);
    this.emit('round_start', {});

    const interval = setInterval(() => {
      this.multiplier =+ (this.multiplier * 1.04).toFixed(2);
      
      if (this.multiplier >= crashPoint) {
        clearInterval(interval);
        this.isRunning = false;
        this.emit('crash', { value: crashPoint });
      }
      else this.emit('multiplier', { value: this.multiplier });
    }, 100);
  }
}
