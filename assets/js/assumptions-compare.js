document.getElementById('analyzeBtn').addEventListener('click', function() {
    var groupA = StatsLib.parseData(document.getElementById('dataA').value);
    var groupB = StatsLib.parseData(document.getElementById('dataB').value);

    if (groupA.length < 3 || groupB.length < 3) {
        alert("Diagnostics require at least 3 numbers per group.");
        return;
    }

    var skewA = StatsLib.getSkewness(groupA);
    var skewB = StatsLib.getSkewness(groupB);
    var swA = StatsLib.checkNormality(groupA);
    var swB = StatsLib.checkNormality(groupB);
    var varA = StatsLib.getVariance(groupA);
    var varB = StatsLib.getVariance(groupB);
    
    // F-Test for Variance
    var fRatio = varA > varB ? varA / varB : varB / varA;
    var fP = StatsLib.getFProbability(fRatio, groupA.length-1, groupB.length-1);

    // 1. Fill Table (Using standard strings)
    var tableRows = "<tr><td><strong>Z-Skew</strong> (Symmetry)</td><td>" + skewA.z + "</td><td>" + skewB.z + "</td></tr>";
    tableRows += "<tr><td><strong>Normality</strong> (p)</td><td>" + Number(swA.pValue).toFixed(4) + "</td><td>" + Number(swB.pValue).toFixed(4) + "</td></tr>";
    tableRows += "<tr><td><strong>Variance</strong> (p)</td><td colspan='2' style='text-align:center;'>p = " + fP.toFixed(4) + "</td></tr>";
    document.getElementById('evidenceBody').innerHTML = tableRows;

    // 2. Explanations (The missing content)
    var isNormal = (swA.isNormal && swB.isNormal);
    var isSymmetrical = (Math.abs(skewA.z) < 1.96 && Math.abs(skewB.z) < 1.96);
    var isVarEqual = (fP > 0.05);

    var advice = "<h3>Diagnostic Report</h3>";
    advice += "<p><strong>Symmetry:</strong> " + (isSymmetrical ? "Both groups are symmetrical." : "One or more groups are skewed, which can bias the results.") + "</p>";
    advice += "<p><strong>Normality:</strong> " + (isNormal ? "Data fits the Bell Curve (Normal)." : "Data is Non-Normal. Consider the Mann-Whitney U test.") + "</p>";
    advice += "<p><strong>Variance:</strong> " + (isVarEqual ? "Groups spread equally." : "Unequal spread detected; use Welch's T-test.") + "</p>";
    
    var rec = !isNormal ? "Mann-Whitney U" : (isVarEqual ? "Student's T-test" : "Welch's T-test");
    advice += "<div style='background:#e7f3ff; padding:10px; border-left:5px solid #2196F3;'><strong>Recommendation:</strong> Use the " + rec + "</div>";

    document.getElementById('consultantAdvice').innerHTML = advice;
    document.getElementById('evidenceBoard').style.display = 'block';

    if (typeof window.renderExecutionButtons === 'function') {
        window.renderExecutionButtons();
    }
});
