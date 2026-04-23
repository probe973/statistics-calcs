document.getElementById('analyzeBtn').addEventListener('click', function() {
    // 1. Data Retrieval
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);

    if (groupA.length < 3 || groupB.length < 3) {
        alert("Please enter at least 3 numbers per group.");
        return;
    }

    // 2. Calculations
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
    const isNormal = swA.isNormal && swB.isNormal && !skewA.isSignificant && !skewB.isSignificant;

    // 3. FULL TABLE (Restoring Z-Skew and Proper Formatting)
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

    // 4. THE EXPLANATIONS (Educational context for the Evidence Board)
    document.getElementById('consultantAdvice').innerHTML = `
        <div class="logic-container" style="margin-top: 20px; padding: 15px; border: 1px solid #ddd; background: #f9f9f9;">
            <h4>How to interpret these results:</h4>
            <p>We use these metrics to determine which final test is mathematically "honest" for your data.</p>
            <ul style="line-height: 1.6;">
                <li><strong>Z-Skew:</strong> Measures symmetry. A value between <strong>-1.96 and +1.96</strong> suggests the data is balanced.</li>
                <li><strong>Shapiro-Wilk (p):</strong> Tests for Normality. If <strong>p > .05</strong>, we assume the data follows a Bell Curve.</li>
                <li><strong>F-Test (p):</strong> Tests for Equality of Variance. It tells us if the "spread" of both groups is similar. If <strong>p > .05</strong>, variances are considered equal.</li>
            </ul>
            <hr>
            <p><strong>Recommendation:</strong> Use the <strong>${!isNormal ? "Mann-Whitney U" : (variancesEqual ? "Student's T-Test" : "Welch's T-Test")}</strong>.</p>
        </div>
    `;

    // Make the board visible
    document.getElementById('evidenceBoard').style.display = 'block';
    
    // 5. THE OPTION TO RUN THE TEST (Restoring the link to compare-two.js)
    if (typeof window.renderExecutionButtons === 'function') {
        window.renderExecutionButtons();
    }
});
