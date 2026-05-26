let myChart = null; // Persist instance to allow destruction on re-run

window.addEventListener('analysisComplete', function() {
    const res = JSON.parse(sessionStorage.getItem('rci_results'));
    const rawData = sessionStorage.getItem('sharedProjectData');
    const hasHeaders = sessionStorage.getItem('hasHeaders') === 'true';
    const savedNames = JSON.parse(sessionStorage.getItem('variableNames') || '[]');

    if (!res || !rawData) return;

    // 1. DATA PROCESSING WITH APA CATEGORIES
    const rows = rawData.trim().split('\n').map(r => r.split('\t'));
    const dataRows = hasHeaders ? rows.slice(1) : rows;

    const chartDataPoints = dataRows.map(row => {
        const pre = parseFloat(row[res.preIndex]);
        const post = parseFloat(row[res.postIndex]);
        if (isNaN(pre) || isNaN(post)) return null;
        
        const rawChange = post - pre;
        const rciScore = rawChange / res.sDiff;
        let category = 'none'; 
        
        if (Math.abs(rciScore) >= 1.96) {
            const improved = (res.direction === 'decrease' && rawChange < 0) || (res.direction === 'increase' && rawChange > 0);
            category = improved ? 'improved' : 'deteriorated'; 
        }
        return { x: pre, y: post, category: category };
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

    // 3. INITIALIZE APA-STYLED CHART
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
                // Reliable improvement
                {
                    type: 'scatter',
                    label: 'Reliable improvement',
                    data: chartDataPoints.filter(p => p.category === 'improved'),
                    backgroundColor: '#0072B2',
                    pointStyle: 'triangle',
                    pointRadius: 5
                },
                // Reliable deterioration
                {
                    type: 'scatter',
                    label: 'Reliable deterioration',
                    data: chartDataPoints.filter(p => p.category === 'deteriorated'),
                    pointStyle: 'rectRot',
                    backgroundColor: '#D55E00',
                    borderColor: '#000',
                    borderWidth: 1,
                    pointRadius: 6
                },
                // No reliable change
                {
                    type: 'scatter',
                    label: 'No reliable change',
                    data: chartDataPoints.filter(p => p.category === 'none'),
                    backgroundColor: '#7A7A7A',
                    pointStyle: 'circle',
                    pointRadius: 4
                },
                // No change diagonal
                {
                    type: 'line',
                    label: 'No change',
                    data: [{x: scaleMin, y: scaleMin}, {x: maxVal, y: maxVal}],
                    borderColor: '#000',
                    borderWidth: 1,
                    borderDash: [4, 4],
                    pointRadius: 0,
                    fill: false
                },
                // Reliable change upper boundary
                {
                    type: 'line',
                    label: 'Reliable change boundary',
                    data: [{x: scaleMin, y: scaleMin + res.rcThreshold}, {x: maxVal - res.rcThreshold, y: maxVal}],
                    borderColor: '#7a7a7a',
                    borderWidth: 1,
                    borderDash: [6, 4],
                    pointRadius: 0,
                    fill: false
                },
                // Reliable change lower boundary
                {
                    type: 'line',
                    label: '', // Hidden label to keep it clean but present
                    data: [{x: scaleMin + res.rcThreshold, y: scaleMin}, {x: maxVal, y: maxVal - res.rcThreshold}],
                    borderColor: '#7a7a7a',
                    borderWidth: 1,
                    borderDash: [6, 4],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1,
            scales: {
                x: { 
                    title: { display: true, text: (savedNames[res.preIndex] || "Pre-test") + ' (' + res.measureName + ')', font: { weight: 'bold' } }, 
                    min: scaleMin, max: scaleMax,
                    ticks: { stepSize: 10 },
                    grid: { display: false },
                    border: { color: '#000', width: 1 }
                },
                y: { 
                    title: { display: true, text: (savedNames[res.postIndex] || "Post-test") + ' (' + res.measureName + ')', font: { weight: 'bold' } }, 
                    min: scaleMin, max: scaleMax,
                    ticks: { stepSize: 10 },
                    grid: { display: false },
                    border: { color: '#000', width: 1 }
                }
            },
            plugins: {
                legend: { 
                    display: true, position: 'bottom',
                    labels: {
                        filter: item => item.text, // Filters out empty string label
                        usePointStyle: true,
                        padding: 15,
                        generateLabels: function(chart) {
                            const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                            labels.forEach(label => {
                                const ds = chart.data.datasets[label.datasetIndex];
                                if (!ds) return;

                                // Scatter points: preserve categorical shapes (Triangle, Diamond, Circle)
                                if (ds.type === 'scatter') {
                                    label.pointStyle = ds.pointStyle || 'circle';
                                    label.strokeStyle = ds.backgroundColor || '#000';
                                }

                                // Line datasets: Force precise line matching
                                if (ds.type === 'line') {
                                    label.pointStyle = 'line';
                                    label.strokeStyle = ds.borderColor || '#000';
                                    label.lineWidth = ds.borderWidth || 1;
                                    label.lineDash = ds.borderDash || [];
                                }
                            });
                            return labels;
                        }
                    }
                }
            }
        }
    });

    // 4. ADD CSC CUTOFF LINES IF ACTIVE
    if (res.showCSC && res.activeThreshold) {
        myChart.data.datasets.push(
            {
                type: 'line',
                label: 'Clinical significance cutoff',
                data: [{ x: scaleMin, y: res.activeThreshold }, { x: maxVal, y: res.activeThreshold }],
                borderColor: '#000',
                borderWidth: 1,
                borderDash: [1, 3],
                pointRadius: 0,
                fill: false
            },
            {
                type: 'line',
                label: '',
                data: [{ x: res.activeThreshold, y: scaleMin }, { x: res.activeThreshold, y: maxVal }],
                borderColor: '#000',
                borderWidth: 1,
                borderDash: [1, 3],
                pointRadius: 0,
                fill: false
            }
        );
        myChart.update();
    }

    // 5. ACCESSIBILITY UPDATE
    const altTextContainer = document.getElementById('chartAltText');
    if (altTextContainer) {
        altTextContainer.innerText = `Scatter plot results: ${res.countImp} participants improved, ${res.countDet} deteriorated, and ${res.countNC} showed no reliable change.`;
    }
});
