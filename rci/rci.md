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



<section style="border: 1px solid #ccc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
    <h3>Clinical Significant Change (CSC)</h3>
    <div style="margin-bottom: 10px; display: flex; align-items: center;">
        <input type="checkbox" id="doCSC" style="width: 20px; height: 20px; margin-right: 10px;">
        <label for="doCSC"><strong>Run Clinical Significance Analysis?</strong></label>
    </div>

    <div id="cscOptions" style="display:none; padding-top: 15px; border-top: 1px dashed #ccc;">
        <label for="cscCriterion"><strong>Choose Recovery Criterion:</strong></label><br>
        <select id="cscCriterion" style="height:44px; width: 100%; margin-bottom: 10px;">
            <option value="" disabled selected>-- Choose a criterion for CSC --</option>
            <option value="A">Criterion A: Movement away from the Clinical Population</option>
            <option value="B">Criterion B: Movement into the Comparative Population range</option>
            <option value="C">Criterion C: Crossing the threshold between 'Clinical' and 'Functional'</option>
            <option value="External">External: Using a fixed clinical cut-off score</option>
        </select>

        <p id="criterionHelp" style="font-size: 0.9em; color: #555; font-style: italic; margin-bottom: 15px;">
            Select a criterion above to see how it defines 'recovery'.
        </p>

        <div id="cscInputs">
            <div id="clinicalNorms" style="display:none;">
                <label>Clinical Mean:</label> 
                <input type="number" id="clinicalMean" placeholder="Enter mean" style="width:100px; height:34px;">
                <label>Clinical SD:</label> 
                <input type="number" id="clinicalSD" placeholder="Enter SD" style="width:100px; height:34px;">
            </div>
            <div id="healthyNorms" style="display:none; margin-top:10px;">
                <label>Comparative Mean:</label> 
                <input type="number" id="healthyMean" placeholder="Enter mean" style="width:100px; height:34px;">
                <label>Comparative SD:</label> 
                <input type="number" id="healthySD" placeholder="Enter SD" style="width:100px; height:34px;">
            </div>
            <div id="externalInput" style="display:none; margin-top:10px;">
                <label>Fixed Cut-off Score:</label> 
                <input type="number" id="externalValue" placeholder="Enter score" style="width:100px; height:34px;">
            </div>
        </div>
    </div>
</section>

<script src="{{ '/rci/030_csc.js' | relative_url }}"></script>


<button id="runRCI" class="standard-button btn-confirm">Run Analysis</button>

<div id="descriptiveStats" style="display:none; margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; border: 1px solid #ccc; border-left: 6px solid #005a9c;">
    </div>

<script src="{{ '/rci/040_analysis.js' | relative_url }}"></script>




<div id="reportOutput" style="display:none; margin-top: 20px; padding: 20px; background: #fcfcfc; border-radius: 8px; border: 1px solid #e0e0e0; border-left: 6px solid #28a745; line-height: 1.6;">
    </div>

<script src="{{ '/rci/050_narrative.js' | relative_url }}"></script>


<section id="chartSection" style="display:none; margin-top: 30px; padding: 20px; background: #fff; border: 1px solid #ccc; border-radius: 8px;">
    <h3 style="color: #005a9c; margin-top:0;">Reliable Change Index Plot</h3>
    <div style="width: 100%; max-width: 700px; margin: 0 auto;">
        <canvas id="rciChart" aria-label="RCI Scatter Plot" role="img"></canvas>
    </div>
    <div id="chartAltText" class="visually-hidden" style="margin-top:10px; font-size: 0.85em; color: #555;"></div>
</section>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<div id="exportButtons" style="display:none; margin-top: 20px; margin-bottom: 20px; gap: 10px;">
    <button id="downloadCSV" style="padding: 10px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-family: inherit;">Download Analysis (.csv)</button>
    <button id="downloadPNG" style="padding: 10px 15px; background-color: #005a9c; color: white; border: none; border-radius: 4px; cursor: pointer; font-family: inherit;">Save Graph (.png)</button>
</div>

<script src="{{ '/rci/060_chart.js' | relative_url }}"></script>

<script src="{{ '/rci/070_export.js' | relative_url }}"></script>



<div id="individualResults" style="display:none; margin-top: 30px;">
    <h3 style="color: #005a9c;">Individual Analysis</h3>
    
    <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ccc;">
        <table style="width:100%; border-collapse: collapse;">
            <thead style="position: sticky; top: 0; background: #005a9c; color: white;">
                <tr>
                    <th style="padding:10px;">Row</th>
                    <th style="padding:10px;">Pre</th>
                    <th style="padding:10px;">Post</th>
                    <th style="padding:10px;">Change</th>
                    <th style="padding:10px;">RCI</th>
                    <th style="padding:10px;">Reliable Status</th>
                    <th id="cscHeader" style="padding:10px; display:none;">CSC</th>
                </tr>
            </thead>
            <tbody id="rciResultBody"></tbody>
        </table>
    </div>
</div>

<script src="{{ '/rci/080_individual_table.js' | relative_url }}"></script>





<script>
// This force-connects the RCI SD box (manualSD) to the CSC SD box (clinicalSD)
document.addEventListener('input', function(e) {
    // Check if the user is typing in the "Clinical Norm SD" box
    if (e.target && e.target.id === 'manualSD') {
        const val = e.target.value;
        const targetCSC = document.getElementById('clinicalSD');
        
        if (targetCSC) {
            targetCSC.value = val;
        }
    }
});
</script>
