/**
 * Global Statistics Library
 * Core math engine for assumptions and data cleaning.
 */
const StatsLib = {
    
    // 1. DATA CLEANING
    parseData: function(rawString) {
        if (!rawString) return [];
        return rawString
            .trim()
            .split(/[\s,]+/) 
            .map(Number)
            .filter(n => !isNaN(n));
    },

    // 2. DESCRIPTIVES
    getMean: function(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    },

    getVariance: function(arr) {
        if (arr.length < 2) return 0;
        const mean = this.getMean(arr);
        return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (arr.length - 1);
    },

    getStdDev: function(arr) {
        return Math.sqrt(this.getVariance(arr));
    },

    // 3. SKEWNESS & SE SKEW
    getSkewness: function(arr) {
        const n = arr.length;
        if (n < 3) return { skew: 0, z: 0, isSignificant: false };

        const mean = this.getMean(arr);
        const sd = this.getStdDev(arr);
        
        const m3 = arr.reduce((acc, val) => acc + Math.pow(val - mean, 3), 0) / n;
        const m2 = Math.pow(sd, 2) * ((n - 1) / n);
        const g1 = m3 / Math.pow(m2, 1.5);
        
        const ses = Math.sqrt((6 * n * (n - 1)) / ((n - 2) * (n + 1) * (n + 3)));
        const z = g1 / ses;

        return {
            skew: g1,
            z: z,
            isSignificant: Math.abs(z) > 1.96
        };
    },

    // 4. SHAPIRO-WILK TEST
    checkNormality: function(arr) {
        const n = arr.length;
        if (n < 3 || n > 50) return { pValue: 0, W: 0, isNormal: false };

        const sorted = [...arr].sort((a, b) => a - b);
        const mean = this.getMean(sorted);
        const s2 = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
        
        const m = [];
        for (let i = 1; i <= n; i++) {
            m.push(this.normalQuantile((i - 0.375) / (n + 0.25)));
        }
        
        const mSumSq = m.reduce((acc, val) => acc + Math.pow(val, 2), 0);
        const weights = m.map(val => val / Math.sqrt(mSumSq));
        
        let gapSum = 0;
        for (let i = 0; i < Math.floor(n / 2); i++) {
            gapSum += weights[i] * (sorted[n - 1 - i] - sorted[i]);
        }
        
        const w = Math.pow(gapSum, 2) / s2;
        const y = Math.log(1 - w);
        const u = Math.log(n);
        const m_y = -2.3218 + 0.6331 * u - 0.0153 * Math.pow(u, 2);
        const s_y = Math.exp(1.1401 - 0.1274 * u - 0.0124 * Math.pow(u, 2));
        const pValue = 1 - this.normalCDF((y - m_y) / s_y);

        return {
            W: w,
            pValue: pValue,
            isNormal: pValue > 0.05
        };
    },

    // 5. F-TEST (EQUALITY OF VARIANCES)
    getFProbability: function(f, df1, df2) {
        const x = df2 / (df1 * f + df2);
        const a = df2 / 2;
        const b = df1 / 2;
        return this.beta(x, a, b);
    },

    // MATH HELPERS
    normalCDF: function(x) {
        const t = 1 / (1 + 0.2316419 * Math.abs(x));
        const d = 0.3989423 * Math.exp(-x * x / 2);
        const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.821256 + t * 1.3302744))));
        return x > 0 ? 1 - p : p;
    },

    normalQuantile: function(p) {
        const a = [-3.9696830e+01, 2.2094609e+02, -2.7592851e+02, 1.3835775e+02, -3.0664798e+01, 2.5066282e+00];
        const b = [-5.4476098e+01, 1.6158583e+02, -1.5569897e+02, 6.6801311e+01, -1.3280681e+01];
        const q = p - 0.5, r = q * q;
        return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
               (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    },

    logGamma: function(z) {
        const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
        let x = z, y = z, tmp = x + 5.5;
        tmp -= (x + 0.5) * Math.log(tmp);
        let ser = 1.000000000190015;
        for (let i = 0; i < 6; i++) ser += c[i] / ++y;
        return -tmp + Math.log(2.5066282746310005 * ser / x);
    },

    beta: function(x, a, b) {
        const bt = (x > 0 && x < 1) ? 
            Math.exp(this.logGamma(a + b) - this.logGamma(a) - this.logGamma(b) + a * Math.log(x) + b * Math.log(1 - x)) : 0;
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
            d = 1 + aa * d;
            if (Math.abs(d) < 1e-30) d = 1e-30;
            c = 1 + aa / c;
            if (Math.abs(c) < 1e-30) c = 1e-30;
            d = 1 / d;
            h *= d * c;
            aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
            d = 1 + aa * d;
            if (Math.abs(d) < 1e-30) d = 1e-30;
            c = 1 + aa / c;
            if (Math.abs(c) < 1e-30) c = 1e-30;
            d = 1 / d;
            h *= d * c;
            if (Math.abs(d * c - 1) < eps) break;
        }
        return h;
    }
};
