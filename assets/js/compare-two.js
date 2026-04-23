window.renderExecutionButtons = function() {
    var html = "<div style='margin-top:25px; padding:20px; background:#f8f9fa; border:1px solid #dee2e6; border-radius:8px;'>";
    html += "<h4>Step 2: Run Statistical Test</h4>";
    html += "<p style='font-size:0.9em; color:#666;'>Choose the test recommended by the diagnostics above.</p>";
    html += "<button class='btn-primary' onclick='runFinalAnalysis(\"student\")'>Student's T-Test</button> ";
    html += "<button class='btn-primary' onclick='runFinalAnalysis(\"welch\")'>Welch's T-Test</button> ";
    html += "<button class='btn-primary' onclick='runFinalAnalysis(\"u\")'>Mann-Whitney U</button>";
    html += "</div>";
    document.getElementById('testButtons').innerHTML = html;
};

window.runFinalAnalysis = function(type) {
    var valA = document.getElementById('dataA').value;
    var valB = document.getElementById('dataB').value;
    var groupA = StatsLib.parseData(valA);
    var groupB = StatsLib.parseData(valB);

    var n1 = groupA.length, n2 = groupB.length;
    var m1 = StatsLib.getMean(groupA), m2 = StatsLib.getMean(groupB);
    var v1 = StatsLib.getVariance(groupA), v2 = StatsLib.getVariance(groupB);

    var testName, statLine, pVal, explanation;

    if (type === 'student') {
        testName = "Student's T-Test (Equal Variances)";
        var df = n1 + n2 - 2;
        var pooledVar = ((n1 - 1) * v1 + (n2 - 1) * v2) / df;
        var t = (m1 - m2) / Math.sqrt(pooledVar * (1/n1 + 1/n2));
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t))); 
        statLine = "t(" + df + ") = " + t.toFixed(3);
        explanation = "This test assumes both groups have the same spread and follow a normal distribution.";
    } 
    else if (type === 'welch') {
        testName = "Welch's T-Test (Unequal Variances)";
        var se1 = v1/n1, se2 = v2/n2;
        var df = Math.pow(se1 + se2, 2) / (Math.pow(se1, 2)/(n1-1) + Math.pow(se2, 2)/(n2-1));
        var t = (m1 - m2) / Math.sqrt(se1 + se2);
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));
        statLine = "t(" + df.toFixed(2) + ") = " + t.toFixed(3);
        explanation = "This test is more robust when your groups have different 'spreads' (variances).";
    } 
    else {
        testName = "Mann-Whitney U Test (Non-Parametric)";
        var combined = [];
        groupA.forEach(function(v){ combined.push({v: v, g: 'a'}); });
        groupB.forEach(function(v){ combined.push({v: v, g: 'b'}); });
        combined.sort(function(x, y){ return x.v - y.v; });
        combined.forEach(function(d, i){ d.rank = i + 1; });
        var r1 = 0;
        combined.forEach(function(d){ if(d.g === 'a') r1 += d.rank; });
        var u1 = r1 - (n1 * (n1 + 1)) / 2;
        var u = Math.min(u1, (n1 * n2) - u1);
        var mu = (n1 * n2) / 2;
        var sigma = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
        var z = (u - mu) / sigma;
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(z)));
        statLine = "U = " + u.toFixed(1) + " (z = " + z.toFixed(3) + ")";
        explanation = "This test is used because your data is skewed or non-normal. It compares 'ranks' rather than averages.";
    }

    var isSig = pVal < 0.05;
    var color = isSig ? "#27ae60" : "#c0392b";

    var resHtml = "<div style='border-left: 5px solid " + color + "; padding: 20px; background: #fff;'>";
    resHtml += "<h3>" + testName + "</h3>";
    resHtml += "<p><strong>Result:</strong> <span style='color:" + color + "; font-weight:bold;'>" + (isSig ? "Statistically Significant" : "Not Statistically Significant") + "</span></p>";
    resHtml += "<p><strong>Test Statistic:</strong> " + statLine + "</p>";
    resHtml += "<p><strong>p-value:</strong> " + pVal.toFixed(4) + "</p>";
    resHtml += "<hr>";
    resHtml += "<h4>What does this mean?</h4>";
    resHtml += "<p>" + explanation + "</p>";
    resHtml += "<p>" + (isSig ? "The difference between the two groups is unlikely to be due to chance. You can trust that the groups are actually different." : "The difference is small enough that it could just be random noise. You cannot claim the groups are different.") + "</p>";
    resHtml += "</div>";

    document.getElementById('finalResults').style.display = 'block';
    document.getElementById('outputContent').innerHTML = resHtml;
    document.getElementById('finalResults').scrollIntoView({ behavior: 'smooth' });
};
