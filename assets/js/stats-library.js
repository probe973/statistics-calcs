/**
 * Common Statistics Library
 * Focus: Pure math functions that return values.
 */

const StatsLib = {
    // Calculates the average
    mean: function(numbers) {
        if (!numbers.length) return 0;
        const sum = numbers.reduce((a, b) => a + b, 0);
        return sum / numbers.length;
    },

    // Calculates the middle value
    median: function(numbers) {
        if (!numbers.length) return 0;
        const sorted = [...numbers].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);

        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }
        return sorted[middle];
    },

    // Calculates Standard Deviation (Sample)
    standardDeviation: function(numbers) {
        if (numbers.length < 2) return 0;
        const avg = this.mean(numbers);
        const squareDiffs = numbers.map(n => Math.pow(n - avg, 2));
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / (numbers.length - 1);
        return Math.sqrt(avgSquareDiff);
    }
};
