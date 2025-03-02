chrome.runtime.onInstalled.addListener(() => {
    console.log("Gmail Phishing Scanner Installed.");
    const API_KEY = "";
    chrome.storage.local.set({ API_KEY }, () => {
        if (chrome.runtime.lastError) {
            console.error("Failed to store API key:", chrome.runtime.lastError);
        } else {
            console.log("API key stored in chrome.storage.local");
        }
    });
});
