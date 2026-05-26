// --- EXPORT FUNCTIONS ---

// 1. Download Analysis Tables as CSV
document.getElementById('downloadCSV')?.addEventListener('click', function() {
    // Select the Descriptive Stats table
    const statsTable = document.querySelector('#descriptiveStats table');
    // Note: Individual Results table doesn't exist yet, so we only grab what's there
    const individualTable = document.querySelector('#individualResults table');
    
    const tablesToExport = [statsTable, individualTable];
    let csvContent = "data:text/csv;charset=utf-8,";
    
    tablesToExport.forEach((table) => {
        if (table) {
            const rows = table.querySelectorAll('tr');
            rows.forEach(row => {
                const cols = row.querySelectorAll('td, th');
                const data = Array.from(cols).map(col => {
                    // Clean text and escape quotes for Excel
                    let text = col.innerText.replace(/"/g, '""').trim();
                    return `"${text}"`;
                }).join(",");
                csvContent += data + "\r\n";
            });
            csvContent += "\r\n\r\n"; // Space between tables
        }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "RCI_Analysis_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// 2. Download Chart as PNG
document.getElementById('downloadPNG')?.addEventListener('click', function() {
    const canvas = document.getElementById('rciChart');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `RCI_Plot_Export.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
});
