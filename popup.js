document.getElementById("scan-email").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            console.error("No active tab found.");
            return;
        }

        let activeTabId = tabs[0].id;

        // Inject the content script dynamically before sending a message
        chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            files: ["content.js"]
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error injecting content script:", chrome.runtime.lastError.message);
                return;
            }

            // Now send the message after ensuring content script is injected
            chrome.tabs.sendMessage(activeTabId, { action: "getEmailData" }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Error: Content script might not be injected yet.");
                    return;
                }

                if (response) {
                    console.log("Extracted Email Data:", response);
                } else {
                    console.warn("No email data received.");
                }
            });
        });
    });
});
