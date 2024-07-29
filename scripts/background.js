chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "getVids") {
            console.log("background.js: getVids");

            // Get current active tab URL
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                const activeTab = tabs[0];
                const url = activeTab.url;
                console.log("background.js: activeTab URL = ", url);

                const discogsArtistUrlPattern = /https:\/\/www\.discogs\.com\/artist\/(\d+)-.+/;
                const discogsSearchUrlPattern = /https:\/\/www\.discogs\.com\/search\/\?limit=\d+&q=.+/;

                // Check if the URL matches the discogs artist URL pattern
                if (discogsArtistUrlPattern.test(url)) {
                    const match = url.match(discogsArtistUrlPattern);
                    const discogsId = match[1];
                    console.log("background.js: Discogs ID = ", discogsId);

                    // Call async promise function "getVidsFromDiscogsId()" with the Discogs ID
                    getVidsFromDiscogsId(discogsId).then((vids) => {
                        console.log("background.js: Vids fetched = ", vids);
                        sendResponse({ vids: vids });
                    }).catch((error) => {
                        console.log("background.js: Error fetching vids = ", error);
                        sendResponse({ error: "Failed to fetch vids" });
                    });

                } else if (discogsSearchUrlPattern.test(url)) {
                    console.log("background.js: Discogs Search URL detected");

                    chrome.scripting.executeScript(
                        {
                            target: { tabId: activeTab.id },
                            func: () => {
                                const xpath = "//li[@role='listitem' and contains(@class, 'card_large') and @data-object-type='release']//div[@class='card-release-title']/a/@href";
                                const elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                                const result = [];
                                for (let i = 0; i < elements.snapshotLength; i++) {
                                    const href = elements.snapshotItem(i).nodeValue;
                                    const idMatch = href.match(/\/release\/(\d+)-/);
                                    if (idMatch && idMatch[1]) {
                                        result.push(idMatch[1]);
                                    }
                                }
                                return result;
                            },
                        },
                        (results) => {
                            if (results && results[0] && results[0].result) {
                                console.log('background.js: fetched release IDs = ', results[0].result);
                                sendResponse({ releaseIds: results[0].result });
                            } else {
                                console.log("Failed to retrieve release IDs");
                                sendResponse({ error: "Failed to retrieve release IDs" });
                            }
                        }
                    );

                } else {
                    console.log("background.js: Not a Discogs artist or search URL");
                    sendResponse({ error: "Not a Discogs artist or search URL" });
                }
            });

            // Return true to indicate that the response will be sent asynchronously
            return true;
        }

        if (request.action === "testButtonClicked") {
            console.log('background.js: testButtonClicked');
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                const tabId = tabs[0].id;
                console.log('background.js: tabId = ', tabId);

                try {
                    chrome.scripting.executeScript(
                        {
                            target: { tabId: tabId },
                            func: () => document.documentElement.outerHTML,
                        },
                        (results) => {
                            if (results && results[0] && results[0].result) {
                                console.log('background.js: fetched html = ', results[0].result);
                                sendResponse({ html: results[0].result });
                            } else {
                                console.log("Failed to retrieve content");
                                sendResponse({ error: "Failed to retrieve content" });
                            }
                        }
                    );
                } catch (err) {
                    console.log(err);
                    sendResponse({ error: "Exception occurred" });
                }
            });

            // Return true to indicate that the response will be sent asynchronously
            return true;
        }
    }
);

// Define the async function to fetch videos from Discogs ID
async function getVidsFromDiscogsId(discogsId) {
    // Implement your logic to fetch videos using the Discogs ID
    // This is a placeholder example, you need to replace it with actual implementation
    return new Promise((resolve, reject) => {
        // Simulate async fetch with a timeout
        setTimeout(() => {
            const exampleVids = ["video1", "video2", "video3"];
            resolve(exampleVids);
        }, 1000);
    });
}
