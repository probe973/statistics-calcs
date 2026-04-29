window.addEventListener('analysisComplete', function() {
    const res = JSON.parse(sessionStorage.getItem('rci_results'));
    const rawData = sessionStorage.getItem('sharedProjectData');
    const hasHeaders = sessionStorage.getItem('hasHeaders') === 'true';

    if (!res || !rawData) return;

    const rows = rawData.trim().split('\n').map(r => r.split('\t'));
    const dataRows = hasHeaders ? rows.slice(1) : rows;

    const container = document.getElementById('individualResults');
    const resultsBody = document.getElementById('rciResultBody');
    const cscHeader = document.getElementById('cscHeader');

    // Show or hide the CSC column header based on user selection
    cscHeader.style.display = res.showCSC ? 'table-cell' : 'none';

    // Ensure all headers are left-aligned for consistency
    const headers = document.querySelectorAll('#individualResults th');
    headers.forEach(th => th.style.textAlign = "left");

    resultsBody.innerHTML = dataRows.map((row, index) => {
        const pre = parseFloat(row[res.preIndex]);
        const post = parseFloat(row[res.postIndex]);
        
        if (isNaN(pre) || isNaN(post)) return '';

        const rawChange = post - pre;
        const rciScore = rawChange / res.sDiff;
        let status = "No Change";
        let relImp = false;
        
        if (Math.abs(rciScore) >= 1.96) {
            const improved = (res.direction === 'decrease' && rawChange < 0) || (res.direction === 'increase' && rawChange > 0);
            if (improved) { 
                status = "Reliable Improvement"; 
                relImp = true; 
            } else { 
                status = "Reliable Deterioration"; 
            }
        }

        let cscCell = "";
        if (res.showCSC) {
            let metCSC = false;
            if (relImp && res.activeThreshold !== null) {
                const startClin = (res.direction === 'decrease' && pre > res.activeThreshold) || (res.direction === 'increase' && pre < res.activeThreshold);
                const endHealthy = (res.direction === 'decrease' && post <= res.activeThreshold) || (res.direction === 'increase' && post >= res.activeThreshold);
                if (startClin && endHealthy) { 
                    metCSC = true; 
                }
            }
            cscCell = `<td style="padding:10px; border:1px solid #eee;">${metCSC ? 'CSC Met' : '-'}</td>`;
        }

        return `
            <tr>
                <td style="padding:10px; border:1px solid #eee;">${index + 1}</td>
                <td style="padding:10px; border:1px solid #eee;">${pre}</td>
                <td style="padding:10px; border:1px solid #eee;">${post}</td>
                <td style="padding:10px; border:1px solid #eee;">${rawChange.toFixed(2)}</td>
                <td style="padding:10px; border:1px solid #eee;">${rciScore.toFixed(2)}</td>
                <td style="padding:10px; border:1px solid #eee;">${status}</td>
                ${cscCell}
            </tr>`;
    }).join('');

    container.style.display = 'block';
});
