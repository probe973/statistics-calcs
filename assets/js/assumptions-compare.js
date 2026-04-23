/**
 * assumptions-compare.js
 * Handles diagnostics for Two-Group Comparisons (T-Tests / Mann-Whitney).
 */

document.getElementById('analyzeBtn').addEventListener('click', function() {
    // 1. Data Retrieval
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);

    if (groupA.length < 3 || groupB.length < 3) {
        alert("Please enter at least 3 numbers per group.");
        return;
    }

    // 2. Calculation Phase (Asking the 'Brain' for math)
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
    const isNormal = swA.isNormal && swB.isNormal && !skewA.isSignificant && !skewB.isSignificant;

    // 3. The Evidence Board (Updating the UI)
    document.getElementById('evidenceBody').innerHTML = `
        <tr>
            <th>Diagnostic</th>
            <th>Group A</th>
            <th>Group B</th>
        </tr>
        <tr>
            <td><strong>Z-Skew</strong> (Symmetry)</td>
            <td>${skewA.z}</td>
            <td>${skewB.z}</td>
        </tr>
        <tr>
            <td><strong>Shapiro-Wilk (p)</strong></td>
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

    // 4. The Explanations (Directly after the table)
    document.getElementById('consultantAdvice').innerHTML = `
        <div class="logic-container" style="margin-top:20px; padding:15px; border:1px solid #ddd; background: #fcfcfc;">
            <h4>What does this mean?</h4>
            <ul style="line-height: 1.5;">
                <li><strong>Z-Skew:</strong> If between -1.96 and +1.96, the data is symmetrical.</li>
                <li><strong>Shapiro-Wilk (p):</strong> If p > 0.05, the data follows a Normal "Bell Curve."</li>
                <li><strong>F-Test (p):</strong> This checks if both groups have a similar "spread." If p > 0.05, variances are equal.</li>
            </ul>
            <hr>
            <p><strong>Recommendation:</strong> Use the <strong>${!isNormal ? "Mann-Whitney U" : (variancesEqual ? "Student's T-Test" : "Welch's T-Test")}</strong>.</p>
        </div>
    `;

    document.getElementById('evidenceBoard').style.display = 'block';

    // 5. Hand-off to the Test Execution script
    if (typeof window.renderExecutionButtons === 'function') {
        window.renderExecutionButtons();
    }
});
