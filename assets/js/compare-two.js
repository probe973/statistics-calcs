document.getElementById('analyzeBtn').addEventListener('click', function() {
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);

    if (groupA.length < 3 || groupB.length < 3) {
        alert("Enter at least 3 numbers per group.");
        return;
    }

    const skewA = StatsLib.getSkewness(groupA);
    const skewB = StatsLib.getSkewness(groupB);
    const swA = StatsLib.checkNormality(groupA);
    const swB = StatsLib.checkNormality(groupB);
    const varA = StatsLib.getVariance(groupA);
    const varB = StatsLib.getVariance(groupB);

    const fRatio = varA > varB ? varA / varB : varB / varA;
    const df1 = varA > varB ? groupA.length - 1 : groupB.length - 1;
    const df2 = varA > varB ? groupB.length - 1 : groupA.length - 1;
    const fPValue = StatsLib.getFProbability(fRatio, df1, df2);
    const variancesEqual = fPValue > 0.05;

    document.getElementById('evidenceBody').innerHTML = `
        <tr>
            <th>Test</th>
            <th>Group A Results</th>
            <th>Group B Results</th>
        </tr>
        <tr>
            <td><strong>Skewness</strong><br>Z-Skew within ±1.96 is symmetrical.</td>
            <td>Skew: ${skewA.skew.toFixed(2)}<br>Z: ${skewA.z.toFixed(2)}</td>
            <td>Skew: ${skewB.skew.toFixed(2)}<br>Z: ${skewB.z.toFixed(2)}</td>
        </tr>
        <tr>
            <td><strong>Shapiro-Wilk</strong><br>Normality test. We want p > .05.</td>
            <td class="${swA.isNormal ? 'v-pass' : 'v-fail'}">W: ${swA.W.toFixed(3)}<br>p = ${swA.pValue.toFixed(4)}</td>
            <td class="${swB.isNormal ? 'v-pass' : 'v-fail'}">W: ${swB.W.toFixed(3)}<br>p = ${swB.pValue.toFixed(4)}</td>
        </tr>
        <tr>
            <td><strong>Equality of Variance</strong><br>Spread comparison. We want p > .05.</td>
            <td colspan="2" style="text-align:center;" class="${variancesEqual ? 'v-pass' : 'v-fail'}">
                F(${df1}, ${df2}) = ${fRatio.toFixed(2)}, p = ${fPValue.toFixed(4)}
            </td>
        </tr>
    `;

    document.getElementById('evidenceBoard').style.display = 'block';
});
