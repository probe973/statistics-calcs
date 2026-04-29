document.addEventListener('DOMContentLoaded', function() {
    // 1. Get the data exactly as the Home page does
    const rawData = sessionStorage.getItem('sharedProjectData');
    const hasHeaders = sessionStorage.getItem('hasHeaders') === 'true';
    const customNames = JSON.parse(sessionStorage.getItem('variableNames') || '[]');

    if (!rawData) return;

    // 2. Process the rows exactly as the Home page does
    const processedRows = rawData.trim().split('\n').map(r => r.split('\t'));
    const dataRows = hasHeaders ? processedRows.slice(1) : processedRows;

    // 3. Find the targets (Looking for IDs that contain 'TableHead' and 'TableBody')
    const thead = document.querySelector('[id$="TableHead"]');
    const tbody = document.querySelector('[id$="TableBody"]');

    // 4. Build the Header (Matching your Home page style)
    if (thead) {
        thead.innerHTML = `<tr>${customNames.map(name => `
            <th style="padding: 10px; border: 1px solid #ccc; text-align: left;">${name}</th>
        `).join('')}</tr>`;
    }

    // 5. Build the Body (Matching your Home page style)
    if (tbody) {
        tbody.innerHTML = dataRows.map(row => `
            <tr>${row.map(cell => `
                <td style="padding: 8px; border: 1px solid #eee;">${cell}</td>
            `).join('')}</tr>
        `).join('');
    }
});
