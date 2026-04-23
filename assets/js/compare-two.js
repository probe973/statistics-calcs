window.renderExecutionButtons = function() {
    document.getElementById('testButtons').innerHTML = `
        <div class="test-actions" style="margin-top: 20px; border-top: 2px solid #eee; pt: 20px;">
            <p><strong>Step 2: Execute Recommended Analysis</strong></p>
            <button class="btn-primary" onclick="runFinalAnalysis('student')">Student's T</button>
            <button class="btn-primary" onclick="runFinalAnalysis('welch')">Welch's T</button>
            <button class="btn-primary" onclick="runFinalAnalysis('u')">Mann-Whitney U</button>
        </div>
    `;
};

window.runFinalAnalysis = function(type) {
    const gA = StatsLib.parseData(document.getElementById('dataA').value);
    const gB = StatsLib.parseData(document.getElementById('dataB').value);
    const output = document.getElementById('outputContent');
    document.getElementById('finalResults').style.display = 'block';

    // (Math processing...) - Simplified here for the explanation block
    let testTitle = type === 'u' ? "Mann-Whitney U (Non-Parametric)" : "Independent Samples T-Test";
    let pVal = 0.042; // Placeholder for logic
    
    output.innerHTML = `
        <div class="result-report">
            <h3>${testTitle} Result</h3>
            <div class="stat-box" style="font-size: 1.2em; font-weight: bold; color: ${pVal < 0.05 ? '#27ae60' : '#c0392b'};">
                p-value: ${pVal.toFixed(4)}
            </div>
            <p><strong>Conclusion:</strong> ${pVal < 0.05 ? 
                "There is a <strong>statistically significant</strong> difference between these groups." : 
                "There is <strong>no significant evidence</strong> of a difference between these groups."}</p>
            
            <hr>
            <h4>What does this mean?</h4>
            <p>${pVal < 0.05 ? 
                "The observed difference is unlikely to have occurred by random chance. You can reject the null hypothesis." : 
                "The observed difference is small enough that it could easily be due to random noise. You fail to reject the null hypothesis."}</p>
        </div>
    `;
    document.getElementById('finalResults').scrollIntoView({ behavior: 'smooth' });
};
