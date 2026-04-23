window.renderExecutionButtons = function() {
    const btnContainer = document.getElementById('testButtons');
    btnContainer.innerHTML = `
        <div style="margin-top: 25px; padding: 20px; background: #eef2f7; border: 1px solid #007bff; border-radius: 8px;">
            <p><strong>Step 2: Execute Statistical Test</strong></p>
            <button class="btn-primary" onclick="runFinalAnalysis('student')">Run Student's T (Equal Variance)</button>
            <button class="btn-primary" onclick="runFinalAnalysis('welch')" style="margin-left:10px;">Run Welch's T (Unequal Variance)</button>
            <button class="btn-primary" onclick="runFinalAnalysis('u')" style="margin-left:10px;">Run Mann-Whitney U (Non-Parametric)</button>
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

    let testName, statLine, pVal;

    if (type === 'student') {
        testName = "Student's Independent T-Test";
        const df = n1 + n2 - 2;
        const pooledVar = ((n1 - 1) * v1 + (n2 - 1) * v2) / df;
        const t = (m1 - m2) / Math.sqrt(pooledVar * (1/n1 + 1/n2));
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t))); // Simplified for large N or Z-approx
        statLine = `t(${df}) = ${t.toFixed(3)}`;
    } else if (type === 'welch') {
        testName = "Welch's T-Test";
        const se1 = v1/n1, se2 = v2/n2;
        const df = Math.pow(se1 + se2, 2) / (Math.pow(se1, 2)/(n1-1) + Math.pow(se2, 2)/(n2-1));
        const t = (m1 - m2) / Math.sqrt(se1 + se2);
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));
        statLine = `t(${df.toFixed(2)}) = ${t.toFixed(3)}`;
    } else {
        testName = "Mann-Whitney U Test";
        // Simple U-test approximation
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
    }

    output.innerHTML = `
        <div style="border-left: 4px solid #007bff; padding-left: 15px; background: #fff; padding: 15px;">
            <h4 style="margin-top:0;">${testName} Results</h4>
            <p><strong>Test Statistic:</strong> ${statLine}</p>
            <p><strong>p-value:</strong> ${pVal.toFixed(4)}</p>
            <p><strong>Result:</strong> ${pVal < 0.05 ? "Statistically Significant" : "Not Statistically Significant"}</p>
        </div>
    `;
    
    // Auto-scroll to results
    document.getElementById('finalResults').scrollIntoView({ behavior: 'smooth' });
};
