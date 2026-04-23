document.getElementById('analyzeBtn').addEventListener('click', function() {
    // 1. Grab the raw data from the textareas
    const rawA = document.getElementById('dataA').value;
    const rawB = document.getElementById('dataB').value;
    
    // 2. Use the "Brain" to clean it
    const groupA = StatsLib.parseData(rawA);
    const groupB = StatsLib.parseData(rawB);

    // 3. Basic validation
    if (groupA.length < 3 || groupB.length < 3) {
        alert("Please enter at least 3 numbers for each group to perform an analysis.");
        return;
    }

    // 4. Run Assumption Checks using our StatsLib
    const skewA = StatsLib.getSkewness(groupA);
    const skewB = StatsLib.getSkewness(groupB);
    const normA = StatsLib.checkNormality(groupA);
    const normB = StatsLib.checkNormality(groupB);

    // 5. Update the Evidence Board Table
    const tbody = document.getElementById('evidenceBody');
    tbody.innerHTML = `
        <tr>
            <td><strong>Skewness Z-Score</strong><br><small>(Target: ±1.96)</small></td>
            <td class="${skewA.isSignificant ? 'v-fail' : 'v-pass'}">${skewA.z}</td>
            <td class="${skewB.isSignificant ? 'v-fail' : 'v-pass'}">${skewB.z}</td>
        </tr>
        <tr>
            <td><strong>Shapiro-Wilk Test</strong><br><small>(Normal if p > .05)</small></td>
            <td class="${normA.isNormal ? 'v-pass' : 'v-fail'}">p = ${normA.pValue}</td>
            <td class="${normB.isNormal ? 'v-pass' : 'v-fail'}">p = ${normB.pValue}</td>
        </tr>
    `;

    // 6. Show the board
    document.getElementById('evidenceBoard').style.display = 'block';

    // 7. Provide the "Consultant" Advice
    const adviceDiv = document.getElementById('consultantAdvice');
    let adviceHtml = "<h4>Recommendation:</h4>";

    if (normA.isNormal && normB.isNormal && !skewA.isSignificant && !skewB.isSignificant) {
        adviceHtml += "<p>Both groups appear normally distributed. The <strong>Independent T-test</strong> is appropriate.</p>";
    } else {
        adviceHtml += "<p>Data shows signs of non-normality. Consider the <strong>Mann-Whitney U</strong> test for more robust results.</p>";
    }
    adviceDiv.innerHTML = adviceHtml;

    // 8. Create the Test Action Buttons
    const btnRow = document.getElementById('testButtons');
    btnRow.innerHTML = `
        <button class="btn-secondary" onclick="runFinalTest('t')">Run Independent T-test</button>
        <button class="btn-secondary" onclick="runFinalTest('u')">Run Mann-Whitney U</button>
    `;
});

// Function to run the actual tests (called by the buttons above)
window.runFinalTest = function(testType) {
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);
    const output = document.getElementById('outputContent');
    let result;

    if (testType === 't') {
        result = StatsLib.runTTest(groupA, groupB);
        output.innerHTML = `<strong>Test:</strong> ${result.name}<br><strong>t:</strong> ${result.stat} | <strong>df:</strong> ${result.df} | <strong>p:</strong> ${result.p}`;
    } else {
        result = StatsLib.runMannWhitney(groupA, groupB);
        output.innerHTML = `<strong>Test:</strong> ${result.name}<br><strong>U:</strong> ${result.stat} | <strong>p:</strong> ${result.p}`;
    }

    document.getElementById('finalResults').style.display = 'block';
};
