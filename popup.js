async function sendGemini(emailData) {
    const API_KEY = '';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const requestBody = {
        contents: [{ parts: [{ text: `Subject: ${emailData.subject}\nBody: ${emailData.body}` }] }]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Gemini API Response:", data);
            return data;
        } else {
            console.error('Error in API response:', response.status, response.statusText);
            const errorResponse = await response.json();
            console.error("Detailed Error:", errorResponse);
        }
    } catch (error) {
        console.error('Error sending request to Gemini API:', error);
    }
}



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
                    sendGemini(response)
                        .then(responseData => {
                            console.log("Gemini API Response:", responseData);
                        })
                        .catch(error => {
                            console.error("Error sending request to Gemini API:", error);
                        });
                } else {
                    console.warn("No email data received.");
                }
            });
        });
    });
});