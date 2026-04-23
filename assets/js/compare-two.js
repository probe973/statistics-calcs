document.getElementById('analyzeBtn').addEventListener('click', function() {
    const rawA = document.getElementById('dataA').value;
    const rawB = document.getElementById('dataB').value;
    
    const groupA = StatsLib.parseData(rawA);
    const groupB = StatsLib.parseData(rawB);

    if (groupA.length < 3 || groupB.length < 3) {
        alert("Please enter at least 3 numbers for each group.");
        return;
    }

    // Assumptions from StatsLib
    const skewA = StatsLib.getSkewness(groupA);
    const skewB = StatsLib.getSkewness(groupB);
    const normA = StatsLib.checkNormality(groupA);
    const normB = StatsLib.checkNormality(groupB);

    // Update the Table
    document.getElementById('evidenceBody').innerHTML = `
        <tr>
            <td><strong>Skewness Z</strong></td>
            <td class="${skewA.isSignificant ? 'v-fail' : 'v-pass'}">${skewA.z}</td>
            <td class="${skewB.isSignificant ? 'v-fail' : 'v-pass'}">${skewB.z}</td>
        </tr>
        <tr>
            <td><strong>Normality (p)</strong></td>
            <td class="${normA.isNormal ? 'v-pass' : 'v-fail'}">${normA.pValue}</td>
            <td class="${normB.isNormal ? 'v-pass' : 'v-fail'}">${normB.pValue}</td>
        </tr>
    `;

    // The Consultant Advice
    const adviceDiv = document.getElementById('consultantAdvice');
    const isNormal = normA.isNormal && normB.isNormal && !skewA.isSignificant && !skewB.isSignificant;
    
    adviceDiv.innerHTML = isNormal 
        ? "<strong>Recommendation:</strong> Data looks Normal. Use the T-Test." 
        : "<strong>Recommendation:</strong> Data is Skewed/Non-Normal. Use Mann-Whitney U.";

    // Show the board and the action buttons
    document.getElementById('evidenceBoard').style.display = 'block';
    document.getElementById('testButtons').innerHTML = `
        <button class="btn-secondary" onclick="runFinalTest('t')">Execute T-Test</button>
        <button class="btn-secondary" onclick="runFinalTest('u')">Execute Mann-Whitney U</button>
    `;
});

// THIS IS THE MISSING MATH THAT MAKES THE BUTTONS WORK
window.runFinalTest = function(type) {
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);
    const output = document.getElementById('outputContent');
    document.getElementById('finalResults').style.display = 'block';

    if (type === 't') {
        // Welch's T-Test Logic
        const n1 = groupA.length, n2 = groupB.length;
        const m1 = StatsLib.getMean(groupA), m2 = StatsLib.getMean(groupB);
        const v1 = StatsLib.getVariance(groupA), v2 = StatsLib.getVariance(groupB);
        const se = Math.sqrt((v1 / n1) + (v2 / n2));
        const t = (m1 - m2) / se;
        const df = Math.pow((v1/n1)+(v2/n2), 2) / ((Math.pow(v1/n1, 2)/(n1-1)) + (Math.pow(v2/n2, 2)/(n2-1)));
        const p = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));

        output.innerHTML = `<h4>Welch's T-Test Results</h4>
                            <p><strong>t:</strong> ${t.toFixed(3)} | <strong>df:</strong> ${df.toFixed(2)}</p>
                            <p><strong>p-value:</strong> ${p.toFixed(4)}</p>`;
    } else {
        // Mann-Whitney U Logic
        const n1 = groupA.length, n2 = groupB.length;
        const combined = [...groupA.map(v => ({v, g: 'a'})), ...groupB.map(v => ({v, g: 'b'}))].sort((x, y) => x.v - y.v);
        combined.forEach((d, i) => d.rank = i + 1);
        const r1 = combined.filter(d => d.g === 'a').reduce((s, d) => s + d.rank, 0);
        const u1 = r1 - (n1 * (n1 + 1)) / 2;
        const u = Math.min(u1, (n1 * n2) - u1);
        const mu = (n1 * n2) / 2;
        const sigma = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
        const p = 2 * (1 - StatsLib.normalCDF(Math.abs((u - mu) / sigma)));

        output.innerHTML = `<h4>Mann-Whitney U Results</h4>
                            <p><strong>U:</strong> ${u} | <strong>p-value:</strong> ${p.toFixed(4)}</p>`;
    }
};
