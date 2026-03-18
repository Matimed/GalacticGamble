class CrashPointGenerator {
    constructor(config = {}) {
        this.config = {
            name: 'default',
            houseEdge: 1.20,
            
            baseScale: 0.5,
            baseCompress: 0.65,
            
            capMin: 20,
            capMax: 100,
            
            tailChance: 0.06,
            tailIntensity: 1.4,
            
            jackpotChance: 0.001,
            jackpotMin: 50,
            jackpotMax: 1200,
            
            ...config
        };
        this.name = config.name
    }

    generate() {
        const base = this._generateBase();
        const withTail = this._maybeApplyTail(base);
        const { value, isJackpot } = this._maybeApplyJackpot(withTail);
        const capped = this._applyCap(value, isJackpot);
        const final = this._applyHouseEdge(capped);

        return this._format(final);
    }

    _generateBase() {
        const { baseScale, baseCompress } = this.config;

        const r = Math.random();
        let value = 1 + (1 / (1 - r) - 1) * baseScale;

        return Math.pow(value, baseCompress);
    }

 
    _maybeApplyTail(baseValue) {
        const { tailChance, tailIntensity, baseScale } = this.config;

        if (Math.random() >= tailChance) {
            return baseValue;
        }

        const u = Math.max(1e-15, Math.random());

        let tail = Math.pow(1 / (1 - u), 1 / tailIntensity);

        // Ajuste para integrarse mejor con la base
        return 1 + (tail - 1) * (1 + baseScale);
    }

    _maybeApplyJackpot(currentValue) {
        const { jackpotChance, jackpotMin, jackpotMax } = this.config;

        if (Math.random() >= jackpotChance) {
            return { value: currentValue, isJackpot: false };
        }

        const logMin = Math.log(jackpotMin);
        const logMax = Math.log(jackpotMax);

        const jackpotValue = Math.exp(
            logMin + Math.random() * (logMax - logMin)
        );

        return {
            value: Math.max(currentValue, jackpotValue),
            isJackpot: true
        };
    }

    _applyCap(value, isJackpot) {
        const { capMin, capMax } = this.config;

        if (isJackpot) return value;

        const dynamicCap = capMin + Math.random() * (capMax - capMin);

        return Math.min(value, dynamicCap);
    }

    _applyHouseEdge(value) {
        return value / this.config.houseEdge;
    }

    _format(value) {
        return Math.max(1.01, Number(value.toFixed(2)));
    }
}


export const moderate = new CrashPointGenerator({
    name: 'moderate',
    houseEdge: 1.20, scale: 0.45, compress: 0.65,
    capMin: 30, capMax: 120, tailProb: 0.04, tailAlpha: 1.6,
    jackpotProb: 0.0005, jackpotMin: 80, jackpotMax: 600
});

export const conservative = new CrashPointGenerator({
    name: 'conservative',
    baseScale: 0.3,
    tailChance: 0.03,
    jackpotChance: 0.0005,
    capMax: 80
});

export const balanced = new CrashPointGenerator({
    name: 'balanced',
    baseScale: 0.5,
    tailChance: 0.06,
    jackpotChance: 0.001,
    capMax: 120
});

export const party = new CrashPointGenerator({
    name: 'party',
    baseScale: 0.6,
    tailChance: 0.08,
    tailIntensity: 1.3,
    jackpotChance: 0.02,   // 1 cada 50
    jackpotMin: 100,
    jackpotMax: 1500,
    capMax: 150
});