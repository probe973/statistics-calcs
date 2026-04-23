---
layout: default
title: Compare Two Independent Groups
---

# Independent Groups Workstation

<div class="tool-section">
    <p>Paste your data for each group below. Use spaces, commas, or new lines to separate numbers.</p>
    
    <div style="display: flex; gap: 20px;">
        <div style="flex: 1;">
            <label><strong>Group A Data</strong></label>
            <textarea id="dataA" class="data-input" placeholder="e.g., 12, 15, 14..."></textarea>
        </div>
        <div style="flex: 1;">
            <label><strong>Group B Data</strong></label>
            <textarea id="dataB" class="data-input" placeholder="e.g., 10, 11, 13..."></textarea>
        </div>
    </div>
    
    <button id="analyzeBtn" class="btn-primary" style="margin-top: 15px;">Analyze Data & Assumptions</button>
</div>

<div id="evidenceBoard" style="display: none;" class="tool-section">
    <h3>Evidence Board</h3>
    <table id="assumptionsTable">
        <thead>
            <tr>
                <th>Assumption Check</th>
                <th>Group A</th>
                <th>Group B</th>
            </tr>
        </thead>
        <tbody id="evidenceBody">
            </tbody>
    </table>
    
    <div id="consultantAdvice" class="advice-box"></div>
    <div id="testButtons" class="button-row"></div>
</div>

<div id="finalResults" style="display: none;" class="tool-section">
    <h3>Statistical Output</h3>
    <div id="outputContent"></div>
</div>

<script src="/assets/js/stats-lib.js"></script>
<script src="/assets/js/compare-two.js"></script>
