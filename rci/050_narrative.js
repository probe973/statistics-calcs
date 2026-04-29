document.getElementById('runRCI').addEventListener('click', function() {
    // 1. Recover the calculated data from the previous step
    const results = JSON.parse(sessionStorage.getItem('rci_results'));
    const rawData = sessionStorage.getItem('sharedProjectData');
    const hasHeaders = sessionStorage.getItem('hasHeaders') === 'true';
    const savedNames = JSON.parse(sessionStorage.getItem('variableNames') || '[]');

    if (!results || !rawData) return;

    // 2. Extract specific counts (We need to re-run the classification loop)
    const rows = rawData.trim().split('\n').map(r => r.split('\t'));
    const dataRows = hasHeaders ? rows.slice(1) : rows;
    
    let countImp = 0, countDet = 0, countNC = 0, countCSC = 0;

    dataRows.forEach(row => {
        const pre = parseFloat(row[results.preIdx]);
        const post = parseFloat(row[results.postIdx]);
        if (isNaN(pre) || isNaN(post)) return;

        const rawChange = post - pre;
        const rciScore = rawChange / results.sDiff;

        let relImp = false;
        if (Math.abs(rciScore) >= 1.96) {
            const improved = (results.direction === 'decrease' && rawChange < 0) || (results.direction === 'increase' && rawChange > 0);
            if (improved) { countImp++; relImp = true; }
            else { countDet++; }
        } else {
            countNC++;
        }

        // CSC Check
        if (results.showCSC && results.activeThreshold !== null && relImp) {
            const startClin = (results.direction === 'decrease' && pre > results.activeThreshold) || (results.direction === 'increase' && pre < results.activeThreshold);
            const endHealthy = (results.direction === 'decrease' && post <= results.activeThreshold) || (results.direction === 'increase' && post >= results.activeThreshold);
            if (startClin && endHealthy) { countCSC++; }
        }
    });

    // 3. Generate the Narrative exactly as it was in rci-logic.js
    const reportDiv = document.getElementById('reportOutput');
    const pImp = ((countImp / results.n) * 100).toFixed(1);
    const pDet = ((countDet / results.n) * 100).toFixed(1);
    const pNC = ((countNC / results.n) * 100).toFixed(1);
    
    const preLabel = (savedNames[results.preIdx] || "Pre-Test");
    const postLabel = (savedNames[results.postIdx] || "Post-Test");

    let reportHTML = `
        <h3 style="margin-top:0; color:#333; border-bottom:1px solid #000; padding-bottom:5px;">Clinical Outcome Narrative</h3>
        <p>An analysis of clinical outcomes was conducted for the ${results.measureName} (n = ${results.n}). Reliability of change was assessed using the Reliable Change Index (RCI) to compare scores from ${preLabel} to ${postLabel}.</p>
        
        <p>Results indicated that ${countImp} participants (${pImp}%) demonstrated reliable improvement, exceeding the margin of measurement error. Conversely, ${countDet} participants (${pDet}%) demonstrated reliable deterioration, and ${countNC} participants (${pNC}%) showed no reliable change.</p>
    `;

    if (results.showCSC && results.activeThreshold) {
        const pCSC = ((countCSC / results.n) * 100).toFixed(1);
        reportHTML += `
            <p>Clinical significance was determined using a threshold of ${results.activeThreshold.toFixed(2)}. A total of ${countCSC} participants (${pCSC}%) met the criteria for clinically significant change, representing a transition from the clinical range to the functional population range.</p>
        `;
    }

    reportDiv.innerHTML = reportHTML;
    reportDiv.style.display = 'block';
});
