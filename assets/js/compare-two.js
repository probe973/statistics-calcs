/**
 * compare-two.js
 * Comprehensive Consultant Workstation
 */

document.getElementById('analyzeBtn').addEventListener('click', function() {
    const rawA = document.getElementById('dataA').value;
    const rawB = document.getElementById('dataB').value;
    const groupA = StatsLib.parseData(rawA);
    const groupB = StatsLib.parseData(rawB);

    if (groupA.length < 3 || groupB.length < 3) {
        alert("We need at least 3 values per group to calculate variance and symmetry.");
        return;
    }

    // 1. Calculate Detailed Diagnostics
    const skewA = StatsLib.getSkewness(groupA);
    const skewB = StatsLib.getSkewness(groupB);
    const swA = StatsLib.checkNormality(groupA); // Shapiro-Wilk
    const swB = StatsLib.checkNormality(groupB);
    
    const varA = StatsLib.getVariance(groupA);
    const varB = StatsLib.getVariance(groupB);
    const n1 = groupA.length;
    const n2 = groupB.length;

    // F-Test for Equality of Variances
    const fRatio = varA > varB ? varA / varB : varB / varA;
    const df1 = varA > varB ? n1 - 1 : n2 - 1;
    const df2 = varA > varB ? n2 - 1 : n1 - 1;
    const fPValue = StatsLib.getFProbability(fRatio, df1, df2); 
    const variancesEqual = fPValue > 0.05;

    // 2. THE EVIDENCE BOARD (Assumptions Table)
    document.getElementById('evidenceBody').innerHTML = `
        <tr>
            <th>Metric</th>
            <th>Group A Results</th>
            <th>Group B Results</th>
        </tr>
        <tr>
            <td><strong>Skewness</strong><br>Degree of lean. We look for Z-Skew between ±1.96.</td>
            <td>Skew: ${skewA.skew.toFixed(3)}<br>Z-Skew: ${skewA.z.toFixed(2)}</td>
            <td>Skew: ${skewB.skew.toFixed(3)}<br>Z-Skew: ${skewB.z.toFixed(2)}</td>
        </tr>
        <tr>
            <td><strong>Shapiro-Wilk Test</strong><br>Testing for Normality (Bell Curve). We want p > .05.</td>
            <td class="${swA.isNormal ? 'v-pass' : 'v-fail'}">W: ${swA.W.toFixed(3)}<br>p = ${swA.pValue.toFixed(4)}</td>
            <td class="${swB.isNormal ? 'v-pass' : 'v-fail'}">W: ${swB.W.toFixed(3)}<br>p = ${swB.pValue.toFixed(4)}</td>
        </tr>
        <tr>
            <td><strong>F-Test (Equality of Variance)</strong><br>Comparing the spread of both groups. We want p > .05.</td>
            <td>F-Ratio: ${fRatio.toFixed(2)}</td>
            <td class="${variancesEqual ? 'v-pass' : 'v-fail'}">
                df: (${df1}, ${df2})<br>
                p = ${fPValue.toFixed(4)}
            </td>
        </tr>
    `;

    // 3. THE CONSULTANT'S DECISION LOGIC
    const adviceDiv = document.getElementById('consultantAdvice');
    const isNormal = swA.isNormal && swB.isNormal && !skewA.isSignificant && !skewB.isSignificant;

    let recommendationText = "";
    if (!isNormal) {
        recommendationText = "Data is non-normal or skewed. The <strong>Mann-Whitney U</strong> is the most honest choice as it uses ranks rather than means.";
    } else if (variancesEqual) {
        recommendationText = "Data is normal and variances are equal. The <strong>Student's T-Test</strong> is the standard approach.";
    } else {
        recommendationText = "Data is normal but variances are unequal. <strong>Welch's T-Test</strong> is required to adjust for the different spreads.";
    }

    adviceDiv.innerHTML = `
        <div class="logic-container">
            <h4>Consultant Recommendation:</h4>
            <p>${recommendationText}</p>
            <ul>
                <li><strong>Symmetry:</strong> ${(!skewA.isSignificant && !skewB.isSignificant) ? "Passed" : "Failed (Significant Skew)"}</li>
                <li><strong>Normality:</strong> ${(swA.isNormal && swB.isNormal) ? "Passed" : "Failed (p < .05)"}</li>
                <li><strong>Equal Variance:</strong> ${variancesEqual ? "Passed" : "Failed (p < .05)"}</li>
            </ul>
        </div>
    `;

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
        testName = "Student's T-Test";
        const df = n1 + n2 - 2;
        const pooledVar = ((n1 - 1) * v1 + (n2 - 1) * v2) / df;
        const t = (m1 - m2) / Math.sqrt(pooledVar * (1/n1 + 1/n2));
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));
        statLine = `t(${df}) = ${t.toFixed(3)}`;
        effectLabel = "Cohen's d";
        effectSize = Math.abs((m1 - m2) / Math.sqrt(pooledVar)).toFixed(3);
        effectDesc = "A standardized measure of the gap between means using pooled variance.";
    } else if (type === 'welch') {
        testName = "Welch's T-Test";
        const se1 = v1/n1, se2 = v2/n2;
        const df = Math.pow(se1 + se2, 2) / (Math.pow(se1, 2)/(n1-1) + Math.pow(se2, 2)/(n2-1));
        const t = (m1 - m2) / Math.sqrt(se1 + se2);
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));
        statLine = `t(${df.toFixed(2)}) = ${t.toFixed(3)}`;
        effectLabel = "Cohen's d";
        effectSize = Math.abs((m1 - m2) / Math.sqrt(((n1-1)*v1 + (n2-1)*v2) / (n1+n2-2))).toFixed(3);
        effectDesc = "A measure of the difference adjusted for unequal group variances.";
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
        effectDesc = "Measures the strength of the relationship based on the ordering of scores.";
    }

    output.innerHTML = `
        <div class="final-report">
            <h3>Test Result: ${testName}</h3>
            
            <section class="result-section">
                <h4>1. Descriptive Statistics</h4>
                <p>Group A (n=${n1}): M = ${m1.toFixed(2)}, SD = ${sd1.toFixed(2)}</p>
                <p>Group B (n=${n2}): M = ${m2.toFixed(2)}, SD = ${sd2.toFixed(2)}</p>
            </section>

            <section class="result-section">
                <h4>2. Inferential Results</h4>
                <p><strong>Statistic:</strong> ${statLine}</p>
                <p><strong>p-value:</strong> ${pVal.toFixed(4)}</p>
                <p><strong>Verdict:</strong> ${pVal < 0.05 ? "Reject the Null Hypothesis. The difference is statistically significant." : "Fail to Reject the Null Hypothesis. The difference is not statistically significant."}</p>
            </section>

            <section class="result-section">
                <h4>3. Magnitude of Difference (${effectLabel})</h4>
                <p><strong>Value: ${effectSize}</strong></p>
                <p>${effectDesc}</p>
            </section>

            <div class="write-up-box">
                <h4>Formal Reporting Guide</h4>
                <code>Group A (M=${m1.toFixed(2)}, SD=${sd1.toFixed(2)}) and Group B (M=${m2.toFixed(2)}, SD=${sd2.toFixed(2)}) showed a ${pVal < .05 ? 'significant' : 'non-significant'} difference, ${statLine}, p = ${pVal.toFixed(3)}, ${effectLabel} = ${effectSize}.</code>
            </div>
        </div>
    `;
};
