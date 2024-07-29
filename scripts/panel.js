document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM Content Loaded");

    var testButton = document.getElementById('test');
    var getVidsButton = document.getElementById('getVids');
    var displayDiv = document.getElementById('display');

    testButton.addEventListener('click', function () {
        console.log("testButton clicked");

        chrome.runtime.sendMessage({ action: 'testButtonClicked' }, response => {
           console.log("response = ", response)
        });
    });

    getVidsButton.addEventListener('click', function () {
        console.log("getVids clicked");

        chrome.runtime.sendMessage({ action: 'getVids' }, response => {
            console.log("response = ", response);
            if (response && response.releaseIds) {
                displayDiv.innerHTML = `Found ${response.releaseIds.length} number of IDs`;
            } else if (response && response.vids) {
                displayDiv.innerHTML = `Found ${response.vids.length} number of IDs`;
            } else if (response && response.error) {
                displayDiv.innerHTML = `Error: ${response.error}`;
            }
        });
    });
});
