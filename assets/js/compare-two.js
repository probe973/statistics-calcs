document.getElementById('analyzeBtn').addEventListener('click', function() {
    const rawA = document.getElementById('dataA').value;
    const rawB = document.getElementById('dataB').value;
    const groupA = StatsLib.parseData(rawA);
    const groupB = StatsLib.parseData(rawB);

    if (groupA.length < 3 || groupB.length < 3) {
        alert("We need at least 3 values per group to calculate variance and symmetry.");
        return;
    }

    // 1. Assumption Calculations
    const skewA = StatsLib.getSkewness(groupA);
    const skewB = StatsLib.getSkewness(groupB);
    const normA = StatsLib.checkNormality(groupA);
    const normB = StatsLib.checkNormality(groupB);
    
    // Equality of Variances: The F-Test
    const varA = StatsLib.getVariance(groupA);
    const varB = StatsLib.getVariance(groupB);
    // F is the ratio of the larger variance over the smaller variance
    const fRatio = varA > varB ? varA / varB : varB / varA;
    // Critical threshold: If one variance is more than 4x the other, it's a major violation
    const variancesEqual = fRatio < 4.0; 

    // 2. The Evidence Board (Clean & Readable)
    document.getElementById('evidenceBody').innerHTML = `
        <tr>
            <td><strong>Symmetry</strong><br>Checking for skew. If the score is between -1.96 and +1.96, the data is balanced.</td>
            <td>Group A: ${skewA.z}<br>Group B: ${skewB.z}</td>
            <td class="${skewA.isSignificant || skewB.isSignificant ? 'v-fail' : 'v-pass'}">
                ${skewA.isSignificant || skewB.isSignificant ? "Data is skewed." : "Data is symmetrical."}
            </td>
        </tr>
        <tr>
            <td><strong>Normality</strong><br>Testing if scores fit a Bell Curve. We want a p-value higher than .05.</td>
            <td>Group A: p=${normA.pValue}<br>Group B: p=${normB.pValue}</td>
            <td class="${normA.isNormal && normB.isNormal ? 'v-pass' : 'v-fail'}">
                ${normA.isNormal && normB.isNormal ? "Normal distribution." : "Non-normal distribution."}
            </td>
        </tr>
        <tr>
            <td><strong>Equality of Variances</strong><br>Checking if both groups have a similar 'spread' (variance).</td>
            <td>F-Ratio: ${fRatio.toFixed(2)}</td>
            <td class="${variancesEqual ? 'v-pass' : 'v-fail'}">
                ${variancesEqual ? "Equal variances." : "Unequal variances."}
            </td>
        </tr>
    `;

    // 3. The Consultant's Guidance
    const adviceDiv = document.getElementById('consultantAdvice');
    const normal = normA.isNormal && normB.isNormal && !skewA.isSignificant && !skewB.isSignificant;

    if (normal && variancesEqual) {
        adviceDiv.innerHTML = `
            <div class="advice-card pass">
                <h4>Recommended: Student's T-Test</h4>
                <p><strong>Reasoning:</strong> Your data follows a normal curve and the groups have similar spreads. This allows us to "pool" the variances into a single estimate, giving us standard whole-number Degrees of Freedom (df).</p>
            </div>`;
    } else if (normal && !variancesEqual) {
        adviceDiv.innerHTML = `
            <div class="advice-card warning">
                <h4>Recommended: Welch's T-Test</h4>
                <p><strong>Reasoning:</strong> The data is normal, but the spreads are too different to "pool." Welch's test adjusts the Degrees of Freedom (using decimals) to prevent the group with the larger spread from distorting the results.</p>
            </div>`;
    } else {
        adviceDiv.innerHTML = `
            <div class="advice-card warning">
                <h4>Recommended: Mann-Whitney U</h4>
                <p><strong>Reasoning:</strong> Your data is skewed or non-normal. Because the "Mean" is easily pulled by outliers, we compare the "Ranks" (the order of scores) instead.</p>
            </div>`;
    }

    document.getElementById('evidenceBoard').style.display = 'block';
    document.getElementById('testButtons').innerHTML = `
        <button class="btn-primary" onclick="runFinalTest('student')">Run Student's T-Test</button>
        <button class="btn-primary" onclick="runFinalTest('welch')" style="margin-left:10px;">Run Welch's T-Test</button>
        <button class="btn-primary" onclick="runFinalTest('u')" style="margin-left:10px;">Run Mann-Whitney U</button>
    `;
});

window.runFinalTest = function(type) {
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);
    const output = document.getElementById('outputContent');
    document.getElementById('finalResults').style.display = 'block';

    const n1 = groupA.length, n2 = groupB.length;
    const m1 = StatsLib.getMean(groupA), m2 = StatsLib.getMean(groupB);
    const v1 = StatsLib.getVariance(groupA), v2 = StatsLib.getVariance(groupB);
    const sd1 = Math.sqrt(v1), sd2 = Math.sqrt(v2);

    let testName, statLine, pVal, effectSize, effectLabel, effectDesc;

    if (type === 'student') {
        testName = "Student's T-Test (Equal Variances)";
        const df = n1 + n2 - 2;
        const pooledVar = ((n1 - 1) * v1 + (n2 - 1) * v2) / df;
        const t = (m1 - m2) / Math.sqrt(pooledVar * (1/n1 + 1/n2));
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));
        statLine = `t(${df}) = ${t.toFixed(3)}`;
        effectLabel = "Cohen's d";
        effectSize = Math.abs((m1 - m2) / Math.sqrt(pooledVar)).toFixed(3);
        effectDesc = "Calculated using pooled variance. A score of 0.5 is a medium-sized difference.";
    } else if (type === 'welch') {
        testName = "Welch's T-Test (Unequal Variances)";
        const se1 = v1/n1, se2 = v2/n2;
        const df = Math.pow(se1 + se2, 2) / (Math.pow(se1, 2)/(n1-1) + Math.pow(se2, 2)/(n2-1));
        const t = (m1 - m2) / Math.sqrt(se1 + se2);
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));
        statLine = `t(${df.toFixed(2)}) = ${t.toFixed(3)}`;
        effectLabel = "Cohen's d";
        effectSize = Math.abs((m1 - m2) / Math.sqrt(((n1-1)*v1 + (n2-1)*v2) / (n1+n2-2))).toFixed(3);
        effectDesc = "Adjusted for unequal spread. This measures how many standard deviations separate the groups.";
    } else {
        testName = "Mann-Whitney U Test";
        const combined = [...groupA.map(v => ({v, g: 'a'})), ...groupB.map(v => ({v, g: 'b'}))].sort((x, y) => x.v - y.v);
        combined.forEach((d, i) => d.rank = i + 1);
        const r1 = combined.filter(d => d.g === 'a').reduce((s, d) => s + d.rank, 0);
        const u1 = r1 - (n1 * (n1 + 1)) / 2;
        const u = Math.min(u1, (n1 * n2) - u1);
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs((u - (n1*n2/2)) / Math.sqrt((n1*n2*(n1+n2+1))/12))));
        statLine = `U = ${u.toFixed(1)}`;
        effectLabel = "Rank-Biserial r";
        effectSize = Math.abs(1 - (2 * u1) / (n1 * n2)).toFixed(3);
        effectDesc = "Measures the strength of the relationship between group membership and rank order.";
    }

    output.innerHTML = `
        <div class="consultation-summary">
            <h3>Analysis Report: ${testName}</h3>
            
            <section class="result-section">
                <h4>1. Descriptive Stats (The Foundation)</h4>
                <p>Group A: Mean = ${m1.toFixed(2)}, SD = ${sd1.toFixed(2)} (n=${n1})</p>
                <p>Group B: Mean = ${m2.toFixed(2)}, SD = ${sd2.toFixed(2)} (n=${n2})</p>
            </section>

            <section class="result-section">
                <h4>2. Inferential Result (The Evidence)</h4>
                <p><strong>Result:</strong> ${statLine}</p>
                <p><strong>p-value:</strong> ${pVal.toFixed(4)}</p>
                <p><em>Interpretation:</em> ${pVal < 0.05 ? "The p-value is below .05. We reject the null hypothesis; the difference is statistically significant." : "The p-value is above .05. We fail to reject the null hypothesis; the difference is likely due to chance."}</p>
            </section>

            <section class="result-section">
                <h4>3. Effect Size (The Magnitude)</h4>
                <p><strong>${effectLabel}: ${effectSize}</strong></p>
                <p>${effectDesc}</p>
            </section>

            <div class="write-up-box">
                <h4>Reporting Guide</h4>
                <code>A ${testName} was conducted to compare [Variable]. There was a ${pVal < .05 ? 'significant' : 'non-significant'} difference between Group A (M=${m1.toFixed(2)}, SD=${sd1.toFixed(2)}) and Group B (M=${m2.toFixed(2)}, SD=${sd2.toFixed(2)}), ${statLine}, p = ${pVal.toFixed(3)}, ${effectLabel} = ${effectSize}.</code>
            </div>
        </div>
    `;
};
