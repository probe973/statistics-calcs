document.addEventListener('DOMContentLoaded', function() {
    const inputArea = document.getElementById('dataInput');
    const saveBtn = document.getElementById('storeDataBtn');
    const status = document.getElementById('saveStatus');

    // Load existing data if the student previously pasted it
    const existingData = sessionStorage.getItem('rawStudentData');
    if (existingData) {
        inputArea.value = existingData;
    }

    saveBtn.addEventListener('click', function() {
        const dataToSave = inputArea.value;

        if (!dataToSave.trim()) {
            alert("The input is empty. Please paste your data first.");
            return;
        }

        // sessionStorage keeps data alive for the duration of the tab session
        // It persists across page clicks within your site.
        sessionStorage.setItem('rawStudentData', dataToSave);

        status.innerText = "Data stored successfully. You can now choose an analysis below.";
        
        // Optional: clear status after 3 seconds
        setTimeout(() => { status.innerText = ""; }, 3000);
    });
});
