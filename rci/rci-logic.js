document.addEventListener('DOMContentLoaded', function() {
    const rawData = sessionStorage.getItem('sharedProjectData');
    const hasHeaders = sessionStorage.getItem('hasHeaders') === 'true';
    // Retrieve the names you typed on the first page
    const savedNames = JSON.parse(sessionStorage.getItem('variableNames') || '[]');

    if (!rawData) {
        alert("No data found. Returning to home page.");
        window.location.href = "../";
        return;
    }

    const rows = rawData.trim().split('\n').map(r => r.split('\t'));
    
    // DECISION LOGIC:
    // If we have saved names from the home page, use them.
    // Otherwise, use the first row of data (if headers exist).
    let headers = (savedNames.length > 0) ? savedNames : (hasHeaders ? rows[0] : rows[0].map((_, i) => `Col ${i+1}`));
    let dataRows = hasHeaders ? rows.slice(1) : rows;

    // --- STEP 1: POPULATE THE DATA TABLE ---
    const thead = document.getElementById('rciTableHead');
    const tbody = document.getElementById('rciTableBody');

    thead.innerHTML = `<tr>${headers.map(h => `<th style="padding:10px; border:1px solid #ccc;">${h}</th>`).join('')}</tr>`;
    tbody.innerHTML = dataRows.map(row => `
        <tr>${row.map(cell => `<td style="padding:8px; border:1px solid #eee;">${cell}</td>`).join('')}</tr>
    `).join('');

    // --- STEP 2: POPULATE DROPDOWNS ---
    const preSelect = document.getElementById('preVar');
    const postSelect = document.getElementById('postVar');
    headers.forEach((h, i) => {
        preSelect.add(new Option(h, i));
        postSelect.add(new Option(h, i));
    });

    // --- STEP 3: SD INPUT TOGGLE ---
    const sdSource = document.getElementById('sdSource');
    const manualSDContainer = document.getElementById('manualSDContainer');
    const manualSD = document.getElementById('manualSD');
    const clinicalSD = document.getElementById('clinicalSD');

    manualSD.addEventListener('input', () => { if(clinicalSD) clinicalSD.value = manualSD.value; });

    sdSource.addEventListener('change', () => {
    // Show the box only if 'manual' (Clinical Norms) is selected
    manualSDContainer.style.display = (sdSource.value === 'manual') ? 'block' : 'none';
});

    // --- STEP 4: PREPARE FOR RUN ANALYSIS ---
    // This variable allows the chart to refresh/update without refreshing the page
    let myChart = null;

document.getElementById('runRCI').addEventListener('click', function() {
    // 1. DATA AND DIV PREP
    const statsDiv = document.getElementById('descriptiveStats');
    const individualDiv = document.getElementById('individualResults');
    const resultsBody = document.getElementById('rciResultBody');
    const cscHeader = document.getElementById('cscHeader');
    const measureName = document.getElementById('measureName').value || "the measure";
    
    // 2. DATA EXTRACTION
    const preIndex = parseInt(document.getElementById('preVar').value);
    const postIndex = parseInt(document.getElementById('postVar').value);
    const preScores = dataRows.map(row => parseFloat(row[preIndex])).filter(n => !isNaN(n));
    const postScores = dataRows.map(row => parseFloat(row[postIndex])).filter(n => !isNaN(n));
    
    if (preScores.length === 0) {
        alert("Please select columns and ensure data is uploaded.");
        return;
    }

    const n = preScores.length;
    const preMean = StatsLib.mean(preScores);
    const preSD = StatsLib.standardDeviation(preScores);
    
    // 3. RCI MATH - RE-EVALUATE INPUTS (TWO-WAY TOGGLE FIX)
    const reliability = parseFloat(document.getElementById('reliability').value);
    const direction = document.getElementById('direction').value;
    const manualSDInput = document.getElementById('manualSD').value.trim();
    
    // THE FIX: If the box is empty or not a number, revert to sample SD.
    // This allows switching back and forth without "sticking".
    let usedSD;
    if (manualSDInput === "" || isNaN(parseFloat(manualSDInput))) {
        usedSD = preSD;
    } else {
        usedSD = parseFloat(manualSDInput);
    }
    
    const sDiff = Math.sqrt(2 * Math.pow(usedSD * Math.sqrt(1 - reliability), 2));
    const rcThreshold = 1.96 * sDiff;

    // 4. CSC MATH
    const showCSC = document.getElementById('doCSC').checked;
    let activeThreshold = null;

    if (showCSC) {
        const cscMethod = document.getElementById('cscCriterion').value;
        const cMeanInput = parseFloat(document.getElementById('clinicalMean').value);
        const cSDInput = parseFloat(document.getElementById('clinicalSD').value);
        const cMean = !isNaN(cMeanInput) ? cMeanInput : preMean;
        const cSD = !isNaN(cSDInput) ? cSDInput : preSD;

        if (cscMethod === 'External') {
            activeThreshold = parseFloat(document.getElementById('externalValue').value);
        } else if (cscMethod === 'A') {
            activeThreshold = (direction === 'decrease') ? (cMean - (2 * (cSD || usedSD))) : (cMean + (2 * (cSD || usedSD)));
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

    // 5. CHART DATA & DRAWING (SQUARE, CLEAN, NO "y=x")
    const chartDataPoints = dataRows.map(row => {
        const pre = parseFloat(row[preIndex]);
        const post = parseFloat(row[postIndex]);
        if (isNaN(pre) || isNaN(post)) return null;
        const rawChange = post - pre;
        const rciScore = rawChange / sDiff;
        let pColor = '#9e9e9e'; 
        if (Math.abs(rciScore) >= 1.96) {
            const improved = (direction === 'decrease' && rawChange < 0) || (direction === 'increase' && rawChange > 0);
            pColor = improved ? '#2e7d32' : '#c62828'; 
        }
        return { x: pre, y: post, color: pColor };
    }).filter(p => p !== null);

    const ctx = document.getElementById('rciChart').getContext('2d');
    if (myChart) { myChart.destroy(); }

    const rawMax = Math.max(...chartDataPoints.map(p => Math.max(p.x, p.y)), activeThreshold || 0);
    const maxVal = Math.ceil((rawMax + 2) / 10) * 10;

    myChart = new Chart(ctx, {
        data: {
            datasets: [
                { type: 'scatter', label: 'Reliable Improvement', data: chartDataPoints.filter(p => p.color === '#2e7d32'), backgroundColor: '#2e7d32', pointRadius: 3.5 },
                { type: 'scatter', label: 'Reliable Deterioration', data: chartDataPoints.filter(p => p.color === '#c62828'), backgroundColor: '#c62828', pointRadius: 3.5 },
                { type: 'scatter', label: 'No Reliable Change', data: chartDataPoints.filter(p => p.color === '#9e9e9e'), backgroundColor: '#9e9e9e', pointRadius: 3.5 },
                { type: 'line', label: 'No Change', data: [{x: 0, y: 0}, {x: maxVal, y: maxVal}], borderColor: '#212121', borderDash: [5, 5], borderWidth: 1.5, pointRadius: 0, fill: false },
                { type: 'line', label: 'RC Boundaries', data: [{x: 0, y: rcThreshold}, {x: maxVal - rcThreshold, y: maxVal}], borderColor: '#bdbdbd', borderWidth: 1, pointRadius: 0, fill: false },
                { type: 'line', label: 'RC Lower (Hidden)', data: [{x: rcThreshold, y: 0}, {x: maxVal, y: maxVal - rcThreshold}], borderColor: '#bdbdbd', borderWidth: 1, pointRadius: 0, fill: false }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            scales: {
                x: { title: { display: true, text: 'Pre-Test (' + measureName + ')', font: { weight: 'bold' } }, min: 0, max: maxVal, ticks: { stepSize: 10 } },
                y: { title: { display: true, text: 'Post-Test (' + measureName + ')', font: { weight: 'bold' } }, min: 0, max: maxVal, ticks: { stepSize: 10 } }
            },
            plugins: {
                legend: { 
                    display: true, 
                    position: 'bottom',
                    labels: {
                        filter: function(item) { return item.text && !item.text.includes('(Hidden)'); },
                        generateLabels: function(chart) {
                            const original = Chart.defaults.plugins.legend.labels.generateLabels;
                            const labels = original.call(this, chart);
                            labels.forEach(label => {
                                label.pointStyle = (label.text.includes('Reliable')) ? 'circle' : 'line';
                            });
                            return labels;
                        },
                        usePointStyle: true
                    }
                }
            }
        }
    });

    if (showCSC && activeThreshold) {
        myChart.data.datasets.push(
            { type: 'line', label: 'CSC Threshold', data: [{x: 0, y: activeThreshold}, {x: maxVal, y: activeThreshold}], borderColor: '#1565c0', borderWidth: 1.5, pointRadius: 0, fill: false },
            { type: 'line', label: 'CSC Vert (Hidden)', data: [{x: activeThreshold, y: 0}, {x: activeThreshold, y: maxVal}], borderColor: '#1565c0', borderWidth: 1.5, pointRadius: 0, fill: false }
        );
        myChart.update();
    }

    // 6. INDIVIDUAL TABLE
    let countImp = 0, countDet = 0, countNC = 0, countCSC = 0;
    cscHeader.style.display = showCSC ? 'table-cell' : 'none';
    const headers = document.querySelectorAll('#individualResults th');
    headers.forEach(th => th.style.textAlign = "left");

    resultsBody.innerHTML = dataRows.map((row, index) => {
        const pre = parseFloat(row[preIndex]);
        const post = parseFloat(row[postIndex]);
        if (isNaN(pre) || isNaN(post)) return '';
        const rawChange = post - pre;
        const rciScore = rawChange / sDiff;
        let status = "No Change";
        let relImp = false;
        
        if (Math.abs(rciScore) >= 1.96) {
            const improved = (direction === 'decrease' && rawChange < 0) || (direction === 'increase' && rawChange > 0);
            if (improved) { status = "Reliable Improvement"; countImp++; relImp = true; }
            else { status = "Reliable Deterioration"; countDet++; }
        } else { countNC++; }

        let cscCell = "";
        if (showCSC && activeThreshold !== null) {
            let metCSC = false;
            if (relImp) {
                const startClin = (direction === 'decrease' && pre > activeThreshold) || (direction === 'increase' && pre < activeThreshold);
                const endHealthy = (direction === 'decrease' && post <= activeThreshold) || (direction === 'increase' && post >= activeThreshold);
                if (startClin && endHealthy) { metCSC = true; countCSC++; }
            }
            cscCell = `<td style="padding:10px; border:1px solid #eee;">${metCSC ? 'CSC Met' : '-'}</td>`;
        }
        return `<tr><td style="padding:10px; border:1px solid #eee;">${index+1}</td><td style="padding:10px; border:1px solid #eee;">${pre}</td><td style="padding:10px; border:1px solid #eee;">${post}</td><td style="padding:10px; border:1px solid #eee;">${rawChange.toFixed(2)}</td><td style="padding:10px; border:1px solid #eee;">${rciScore.toFixed(2)}</td><td style="padding:10px; border:1px solid #eee;">${status}</td>${cscCell}</tr>`;
    }).join('');

    // 7. SUMMARY OUTPUT (WITH DEFINITIONS & USED SD)
    statsDiv.style.display = 'block';
    individualDiv.style.display = 'block';
    document.getElementById('chartSection').style.display = 'block';
    const threshDisp = (activeThreshold !== null) ? activeThreshold.toFixed(2) : "N/A";

    statsDiv.innerHTML = `
        <h3 style="margin-top:0; color: #005a9c;">Analysis of ${measureName}</h3>
        <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead><tr style="background:#f2f2f2;"><th style="padding:8px; border:1px solid #ccc; text-align: left;">Timepoint</th><th style="padding:8px; border:1px solid #ccc; text-align: left;">n</th><th style="padding:8px; border:1px solid #ccc; text-align: left;">Mean</th><th style="padding:8px; border:1px solid #ccc; text-align: left;">SD</th></tr></thead>
            <tbody>
                <tr><td style="padding:8px; border:1px solid #ccc;">Pre-test</td><td style="padding:8px; border:1px solid #ccc;">${n}</td><td style="padding:8px; border:1px solid #ccc;">${preMean.toFixed(2)}</td><td style="padding:8px; border:1px solid #ccc;">${preSD.toFixed(2)}</td></tr>
                <tr><td style="padding:8px; border:1px solid #ccc;">Post-test</td><td style="padding:8px; border:1px solid #ccc;">${postScores.length}</td><td style="padding:8px; border:1px solid #ccc;">${StatsLib.mean(postScores).toFixed(2)}</td><td style="padding:8px; border:1px solid #ccc;">${StatsLib.standardDeviation(postScores).toFixed(2)}</td></tr>
            </tbody>
        </table>
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
});
    
    
    // --- ADD THIS INSIDE THE DOMContentLoaded BLOCK ---
    const doCSC = document.getElementById('doCSC');
    const cscOptions = document.getElementById('cscOptions');
    const cscCriterion = document.getElementById('cscCriterion');

    // Show/Hide CSC section when checkbox is clicked
    doCSC.addEventListener('change', () => {
    cscOptions.style.display = doCSC.checked ? 'block' : 'none';
    if (doCSC.checked) {
        document.getElementById('clinicalNorms').style.display = 'none';
        document.getElementById('healthyNorms').style.display = 'none';
        document.getElementById('externalInput').style.display = 'none';
        helpText.innerText = "Please select a criterion to see the required inputs and explanation.";
    }
});

    // Show/Hide specific norm inputs based on Criterion choice
    const helpText = document.getElementById('criterionHelp');
    cscCriterion.addEventListener('change', () => {
    const val = cscCriterion.value;
    document.getElementById('clinicalNorms').style.display = (val !== "" && (val === 'A' || val === 'C')) ? 'block' : 'none';
    document.getElementById('healthyNorms').style.display = (val === 'B' || val === 'C') ? 'block' : 'none';
    document.getElementById('externalInput').style.display = (val === 'External') ? 'block' : 'none';
    if (val === 'A') {
    helpText.innerText = "Criterion A: Clinical significance is reached when the score moves more than 2 SDs away from the Clinical Mean (moving outside the range of the clinical population).";
} else if (val === 'B') {
    helpText.innerText = "Criterion B: Clinical significance is reached when the score falls within 2 SDs of the Healthy Mean (moving into the range of the functional population).";
} else if (val === 'C') {
    helpText.innerText = "Criterion C: This calculates a 'Cut-off' score where it is statistically more likely that a person belongs to the functional population than the clinical population.";
} else {
    helpText.innerText = "External: Use a specific threshold score defined by the measure's manual to determine clinical significance.";
}
});
});
