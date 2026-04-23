document.getElementById('analyzeBtn').addEventListener('click', function() {
    const rawA = document.getElementById('dataA').value;
    const rawB = document.getElementById('dataB').value;
    const groupA = StatsLib.parseData(rawA);
    const groupB = StatsLib.parseData(rawB);

    if (groupA.length < 3 || groupB.length < 3) {
        alert("I need a bit more data to work with. Please ensure both groups have at least 3 values.");
        return;
    }

    const skewA = StatsLib.getSkewness(groupA);
    const skewB = StatsLib.getSkewness(groupB);
    const normA = StatsLib.checkNormality(groupA);
    const normB = StatsLib.checkNormality(groupB);

    // 1. Evidence Board (Detective Phase)
    document.getElementById('evidenceBody').innerHTML = `
        <tr>
            <td><strong>Symmetry (Skewness)</strong><br><small>Is the data balanced or leaning?</small></td>
            <td class="${skewA.isSignificant ? 'v-fail' : 'v-pass'}">${skewA.z} (Z-score)</td>
            <td class="${skewB.isSignificant ? 'v-fail' : 'v-pass'}">${skewB.z} (Z-score)</td>
        </tr>
        <tr>
            <td><strong>Normality Check</strong><br><small>Does it fit the 'Bell Curve'?</small></td>
            <td class="${normA.isNormal ? 'v-pass' : 'v-fail'}">p = ${normA.pValue}</td>
            <td class="${normB.isNormal ? 'v-pass' : 'v-fail'}">p = ${normB.pValue}</td>
        </tr>
    `;

    // 2. The Grounded Consultant's Advice (Removed "Good News")
    const adviceDiv = document.getElementById('consultantAdvice');
    const isNormal = normA.isNormal && normB.isNormal && !skewA.isSignificant && !skewB.isSignificant;
    
    adviceDiv.innerHTML = isNormal 
        ? `<div class="advice-card pass">
            <h4>Recommendation: Parametric Path</h4>
            <p>The data appears symmetrical and follows a normal distribution. A <strong>Welch's T-Test</strong> is the standard, robust choice here.</p>
           </div>`
        : `<div class="advice-card warning">
            <h4>Recommendation: Non-Parametric Path</h4>
            <p>One or more groups show significant skew or non-normality. The <strong>Mann-Whitney U</strong> test is recommended as it handles non-normal distributions more honestly.</p>
           </div>`;

    document.getElementById('evidenceBoard').style.display = 'block';
    
    document.getElementById('testButtons').innerHTML = `
        <p><em>Select the analysis to execute:</em></p>
        <button class="btn-primary" onclick="runFinalTest('t')">Execute Welch's T-Test</button>
        <button class="btn-primary" onclick="runFinalTest('u')" style="margin-left:10px;">Execute Mann-Whitney U</button>
    `;
});

window.runFinalTest = function(type) {
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);
    const output = document.getElementById('outputContent');
    document.getElementById('finalResults').style.display = 'block';

    // DESCRIPTIVES (The Foundation we discussed)
    const n1 = groupA.length, n2 = groupB.length;
    const m1 = StatsLib.getMean(groupA), m2 = StatsLib.getMean(groupB);
    const v1 = StatsLib.getVariance(groupA), v2 = StatsLib.getVariance(groupB);
    const sd1 = Math.sqrt(v1), sd2 = Math.sqrt(v2);

    let testName, statLine, pVal, effectSize, effectLabel, writeUp;

    if (type === 't') {
        testName = "Welch's Independent T-Test";
        const se1 = v1/n1, se2 = v2/n2;
        const df = Math.pow(se1 + se2, 2) / (Math.pow(se1, 2)/(n1-1) + Math.pow(se2, 2)/(n2-1));
        const t = (m1 - m2) / Math.sqrt(se1 + se2);
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));
        
        // Cohen's d (Magnitude)
        const sdPooled = Math.sqrt(((n1-1)*v1 + (n2-1)*v2) / (n1+n2-2));
        const d = (m1 - m2) / sdPooled;
        
        statLine = `t(${df.toFixed(2)}) = ${t.toFixed(3)}`;
        effectLabel = "Cohen's d";
        effectSize = Math.abs(d).toFixed(3);
        writeUp = `t(${df.toFixed(2)}) = ${t.toFixed(3)}, p = ${pVal.toFixed(3)}, d = ${effectSize}`;
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
        writeUp = `U = ${u.toFixed(1)}, p = ${pVal.toFixed(3)}, r = ${effectSize}`;
    }

    output.innerHTML = `
        <div class="final-report">
            <h3>Analysis Summary: ${testName}</h3>
            
            <section class="result-section">
                <h4>1. Descriptive Statistics</h4>
                <p>Group A: M = ${m1.toFixed(2)}, SD = ${sd1.toFixed(2)} (N=${n1})</p>
                <p>Group B: M = ${m2.toFixed(2)}, SD = ${sd2.toFixed(2)} (N=${n2})</p>
            </section>

            <section class="result-section">
                <h4>2. Inferential Results</h4>
                <p><strong>Statistic:</strong> ${statLine}</p>
                <p><strong>Probability of Chance (p):</strong> ${pVal.toFixed(4)}</p>
                <p><strong>Magnitude of Difference (${effectLabel}):</strong> ${effectSize}</p>
            </section>

            <div class="write-up-box">
                <h4>3. Technical Reporting Guide</h4>
                <code>Group A (M=${m1.toFixed(2)}, SD=${sd1.toFixed(2)}) and Group B (M=${m2.toFixed(2)}, SD=${sd2.toFixed(2)}) showed a ${pVal < .05 ? 'significant' : 'non-significant'} difference; ${writeUp}.</code>
            </div>
        </div>
    `;
};
