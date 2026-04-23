document.getElementById('analyzeBtn').addEventListener('click', function() {
    const groupA = StatsLib.parseData(document.getElementById('dataA').value);
    const groupB = StatsLib.parseData(document.getElementById('dataB').value);

    if (groupA.length < 3 || groupB.length < 3) {
        alert("Diagnostics require at least 3 numbers per group.");
        return;
    }

    const skewA = StatsLib.getSkewness(groupA);
    const skewB = StatsLib.getSkewness(groupB);
    const swA = StatsLib.checkNormality(groupA);
    const swB = StatsLib.checkNormality(groupB);
    const varA = StatsLib.getVariance(groupA);
    const varB = StatsLib.getVariance(groupB);
    const fRatio = varA > varB ? varA / varB : varB / varA;
    const fP = StatsLib.getFProbability(fRatio, groupA.length-1, groupB.length-1);

    // Populate Table
    document.getElementById('evidenceBody').innerHTML = `
        <tr><td><strong>Z-Skew</strong> (Symmetry)</td><td>${skewA.z}</td><td>${skewB.z}</td></tr>
        <tr><td><strong>Normality</strong> (Shapiro-Wilk p)</td><td>${Number(swA.pValue).toFixed(4)}</td><td>${Number(swB.pValue).toFixed(4)}</td></tr>
        <tr><td><strong>Variance</strong> (F-test p)</td><td colspan="2" style="text-align:center;">p = ${fP.toFixed(4)}</td></tr>
    `;

    // RESTORED: Deep Explanations
    let adviceHtml = `
        <div class="advice-content">
            <h4><i class="fas fa-microscope"></i> Diagnostic Interpretation</h4>
            <p><strong>Symmetry:</strong> ${Math.abs(skewA.z) < 1.96 && Math.abs(skewB.z) < 1.96 ? 
                "Both groups are balanced. The mean is a reliable center point." : 
                "Significant skew detected. The distribution is lopsided, which may bias a T-test."}</p>
            
            <p><strong>Normality:</strong> ${swA.isNormal && swB.isNormal ? 
                "Data follows a Normal (Bell Curve) distribution. Parametric testing is appropriate." : 
                "Non-normality detected. The 'Mann-Whitney U' test is recommended as it doesn't assume a bell curve."}</p>
            
            <p><strong>Variance:</strong> ${fP > 0.05 ? 
                "Groups have 'Homogeneity of Variance' (they spread similarly)." : 
                "Unequal variance detected. If running a T-test, <strong>Welch's T</strong> is mandatory to avoid false positives."}</p>
            
            <div class="recommendation-highlight" style="background: #e7f3ff; padding: 15px; border-left: 5px solid #2196F3; margin-top: 15px;">
                <strong>Strategist's Choice:</strong> Use the <strong>${!swA.isNormal || !swB.isNormal ? 'Mann-Whitney U' : (fP > 0.05 ? "Student's T-Test" : "Welch's T-Test")}</strong>.
            </div>
        </div>
    `;

    document.getElementById('consultantAdvice').innerHTML = adviceHtml;
    document.getElementById('evidenceBoard').style.display = 'block';

    if (typeof window.renderExecutionButtons === 'function') window.renderExecutionButtons();
});
