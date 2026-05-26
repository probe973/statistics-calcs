document.addEventListener('DOMContentLoaded', function() {
    // 1. Get the names exactly as they were saved by the home page
    const savedNames = JSON.parse(sessionStorage.getItem('variableNames') || '[]');

    // 2. Identify the dropdowns
    const preSelect = document.getElementById('preVar');
    const postSelect = document.getElementById('postVar');

    // 3. Populate only if the elements exist and we have names
    if (preSelect && postSelect && savedNames.length > 0) {
        savedNames.forEach((h, i) => {
            // h is the name (string), i is the index (0, 1, 2...)
            preSelect.add(new Option(h, i));
            postSelect.add(new Option(h, i));
        });
    }
});
