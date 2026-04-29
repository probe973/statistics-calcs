
function buildCommonTable(headId, bodyId) {
    const rawData = sessionStorage.getItem('sharedProjectData');
    const hasHeaders = sessionStorage.getItem('hasHeaders') === 'true';
    const savedNames = JSON.parse(sessionStorage.getItem('variableNames') || '[]');

    if (!rawData) return;

    const processedRows = rawData.trim().split('\n').map(r => r.split('\t'));
    const dataRows = hasHeaders ? processedRows.slice(1) : processedRows;

    const thead = document.getElementById(headId);
    const tbody = document.getElementById(bodyId);

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
}
