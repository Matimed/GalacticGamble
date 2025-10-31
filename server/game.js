import { EventEmitter } from 'events';

export class Game extends EventEmitter {
  constructor() {
    super();
    this.multiplier = 1.0;
    this.crashPoint = null;
    this.isRunning = false;
    this.bets = [];
  }

  addBet(bet){
    if(!bet || !bet.amount || !bet.user || !bet.cashOut) return
    this.bets.push(bet);
    this.emit('new_bet', bet);
  }

  startRound() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.multiplier = 1.0;

    this.crashPoint = (Math.random() * 3.5 + 1.5);
    this.emit('round_start', {});

    const interval = setInterval(() => {
      this.multiplier *= 1.04;
      
      if (this.multiplier >= this.crashPoint) {
        clearInterval(interval);
        this.isRunning = false;
        this.clearBets();
        this.emit('crash', { value: this.crashPoint.toFixed(2) });
      }
      else {
        this.emit('multiplier', { value: this.multiplier.toFixed(2) });
        this.checkBets();
      }
    }, 100);
  }

  checkBets(){
    for (let i = this.bets.length - 1; i >= 0; i--) {
      const bet = this.bets[i];
      if(bet.cashOut <= this.multiplier && bet.cashOut <= this.crashPoint ) {
        this.bets.splice(i, 1);
        this.emit('user_win', {user: bet.user, profit: (bet.amount * this.multiplier).toFixed(2)});
      }
    }
  }

  clearBets(){
    for (let i = 0; i < this.bets.length; i++){
      this.emit('user_lost', {user: this.bets[i].user})
    }
    this.bets = [];
  }
}
