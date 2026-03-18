import * as CRASH_PRESETS from "./crashPointGenerator.js";
import { AbstractGame } from './abstractGame.js';

export class GameSimulator extends AbstractGame {
  constructor() {
    super();
    this.multiplier = 1.0;
    this.crashPoint = null;
    this.isRunning = false;
  }


  startSimulation(rounds = 20, fast= false) {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('Starting simulation...');
    let timeBtwRounds = fast? 0: 200;
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    sleep(100)
      .then(() => this.simulatePreset(CRASH_PRESETS.moderate, rounds, timeBtwRounds))
      .then(() => sleep(timeBtwRounds*10))
      .then(() => this.simulatePreset(CRASH_PRESETS.conservative, rounds,timeBtwRounds))
      .then(() => sleep(timeBtwRounds*10))
      .then(() => this.simulatePreset(CRASH_PRESETS.party, rounds,timeBtwRounds))
      .then(() => {console.log('Simulation finished.'); this.isRunning = false});
  }

  simulatePreset(crashPointGenerator, rounds=100, timeBtwRounds = 200) {
    console.log(crashPointGenerator.name);
    this.crashHistory = [];
    return new Promise(resolve => {
      let currentRound = 0;
      const interval = setInterval(() => {
        this.crashPoint = crashPointGenerator.generate();
        this.crashHistory.push(this.crashPoint);
        this.emit('crash', { value: this.crashPoint.toFixed(2) });
        currentRound++;
        if (currentRound >= rounds) {
          console.log(this.analizeData());
          clearInterval(interval);
          resolve();
        }
      }, timeBtwRounds);
    });
  }

  analizeData() {
    const n = this.crashHistory.length;
    if (!n) return null;

    const sorted = [...this.crashHistory].sort((a, b) => a - b);

    const sum = this.crashHistory.reduce((a, b) => a + b, 0);
    const avg = sum / n;

    const min = sorted[0];
    const max = sorted[n - 1];

    const percentile = (p) => {
      const idx = Math.floor(p * n);
      return sorted[Math.min(idx, n - 1)];
    };

    const countAbove = (x) => this.crashHistory.filter(v => v >= x).length;

    return {
      totalRounds: n,

      // 📈 básicos
      avg: Number(avg.toFixed(2)),
      min,
      max,

      // 📊 percentiles clave
      p50: percentile(0.5),   // mediana
      p75: percentile(0.75),
      p90: percentile(0.90),
      p99: percentile(0.99),

      // 🎯 comportamiento jugador típico
      above1_5: countAbove(1.5) / n,
      above2: countAbove(2) / n,
      above3: countAbove(3) / n,
      above5: countAbove(5) / n,
      above10: countAbove(10) / n,
      above100: countAbove(100) ,

      // 💀 rondas cortas (anti x2 abuse)
      below1_2: this.crashHistory.filter(v => v < 1.2).length / n,
      below1_5: this.crashHistory.filter(v => v < 1.5).length / n,
    };
  }
}
