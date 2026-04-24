---
layout: default
title: Home
---

<h2>1. Paste Your Data</h2>
<p>Paste tab-separated data (e.g., from Excel or Google Sheets).</p>

<textarea id="dataInput" rows="10" style="width:100%; font-family: monospace;"></textarea>

<div style="margin: 15px 0;">
    <input type="checkbox" id="hasHeaders" checked>
    <label for="hasHeaders">First row contains headers</label>
</div>

<button id="processBtn">Process Data</button>

<hr>

<div id="variableSettings" style="display:none;">
    <h3>2. Confirm Variable Details</h3>
    <p>Adjust names and data types if needed.</p>
    <table id="variableTable" style="width:100%; border-collapse: collapse;">
        <thead>
            <tr style="text-align: left; border-bottom: 2px solid #ccc;">
                <th>Original Data</th>
                <th>Variable Name</th>
                <th>Data Type</th>
            </tr>
        </thead>
        <tbody id="variableBody">
            </tbody>
    </table>
    <br>
    <button id="confirmBtn" style="background-color: #28a745; color: white; padding: 10px 20px;">Confirm & Ready for Analysis</button>
</div>

<script src="{{ '/assets/js/data-handler.js' | relative_url }}"></script>
