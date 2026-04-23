document.getElementById('analyzeBtn').addEventListener('click', function() {
    // 1. UNIVERSAL DATA GRAB
    const inputElements = document.querySelectorAll('.data-input');
    const dataGroups = Array.from(inputElements)
        .map(el => StatsLib.parseData(el.value))
        .filter(arr => arr.length >= 3); 

    if (dataGroups.length < 2) {
        alert("Please provide data for at least two groups to compare.");
        return;
    }

    // 2. DYNAMIC TABLE GENERATION
    let tableHtml = `<tr><th>Diagnostic Metric</th>`;
    dataGroups.forEach((_, i) => {
        tableHtml += `<th>Group ${String.fromCharCode(65 + i)}</th>`;
    });
    tableHtml += `</tr>`;

    // Row: Z-Skew (Symmetry)
    tableHtml += `<tr><td><strong>Z-Skew</strong> (Symmetry)</td>`;
    dataGroups.forEach(group => {
        const skew = StatsLib.getSkewness(group);
        tableHtml += `<td>${skew.z}</td>`;
    });
    tableHtml += `</tr>`;

    // Row: Shapiro-Wilk (Normality)
    let allNormal = true;
    tableHtml += `<tr><td><strong>Shapiro-Wilk (p)</strong></td>`;
    dataGroups.forEach(group => {
        const sw = StatsLib.checkNormality(group);
        if (!sw.isNormal) allNormal = false;
        tableHtml += `<td class="${sw.isNormal ? 'v-pass' : 'v-fail'}">${Number(sw.pValue).toFixed(4)}</td>`;
    });
    tableHtml += `</tr>`;

    document.getElementById('evidenceBody').innerHTML = tableHtml;

    // 3. FULL EXPLANATIONS (Restored and Expanded)
    let adviceHtml = `
        <div class="explanation-box" style="padding: 20px; background: #f9f9f9; border: 1px solid #ddd; margin-top: 20px; border-radius: 8px;">
            <h4>Diagnostic Evidence for ${dataGroups.length} Groups:</h4>
            <p>We have checked the underlying "rules" of statistics to see which test is most accurate for your data:</p>
            <ul style="line-height: 1.6;">
                <li><strong>Normality:</strong> ${allNormal ? 'All groups appear to follow a <strong>Normal (Bell Curve)</strong> distribution.' : 'One or more groups are <strong>Non-Normal</strong>. This suggests outliers or skewed data.'}</li>
                <li><strong>Z-Skew:</strong> This measures the symmetry of your groups. Values between ±1.96 are considered ideal.</li>
            </ul>
            <hr style="margin: 15px 0;">
    `;

    // 4. TAILORED RECOMMENDATION BASED ON GROUP COUNT
    if (dataGroups.length === 2) {
        adviceHtml += `<p><strong>Recommendation:</strong> Use the <strong>${allNormal ? "T-Test" : "Mann-Whitney U"}</strong>. See Step 2 below to execute.</p>`;
    } else {
        adviceHtml += `<p><strong>Recommendation:</strong> Use <strong>${allNormal ? "One-Way ANOVA" : "Kruskal-Wallis"}</strong> for comparing ${dataGroups.length} groups.</p>`;
    }

    adviceHtml += `</div>`;
    document.getElementById('consultantAdvice').innerHTML = adviceHtml;

    // 5. TRIGGER BUTTONS
    document.getElementById('evidenceBoard').style.display = 'block';

    const testButtons = document.getElementById('testButtons');
    if (dataGroups.length === 2) {
        if (typeof window.renderExecutionButtons === 'function') {
            window.renderExecutionButtons();
        }
    } else {
        // Clear buttons if we have 3+ groups (prevents running a 2-group test on 3 groups)
        testButtons.innerHTML = `<p style="color: #666; font-style: italic;">Note: Testing logic for 3+ groups is handled in the ANOVA module.</p>`;
    }
});
