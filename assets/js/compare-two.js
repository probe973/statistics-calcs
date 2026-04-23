window.renderExecutionButtons = function() {
    var html = "<div style='margin-top:25px; padding:20px; background:#f8f9fa; border:1px solid #dee2e6; border-radius:8px;'>";
    html += "<h4>Step 2: Inferential Analysis</h4>";
    html += "<p style='font-size:0.9em; color:#666;'>Select the appropriate test based on the diagnostic evidence above.</p>";
    html += "<button class='btn-primary' onclick='runFinalAnalysis(\"student\")'>Student's T-Test</button> ";
    html += "<button class='btn-primary' onclick='runFinalAnalysis(\"welch\")'>Welch's T-Test</button> ";
    html += "<button class='btn-primary' onclick='runFinalAnalysis(\"u\")'>Mann-Whitney U</button>";
    html += "</div>";
    document.getElementById('testButtons').innerHTML = html;
};

window.runFinalAnalysis = function(type) {
    var groupA = StatsLib.parseData(document.getElementById('dataA').value);
    var groupB = StatsLib.parseData(document.getElementById('dataB').value);

    var n1 = groupA.length, n2 = groupB.length;
    var m1 = StatsLib.getMean(groupA), m2 = StatsLib.getMean(groupB);
    var v1 = StatsLib.getVariance(groupA), v2 = StatsLib.getVariance(groupB);

    var testName, statLine, pVal, logicExp;

    if (type === 'student') {
        testName = "Student's Independent Samples T-Test";
        var df = n1 + n2 - 2;
        var pooledVar = ((n1 - 1) * v1 + (n2 - 1) * v2) / df;
        var t = (m1 - m2) / Math.sqrt(pooledVar * (1/n1 + 1/n2));
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t))); 
        statLine = "t(" + df + ") = " + t.toFixed(3);
        logicExp = "This parametric procedure assumes normality and homogeneity of variance ($$ \sigma_1^2 = \sigma_2^2 $$).";
    } 
    else if (type === 'welch') {
        testName = "Welch's Unequal Variances T-Test";
        var se1 = v1/n1, se2 = v2/n2;
        var df = Math.pow(se1 + se2, 2) / (Math.pow(se1, 2)/(n1-1) + Math.pow(se2, 2)/(n2-1));
        var t = (m1 - m2) / Math.sqrt(se1 + se2);
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t)));
        statLine = "t(" + df.toFixed(2) + ") = " + t.toFixed(3);
        logicExp = "This variation of the T-test is robust against violations of the assumption of equal variances.";
    } 
    else {
        testName = "Mann-Whitney U Test";
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
        logicExp = "As a non-parametric alternative, this test evaluates whether the distributions of the two groups differ based on rank-order rather than means.";
    }

    var isSig = pVal < 0.05;
    var color = isSig ? "#27ae60" : "#c0392b";

    var resHtml = "<div style='border-left: 5px solid " + color + "; padding: 20px; background: #fff;'>";
    resHtml += "<h3>" + testName + "</h3>";
    resHtml += "<p><strong>Significance:</strong> <span style='color:" + color + "; font-weight:bold;'>" + (isSig ? "p < .05" : "p > .05") + "</span></p>";
    resHtml += "<p><strong>Test Statistic:</strong> " + statLine + "</p>";
    resHtml += "<p><strong>p-value:</strong> " + pVal.toFixed(4) + "</p>";
    resHtml += "<hr>";
    resHtml += "<h4>Statistical Interpretation</h4>";
    resHtml += "<p>" + logicExp + "</p>";
    resHtml += "<p>" + (isSig ? "The null hypothesis ($$ H_0 $$) is rejected. The data provide sufficient evidence to conclude that a statistically significant difference exists between the group distributions." : "The data fail to provide sufficient evidence to reject the null hypothesis ($$ H_0 $$). The observed difference is not statistically significant at the $\alpha = .05$ level.") + "</p>";
    resHtml += "</div>";

    document.getElementById('finalResults').style.display = 'block';
    document.getElementById('outputContent').innerHTML = resHtml;
    document.getElementById('finalResults').scrollIntoView({ behavior: 'smooth' });
};
