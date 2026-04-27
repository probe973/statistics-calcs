document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const processBtn = document.getElementById('processBtn');
    const confirmBtn = document.getElementById('confirmBtn');
    const varSettings = document.getElementById('variableSettings');
    const varBody = document.getElementById('variableBody');
    const analysisSection = document.getElementById('analysisSection');
    
    let processedRows = [];

    processBtn.addEventListener('click', function() {
        const rawData = document.getElementById('dataInput').value.trim();
        const hasHeaders = document.getElementById('hasHeaders').checked;

        if (!rawData) return alert("Please paste data first.");

        processedRows = rawData.split('\n').map(r => r.split('\t'));
        const firstRow = processedRows[0];
        const sampleRow = processedRows[1] || firstRow;

        varBody.innerHTML = '';
        
        firstRow.forEach((colValue, index) => {
            let varName = hasHeaders ? colValue.trim() : String.fromCharCode(65 + index);
            
            // Basic type guessing
            let val = hasHeaders ? (sampleRow[index] || "") : colValue;
            let type = (!isNaN(val) && val.trim() !== "") ? (val.includes('.') ? "decimal" : "integer") : "string";

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 10px; border: 1px solid #ccc;">Col ${index + 1}</td>
                <td style="padding: 10px; border: 1px solid #ccc;">
                    <input type="text" class="var-name-input" value="${varName}" aria-label="Name for Column ${index + 1}">
                </td>
                <td style="padding: 10px; border: 1px solid #ccc;">
                    <select class="var-type-select" aria-label="Type for Column ${index + 1}">
                        <option value="integer" ${type === 'integer' ? 'selected' : ''}>Integer</option>
                        <option value="decimal" ${type === 'decimal' ? 'selected' : ''}>Decimal</option>
                        <option value="string" ${type === 'string' ? 'selected' : ''}>String</option>
                    </select>
                </td>
            `;
            varBody.appendChild(tr);
        });

        varSettings.style.display = 'block';
        analysisSection.style.display = 'none'; // Hide section 3 if re-processing
    });

    confirmBtn.addEventListener('click', function() {
        sessionStorage.setItem('sharedProjectData', document.getElementById('dataInput').value.trim());
        const names = Array.from(document.querySelectorAll('.var-name-input')).map(i => i.value);
        const hasHeaders = document.getElementById('hasHeaders').checked;
        const dataRows = hasHeaders ? processedRows.slice(1) : processedRows;

        // Build Final Table Header
        const thead = document.getElementById('finalTableHead');
        thead.innerHTML = `<tr>${names.map(name => `<th style="padding: 10px; border: 1px solid #ccc; text-align: left;">${name}</th>`).join('')}</tr>`;

        // Build Final Table Body
        const tbody = document.getElementById('finalTableBody');
        tbody.innerHTML = dataRows.map(row => `
            <tr>${row.map(cell => `<td style="padding: 8px; border: 1px solid #eee;">${cell}</td>`).join('')}</tr>
        `).join('');

        analysisSection.style.display = 'block';
        analysisSection.scrollIntoView({ behavior: 'smooth' });
    });

});
