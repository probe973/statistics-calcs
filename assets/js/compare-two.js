/**
 * compare-two.js
 * The "Judge" - Executes the final statistical tests for two groups.
 */

window.renderExecutionButtons = function() {
    const btnContainer = document.getElementById('testButtons');
    btnContainer.innerHTML = `
        <div style="margin-top: 25px; padding: 20px; background: #f0f4f8; border-radius: 10px; border: 1px solid #d1d9e6;">
            <p style="margin-top:0;"><strong>Step 2: Execute the Test</strong></p>
            <p style="font-size: 0.9em; color: #555;">Choose the test recommended by the Evidence Board above.</p>
            <button class="btn-primary" onclick="runFinalAnalysis('student')">Student's T-Test</button>
            <button class="btn-primary" onclick="runFinalAnalysis('welch')" style="margin-left:10px;">Welch's T-Test</button>
            <button class="btn-primary" onclick="runFinalAnalysis('u')" style="margin-left:10px;">Mann-Whitney U</button>
        </div>
    `;
};

window.runFinalAnalysis = function(type) {
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);
    const output = document.getElementById('outputContent');
    document.getElementById('finalResults').style.display = 'block';

    const n1 = groupA.length, n2 = groupB.length;
    const m1 = StatsLib.getMean(groupA), m2 = StatsLib.getMean(groupB);
    const v1 = StatsLib.getVariance(groupA), v2 = StatsLib.getVariance(groupB);

    let testName, statLine, pVal, effectSize, effectLabel;

    if (type === 'student') {
        testName = "Student's T-Test (Equal Variance)";
        const df = n1 + n2 - 2;
        const pooledVar = ((n1 - 1) * v1 + (n2 - 1) * v2) / df;
        const t = (m1 - m2) / Math.sqrt(pooledVar * (1/n1 + 1/n2));
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));
        statLine = `t(${df}) = ${t.toFixed(3)}`;
        effectLabel = "Cohen's d";
        effectSize = Math.abs((m1 - m2) / Math.sqrt(pooledVar)).toFixed(3);
    } else if (type === 'welch') {
        testName = "Welch's T-Test (Unequal Variance)";
        const se1 = v1/n1, se2 = v2/n2;
        const df = Math.pow(se1 + se2, 2) / (Math.pow(se1, 2)/(n1-1) + Math.pow(se2, 2)/(n2-1));
        const t = (m1 - m2) / Math.sqrt(se1 + se2);
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));
        statLine = `t(${df.toFixed(2)}) = ${t.toFixed(3)}`;
        effectLabel = "Cohen's d";
        effectSize = Math.abs((m1 - m2) / Math.sqrt((v1 + v2) / 2)).toFixed(3);
    } else {
        testName = "Mann-Whitney U Test";
        const combined = [...groupA.map(v => ({v, g: 'a'})), ...groupB.map(v => ({v, g: 'b'}))].sort((x, y) => x.v - y.v);
        combined.forEach((d, i) => d.rank = i + 1);
        const r1 = combined.filter(d => d.g === 'a').reduce((s, d) => s + d.rank, 0);
        const u1 = r1 - (n1 * (n1 + 1)) / 2;
        const u2 = (n1 * n2) - u1;
        const u = Math.min(u1, u2);
        const mu = (n1 * n2) / 2;
        const sigma = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
        const z = (u - mu) / sigma;
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(z)));
        statLine = `U = ${u.toFixed(1)} (z = ${z.toFixed(3)})`;
        effectLabel = "Rank-Biserial r";
        effectSize = Math.abs(1 - (2 * u1) / (n1 * n2)).toFixed(3);
    }

    output.innerHTML = `
        <div class="final-report" style="background: white; border: 2px solid #007bff; padding: 20px; border-radius: 8px;">
            <h3 style="margin-top:0; color: #007bff;">${testName}</h3>
            <p><strong>Result:</strong> ${statLine}</p>
            <p><strong>p-value:</strong> ${pVal.toFixed(4)}</p>
            <p><strong>Effect Size (${effectLabel}):</strong> ${effectSize}</p>
            <hr>
            <p><strong>Conclusion:</strong> ${pVal < 0.05 ? 
                "The difference is statistically significant (Reject Null Hypothesis)." : 
                "The difference is not statistically significant (Fail to Reject Null Hypothesis)."}
            </p>
        </div>
    `;
    
    // Smooth scroll to results
    document.getElementById('finalResults').scrollIntoView({ behavior: 'smooth' });
};
