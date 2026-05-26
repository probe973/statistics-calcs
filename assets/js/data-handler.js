document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Elements
    const dataInput = document.getElementById('dataInput');
    const processBtn = document.getElementById('processBtn');
    const confirmBtn = document.getElementById('confirmBtn');
    const varSettings = document.getElementById('variableSettings');
    const varBody = document.getElementById('variableBody');
    const analysisSection = document.getElementById('analysisSection');
    const clearBtn = document.getElementById('clearBtn');
    
    let processedRows = [];

    // Recovery: Look for the ONE state object we saved
    const savedState = JSON.parse(sessionStorage.getItem('toolState'));
    if (savedState && dataInput && dataInput.value === "") {
        dataInput.value = savedState.rawData;

        // RESTORE THE CHECKBOX STATE HERE
    if (savedState.hasOwnProperty('hasHeaders')) {
        document.getElementById('hasHeaders').checked = savedState.hasHeaders;
    }
        
        if (savedState.analysisVisible) {
            setTimeout(() => {
                processBtn.click(); // Builds Step 2
                
                setTimeout(() => {
                    const inputs = document.querySelectorAll('.var-name-input');
                    const selects = document.querySelectorAll('.var-type-select'); // NEW: Find dropdowns
                    
                    if (savedState.customNames && inputs.length > 0) {
                        inputs.forEach((input, i) => {
                            if (savedState.customNames[i]) input.value = savedState.customNames[i];
                        });
                    }

                    // NEW: Set the dropdowns back to what the user chose
                    if (savedState.customTypes && selects.length > 0) {
                        selects.forEach((select, i) => {
                            if (savedState.customTypes[i]) select.value = savedState.customTypes[i];
                        });
                    }
                    
                    confirmBtn.click(); // Now run Step 3 with names AND types
                }, 100); 
            }, 100); 
        }
    }

    // 3. Step 1 -> Step 2 (The "Process" Button)
    processBtn.addEventListener('click', function() {
        const rawData = dataInput.value.trim();
        const hasHeaders = document.getElementById('hasHeaders').checked;

        if (!rawData) return alert("Please paste data first.");

        processedRows = rawData.split('\n').map(r => r.split('\t'));
        const firstRow = processedRows[0];
        const sampleRow = processedRows[1] || firstRow;

        varBody.innerHTML = '';
        
        firstRow.forEach((colValue, index) => {
            let varName = hasHeaders ? colValue.trim() : String.fromCharCode(65 + index);
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
        analysisSection.style.display = 'none'; 
    });

    // 4. Step 2 -> Step 3 (The "Confirm" Button)
    confirmBtn.addEventListener('click', function() {
        const rawData = dataInput.value.trim();
        const hasHeaders = document.getElementById('hasHeaders').checked;
        const customNames = Array.from(document.querySelectorAll('.var-name-input')).map(i => i.value);

        // Save for the RCI logic/other pages
        sessionStorage.setItem('sharedProjectData', rawData);
        sessionStorage.setItem('hasHeaders', hasHeaders);
        sessionStorage.setItem('variableNames', JSON.stringify(customNames));

        // Save state for the Home button return
        // Save everything for the "Home" button return
        const state = {
        rawData: dataInput.value,
        hasHeaders: document.getElementById('hasHeaders').checked,
        analysisVisible: true,
        customNames: Array.from(document.querySelectorAll('.var-name-input')).map(i => i.value),
        // NEW: Grab the selected types from the dropdowns
        customTypes: Array.from(document.querySelectorAll('.var-type-select')).map(s => s.value)
    };
    sessionStorage.setItem('toolState', JSON.stringify(state));

        // Update the Preview Table
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

    // 5. The Clear Button (Wipe memory and refresh)
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            sessionStorage.clear(); 
            window.location.reload(); 
        });
    }
});
