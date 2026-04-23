document.getElementById('analyzeBtn').addEventListener('click', function() {
    // 1. Data Retrieval
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);

    if (groupA.length < 3 || groupB.length < 3) {
        alert("Please enter at least 3 numbers per group.");
        return;
    }

    // 2. Comprehensive Diagnostics
    const skewA = StatsLib.getSkewness(groupA);
    const skewB = StatsLib.getSkewness(groupB);
    const swA = StatsLib.checkNormality(groupA);
    const swB = StatsLib.checkNormality(groupB);
    const varA = StatsLib.getVariance(groupA);
    const varB = StatsLib.getVariance(groupB);

    // F-Test Logic
    const fRatio = varA > varB ? varA / varB : varB / varA;
    const df1 = varA > varB ? groupA.length - 1 : groupB.length - 1;
    const df2 = varA > varB ? groupB.length - 1 : groupA.length - 1;
    const fPValue = StatsLib.getFProbability(fRatio, df1, df2);
    
    const variancesEqual = fPValue > 0.05;
    const isNormal = swA.isNormal && swB.isNormal && !skewA.isSignificant && !skewB.isSignificant;

    // 3. The Full Evidence Board Table
    document.getElementById('evidenceBody').innerHTML = `
        <tr>
            <th>Diagnostic Metric</th>
            <th>Group A Results</th>
            <th>Group B Results</th>
        </tr>
        <tr>
            <td><strong>Z-Skew</strong> (Symmetry)</td>
            <td>${skewA.z}</td>
            <td>${skewB.z}</td>
        </tr>
        <tr>
            <td><strong>Shapiro-Wilk (p)</strong> (Normality)</td>
            <td class="${swA.isNormal ? 'v-pass' : 'v-fail'}">${Number(swA.pValue).toFixed(4)}</td>
            <td class="${swB.isNormal ? 'v-pass' : 'v-fail'}">${Number(swB.pValue).toFixed(4)}</td>
        </tr>
        <tr>
            <td><strong>F-Test (p)</strong> (Equal Variance)</td>
            <td colspan="2" style="text-align:center;" class="${variancesEqual ? 'v-pass' : 'v-fail'}">
                F(${df1}, ${df2}) = ${fRatio.toFixed(2)}, p = ${fPValue.toFixed(4)}
            </td>
        </tr>
    `;

    // 4. Detailed Explanations
    document.getElementById('consultantAdvice').innerHTML = `
        <div class="logic-container" style="margin-top: 20px; padding: 15px; border: 1px solid #ddd; background: #f9f9f9;">
            <h4>How to interpret these results:</h4>
            <ul style="line-height: 1.6;">
                <li><strong>Z-Skew:</strong> If the value is outside <strong>±1.96</strong>, your data is too "leaning" for a standard T-test.</li>
                <li><strong>Shapiro-Wilk:</strong> A <strong>p > .05</strong> means we assume a Normal distribution.</li>
                <li><strong>F-Test:</strong> A <strong>p > .05</strong> means the two groups have similar spreads (Homogeneity).</li>
            </ul>
            <hr>
            <p><strong>Recommendation:</strong> Use the <strong>${!isNormal ? "Mann-Whitney U" : (variancesEqual ? "Student's T-Test" : "Welch's T-Test")}</strong>.</p>
        </div>
    `;

    document.getElementById('evidenceBoard').style.display = 'block';
    
    // 5. TRIGGER THE BUTTONS (This makes Step 2 appear)
    if (typeof window.renderExecutionButtons === 'function') {
        window.renderExecutionButtons();
    }
});
