import * as CRASH_PRESETS from "./crashPointGenerator.js";
import { AbstractGame } from './abstractGame.js';

export class Game extends AbstractGame {
  constructor() {
    super();
    this.multiplier = 1.0;
    this.crashPoint = null;
    this.crashPointGenerator = CRASH_PRESETS.party;
  }

  startRound() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.multiplier = 1.0;
    this.crashPoint = this.crashPointGenerator.generate();
    this.emit('round_start', {});
    const base = 1.005; // Base de incremento por tick
    const accel = 0.005; // Acelerador del multiplicador por tick

    const interval = setInterval(() => {
      if (this.multiplier >= this.crashPoint) {
        this.crashHistory.push(this.crashPoint);
        this.emit('crash', { value: this.crashPoint.toFixed(2) });
        this.clearBets();
        clearInterval(interval);
        this.isRunning = false;
      }
      else {
        this.emit('multiplier', { value: this.multiplier.toFixed(2) });
        this.checkBets();
      }
      const factor = base + Math.log10(this.multiplier + 1) * accel;
      this.multiplier *= factor;
    }, 100);
  }

  checkBets(){
    for (let i = this.bets.length - 1; i >= 0; i--) {
      const bet = this.bets[i];
      if(bet.cashOut <= this.multiplier && bet.cashOut <= this.crashPoint && !bet.profit) {
        const profit = bet.amount * this.multiplier;
        this.bets[i].profit = profit;
        this.emit('user_win', {user: bet.user, profit: profit.toFixed(2)});
      }
    }
  }

  clearBets(){
    for (let i = 0; i < this.bets.length; i++){
      if (!this.bets[i].profit) this.emit('user_lost', {user: this.bets[i].user});
    }
    this.bets = [];
  }
}
