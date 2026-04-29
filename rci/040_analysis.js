document.getElementById('runRCI').addEventListener('click', function() {
    // 1. DATA RECOVERY (From session storage)
    const rawData = sessionStorage.getItem('sharedProjectData');
    const hasHeaders = sessionStorage.getItem('hasHeaders') === 'true';
    const savedNames = JSON.parse(sessionStorage.getItem('variableNames') || '[]');
    
    const rows = rawData.trim().split('\n').map(r => r.split('\t'));
    const dataRows = hasHeaders ? rows.slice(1) : rows;

    // 2. INPUT RECOVERY
    const preIdx = parseInt(document.getElementById('preVar').value);
    const postIdx = parseInt(document.getElementById('postVar').value);
    const reliability = parseFloat(document.getElementById('reliability').value);
    const measureName = document.getElementById('measureName').value || "the measure";
    const sdSource = document.getElementById('sdSource').value;
    const direction = document.getElementById('direction').value;

    // 3. CALCULATE RAW ARRAYS
    const preScores = dataRows.map(row => parseFloat(row[preIdx])).filter(n => !isNaN(n));
    const postScores = dataRows.map(row => parseFloat(row[postIdx])).filter(n => !isNaN(n));
    const changeScores = dataRows.map(row => {
        const diff = parseFloat(row[postIdx]) - parseFloat(row[preIdx]);
        return isNaN(diff) ? null : diff;
    }).filter(n => n !== null);

    if (preScores.length === 0 || isNaN(reliability)) {
        alert("Please ensure data is loaded and reliability is entered.");
        return;
    }

    // 4. STATS ENGINE
    const n = preScores.length;
    const preMean = preScores.reduce((a, b) => a + b, 0) / n;
    const postMean = postScores.reduce((a, b) => a + b, 0) / n;
    const preSD = Math.sqrt(preScores.map(x => Math.pow(x - preMean, 2)).reduce((a, b) => a + b) / n);
    const postSD = Math.sqrt(postScores.map(x => Math.pow(x - postMean, 2)).reduce((a, b) => a + b) / n);
    
    // Mean Difference and Cohen's d (Your specific addition)
    const meanDiff = postMean - preMean;
    const sdDiff = Math.sqrt(changeScores.map(x => Math.pow(x - meanDiff, 2)).reduce((a, b) => a + b) / n);
    const cohensD = sdDiff !== 0 ? (meanDiff / sdDiff) : 0;

    // 5. RCI & CSC THRESHOLDS
    let usedSD = (sdSource === 'manual') ? (parseFloat(document.getElementById('manualSD').value) || preSD) : preSD;
    const SEM = usedSD * Math.sqrt(1 - reliability);
    const sDiff = Math.sqrt(2) * SEM;
    const rcThreshold = 1.96 * sDiff;

    // CSC Threshold Calculation (Mirroring your logic)
    const showCSC = document.getElementById('doCSC').checked;
    const cscMethod = document.getElementById('cscCriterion').value;
    let activeThreshold = null;

    if (showCSC && cscMethod) {
        const cMean = parseFloat(document.getElementById('clinicalMean').value) || preMean;
        const cSD = parseFloat(document.getElementById('clinicalSD').value) || preSD;
        if (cscMethod === 'External') {
            activeThreshold = parseFloat(document.getElementById('externalValue').value);
        } else if (cscMethod === 'A') {
            activeThreshold = (direction === 'decrease') ? (cMean - (2 * cSD)) : (cMean + (2 * cSD));
        } else if (cscMethod === 'B' || cscMethod === 'C') {
            const hMean = parseFloat(document.getElementById('healthyMean').value);
            const hSD = parseFloat(document.getElementById('healthySD').value);
            if (cscMethod === 'B') {
                activeThreshold = (direction === 'decrease') ? (hMean + (2 * hSD)) : (hMean - (2 * hSD));
            } else {
                activeThreshold = ((cSD * hMean) + (hSD * cMean)) / (cSD + hSD);
            }
        }
    }

    // 6. OUTPUT GENERATION
    const statsDiv = document.getElementById('descriptiveStats');
    statsDiv.style.display = 'block';

    statsDiv.innerHTML = `
        <h3 style="margin-top:0; color: #005a9c;">Analysis of ${measureName}</h3>
        <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead><tr style="background:#f2f2f2;">
                <th style="padding:8px; border:1px solid #ccc; text-align: left;">Timepoint</th>
                <th style="padding:8px; border:1px solid #ccc; text-align: left;">n</th>
                <th style="padding:8px; border:1px solid #ccc; text-align: left;">Mean</th>
                <th style="padding:8px; border:1px solid #ccc; text-align: left;">SD</th>
            </tr></thead>
            <tbody>
                <tr><td style="padding:8px; border:1px solid #ccc;">${savedNames[preIdx] || "Pre-test"}</td><td style="padding:8px; border:1px solid #ccc;">${n}</td><td style="padding:8px; border:1px solid #ccc;">${preMean.toFixed(2)}</td><td style="padding:8px; border:1px solid #ccc;">${preSD.toFixed(2)}</td></tr>
                <tr><td style="padding:8px; border:1px solid #ccc;">${savedNames[postIdx] || "Post-test"}</td><td style="padding:8px; border:1px solid #ccc;">${postScores.length}</td><td style="padding:8px; border:1px solid #ccc;">${postMean.toFixed(2)}</td><td style="padding:8px; border:1px solid #ccc;">${postSD.toFixed(2)}</td></tr>
            </tbody>
        </table>

        <div style="background: #eef4f8; padding: 15px; border-radius: 4px; margin-bottom: 20px; border: 1px solid #d0e0eb;">
            <p style="margin:0;"><strong>Mean Difference:</strong> ${meanDiff.toFixed(2)}</p>
            <p style="margin:5px 0 0 0;"><strong>Effect Size (Cohen's d<sub>av</sub>):</strong> ${Math.abs(cohensD).toFixed(2)}</p>
        </div>

        <h3 style="color: #005a9c;">RCI & CSC Analysis</h3>
        <p style="font-size: 0.9em; color: #333;"><strong>Used Standard Deviation:</strong> ${usedSD.toFixed(2)}</p>
        <p style="font-size: 0.9em; color: #333;"><strong>RC Threshold: ${rcThreshold.toFixed(2)}</strong> points.</p>
        ${showCSC && activeThreshold ? `<p style="font-size: 0.9em; color: #333;"><strong>CSC Threshold: ${activeThreshold.toFixed(2)}</strong>.</p>` : ''}
    `;

    // Save these calculated values to sessionStorage so future scripts (Chart/Table) can use them
    sessionStorage.setItem('rci_results', JSON.stringify({
        preIdx, postIdx, sDiff, rcThreshold, activeThreshold, direction, showCSC, measureName
    }));
});
