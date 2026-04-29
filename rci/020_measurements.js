document.addEventListener('DOMContentLoaded', function() {
    // 1. Setup Elements
    const preSelect = document.getElementById('preVar');
    const postSelect = document.getElementById('postVar');
    const sdSource = document.getElementById('sdSource');
    const manualSDContainer = document.getElementById('manualSDContainer');
    
    // Get raw data for the Scale Auto-Fill
    const rawData = sessionStorage.getItem('sharedProjectData');
    const hasHeaders = sessionStorage.getItem('hasHeaders') === 'true';
    if (!rawData) return;

    const processedRows = rawData.trim().split('\n').map(r => r.split('\t'));
    const dataRows = hasHeaders ? processedRows.slice(1) : processedRows;

    // --- SMART SCALE AUTO-FILL LOGIC ---
    function updateSuggestedScale() {
        const preIdx = parseInt(preSelect.value);
        const postIdx = parseInt(postSelect.value);
        
        // Extract all scores from the selected columns
        const allScores = dataRows.map(row => [
            parseFloat(row[preIdx]), 
            parseFloat(row[postIdx])
        ]).flat().filter(n => !isNaN(n));

        if (allScores.length > 0) {
            const dataMin = Math.min(...allScores);
            const dataMax = Math.max(...allScores);
            
            let suggestedMin = Math.floor((dataMin - 4) / 10) * 10;
            if (suggestedMin < 0) suggestedMin = 0;
            
            let suggestedMax = Math.ceil((dataMax + 4) / 10) * 10;

            document.getElementById('scaleMin').value = suggestedMin;
            document.getElementById('scaleMax').value = suggestedMax;
        }
    }

    // --- SD TOGGLE LOGIC ---
    sdSource.addEventListener('change', () => {
        manualSDContainer.style.display = (sdSource.value === 'manual') ? 'block' : 'none';
    });

    // --- EVENT LISTENERS ---
    // If user changes the variables in Step 1, update the scale in Step 2
    preSelect.addEventListener('change', updateSuggestedScale);
    postSelect.addEventListener('change', updateSuggestedScale);

    // Initial Run
    updateSuggestedScale();
});
