let myChart = null; // Persist instance to allow destruction on re-run

window.addEventListener('analysisComplete', function() {
    const res = JSON.parse(sessionStorage.getItem('rci_results'));
    const rawData = sessionStorage.getItem('sharedProjectData');
    const hasHeaders = sessionStorage.getItem('hasHeaders') === 'true';
    const savedNames = JSON.parse(sessionStorage.getItem('variableNames') || '[]');

    if (!res || !rawData) return;

    // 1. DATA PROCESSING
    const rows = rawData.trim().split('\n').map(r => r.split('\t'));
    const dataRows = hasHeaders ? rows.slice(1) : rows;

    const chartDataPoints = dataRows.map(row => {
        const pre = parseFloat(row[res.preIndex]);
        const post = parseFloat(row[res.postIndex]);
        if (isNaN(pre) || isNaN(post)) return null;
        
        const rawChange = post - pre;
        const rciScore = rawChange / res.sDiff;
        let pColor = '#9e9e9e'; 
        
        if (Math.abs(rciScore) >= 1.96) {
            const improved = (res.direction === 'decrease' && rawChange < 0) || (res.direction === 'increase' && rawChange > 0);
            pColor = improved ? '#2e7d32' : '#c62828'; 
        }
        return { x: pre, y: post, color: pColor };
    }).filter(p => p !== null);

    // 2. SETUP CANVAS
    const chartSection = document.getElementById('chartSection');
    const exportButtons = document.getElementById('exportButtons');
    const ctx = document.getElementById('rciChart').getContext('2d');
    
    chartSection.style.display = 'block';
    exportButtons.style.display = 'flex';

    if (myChart) { myChart.destroy(); }

    // Dynamic scale logic
    const scaleMin = parseFloat(document.getElementById('scaleMin').value) || 0;
    const scaleMax = parseFloat(document.getElementById('scaleMax').value) || 100;
    const maxVal = scaleMax; 

    // 3. INITIALIZE CHART
    myChart = new Chart(ctx, {
        plugins: [{
            id: 'customCanvasBackgroundColor',
            beforeDraw: (chart) => {
                const {ctx} = chart;
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, chart.width, chart.height);
                ctx.restore();
            }
        }],
        data: {
            datasets: [
                { type: 'scatter', label: 'Reliable Improvement', data: chartDataPoints.filter(p => p.color === '#2e7d32'), backgroundColor: '#2e7d32', pointRadius: 3.5 },
                { type: 'scatter', label: 'Reliable Deterioration', data: chartDataPoints.filter(p => p.color === '#c62828'), backgroundColor: '#c62828', pointRadius: 3.5 },
                { type: 'scatter', label: 'No Reliable Change', data: chartDataPoints.filter(p => p.color === '#9e9e9e'), backgroundColor: '#9e9e9e', pointRadius: 3.5 },
                { type: 'line', label: 'No Change', data: [{x: scaleMin, y: scaleMin}, {x: maxVal, y: maxVal}], borderColor: '#212121', borderDash: [5, 5], borderWidth: 1.5, pointRadius: 0, fill: false },
                { type: 'line', label: 'RC Boundaries', data: [{x: scaleMin, y: scaleMin + res.rcThreshold}, {x: maxVal - res.rcThreshold, y: maxVal}], borderColor: '#bdbdbd', borderWidth: 1, pointRadius: 0, fill: false },
                { type: 'line', label: 'RC Lower (Hidden)', data: [{x: scaleMin + res.rcThreshold, y: scaleMin}, {x: maxVal, y: maxVal - res.rcThreshold}], borderColor: '#bdbdbd', borderWidth: 1, pointRadius: 0, fill: false }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            scales: {
                x: { 
                    title: { display: true, text: (savedNames[res.preIndex] || "Pre-Test") + ' (' + res.measureName + ')', font: { weight: 'bold' } }, 
                    min: scaleMin, max: scaleMax,
                    ticks: { stepSize: 10 } 
                },
                y: { 
                    title: { display: true, text: (savedNames[res.postIndex] || "Post-Test") + ' (' + res.measureName + ')', font: { weight: 'bold' } }, 
                    min: scaleMin, max: scaleMax,
                    ticks: { stepSize: 10 } 
                }
            },
            plugins: {
                legend: { 
                    display: true, position: 'bottom',
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

    // 4. ADD CSC LINES IF ACTIVE
    if (res.showCSC && res.activeThreshold) {
        myChart.data.datasets.push(
            { type: 'line', label: 'CSC Threshold', data: [{x: scaleMin, y: res.activeThreshold}, {x: maxVal, y: res.activeThreshold}], borderColor: '#1565c0', borderWidth: 1.5, pointRadius: 0, fill: false },
            { type: 'line', label: 'CSC Vert (Hidden)', data: [{x: res.activeThreshold, y: scaleMin}, {x: res.activeThreshold, y: maxVal}], borderColor: '#1565c0', borderWidth: 1.5, pointRadius: 0, fill: false }
        );
        myChart.update();
    }

    // 5. ACCESSIBILITY UPDATE
    const altTextContainer = document.getElementById('chartAltText');
    if (altTextContainer) {
        altTextContainer.innerText = `Scatter plot results: ${res.countImp} participants improved, ${res.countDet} deteriorated, and ${res.countNC} showed no reliable change.`;
    }
});
