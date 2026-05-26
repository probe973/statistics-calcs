// This script waits for the "analysisComplete" signal from 040_analysis.js
window.addEventListener('analysisComplete', function() {
    const results = JSON.parse(sessionStorage.getItem('rci_results'));
    const savedNames = JSON.parse(sessionStorage.getItem('variableNames') || '[]');

    if (!results) return;

    const reportDiv = document.getElementById('reportOutput');
    
    // Calculate percentages
    const pImp = ((results.countImp / results.n) * 100).toFixed(1);
    const pDet = ((results.countDet / results.n) * 100).toFixed(1);
    const pNC = ((results.countNC / results.n) * 100).toFixed(1);
    
    const preLabel = (savedNames[results.preIndex] || "Pre-Test");
    const postLabel = (savedNames[results.postIndex] || "Post-Test");

    let reportHTML = `
        <h3 style="margin-top:0; color:#333; border-bottom:1px solid #000; padding-bottom:5px;">Clinical Outcome Narrative</h3>
        <p>An analysis of clinical outcomes was conducted for the ${results.measureName} (n = ${results.n}). Reliability of change was assessed using the Reliable Change Index (RCI) to compare scores from ${preLabel} to ${postLabel}.</p>
        
        <p>Results indicated that ${results.countImp} participants (${pImp}%) demonstrated reliable improvement, exceeding the margin of measurement error. Conversely, ${results.countDet} participants (${pDet}%) demonstrated reliable deterioration, and ${results.countNC} participants (${pNC}%) showed no reliable change.</p>
    `;

    if (results.showCSC && results.activeThreshold) {
        const pCSC = ((results.countCSC / results.n) * 100).toFixed(1);
        reportHTML += `
            <p>Clinical significance was determined using a threshold of ${results.activeThreshold.toFixed(2)}. A total of ${results.countCSC} participants (${pCSC}%) met the criteria for clinically significant change, representing a transition from the clinical range to the functional population range.</p>
        `;
    }

    reportDiv.innerHTML = reportHTML;
    reportDiv.style.display = 'block';
});
