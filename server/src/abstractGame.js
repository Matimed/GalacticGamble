import { EventEmitter } from 'events';

export class AbstractGame extends EventEmitter {
  constructor() {
    super();
    this.bets = [];    
    this.crashHistory = [];
    this.isRunning = false;
  }

  addBet(bet){
    if(!bet || !bet.amount || !bet.user || !bet.cashOut) return
    this.bets.push(bet);
    this.emit('new_bet', bet);
  }

  getBetsByAmount(){
    return this.bets.sort((a,b) => b.amount - a.amount)
  }

  getBetsByProfit(){
    return this.bets.sort((a,b) => b.profit - a.profit)
  }

  getTotalBets(){
    return this.bets.reduce((acc, current) => {return acc + Number(current.amount)}, 0);
  }

  getTotalProfit(){
    return this.bets.reduce((acc, current) => {return acc + Number(current.profit)}, 0);
  }

  getUsers(){
    return this.bets.length;
  }

  getCrashes(){
    return this.crashHistory;
  }

  startRound() {
  }

  checkBets(){
  }

  clearBets(){}
}
