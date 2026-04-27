---
layout: default
title: Home
---

<section aria-labelledby="input-heading" style="margin-bottom: 40px;">
    <h2 id="input-heading">1. Paste Your Data</h2>
    <p>Paste tab-separated data from Excel or Google Sheets below.</p>

    <textarea id="dataInput" 
              aria-label="Tab-separated data input"
              rows="10" 
              style="width:100%; font-family: monospace; padding: 10px; border: 1px solid #767676; border-radius: 4px;"></textarea>

    <div style="margin: 15px 0; display: flex; align-items: center;">
        <input type="checkbox" id="hasHeaders" checked style="width: 20px; height: 20px; margin-right: 10px;">
        <label for="hasHeaders">First row contains headers</label>
    </div>

    <button id="processBtn" class="standard-button">Process Data</button>
</section>

<section id="variableSettings" aria-labelledby="config-heading" style="display:none; margin-bottom: 40px;">
    <h2 id="config-heading">2. Confirm Variable Details</h2>
    <p>Adjust names and data types to ensure accurate analysis.</p>
    
    <div style="overflow-x: auto;">
        <table id="variableTable" style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr style="text-align: left; background-color: #f4f4f4;">
                    <th style="padding: 12px; border: 1px solid #ccc;">Source Column</th>
                    <th style="padding: 12px; border: 1px solid #ccc;">Variable Name</th>
                    <th style="padding: 12px; border: 1px solid #ccc;">Data Type</th>
                </tr>
            </thead>
            <tbody id="variableBody"></tbody>
        </table>
    </div>
    
    <button id="confirmBtn" class="standard-button btn-confirm">Confirm & Review Data</button>
</section>

<section id="analysisSection" aria-labelledby="analysis-heading" style="display:none; margin-bottom: 40px;">
    <h2 id="analysis-heading">3. Data Review & Analysis</h2>
    
    <div id="tableWrapper" style="max-height: 300px; overflow-y: auto; border: 1px solid #ccc; margin-bottom: 20px; border-radius: 4px;">
        <table id="finalDataTable" style="width:100%; border-collapse: collapse;">
            <thead id="finalTableHead" style="position: sticky; top: 0; background: #eee;"></thead>
            <tbody id="finalTableBody"></tbody>
        </table>
    </div>


<h3>Available Analyses</h3>
    <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
        
        <div style="border: 1px solid #ccc; padding: 20px; border-radius: 8px;">
            <h4>Descriptive Statistics</h4>
            <p style="font-size: 0.9em; color: #555;">Calculate the mean, median, and standard deviation for your selected variables.</p>
            <button id="btnDescriptive" class="standard-button">Run Descriptives</button>
        </div>

        <div style="border: 1px solid #ccc; padding: 20px; border-radius: 8px;">
            <h4>Reliable Change Index (RCI)</h4>
            <p style="font-size: 0.9em; color: #555;">Compare pre and post scores to determine if individual change is clinically significant.</p>
            <a href="./rci/" style="text-decoration: none;">
            <button id="btnRCI" class="standard-button">Run RCI Analysis</button>
            </a>
        </div>

    </div>
</section>



<style>
    /* Consistency and Accessibility Styles */
    .standard-button {
        height: 44px; /* Minimum touch target size for accessibility */
        padding: 0 24px;
        font-size: 16px;
        cursor: pointer;
        border: 1px solid #005a9c;
        border-radius: 4px;
        background-color: #005a9c;
        color: white;
        transition: background-color 0.2s;
    }
    .standard-button:hover, .standard-button:focus {
        background-color: #003f6b;
        outline: 3px solid #ffbf47; /* High contrast focus indicator */
    }
    .btn-confirm {
        background-color: #2e7d32;
        border-color: #1b5e20;
    }
    .btn-confirm:hover {
        background-color: #1b5e20;
    }
</style>

<script src="{{ '/assets/js/stats-library.js' | relative_url }}"></script>
<script src="{{ '/assets/js/data-handler.js' | relative_url }}"></script>
