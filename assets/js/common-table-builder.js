document.addEventListener('DOMContentLoaded', function() {
    // 1. Get the data (Exactly as the Home page does)
    const rawData = sessionStorage.getItem('sharedProjectData');
    const hasHeaders = sessionStorage.getItem('hasHeaders') === 'true';
    const savedNames = JSON.parse(sessionStorage.getItem('variableNames') || '[]');

    if (!rawData) return;

    // 2. Prepare the data
    const processedRows = rawData.trim().split('\n').map(r => r.split('\t'));
    const dataRows = hasHeaders ? processedRows.slice(1) : processedRows;

    // 3. Find the table parts using a "data-attribute" instead of specific names
    const thead = document.querySelector('[data-table-part="head"]');
    const tbody = document.querySelector('[data-table-part="body"]');

    if (thead) {
        thead.innerHTML = `<tr>${savedNames.map(name => `
            <th style="padding: 10px; border: 1px solid #ccc; text-align: left;">${name}</th>
        `).join('')}</tr>`;
    }

    if (tbody) {
        tbody.innerHTML = dataRows.map(row => `
            <tr>${row.map(cell => `
                <td style="padding: 8px; border: 1px solid #eee;">${cell}</td>
            `).join('')}</tr>
        `).join('');
    }
});
