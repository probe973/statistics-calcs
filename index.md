---
layout: default
title: Home
---

## 1. Paste Your Data
Paste your tab-separated data here before selecting an analysis.

<textarea id="dataInput" placeholder="Paste tab-separated data here..." rows="12" style="width:100%; font-family: monospace;"></textarea>

<button id="storeDataBtn" style="margin-top: 10px; padding: 10px 20px;">Securely Save Data</button>

<p id="saveStatus" style="color: green; font-weight: bold;"></p>

<hr>

## 2. Choose Your Analysis
* [T-Test Analysis](./t-test.html)
* [Descriptive Statistics](./descriptives.html)

<script src="{{ '/assets/js/data-handler.js' | relative_url }}"></script>
