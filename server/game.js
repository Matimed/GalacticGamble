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
    this.emit('round_start', { crashPoint });

    const interval = setInterval(() => {
      this.multiplier =+ (this.multiplier * 1.01).toFixed(2);
      this.emit('multiplier', { value: this.multiplier });

      if (this.multiplier >= crashPoint) {
        clearInterval(interval);
        this.isRunning = false;
        this.emit('crash', { value: crashPoint });

        setTimeout(() => this.startRound(), 5000);
      }
    }, 100);
  }
}
