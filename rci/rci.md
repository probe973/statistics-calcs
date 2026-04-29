---
layout: default
title: Reliable Change Index
---

<h2>Reliable Change Index (RCI)</h2>


<section id="dataReview" style="margin-bottom: 30px;">
    <h3>Data Review</h3>
    <div id="tableWrapper" style="max-height: 300px; overflow-y: auto; border: 1px solid #ccc; border-radius: 4px;">
        <table id="rciDataTable" style="width:100%; border-collapse: collapse;">
            <thead id="rciTableHead" data-table-part="head" style="position: sticky; top: 0; background: #eee;"></thead>
            <tbody id="rciTableBody" data-table-part="body"></tbody>
        </table>
    </div>
</section>

<script src="{{ '/assets/js/common-table-builder.js' | relative_url }}"></script>



<section id="variableSelection" style="margin-bottom: 30px;">
    <h3>Variable Selection</h3>
    <div style="display: grid; gap: 20px; grid-template-columns: 1fr 1fr;">
        <div>
            <label for="preVar"><strong>Pre-Test Variable:</strong></label>
            <select id="preVar" style="width:100%; height:44px;"></select>
        </div>
        <div>
            <label for="postVar"><strong>Post-Test Variable:</strong></label>
            <select id="postVar" style="width:100%; height:44px;"></select>
        </div>
    </div>
</section>

<script src="{{ '/rci/010_varSelect.js' | relative_url }}"></script>


<section style="border: 1px solid #ccc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
    <h3>Measurement Properties</h3>

    <div style="margin-bottom: 20px;">
        <label for="measureName"><strong>Name of Measure:</strong></label><br>
        <input type="text" id="measureName" placeholder="e.g., PHQ-9 or GAD-7" style="height:34px; width: 100%;">
    </div>
    
    <div style="margin-bottom: 20px;">
        <label for="reliability"><strong>Reliability of the measure (α):</strong></label><br>
        <small style="color: #555;">Usually found in the manual or original validation study (e.g., 0.85).</small><br>
        <input type="number" id="reliability" step="0.01" style="height:34px; width: 100px;">
    </div>

    <div style="margin-bottom: 10px;">
        <label for="sdSource"><strong>Standard Deviation (SD) Source:</strong></label><br>
        <select id="sdSource" style="height:44px; width: 100%;">
            <option value="manual">Use Clinical Norms (Recommended)</option>
            <option value="sample">Estimate using my sample data</option>
        </select>
    </div>

    <div id="manualSDContainer" style="margin-bottom: 20px; padding: 10px; background: #f9f9f9; border-left: 4px solid #005a9c;">
        <label for="manualSD"><strong>Clinical Norm SD:</strong></label><br>
        <small style="color: #555;">Enter the SD reported for this measure in clinical literature.</small><br>
        <input type="number" id="manualSD" step="0.1" style="height:34px; width: 100px;">
    </div>

    <div>
        <label for="direction"><strong>Direction of improvement:</strong></label><br>
        <select id="direction" style="height:44px; width: 100%;">
            <option value="decrease">Lower score is better (e.g., Anxiety, Depression)</option>
            <option value="increase">Higher score is better (e.g., Wellbeing, Resilience)</option>
        </select>
    </div>
    <br>
    <div style="margin-bottom: 20px;">
    <label><strong>Graph Scale Range:</strong></label><br>
    <div style="display: flex; gap: 10px; margin-top: 5px;">
        <div>
            <small style="color: #555;">Min Value</small><br>
            <input type="number" id="scaleMin" placeholder="0" style="height:34px; width: 80px;">
        </div>
        <div>
            <small style="color: #555;">Max Value</small><br>
            <input type="number" id="scaleMax" placeholder="100" style="height:34px; width: 80px;">
        </div>
    </div>
    <p style="font-size: 0.8em; color: #666; margin-top: 5px;">
        *Auto-calculated to the nearest 10 based on your data, but can be changed manually.
    </p>
</div>
</section>

<script src="{{ '/rci/020_measurements.js' | relative_url }}"></script>

