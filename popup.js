const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Function to send email data to Gemini API
async function askGemini(emailData, apiKey) {
    try {
        // Ensure content is within Gemini's limits
        const MAX_LENGTH = 1000;
        emailData.body = emailData.body.length > MAX_LENGTH ? emailData.body.substring(0, MAX_LENGTH) + "..." : emailData.body;

        // Properly formatted question
        const formattedQuestion = `In 150 words, how likely is this email from to be a phishing attack based on the content: sender, subject, body, images, links. Analyze if there is any PII, suspicious or obfuscated URLs, sense of urgency, unusual formatting, wrong information, inconsistencies, or sensitive requests. If there are verified/official sender emails or links, lower the percentage accordingly.
Use this information: Sender:${emailData.sender}\nSubject: ${emailData.subject}\nBody: ${emailData.body}\nLinks: ${emailData.links}\nImages: ${emailData.images}\n`;

        // Make the request
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: formattedQuestion }],
                }],
            })
        });

        const data = await response.json();

        // Handle errors properly
        if (!response.ok) {
            console.error("Error in API response:", response.status);
            console.error("Detailed Error:", data);
            return `Error ${response.status}: ${data.error?.message || "Unknown error"}`;
        }

        // Extract the response properly
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error("Unexpected response structure:", data);
            return "Error: Unexpected response structure";
        }
    } catch (error) {
        console.error("Error querying Gemini API:", error);
        return `Error: ${error.message}`;
    }
}

document.getElementById("scan-email").addEventListener("click", () => {
    const scanButton = document.getElementById("scan-email");
    const loadingSpinner = document.getElementById("loading-spinner");
    const phishingInfo = document.getElementById("phishing-info"); // Get the phishing info div

    // Change button text and disable it
    scanButton.innerText = "Scanning...";
    scanButton.disabled = true;
    scanButton.style.background = "#a0a0a0"; // Change color to indicate disabled state

    // Show loading spinner and phishing info link
    loadingSpinner.style.display = "block";
    phishingInfo.style.display = "block"; // Ensure link is visible while scanning

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            console.error("No active tab found.");
            resetButton(); // Reset button on error
            return;
        }

        let activeTabId = tabs[0].id;

        chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            files: ["content.js"]
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error injecting content script:", chrome.runtime.lastError.message);
                resetButton(); // Reset button on error
                return;
            }

            chrome.storage.local.get("API_KEY", (data) => {
                if (chrome.runtime.lastError || !data.API_KEY) {
                    console.error("API key retrieval failed.");
                    resetButton(); // Reset button on error
                    return;
                }

                const API_KEY = data.API_KEY;

                chrome.tabs.sendMessage(activeTabId, { action: "getEmailData" }, (response) => {
                    if (chrome.runtime.lastError || !response) {
                        console.error("Error: No email data received.");
                        resetButton(); // Reset button if no response
                        return;
                    }

                    console.log("Extracted Email Data:", response);
                    askGemini(response, API_KEY)
                        .then(responseData => {
                            console.log("Gemini API Response:", responseData);
                            alert("Phishing Analysis Complete:\n" + responseData);
                        })
                        .catch(error => {
                            console.error("Error sending request to Gemini API:", error);
                        })
                        .finally(() => {
                            resetButton(); // Reset button after completion
                        });
                });
            });
        });
    });

    // Function to reset button and hide the phishing link after scanning
    function resetButton() {
        scanButton.innerHTML = "🛡️ <span>Scan</span>"; // Restore shield icon and text
        scanButton.disabled = false;
        scanButton.style.background = "#60bad7"; // Restore original color
        loadingSpinner.style.display = "none"; // Hide spinner
        phishingInfo.style.display = "none"; // Hide phishing info after scanning
    }
});


