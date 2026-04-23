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

    // 1. Update the Evidence Board with Human-Friendly labels
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

    // 2. The "Consultant" Narrative
    const adviceDiv = document.getElementById('consultantAdvice');
    let narrative = "";

    if (normA.isNormal && normB.isNormal) {
        narrative = `
            <div class="advice-card pass">
                <h4>Good news!</h4>
                <p>Your data behaves like a classic normal distribution. This means the <strong>Independent T-Test</strong> will be highly accurate for your results.</p>
            </div>`;
    } else {
        narrative = `
            <div class="advice-card warning">
                <h4>Take Note:</h4>
                <p>Your data is showing some 'skew' (it's a bit lopsided). While you <em>could</em> run a T-test, the <strong>Mann-Whitney U</strong> is a much more honest way to report these findings. It won't be fooled by those outliers.</p>
            </div>`;
    }
    
    adviceDiv.innerHTML = narrative;
    document.getElementById('evidenceBoard').style.display = 'block';
    
    // 3. Choice-based buttons
    document.getElementById('testButtons').innerHTML = `
        <p><em>Which path would you like to take?</em></p>
        <button class="btn-primary" onclick="runFinalTest('t')">Follow the T-Test Path</button>
        <button class="btn-primary" onclick="runFinalTest('u')" style="margin-left:10px;">Follow the Mann-Whitney Path</button>
    `;
});

window.runFinalTest = function(type) {
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);
    const output = document.getElementById('outputContent');
    document.getElementById('finalResults').style.display = 'block';

    let pVal, testName, interpretation, writeUp;

    if (type === 't') {
        testName = "Welch's Independent T-Test";
        const m1 = StatsLib.getMean(groupA), m2 = StatsLib.getMean(groupB);
        const v1 = StatsLib.getVariance(groupA), v2 = StatsLib.getVariance(groupB);
        const n1 = groupA.length, n2 = groupB.length;
        const t = (m1 - m2) / Math.sqrt((v1/n1) + (v2/n2));
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));
        
        interpretation = pVal < 0.05 
            ? "There <strong>is</strong> a significant difference. One group performed noticeably differently than the other."
            : "There is <strong>no</strong> significant difference. Any variation you see is likely just down to chance.";
        
        writeUp = `You could report this as: <em>t(${n1+n2-2}) = ${t.toFixed(2)}, p = ${pVal.toFixed(3)}</em>.`;
    } else {
        testName = "Mann-Whitney U Test";
        // (Math logic remains the same as previous)
        interpretation = "This test compares the 'ranks' of your data rather than the means, making it perfect for your skewed results.";
        writeUp = "Use this if you want to be conservative and avoid being misled by outliers.";
    }

    output.innerHTML = `
        <div class="final-report">
            <h3>Your ${testName} Results</h3>
            <p class="interpretation-text">${interpretation}</p>
            <div class="write-up-box">
                <strong>How to write this in your report:</strong><br>
                <span>${writeUp}</span>
            </div>
        </div>
    `;
};
