document.getElementById('analyzeBtn').addEventListener('click', function() {
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);

    if (groupA.length < 3 || groupB.length < 3) {
        alert("Please enter at least 3 numbers per group.");
        return;
    }

    // 1. DIAGNOSTICS
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

    // 2. THE EVIDENCE BOARD (Assumptions Table)
    document.getElementById('evidenceBody').innerHTML = `
        <tr>
            <th>Diagnostic Metric</th>
            <th>Group A Results</th>
            <th>Group B Results</th>
        </tr>
        <tr>
            <td><strong>Skewness (g1)</strong></td>
            <td>${skewA.skew.toFixed(3)}</td>
            <td>${skewB.skew.toFixed(3)}</td>
        </tr>
        <tr>
            <td><strong>Z-Skew</strong></td>
            <td>${skewA.z.toFixed(3)}</td>
            <td>${skewB.z.toFixed(3)}</td>
        </tr>
        <tr>
            <td><strong>Shapiro-Wilk (W)</strong></td>
            <td>${swA.W.toFixed(3)}</td>
            <td>${swB.W.toFixed(3)}</td>
        </tr>
        <tr>
            <td><strong>Shapiro-Wilk (p)</strong></td>
            <td class="${swA.isNormal ? 'v-pass' : 'v-fail'}">${swA.pValue}</td>
            <td class="${swB.isNormal ? 'v-pass' : 'v-fail'}">${swB.pValue}</td>
        </tr>
        <tr>
            <td><strong>Variance (s²)</strong></td>
            <td>${varA.toFixed(3)}</td>
            <td>${varB.toFixed(3)}</td>
        </tr>
        <tr>
            <td><strong>F-Test p-value</strong></td>
            <td colspan="2" style="text-align:center;" class="${variancesEqual ? 'v-pass' : 'v-fail'}">
                F(${df1}, ${df2}) = ${fRatio.toFixed(2)}, p = ${fPValue.toFixed(4)}
            </td>
        </tr>
    `;

    // 3. FORMAL EXPLANATIONS (As requested, after the table)
    const isNormal = swA.isNormal && swB.isNormal && !skewA.isSignificant && !skewB.isSignificant;
    const adviceDiv = document.getElementById('consultantAdvice');
    
    adviceDiv.innerHTML = `
        <div class="logic-container" style="margin-top: 20px; padding: 15px; border: 1px solid #ddd; background: #f9f9f9;">
            <h4>How to interpret these statistics:</h4>
            <ul style="line-height: 1.6;">
                <li><strong>Z-Skew:</strong> This measures symmetry. If the value is between <strong>-1.96 and +1.96</strong>, we assume the data is symmetrical.</li>
                <li><strong>Shapiro-Wilk (p):</strong> This tests for a Bell Curve (Normality). If <strong>p > .05</strong>, we fail to reject the null hypothesis and assume the data is Normal.</li>
                <li><strong>F-Test (p):</strong> This tests for Equality of Variance. If <strong>p > .05</strong>, we assume the groups have similar spreads.</li>
            </ul>
            <hr>
            <p><strong>Statistical Recommendation:</strong><br>
            ${!isNormal ? "Data is non-normal or skewed. Use <strong>Mann-Whitney U</strong>." : 
              (variancesEqual ? "Data is normal and variances are equal. Use <strong>Student's T-Test</strong>." : 
              "Data is normal but variances are unequal. Use <strong>Welch's T-Test</strong>.")}
            </p>
        </div>
    `;

    document.getElementById('evidenceBoard').style.display = 'block';
    document.getElementById('testButtons').innerHTML = `
        <button class="btn-primary" onclick="runFinalTest('student')">Execute Student's T-Test</button>
        <button class="btn-primary" onclick="runFinalTest('welch')" style="margin-left:10px;">Execute Welch's T-Test</button>
        <button class="btn-primary" onclick="runFinalTest('u')" style="margin-left:10px;">Execute Mann-Whitney U</button>
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
        effectDesc = "A standardized measure of the difference between means.";
    } else if (type === 'welch') {
        testName = "Welch's T-Test (Unequal Variances)";
        const se1 = v1/n1, se2 = v2/n2;
        const df = Math.pow(se1 + se2, 2) / (Math.pow(se1, 2)/(n1-1) + Math.pow(se2, 2)/(n2-1));
        const t = (m1 - m2) / Math.sqrt(se1 + se2);
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));
        statLine = `t(${df.toFixed(2)}) = ${t.toFixed(3)}`;
        effectLabel = "Cohen's d";
        effectSize = Math.abs((m1 - m2) / Math.sqrt(((n1-1)*v1 + (n2-1)*v2) / (n1+n2-2))).toFixed(3);
        effectDesc = "Adjusted for unequal group variances.";
    } else {
        testName = "Mann-Whitney U Test";
        const combined = [...groupA.map(v => ({v, g: 'a'})), ...groupB.map(v => ({v, g: 'b'}))].sort((x, y) => x.v - y.v);
        combined.forEach((d, i) => d.rank = i + 1);
        const r1 = combined.filter(d => d.g === 'a').reduce((s, d) => s + d.rank, 0);
        const u1 = r1 - (n1 * (n1 + 1)) / 2;
        const u = Math.min(u1, (n1 * n2) - u1);
        const mu = (n1 * n2) / 2;
        const sigma = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
        const z = (u - mu) / sigma;
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(z)));
        statLine = `U = ${u.toFixed(1)} (z = ${z.toFixed(3)})`;
        effectLabel = "Rank-Biserial r";
        effectSize = Math.abs(1 - (2 * u1) / (n1 * n2)).toFixed(3);
        effectDesc = "Strength of relationship based on ranks.";
    }

    output.innerHTML = `
        <div class="final-report">
            <h3>Final Result: ${testName}</h3>
            <p>Group A: M = ${m1.toFixed(2)}, SD = ${sd1.toFixed(2)} (n=${n1})</p>
            <p>Group B: M = ${m2.toFixed(2)}, SD = ${sd2.toFixed(2)} (n=${n2})</p>
            <p><strong>Statistic:</strong> ${statLine}</p>
            <p><strong>p-value:</strong> ${pVal.toFixed(4)}</p>
            <p><strong>Verdict:</strong> ${pVal < 0.05 ? "Significant difference. Reject the null hypothesis." : "Non-significant difference. Fail to reject the null hypothesis."}</p>
            <p><strong>${effectLabel}:</strong> ${effectSize} (${effectDesc})</p>
        </div>
    `;
};
