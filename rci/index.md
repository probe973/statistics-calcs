---
layout: default
title: Reliable Change Index
---

<h2>Reliable Change Index (RCI)</h2>

<section id="dataReview" style="margin-bottom: 30px;">
    <h3>Data Review</h3>
    <div id="tableWrapper" style="max-height: 300px; overflow-y: auto; border: 1px solid #ccc; border-radius: 4px;">
        <table id="rciDataTable" style="width:100%; border-collapse: collapse;">
            <thead id="rciTableHead" style="position: sticky; top: 0; background: #eee;"></thead>
            <tbody id="rciTableBody"></tbody>
        </table>
    </div>
</section>

<section style="margin-bottom: 30px;">
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
</section>

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
        <option value="B">Criterion B: Movement into the Healthy Population range</option>
        <option value="C">Criterion C: Crossing the threshold between 'Clinical' and 'Functional'</option>
        <option value="External">External: Using a fixed clinical cut-off score</option>
    </select>

    <p id="criterionHelp" style="font-size: 0.9em; color: #555; font-style: italic; margin-bottom: 15px;">
        Select a criterion above to see how it defines 'recovery'.
    </p>

    <div id="cscInputs">
    <div id="clinicalNorms">
        <label>Clinical Mean:</label> 
        <input type="number" id="clinicalMean" placeholder="Enter mean" style="width:100px; height:34px;">
        <label>Clinical SD:</label> 
        <input type="number" id="clinicalSD" placeholder="Enter SD" style="width:100px; height:34px;">
    </div>
    <div id="healthyNorms" style="display:none; margin-top:10px;">
        <label>Healthy Mean:</label> 
        <input type="number" id="healthyMean" placeholder="Enter mean" style="width:100px; height:34px;">
        <label>Healthy SD:</label> 
        <input type="number" id="healthySD" placeholder="Enter SD" style="width:100px; height:34px;">
    </div>
    <div id="externalInput" style="display:none; margin-top:10px;">
        <label>Fixed Cut-off Score:</label> 
        <input type="number" id="externalValue" placeholder="Enter score" style="width:100px; height:34px;">
    </div>
</div>
</div>
</section>

<button id="runRCI" class="standard-button btn-confirm">Run Analysis</button>

<div id="descriptiveStats" style="display:none; margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 8px; border: 1px solid #ccc; border-left: 6px solid #005a9c;">
    </div>

<section id="chartSection" style="display:none; margin-top: 30px; padding: 20px; background: #fff; border: 1px solid #ccc; border-radius: 8px;">
    <h3 style="color: #005a9c; margin-top:0;">Reliable Change Index Plot</h3>
    <div style="width: 100%; max-width: 700px; margin: 0 auto;">
        <canvas id="rciChart" aria-label="RCI Scatter Plot" role="img"></canvas>
    </div>
    <div id="chartAltText" class="visually-hidden" style="margin-top:10px; font-size: 0.85em; color: #555;"></div>
</section>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

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
                    <th id="cscHeader" style="padding:10px; display:none;">Clinical Recovery</th>
                </tr>
            </thead>
            <tbody id="rciResultBody"></tbody>
        </table>
    </div>
</div>

<script src="{{ '/assets/js/stats-library.js' | relative_url }}"></script>
<script src="./rci-logic.js"></script>
