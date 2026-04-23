document.getElementById('analyzeBtn').addEventListener('click', function() {
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);

    if (groupA.length < 3 || groupB.length < 3) {
        alert("Please enter at least 3 numbers per group to perform a valid analysis.");
        return;
    }

    // 1. DATA DIAGNOSTICS
    const skewA = StatsLib.getSkewness(groupA);
    const skewB = StatsLib.getSkewness(groupB);
    const swA = StatsLib.checkNormality(groupA);
    const swB = StatsLib.checkNormality(groupB);
    const varA = StatsLib.getVariance(groupA);
    const varB = StatsLib.getVariance(groupB);

    // F-Test for Equality of Variances
    const fRatio = varA > varB ? varA / varB : varB / varA;
    const df1 = varA > varB ? groupA.length - 1 : groupB.length - 1;
    const df2 = varA > varB ? groupB.length - 1 : groupA.length - 1;
    const fPValue = StatsLib.getFProbability(fRatio, df1, df2);
    const variancesEqual = fPValue > 0.05;

    // 2. THE EVIDENCE BOARD (Assumptions Table)
    document.getElementById('evidenceBody').innerHTML = `
        <tr>
            <th>Diagnostic Test</th>
            <th>Group A Statistics</th>
            <th>Group B Statistics</th>
        </tr>
        <tr>
            <td><strong>Skewness (Symmetry)</strong><br>Testing if data is leaning. We want Z between ±1.96.</td>
            <td>Skew: ${skewA.skew.toFixed(3)}<br>Z-Skew: ${skewA.z.toFixed(3)}</td>
            <td>Skew: ${skewB.skew.toFixed(3)}<br>Z-Skew: ${skewB.z.toFixed(3)}</td>
        </tr>
        <tr>
            <td><strong>Shapiro-Wilk (Normality)</strong><br>Testing for Bell Curve fit. We want p > .05.</td>
            <td class="${swA.isNormal ? 'v-pass' : 'v-fail'}">W: ${swA.W.toFixed(3)}<br>p = ${swA.pValue}</td>
            <td class="${swB.isNormal ? 'v-pass' : 'v-fail'}">W: ${swB.W.toFixed(3)}<br>p = ${swB.pValue}</td>
        </tr>
        <tr>
            <td><strong>F-Test (Equal Variance)</strong><br>Comparing group spreads. We want p > .05.</td>
            <td colspan="2" style="text-align:center;" class="${variancesEqual ? 'v-pass' : 'v-fail'}">
                F(${df1}, ${df2}) = ${fRatio.toFixed(2)}, p = ${fPValue.toFixed(4)}<br>
                <strong>Result:</strong> ${variancesEqual ? "Equal Variances Assumed" : "Unequal Variances Detected"}
            </td>
        </tr>
    `;

    // 3. DECISION LOGIC & RECOMMENDATION
    const isNormal = swA.isNormal && swB.isNormal && !skewA.isSignificant && !skewB.isSignificant;
    const adviceDiv = document.getElementById('consultantAdvice');
    
    let recommendation = "";
    if (!isNormal) {
        recommendation = "<strong>Recommendation: Mann-Whitney U.</strong> Your data violated normality or symmetry. This test compares ranks rather than means to avoid outlier distortion.";
    } else if (variancesEqual) {
        recommendation = "<strong>Recommendation: Student's T-Test.</strong> Both groups are normal and have similar spreads. This is the standard parametric approach.";
    } else {
        recommendation = "<strong>Recommendation: Welch's T-Test.</strong> Data is normal, but the spreads are significantly different. Welch's corrects the Degrees of Freedom for accuracy.";
    }

    adviceDiv.innerHTML = `
        <div class="logic-container">
            <h4>Consultant Guidance</h4>
            <p>${recommendation}</p>
        </div>
    `;

    // Show Board and Execution Buttons
    document.getElementById('evidenceBoard').style.display = 'block';
    document.getElementById('testButtons').innerHTML = `
        <p><strong>Select Analysis to Execute:</strong></p>
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
        effectDesc = "Calculated using pooled variance. 0.5 is a medium effect.";
    } else if (type === 'welch') {
        testName = "Welch's T-Test (Unequal Variances)";
        const se1 = v1/n1, se2 = v2/n2;
        const df = Math.pow(se1 + se2, 2) / (Math.pow(se1, 2)/(n1-1) + Math.pow(se2, 2)/(n2-1));
        const t = (m1 - m2) / Math.sqrt(se1 + se2);
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));
        statLine = `t(${df.toFixed(2)}) = ${t.toFixed(3)}`;
        effectLabel = "Cohen's d";
        effectSize = Math.abs((m1 - m2) / Math.sqrt(((n1-1)*v1 + (n2-1)*v2) / (n1+n2-2))).toFixed(3);
        effectDesc = "Adjusted for unequal variance between groups.";
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
        effect
