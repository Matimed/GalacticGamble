import { EventEmitter } from 'events';

export class Game extends EventEmitter {
  constructor() {
    super();
    this.multiplier = 1.0;
    this.crashPoint = null;
    this.isRunning = false;
    this.bets = [];
    this.crashHistory = [];
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
    if (this.isRunning) return;
    this.isRunning = true;

    this.multiplier = 1.0;
    this.crashPoint = this.generateCrashPoint(crashPresets.jackpot_maniaco);
    this.emit('round_start', {});

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
      this.multiplier *= 1.005;
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

  startSimulation(rounds = 20){
    console.log('Starting simulation...');
    this.simulatePreset(crashPresets.moderate, rounds, 'Moderate:')
      .then(() => this.simulatePreset(crashPresets.fiesta, rounds, 'Fiesta:'))
      .then(() => this.simulatePreset(crashPresets.jackpot_maniaco, rounds, 'Jackpot Maniaco:'))
      .then(() => console.log('Simulation finished.'));
  }

  simulatePreset(preset, rounds, name){
    console.log(name);
    return new Promise(resolve => {
      let currentRound = 0;
      const interval = setInterval(() => {
        this.crashPoint = this.generateCrashPoint(preset);
        this.crashHistory.push(this.crashPoint);
        this.emit('round_start', {});
        this.emit('multiplier', { value: this.crashPoint.toFixed(2) });
        this.emit('crash', { value: this.crashPoint.toFixed(2) });
        currentRound++;
        if (currentRound >= rounds) {
          clearInterval(interval);
          resolve();
        }
      }, 1000);
    });
  }

  generateCrashPoint({
    houseEdge = 1.20,    // >1 reduce ganancias globales
    scale = 0.5,         // controla masa cerca de 1.0 (0..1)
    compress = 0.65,     // compresión de la distribución base
    capMin = 20,         // rango para dynamic cap
    capMax = 100,
    tailProb = 0.06,     // probabilidad de cola pesada (ej: 0.06 = 6%)
    tailAlpha = 1.4,     // pareto alpha (1.2..2.0) - menor = cola más pesada
    jackpotProb = 0.001, // prob de mega-jackpot (0.1%)
    jackpotMin = 50,     // multiplicador mínimo para jackpot
    jackpotMax = 1200    // multiplicador máximo para jackpot
  } = {}) {
    const r = Math.random();
    let base = 1 + (1 / (1 - r) - 1) * scale;
    base = Math.pow(base, compress);

    // DYNAMIC CAP (permite picos cuando toca, pero protege)
    const dynamicCap = capMin + Math.random() * (capMax - capMin);

    // Decide si vamos por cola pesada o base
    let candidate;
    if (Math.random() < tailProb) {
      // Generación Pareto (xmin = 1)
      const u = Math.max(1e-15, Math.random());
      // Pareto inverse CDF: x = xmin * (1 / (1-u))^(1/alpha)
      candidate = Math.pow(1 / (1 - u), 1 / tailAlpha);
      // aplicamos algo de escala para encajar con base
      candidate = 1 + (candidate - 1) * (1 + scale);
    } else {
      candidate = base;
    }

    // Jackpot ultra-raro: multiplica por un factor grande
    if (Math.random() < jackpotProb) {
      // Genera multiplicador aleatorio en log-space para repartir bien
      const logMin = Math.log(jackpotMin);
      const logMax = Math.log(jackpotMax);
      const v = Math.exp(logMin + Math.random() * (logMax - logMin));
      candidate = Math.max(candidate, v);
    }

    // Aplica cap dinámico y house edge
    let crash = Math.min(candidate, dynamicCap);
    crash = crash / houseEdge;

    // Seguridad: toFixed solo para display; conserva valor real si lo necesitás
    crash = Math.max(1.01, Number(crash.toFixed(2)));
    return crash;
  }

}

const crashPresets = {
  moderate: {
    houseEdge: 1.20, scale: 0.45, compress: 0.65,
    capMin: 30, capMax: 120, tailProb: 0.04, tailAlpha: 1.6,
    jackpotProb: 0.0005, jackpotMin: 80, jackpotMax: 600
  },
  fiesta: {
    houseEdge: 1.18, scale: 0.6, compress: 0.6,
    capMin: 40, capMax: 300, tailProb: 0.08, tailAlpha: 1.35,
    jackpotProb: 0.001, jackpotMin: 100, jackpotMax: 1000
  },
  jackpot_maniaco: {
    houseEdge: 1.22, scale: 0.55, compress: 0.6,
    capMin: 60, capMax: 1000, tailProb: 0.12, tailAlpha: 1.2,
    jackpotProb: 0.002, jackpotMin: 200, jackpotMax: 5000
  }
};

