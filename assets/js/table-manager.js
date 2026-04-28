// assets/js/table-manager.js
document.addEventListener('DOMContentLoaded', function() {
    // 1. Get the raw data and settings from the home page
    const rawData = sessionStorage.getItem('sharedProjectData');
    const hasHeaders = sessionStorage.getItem('hasHeaders') === 'true';
    const savedNames = JSON.parse(sessionStorage.getItem('variableNames') || '[]');

    if (!rawData) {
        alert("No data found. Returning to home page.");
        window.location.href = "../";
        return;
    }

    // 2. Process the raw text into rows and cells
    const rows = rawData.trim().split('\n').map(r => r.split('\t'));
    
    // 3. Determine if we use the first row as headers or generic "Col 1" labels
    let headers = (savedNames.length > 0) ? savedNames : (hasHeaders ? rows[0] : rows[0].map((_, i) => `Col ${i+1}`));
    let dataRows = hasHeaders ? rows.slice(1) : rows;

    // 4. Find the table on the current page and fill it
    const thead = document.getElementById('rciTableHead');
    const tbody = document.getElementById('rciTableBody');

    if (thead && tbody) {
        thead.innerHTML = `<tr>${headers.map(h => `<th style="padding:10px; border:1px solid #ccc;">${h}</th>`).join('')}</tr>`;
        tbody.innerHTML = dataRows.map(row => `
            <tr>${row.map(cell => `<td style="padding:8px; border:1px solid #eee;">${cell}</td>`).join('')}</tr>
        `).join('');
    }

    // 5. IMPORTANT: Save these processed versions so the RCI math can use them
    window.currentProjectHeaders = headers;
    window.currentProjectData = dataRows;
    
    // Notify other scripts that the data is ready
    window.dispatchEvent(new Event('tableManagerReady'));
});
