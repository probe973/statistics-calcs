document.getElementById('analyzeBtn').addEventListener('click', function() {
    const rawA = document.getElementById('dataA').value;
    const rawB = document.getElementById('dataB').value;
    
    const groupA = StatsLib.parseData(rawA);
    const groupB = StatsLib.parseData(rawB);

    if (groupA.length < 3 || groupB.length < 3) {
        alert("Please enter at least 3 numbers for each group.");
        return;
    }

    const skewA = StatsLib.getSkewness(groupA);
    const skewB = StatsLib.getSkewness(groupB);
    const normA = StatsLib.checkNormality(groupA);
    const normB = StatsLib.checkNormality(groupB);

    document.getElementById('evidenceBody').innerHTML = `
        <tr><td><strong>Skewness Z</strong></td><td>${skewA.z}</td><td>${skewB.z}</td></tr>
        <tr><td><strong>Normality (p)</strong></td><td>${normA.pValue}</td><td>${normB.pValue}</td></tr>
    `;

    const isNormal = normA.isNormal && normB.isNormal && !skewA.isSignificant && !skewB.isSignificant;
    const adviceDiv = document.getElementById('consultantAdvice');
    
    adviceDiv.innerHTML = isNormal 
        ? `<div style="color: green;"><strong>Recommendation:</strong> Your data meets the requirements for a <strong>T-test</strong>.</div>` 
        : `<div style="color: #856404;"><strong>Recommendation:</strong> Your data is skewed or non-normal. The <strong>Mann-Whitney U</strong> is a safer, more honest choice here.</div>`;

    document.getElementById('evidenceBoard').style.display = 'block';
    document.getElementById('testButtons').innerHTML = `
        <button class="btn-primary" onclick="runFinalTest('t')">Execute T-Test</button>
        <button class="btn-primary" onclick="runFinalTest('u')" style="margin-left:10px;">Execute Mann-Whitney U</button>
    `;
});

window.runFinalTest = function(type) {
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);
    const output = document.getElementById('outputContent');
    document.getElementById('finalResults').style.display = 'block';

    let pVal, testName, statVal, interpretation;

    if (type === 't') {
        testName = "Welch's T-Test";
        const n1 = groupA.length, n2 = groupB.length;
        const m1 = StatsLib.getMean(groupA), m2 = StatsLib.getMean(groupB);
        const v1 = StatsLib.getVariance(groupA), v2 = StatsLib.getVariance(groupB);
        const se = Math.sqrt((v1 / n1) + (v2 / n2));
        const t = (m1 - m2) / se;
        const df = Math.pow((v1/n1)+(v2/n2), 2) / ((Math.pow(v1/n1, 2)/(n1-1)) + (Math.pow(v2/n2, 2)/(n2-1)));
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));
        statVal = `t(${df.toFixed(2)}) = ${t.toFixed(3)}`;
    } else {
        testName = "Mann-Whitney U";
        const n1 = groupA.length, n2 = groupB.length;
        const combined = [...groupA.map(v => ({v, g: 'a'})), ...groupB.map(v => ({v, g: 'b'}))].sort((x, y) => x.v - y.v);
        combined.forEach((d, i) => d.rank = i + 1);
        const r1 = combined.filter(d => d.g === 'a').reduce((s, d) => s + d.rank, 0);
        const u1 = r1 - (n1 * (n1 + 1)) / 2;
        const u = Math.min(u1, (n1 * n2) - u1);
        const mu = (n1 * n2) / 2;
        const sigma = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs((u - mu) / sigma)));
        statVal = `U = ${u}`;
    }

    interpretation = pVal < 0.05 
        ? `<strong style="color:green;">Significant Result (p < .05)</strong>: There is a statistically significant difference between your two groups.` 
        : `<strong style="color:red;">Non-Significant Result (p > .05)</strong>: There is no statistically significant difference found between your groups.`;

    output.innerHTML = `
        <div class="result-card">
            <h4>${testName} Analysis</h4>
            <p>${statVal}</p>
            <p><strong>p-value: ${pVal.toFixed(4)}</strong></p>
            <hr>
            <p>${interpretation}</p>
        </div>
    `;
    output.scrollIntoView({ behavior: 'smooth' });
};
