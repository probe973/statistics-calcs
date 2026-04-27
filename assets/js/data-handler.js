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
        const rawData = document.getElementById('dataInput').value.trim();
        const hasHeaders = document.getElementById('hasHeaders').checked;
        
        // 1. GRAB THE NAMES YOU TYPED INTO THE STEP 2 TABLE
        const customNames = Array.from(document.querySelectorAll('.var-name-input')).map(i => i.value);

        // 2. SAVE EVERYTHING FOR THE RCI PAGE
        sessionStorage.setItem('sharedProjectData', rawData);
        sessionStorage.setItem('hasHeaders', hasHeaders);
        // We save your custom names as a list (JSON)
        sessionStorage.setItem('variableNames', JSON.stringify(customNames));

        // 3. UPDATE THE PREVIEW TABLE AT THE BOTTOM
        const dataRows = hasHeaders ? processedRows.slice(1) : processedRows;
        const thead = document.getElementById('finalTableHead');
        thead.innerHTML = `<tr>${customNames.map(name => `<th style="padding: 10px; border: 1px solid #ccc; text-align: left;">${name}</th>`).join('')}</tr>`;

        const tbody = document.getElementById('finalTableBody');
        tbody.innerHTML = dataRows.map(row => `
            <tr>${row.map(cell => `<td style="padding: 8px; border: 1px solid #eee;">${cell}</td>`).join('')}</tr>
        `).join('');

        analysisSection.style.display = 'block';
        analysisSection.scrollIntoView({ behavior: 'smooth' });
    });

});
