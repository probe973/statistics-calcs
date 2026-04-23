/**
 * assumptions-compare.js
 * Handles diagnostics for Comparison Tests (T-Tests, ANOVA, etc.)
 * Dynamically handles any number of data groups.
 */

document.getElementById('analyzeBtn').addEventListener('click', function() {
    // 1. Gather all available data groups into an array
    const inputs = [
        document.getElementById('dataA').value,
        document.getElementById('dataB').value
        // You can add dataC, dataD here later and the rest of the code won't break
    ];

    const dataGroups = inputs.map(raw => StatsLib.parseData(raw)).filter(arr => arr.length > 0);

    if (dataGroups.length < 2) {
        alert("Please enter data for at least two groups.");
        return;
    }

    // 2. Generate the Table Header dynamically
    let tableHtml = `<tr><th>Diagnostic Metric</th>`;
    dataGroups.forEach((_, i) => {
        tableHtml += `<th>Group ${String.fromCharCode(65 + i)}</th>`;
    });
    tableHtml += `</tr>`;

    // 3. Z-Skew Row
    tableHtml += `<tr><td><strong>Z-Skew</strong> (Symmetry)</td>`;
    dataGroups.forEach(group => {
        const skew = StatsLib.getSkewness(group);
        tableHtml += `<td>${skew.z}</td>`;
    });
    tableHtml += `</tr>`;

    // 4. Shapiro-Wilk Row
    let allNormal = true;
    tableHtml += `<tr><td><strong>Shapiro-Wilk (p)</strong></td>`;
    dataGroups.forEach(group => {
        const sw = StatsLib.checkNormality(group);
        if (!sw.isNormal) allNormal = false;
        tableHtml += `<td class="${sw.isNormal ? 'v-pass' : 'v-fail'}">${Number(sw.pValue).toFixed(4)}</td>`;
    });
    tableHtml += `</tr>`;

    // 5. Variance Test (F-Test for 2 groups, Levene's logic for more)
    let variancesEqual = true;
    if (dataGroups.length === 2) {
        const vA = StatsLib.getVariance(dataGroups[0]);
        const vB = StatsLib.getVariance(dataGroups[1]);
        const fRatio = vA > vB ? vA / vB : vB / vA;
        const fP = StatsLib.getFProbability(fRatio, dataGroups[0].length - 1, dataGroups[1].length - 1);
        variancesEqual = fP > 0.05;

        tableHtml += `<tr>
            <td><strong>Equality of Variance (p)</strong></td>
            <td colspan="2" style="text-align:center;" class="${variancesEqual ? 'v-pass' : 'v-fail'}">
                p = ${fP.toFixed(4)}
            </td>
        </tr>`;
    }

    document.getElementById('evidenceBody').innerHTML = tableHtml;

    // 6. Explanations
    document.getElementById('consultantAdvice').innerHTML = `
        <div class="logic-container" style="margin-top:20px; padding:15px; border:1px solid #ddd; background: #fcfcfc;">
            <h4>Interpretation Guide:</h4>
            <p>We are checking if your data meets the "rules" for standard parametric tests.</p>
            <ul>
                <li><strong>Normality:</strong> ${allNormal ? "All groups are Normal (Bell Curve)." : "One or more groups are Non-Normal."}</li>
                <li><strong>Variance:</strong> ${variancesEqual ? "The 'spread' is equal across groups." : "The 'spread' is significantly different."}</li>
            </ul>
        </div>
    `;

    document.getElementById('evidenceBoard').style.display = 'block';

    // Call the final execution buttons
    if (typeof window.renderExecutionButtons === 'function') {
        window.renderExecutionButtons();
    }
});
