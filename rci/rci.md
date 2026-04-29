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

