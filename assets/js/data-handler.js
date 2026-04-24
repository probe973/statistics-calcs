document.addEventListener('DOMContentLoaded', function() {
    const processBtn = document.getElementById('processBtn');
    const variableSettings = document.getElementById('variableSettings');
    const variableBody = document.getElementById('variableBody');

    processBtn.addEventListener('click', function() {
        const rawData = document.getElementById('dataInput').value.trim();
        const hasHeaders = document.getElementById('hasHeaders').checked;

        if (!rawData) return alert("Please paste data first.");

        const rows = rawData.split('\n').map(r => r.split('\t'));
        const firstRow = rows[0];
        const secondRow = rows[1] || []; // Used to guess types

        variableBody.innerHTML = ''; // Clear previous
        
        firstRow.forEach((colValue, index) => {
            // 1. Determine Name
            let varName = hasHeaders ? colValue.trim() : String.fromCharCode(65 + index);
            
            // 2. Guess Type (Check the second row or first row if no headers)
            let sampleValue = hasHeaders ? (secondRow[index] || "") : colValue;
            let guessedType = "string";
            if (!isNaN(sampleValue) && sampleValue.trim() !== "") {
                guessedType = sampleValue.includes('.') ? "decimal" : "integer";
            }

            // 3. Build the Row
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 10px; border-bottom: 1px solid #eee; color: #666;">
                    <em>${hasHeaders ? 'Header found' : 'Column ' + (index + 1)}</em>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <input type="text" class="var-name" value="${varName}" data-col="${index}">
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <select class="var-type" data-col="${index}">
                        <option value="integer" ${guessedType === 'integer' ? 'selected' : ''}>Integer</option>
                        <option value="decimal" ${guessedType === 'decimal' ? 'selected' : ''}>Decimal</option>
                        <option value="string" ${guessedType === 'string' ? 'selected' : ''}>String/Category</option>
                    </select>
                </td>
            `;
            variableBody.appendChild(tr);
        });

        variableSettings.style.display = 'block';
    });

    document.getElementById('confirmBtn').addEventListener('click', function() {
        // Here we would save the finalized names/types and the data to sessionStorage
        alert("Data processed. Ready for next step.");
    });
});
