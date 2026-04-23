/**
 * compare-two.js
 * The "Consultant" Workstation for Comparing Two Groups
 */

document.getElementById('analyzeBtn').addEventListener('click', function() {
    const rawA = document.getElementById('dataA').value;
    const rawB = document.getElementById('dataB').value;
    
    const groupA = StatsLib.parseData(rawA);
    const groupB = StatsLib.parseData(rawB);

    // Initial check for data quantity
    if (groupA.length < 3 || groupB.length < 3) {
        alert("I need a bit more data to work with. Please ensure both groups have at least 3 values so we can calculate a meaningful spread.");
        return;
    }

    // 1. RUN ASSUMPTIONS (Building the Evidence Board)
    const skewA = StatsLib.getSkewness(groupA);
    const skewB = StatsLib.getSkewness(groupB);
    const normA = StatsLib.checkNormality(groupA);
    const normB = StatsLib.checkNormality(groupB);

    // Equality of Variances (The F-Test)
    const varA = StatsLib.getVariance(groupA);
    const varB = StatsLib.getVariance(groupB);
    const fRatio = varA > varB ? varA / varB : varB / varA;
    const variancesUnequal = fRatio > 4; // A common threshold for Welch recommendation

    // 2. UPDATE THE EVIDENCE BOARD (Pedagogical & Accessible)
    document.getElementById('evidenceBody').innerHTML = `
        <tr>
            <td><strong>Symmetry (Skewness)</strong><br>Checking if your data is balanced or leaning too far to one side.</td>
            <td class="${skewA.isSignificant ? 'v-fail' : 'v-pass'}">Group A: ${skewA.z} (Z)<br>Group B: ${skewB.z} (Z)</td>
            <td>${skewA.isSignificant || skewB.isSignificant ? "Leaning: Data is skewed." : "Symmetrical: Data is balanced."}</td>
        </tr>
        <tr>
            <td><strong>Normality Check</strong><br>Testing if the data fits the classic 'Bell Curve' shape.</td>
            <td class="${normA.isNormal && normB.isNormal ? 'v-pass' : 'v-fail'}">A: p=${normA.pValue}<br>B: p=${normB.pValue}</td>
            <td>${normA.isNormal && normB.isNormal ? "Normal: Fits the bell curve." : "Non-Normal: Does not fit the curve."}</td>
        </tr>
        <tr>
            <td><strong>Equality of Variances</strong><br>Comparing the 'spread' (variance) of Group A vs Group B.</td>
            <td class="${variancesUnequal ? 'v-fail' : 'v-pass'}">F-Ratio = ${fRatio.toFixed(2)}</td>
            <td>${variancesUnequal ? "Unequal Spread: One group is much wider." : "Equal Spread: Groups have similar widths."}</td>
        </tr>
    `;

    // 3. THE CONSULTANT'S PATHWAY ADVICE
    const adviceDiv = document.getElementById('consultantAdvice');
    const isNormal = normA.isNormal && normB.isNormal && !skewA.isSignificant && !skewB.isSignificant;
    
    let adviceHTML = "";

    if (isNormal && !variancesUnequal) {
        adviceHTML = `
            <div class="advice-card pass">
                <h4>Recommendation: Standard Independent T-Test</h4>
                <p><strong>The Logic:</strong> Your data is symmetrical, follows the bell curve, and both groups have a similar spread. This is the "Gold Standard" scenario where comparing averages is very powerful.</p>
            </div>`;
    } else if (isNormal && variancesUnequal) {
        adviceHTML = `
            <div class="advice-card warning">
                <h4>Recommendation: Welch's T-Test</h4>
                <p><strong>The Logic:</strong> Your data is normal, but the 'spread' is different between groups. <strong>Welch's T-Test</strong> is a robust calculation that adjusts the degrees of freedom to ensure the group with more variation doesn't drown out the other.</p>
            </div>`;
    } else {
        adviceHTML = `
            <div class="advice-card warning">
                <h4>Recommendation: Mann-Whitney U Test</h4>
                <p><strong>The Logic:</strong> Your data doesn't fit the bell curve or is leaning (skewed). A T-test might be misled by extreme scores here. The <strong>Mann-Whitney U</strong> is safer because it compares the 'ranks' (order) of the data rather than the averages.</p>
            </div>`;
    }

    adviceDiv.innerHTML = adviceHTML;
    document.getElementById('evidenceBoard').style.display = 'block';
    
    // 4. ACTION BUTTONS
    document.getElementById('testButtons').innerHTML = `
        <p><strong>Based on the evidence above, which analysis would you like to execute?</strong></p>
        <button class="btn-primary" onclick="runFinalTest('t')">Execute Welch's T-Test</button>
        <button class="btn-primary" onclick="runFinalTest('u')" style="margin-left:10px;">Execute Mann-Whitney U</button>
    `;
});

window.runFinalTest = function(type) {
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);
    const output = document.getElementById('outputContent');
    document.getElementById('finalResults').style.display = 'block';

    // DESCRIPTIVE STATISTICS (The Foundation)
    const n1 = groupA.length, n2 = groupB.length;
    const m1 = StatsLib.getMean(groupA), m2 = StatsLib.getMean(groupB);
    const v1 = StatsLib.getVariance(groupA), v2 = StatsLib.getVariance(groupB);
    const sd1 = Math.sqrt(v1), sd2 = Math.sqrt(v2);

    let testName, statLine, pVal, effectSize, effectLabel, explanation;

    if (type === 't') {
        testName = "Welch's Independent T-Test";
        const se1 = v1/n1, se2 = v2/n2;
        const df = Math.pow(se1 + se2, 2) / (Math.pow(se1, 2)/(n1-1) + Math.pow(se2, 2)/(n2-1));
        const t = (m1 - m2) / Math.sqrt(se1 + se2);
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));
        
        // Cohen's d (Magnitude of difference)
        const sdPooled = Math.sqrt(((n1-1)*v1 + (n2-1)*v2) / (n1+n2-2));
        const d = (m1 - m2) / sdPooled;
        
        statLine = `t(${df.toFixed(2)}) = ${t.toFixed(3)}`;
        effectLabel = "Cohen's d";
        effectSize = Math.abs(d).toFixed(3);
        explanation = "This test evaluates the gap between the averages of your two groups while accounting for the 'noise' (variance) within each group.";
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
        
        // Rank-Biserial Correlation (r)
        const r = 1 - (2 * u1) / (n1 * n2);
        
        statLine = `U = ${u.toFixed(1)} (z = ${z.toFixed(3)})`;
        effectLabel = "Rank-Biserial r";
        effectSize = Math.abs(r).toFixed(3);
        explanation = "This test converts your values into ranks. It determines if one group's scores consistently outrank the other's, making it immune to the influence of outliers.";
    }

    output.innerHTML = `
        <div class="consultation-summary">
            <header>
                <h3>Analysis Results: ${testName}</h3>
                <p><em>${explanation}</em></p>
            </header>
            
            <section class="result-section">
                <h4>1. The Foundations (Descriptive Statistics)</h4>
                <p>To understand the difference, we must first look at the groups themselves:</p>
                <table>
                    <thead><tr><th>Group</th><th>N</th><th>Mean</th><th>SD</th></tr></thead>
                    <tbody>
                        <tr><td>Group A</td><td>${n1}</td><td>${m1.toFixed(2)}</td><td>${sd1.toFixed(2)}</td></tr>
                        <tr><td>Group B</td><td>${n2}</td><td>${m2.toFixed(2)}</td><td>${sd2.toFixed(2)}</td></tr>
                    </tbody>
                </table>
            </section>

            <section class="result-section">
                <h4>2. The Evidence (Inferential Statistics)</h4>
                <p><strong>Test Statistic:</strong> ${statLine}</p>
                <p><strong>Probability of Chance (p):</strong> ${pVal.toFixed(4)}</p>
                <p><strong>Magnitude of Difference (${effectLabel}):</strong> ${effectSize}</p>
                <div class="verdict-box">
                    ${pVal < 0.05 
                        ? "<strong>Verdict: Statistically Significant.</strong> The p-value is below .05, suggesting this difference is unlikely to be a fluke." 
                        : "<strong>Verdict: Not Significant.</strong> The p-value is above .05, meaning we cannot rule out random chance as the cause of this difference."}
                </div>
            </section>

            <div class="write-up-box">
                <h4>3. Technical Reporting Template</h4>
                <p>In a formal report, you would present these findings as follows:</p>
                <div class="code-block">
                    Group A (M=${m1.toFixed(2)}, SD=${sd1.toFixed(2)}) and Group B (M=${m2.toFixed(2)}, SD=${sd2.toFixed(2)}) 
                    showed a ${pVal < .05 ? 'significant' : 'non-significant'} difference; ${statLine}, p = ${pVal.toFixed(3)}, ${effectLabel} = ${effectSize}.
                </div>
            </div>
        </div>
    `;
    output.scrollIntoView({ behavior: 'smooth' });
};
