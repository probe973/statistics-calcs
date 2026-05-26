document.addEventListener('DOMContentLoaded', function() {
    const doCSC = document.getElementById('doCSC');
    const cscOptions = document.getElementById('cscOptions');
    const cscCriterion = document.getElementById('cscCriterion');
    const helpText = document.getElementById('criterionHelp');

    const clinicalInputs = document.getElementById('clinicalNorms');
    const healthyInputs = document.getElementById('healthyNorms');
    const externalInputs = document.getElementById('externalInput');

    // 1. Show/Hide the main CSC block when checkbox is clicked
    doCSC.addEventListener('change', () => {
        cscOptions.style.display = doCSC.checked ? 'block' : 'none';
        
        // Reset inputs and help text if checking/unchecking
        if (doCSC.checked) {
            clinicalInputs.style.display = 'none';
            healthyInputs.style.display = 'none';
            externalInputs.style.display = 'none';
            helpText.innerText = "Please select a criterion to see the required inputs and explanation.";
        }
    });

    // 2. Show/Hide specific inputs based on Criterion choice
    cscCriterion.addEventListener('change', () => {
        const val = cscCriterion.value;

        // Visibility Logic matching your original rci-logic.js
        clinicalInputs.style.display = (val !== "" && (val === 'A' || val === 'C')) ? 'block' : 'none';
        healthyInputs.style.display = (val === 'B' || val === 'C') ? 'block' : 'none';
        externalInputs.style.display = (val === 'External') ? 'block' : 'none';

        // Help Text Logic (updated "Healthy" to "Comparative")
        if (val === 'A') {
            helpText.innerText = "Criterion A: Clinical significance is reached when the score moves more than 2 SDs away from the Clinical Mean (moving outside the range of the clinical population).";
        } else if (val === 'B') {
            helpText.innerText = "Criterion B: Clinical significance is reached when the score falls within 2 SDs of the Comparative Mean (moving into the range of the functional/comparative population).";
        } else if (val === 'C') {
            helpText.innerText = "Criterion C: This calculates a 'Cut-off' score where it is statistically more likely that a person belongs to the functional population than the clinical population.";
        } else if (val === 'External') {
            helpText.innerText = "External: Use a specific threshold score defined by the measure's manual to determine clinical significance.";
        }
    });
});
