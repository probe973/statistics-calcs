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

    var testName, statLine, pVal, effLabel, effVal, logicExp;

    if (type === 'student' || type === 'welch') {
        var diff = m1 - m2;
        var pooledSD = Math.sqrt(((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2));
        effLabel = "Cohen's d";
        effVal = (diff / pooledSD).toFixed(3);
        
        if (type === 'student') {
            testName = "Student's Independent Samples T-Test";
            var df = n1 + n2 - 2;
            var pooledVar = ((n1 - 1) * v1 + (n2 - 1) * v2) / df;
            var t = diff / Math.sqrt(pooledVar * (1/n1 + 1/n2));
            pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(t))); 
            statLine = "t(" + df + ") = " + t.toFixed(3);
            logicExp = "This procedure assumes homogeneity of variance and normality.";
        } else {
            testName = "Welch's Unequal Variances T-Test";
            var se1 = v1/n1, se2 = v2/n2;
            var dfW = Math.pow(se1 + se2, 2) / (Math.pow(se1, 2)/(n1-1) + Math.pow(se2, 2)/(n2-1));
            var tW = diff / Math.sqrt(se1 + se2);
            pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(tW)));
            statLine = "t(" + dfW.toFixed(2) + ") = " + tW.toFixed(3);
            logicExp = "This procedure is robust against violations of the equal variance assumption.";
        }
    } else {
        testName = "Mann-Whitney U Test";
        var combined = [];
        groupA.forEach(function(v){ combined.push({v: v, g: 'a'}); });
        groupB.forEach(function(v){ combined.push({v: v, g: 'b'}); });
        combined.sort(function(x, y){ return x.v - y.v; });
        combined.forEach(function(d, i){ d.rank = i + 1; });
        var r1 = 0;
        combined.forEach(function(d){ if(d.g === 'a') r1 += d.rank; });
        var u1 = r1 - (n1 * (n1 + 1)) / 2;
        var uVal = Math.min(u1, (n1 * n2) - u1);
        var z = (uVal - (n1 * n2 / 2)) / Math.sqrt(n1 * n2 * (n1 + n2 + 1) / 12);
        pVal = 2 * (1 - StatsLib.normalCDF(Math.abs(z)));
        statLine = "U = " + uVal.toFixed(1) + ", z = " + z.toFixed(3);
        effLabel = "Rank-Biserial Correlation (r)";
        effVal = (1 - (2 * uVal) / (n1 * n2)).toFixed(3);
        logicExp = "This non-parametric test evaluates differences in rank-order distributions.";
    }

    var isSig = pVal < 0.05;
    var report = "<div style='border-left: 5px solid " + (isSig ? "#27ae60" : "#c0392b") + "; padding: 20px; background: #fff;'>";
    report += "<h3>" + testName + "</h3>";
    report += "<p><strong>Significance:</strong> " + (isSig ? "p < .05" : "p > .05") + " (p = " + pVal.toFixed(4) + ")</p>";
    report += "<p><strong>Test Statistic:</strong> " + statLine + "</p>";
    report += "<p><strong>Effect Size (" + effLabel + "):</strong> " + effVal + "</p>";
    report += "<hr><h4>Statistical Write-up</h4>";
    report += "<p>" + logicExp + "</p>";
    report += "<p>" + (isSig ? "The null hypothesis is rejected. There is sufficient evidence to suggest a statistically significant difference between the group distributions." : "The data fail to provide sufficient evidence to reject the null hypothesis at the .05 alpha level. The observed difference is not statistically significant.") + "</p>";
    report += "</div>";

    document.getElementById('finalResults').style.display = 'block';
    document.getElementById('outputContent').innerHTML = report;
    document.getElementById('finalResults').scrollIntoView({ behavior: 'smooth' });
};
