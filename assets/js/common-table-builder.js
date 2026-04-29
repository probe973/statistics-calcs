document.addEventListener('DOMContentLoaded', function() {
    // 1. Pull the data from the drawer
    const rawData = sessionStorage.getItem('sharedProjectData');
    const hasHeaders = sessionStorage.getItem('hasHeaders') === 'true';
    const savedNames = JSON.parse(sessionStorage.getItem('variableNames') || '[]');

    if (!rawData) return;

    // 2. Format the data
    const rows = rawData.trim().split('\n').map(r => r.split('\t'));
    const headers = (savedNames.length > 0) ? savedNames : (hasHeaders ? rows[0] : rows[0].map((_, i) => `Col ${i+1}`));
    const dataRows = hasHeaders ? rows.slice(1) : rows;

    // 3. Find EVERY table on the page that wants common data
    const tables = document.querySelectorAll('.common-data-table');

    tables.forEach(table => {
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');

        // Render Headers
        if (thead) {
            thead.innerHTML = `<tr>${headers.map(h => `<th style="padding:10px; border:1px solid #ccc; text-align: left;">${h}</th>`).join('')}</tr>`;
        }

        // Render Body
        if (tbody) {
            tbody.innerHTML = dataRows.map(row => `
                <tr>${row.map(cell => `<td style="padding:8px; border:1px solid #eee;">${cell}</td>`).join('')}</tr>
            `).join('');
        }
    });
});
