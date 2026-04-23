document.getElementById('analyzeBtn').addEventListener('click', function() {
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);

    if (groupA.length < 3 || groupB.length < 3) {
        alert("Please enter at least 3 numbers per group.");
        return;
    }

    // Diagnostics
    const swA = StatsLib.checkNormality(groupA);
    const swB = StatsLib.checkNormality(groupB);
    const varA = StatsLib.getVariance(groupA);
    const varB = StatsLib.getVariance(groupB);
    
    const fRatio = varA > varB ? varA / varB : varB / varA;
    const fPValue = StatsLib.getFProbability(fRatio, groupA.length-1, groupB.length-1);
    
    const variancesEqual = fPValue > 0.05;
    const isNormal = swA.isNormal && swB.isNormal;

    // UPDATE THE TABLE
    document.getElementById('evidenceBody').innerHTML = `
        <tr>
            <th>Test</th>
            <th>Group A</th>
            <th>Group B</th>
        </tr>
        <tr>
            <td><strong>Normality (p)</strong></td>
            <td class="${swA.isNormal ? 'v-pass' : 'v-fail'}">${swA.pValue}</td>
            <td class="${swB.isNormal ? 'v-pass' : 'v-fail'}">${swB.pValue}</td>
        </tr>
        <tr>
            <td><strong>Variance (p)</strong></td>
            <td colspan="2" style="text-align:center;" class="${variancesEqual ? 'v-pass' : 'v-fail'}">
                p = ${fPValue.toFixed(4)}
            </td>
        </tr>
    `;

    // THE EXPLANATION SECTION (The part I was ignoring)
    document.getElementById('consultantAdvice').innerHTML = `
        <div class="explanation-box" style="padding: 15px; background: #f9f9f9; border: 1px solid #ddd; margin-top: 20px;">
            <h4>How to Interpret the Evidence Board:</h4>
            <p>Before we pick a test, we have to check if your data follows the "rules" of standard statistics:</p>
            <ul>
                <li><strong>Normality:</strong> We use the Shapiro-Wilk test. If the p-value is <strong>greater than 0.05</strong>, your data looks like a bell curve. If it's lower, your data is "skewed" or has outliers.</li>
                <li><strong>Variance:</strong> We use the F-Test to see if the "width" of Group A is similar to Group B. If the p-value is <strong>greater than 0.05</strong>, we assume the groups are comparable in spread.</li>
            </ul>
            <p><strong>Conclusion:</strong> Because your data is <strong>${isNormal ? 'Normal' : 'Non-Normal'}</strong> and your variances are <strong>${variancesEqual ? 'Equal' : 'Unequal'}</strong>, the math recommends the <strong>${!isNormal ? "Mann-Whitney U" : (variancesEqual ? "Student's T-Test" : "Welch's T-Test")}</strong>.</p>
        </div>
    `;

    document.getElementById('evidenceBoard').style.display = 'block';
    
    if (typeof window.renderExecutionButtons === 'function') {
        window.renderExecutionButtons();
    }
});
