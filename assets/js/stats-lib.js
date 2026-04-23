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

    // 3. SKEWNESS & SE SKEW (Evidence Board Logic)
    getSkewness: function(arr) {
        const n = arr.length;
        if (n < 3) return { score: "N/A", z: "N/A", isSignificant: false };

        const mean = this.getMean(arr);
        const sd = this.getStdDev(arr);
        
        const m3 = arr.reduce((acc, val) => acc + Math.pow(val - mean, 3), 0) / n;
        const m2 = Math.pow(sd, 2) * ((n - 1) / n);
        const g1 = m3 / Math.pow(m2, 1.5);
        
        const ses = Math.sqrt((6 * n * (n - 1)) / ((n - 2) * (n + 1) * (n + 3)));
        const z = g1 / ses;

        return {
            score: g1.toFixed(3),
            z: z.toFixed(3),
            isSignificant: Math.abs(z) > 1.96
        };
    },

    // 4. SHAPIRO-WILK TEST
    checkNormality: function(arr) {
        const n = arr.length;
        if (n < 3 || n > 50) return { pValue: null, error: "N must be 3-50" };

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
            pValue: pValue.toFixed(4),
            isNormal: pValue > 0.05
        };
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
    }
};
