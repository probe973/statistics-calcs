const StatsLib = {
    parseData: function(str) {
        if (!str) return [];
        return str.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    },

    getMean: function(arr) {
        if (!arr.length) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    },

    getVariance: function(arr) {
        if (arr.length < 2) return 0;
        const m = this.getMean(arr);
        return arr.reduce((a, v) => a + Math.pow(v - m, 2), 0) / (arr.length - 1);
    },

    getStdDev: function(arr) {
        return Math.sqrt(this.getVariance(arr));
    },

    getSkewness: function(arr) {
        const n = arr.length;
        if (n < 3) return { skew: 0, z: 0, isSignificant: false };
        const m = this.getMean(arr);
        const sd = this.getStdDev(arr);
        const m3 = arr.reduce((a, v) => a + Math.pow(v - m, 3), 0) / n;
        const g1 = m3 / Math.pow(sd * Math.sqrt((n - 1) / n), 3);
        const ses = Math.sqrt((6 * n * (n - 1)) / ((n - 2) * (n + 1) * (n + 3)));
        const z = g1 / ses;
        return { skew: g1.toFixed(3), z: z.toFixed(3), isSignificant: Math.abs(z) > 1.96 };
    },

    checkNormality: function(arr) {
        const n = arr.length;
        if (n < 3) return { W: 0, pValue: 0, isNormal: false };
        const sorted = [...arr].sort((a, b) => a - b);
        const mean = this.getMean(sorted);
        const s2 = sorted.reduce((a, v) => a + Math.pow(v - mean, 2), 0);
        const m = sorted.map((_, i) => this.normalQuantile((i + 1 - 0.375) / (n + 0.25)));
        const mSumSq = m.reduce((a, v) => a + v * v, 0);
        const weights = m.map(v => v / Math.sqrt(mSumSq));
        let gap = 0;
        for (let i = 0; i < Math.floor(n / 2); i++) gap += weights[i] * (sorted[n - 1 - i] - sorted[i]);
        const w = Math.pow(gap, 2) / s2;
        const p = 1 - this.normalCDF((Math.log(1 - w) - (-2.32 + 0.63 * Math.log(n))) / Math.exp(1.14 - 0.12 * Math.log(n)));
        return { W: w.toFixed(4), pValue: p.toFixed(4), isNormal: p > 0.05 };
    },

    // FULL F-DISTRIBUTION MATH
    getFProbability: function(f, df1, df2) {
        const x = df2 / (df1 * f + df2);
        const a = df2 / 2;
        const b = df1 / 2;
        return this.beta(x, a, b);
    },

    logGamma: function(z) {
        const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -0.000005395239384953];
        let x = z, y = z, tmp = x + 5.5;
        tmp -= (x + 0.5) * Math.log(tmp);
        let ser = 1.000000000190015;
        for (let i = 0; i < 6; i++) ser += c[i] / ++y;
        return -tmp + Math.log(2.5066282746310005 * ser / x);
    },

    beta: function(x, a, b) {
        const bt = (x > 0 && x < 1) ? Math.exp(this.logGamma(a + b) - this.logGamma(a) - this.logGamma(b) + a * Math.log(x) + b * Math.log(1 - x)) : 0;
        if (x < (a + 1) / (a + b + 2)) return bt * this.betacf(x, a, b) / a;
        return 1 - bt * this.betacf(1 - x, b, a) / b;
    },

    betacf: function(x, a, b) {
        const maxIter = 100, eps = 3e-7;
        let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
        if (Math.abs(d) < 1e-30) d = 1e-30;
        d = 1 / d;
        let h = d;
        for (let m = 1; m <= maxIter; m++) {
            let m2 = 2 * m, aa = m * (b - m) * x / ((qam + m2) * (a + m2));
            d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
            c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
            d = 1 / d; h *= d * c;
            aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
            d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30;
            c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30;
            d = 1 / d; h *= d * c;
            if (Math.abs(d * c - 1) < eps) break;
        }
        return h;
    },

    normalCDF: function(x) {
        const t = 1 / (1 + 0.2316419 * Math.abs(x));
        const d = 0.3989423 * Math.exp(-x * x / 2);
        const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.821256 + t * 1.3302744))));
        return x > 0 ? 1 - p : p;
    },

    normalQuantile: function(p) {
        const a = [-39.69683, 220.946, -275.928, 138.357, -30.664, 2.5066];
        const b = [-54.476, 161.585, -155.698, 66.801, -13.280];
        const q = p - 0.5, r = q * q;
        return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
               (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    }
};
