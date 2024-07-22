chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({colorCount: 0});
  });
  
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action === "colorChanged") {
        console.log("Background color was changed");
      }
    }
  );