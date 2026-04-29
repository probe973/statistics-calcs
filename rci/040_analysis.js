document.getElementById('runRCI').addEventListener('click', function() {
    // 1. DATA RECOVERY
    const rawData = sessionStorage.getItem('sharedProjectData');
    const hasHeaders = sessionStorage.getItem('hasHeaders') === 'true';
    const savedNames = JSON.parse(sessionStorage.getItem('variableNames') || '[]');
    const rows = rawData.trim().split('\n').map(r => r.split('\t'));
    const dataRows = hasHeaders ? rows.slice(1) : rows;

    // 2. INPUT RECOVERY
    const preIndex = parseInt(document.getElementById('preVar').value);
    const postIndex = parseInt(document.getElementById('postVar').value);
    const reliability = parseFloat(document.getElementById('reliability').value);
    const measureName = document.getElementById('measureName').value || "the measure";
    const sdSource = document.getElementById('sdSource').value;
    const direction = document.getElementById('direction').value;

    // 3. STATS ENGINE
    const preScores = dataRows.map(row => parseFloat(row[preIndex])).filter(n => !isNaN(n));
    const postScores = dataRows.map(row => parseFloat(row[postIndex])).filter(n => !isNaN(n));
    const n = preScores.length;

    if (n === 0 || isNaN(reliability)) {
        alert("Please ensure data is loaded and reliability is entered.");
        return;
    }

    const preMean = preScores.reduce((a, b) => a + b, 0) / n;
    const postMean = postScores.reduce((a, b) => a + b, 0) / postScores.length;
    const preSD = Math.sqrt(preScores.map(x => Math.pow(x - preMean, 2)).reduce((a, b) => a + b) / n);
    const postSD = Math.sqrt(postScores.map(x => Math.pow(x - postMean, 2)).reduce((a, b) => a + b) / postScores.length);
    
    // Mean Difference & Cohen's d logic
    const changeScores = dataRows.map(row => parseFloat(row[postIndex]) - parseFloat(row[preIndex])).filter(n => !isNaN(n));
    const meanDiff = postMean - preMean;
    const sdDiff = Math.sqrt(changeScores.map(x => Math.pow(x - meanDiff, 2)).reduce((a, b) => a + b) / n);
    const cohensD = sdDiff !== 0 ? (meanDiff / sdDiff) : 0;

    // Thresholds
    let usedSD = (sdSource === 'manual') ? (parseFloat(document.getElementById('manualSD').value) || preSD) : preSD;
    const sDiff = Math.sqrt(2 * Math.pow(usedSD * Math.sqrt(1 - reliability), 2));
    const rcThreshold = 1.96 * sDiff;

    // CSC Threshold Logic
    const showCSC = document.getElementById('doCSC').checked;
    const cscMethod = document.getElementById('cscCriterion').value;
    let activeThreshold = null;
    if (showCSC && cscMethod) {
        const cMean = parseFloat(document.getElementById('clinicalMean').value) || preMean;
        const cSD = parseFloat(document.getElementById('clinicalSD').value) || preSD;
        if (cscMethod === 'External') activeThreshold = parseFloat(document.getElementById('externalValue').value);
        else if (cscMethod === 'A') activeThreshold = (direction === 'decrease') ? (cMean - (2 * cSD)) : (cMean + (2 * cSD));
        else if (cscMethod === 'B' || cscMethod === 'C') {
            const hMean = parseFloat(document.getElementById('healthyMean').value);
            const hSD = parseFloat(document.getElementById('healthySD').value);
            if (cscMethod === 'B') activeThreshold = (direction === 'decrease') ? (hMean + (2 * hSD)) : (hMean - (2 * hSD));
            else activeThreshold = ((cSD * hMean) + (hSD * cMean)) / (cSD + hSD);
        }
    }
    const threshDisp = (activeThreshold !== null) ? activeThreshold.toFixed(2) : "N/A";

    // 4. CLASSIFICATION LOOP (Restored)
    let countImp = 0, countDet = 0, countNC = 0, countCSC = 0;
    dataRows.forEach(row => {
        const pre = parseFloat(row[preIndex]);
        const post = parseFloat(row[postIndex]);
        if (isNaN(pre) || isNaN(post)) return;
        const rawChange = post - pre;
        const rciScore = rawChange / sDiff;
        let relImp = false;
        if (Math.abs(rciScore) >= 1.96) {
            const improved = (direction === 'decrease' && rawChange < 0) || (direction === 'increase' && rawChange > 0);
            if (improved) { countImp++; relImp = true; } else { countDet++; }
        } else { countNC++; }
        if (showCSC && activeThreshold !== null && relImp) {
            const startClin = (direction === 'decrease' && pre > activeThreshold) || (direction === 'increase' && pre < activeThreshold);
            const endHealthy = (direction === 'decrease' && post <= activeThreshold) || (direction === 'increase' && post >= activeThreshold);
            if (startClin && endHealthy) countCSC++;
        }
    });

    // 5. OUTPUT (Restored and Expanded)
    const statsDiv = document.getElementById('descriptiveStats');
    statsDiv.style.display = 'block';

    statsDiv.innerHTML = `
        <h3 style="margin-top:0; color: #005a9c;">Analysis of ${measureName}</h3>
        <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead><tr style="background:#f2f2f2;"><th style="padding:8px; border:1px solid #ccc; text-align: left;">Timepoint</th><th style="padding:8px; border:1px solid #ccc; text-align: left;">n</th><th style="padding:8px; border:1px solid #ccc; text-align: left;">Mean</th><th style="padding:8px; border:1px solid #ccc; text-align: left;">SD</th></tr></thead>
            <tbody>
                <tr><td style="padding:8px; border:1px solid #ccc;">${savedNames[preIndex] || "Pre-test"}</td><td style="padding:8px; border:1px solid #ccc;">${n}</td><td style="padding:8px; border:1px solid #ccc;">${preMean.toFixed(2)}</td><td style="padding:8px; border:1px solid #ccc;">${preSD.toFixed(2)}</td></tr>
                <tr><td style="padding:8px; border:1px solid #ccc;">${savedNames[postIndex] || "Post-test"}</td><td style="padding:8px; border:1px solid #ccc;">${postScores.length}</td><td style="padding:8px; border:1px solid #ccc;">${postMean.toFixed(2)}</td><td style="padding:8px; border:1px solid #ccc;">${postSD.toFixed(2)}</td></tr>
            </tbody>
        </table>

        <div style="background: #eef4f8; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #d0e0eb;">
            <p style="margin:0;"><strong>Mean Difference:</strong> ${meanDiff.toFixed(2)}</p>
            <p style="margin:5px 0 0 0;"><strong>Effect Size (Cohen's d):</strong> ${Math.abs(cohensD).toFixed(2)}</p>
        </div>

        <h3 style="color: #005a9c;">RCI & CSC Analysis</h3>
        <p style="font-size: 0.9em; color: #333;"><strong>Used Standard Deviation:</strong> ${usedSD.toFixed(2)}</p>
        <p style="font-size: 0.9em; color: #333;"><strong>RC Threshold: ${rcThreshold.toFixed(2)}</strong> points. The number of points an individual must change for it to be classed as reliable.</p>
        ${showCSC ? `<p style="font-size: 0.9em; color: #333;"><strong>CSC Threshold: ${threshDisp}</strong>. Individuals must make reliable change and cross this threshold to be classed as clinically significant.</p>` : ''}
        
        <table style="width:100%; border-collapse: collapse; margin-top: 15px;">
            <thead><tr style="background:#f2f2f2;"><th style="padding:8px; border:1px solid #ccc; text-align: left; width:50%;">Category</th><th style="padding:8px; border:1px solid #ccc; text-align: left; width:25%;">Count</th><th style="padding:8px; border:1px solid #ccc; text-align: left; width:25%;">Percentage</th></tr></thead>
            <tbody>
                <tr><td style="padding:8px; border:1px solid #ccc;">Reliable Improvement</td><td style="padding:8px; border:1px solid #ccc;">${countImp}</td><td style="padding:8px; border:1px solid #ccc;">${((countImp/n)*100).toFixed(1)}%</td></tr>
                <tr><td style="padding:8px; border:1px solid #ccc;">No Reliable Change</td><td style="padding:8px; border:1px solid #ccc;">${countNC}</td><td style="padding:8px; border:1px solid #ccc;">${((countNC/n)*100).toFixed(1)}%</td></tr>
                <tr><td style="padding:8px; border:1px solid #ccc;">Reliable Deterioration</td><td style="padding:8px; border:1px solid #ccc;">${countDet}</td><td style="padding:8px; border:1px solid #ccc;">${((countDet/n)*100).toFixed(1)}%</td></tr>
                ${showCSC ? `<tr><td style="padding:8px; border:1px solid #ccc;">Clinically Significant Change (CSC)</td><td style="padding:8px; border:1px solid #ccc;">${countCSC}</td><td style="padding:8px; border:1px solid #ccc;">${((countCSC/n)*100).toFixed(1)}%</td></tr>` : ''}
            </tbody>
        </table>
    `;

    // Save state for Narrative/Chart/Table
    sessionStorage.setItem('rci_results', JSON.stringify({
        preIndex, postIndex, sDiff, rcThreshold, activeThreshold, direction, showCSC, measureName, n, 
        countImp, countNC, countDet, countCSC
    }));
});


window.dispatchEvent(new CustomEvent('analysisComplete'));
