const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Function to fetch API key from backend
async function getApiKey() {
    try {
        const response = await fetch("http://localhost:5000/api/get-key");
        if (!response.ok) throw new Error("Failed to fetch API key");
        const data = await response.json();
        return data.apiKey; // Assuming the backend returns { "apiKey": "your-key" }
    } catch (error) {
        console.error("Error fetching API key:", error);
        return null;
    }
}

// Function to send email data to Gemini API
async function askGemini(emailData, apiKey) {
    try {
        // Ensure content is within Gemini's limits
        const MAX_LENGTH = 1000;
        emailData.body = emailData.body.length > MAX_LENGTH ? emailData.body.substring(0, MAX_LENGTH) + "..." : emailData.body;

        // Properly formatted question
        const formattedQuestion = `In 150 words, how likely is this email from to be a phishing attack (from very low, low, medium, high, very high risk) based on the content: sender, subject, body, images, links. Analyze if there is any PII, suspicious or obfuscated URLs, sense of urgency, unusual formatting, wrong information, inconsistencies, or sensitive requests. If there are verified/official sender emails or links, lower the percentage accordingly.
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

// Handle Scan Button Click
document.getElementById("scan-email").addEventListener("click", async () => {
    const scanButton = document.getElementById("scan-email");
    const loadingSpinner = document.getElementById("loading-spinner");
    const phishingInfo = document.getElementById("phishing-info");

    // Change button text and disable it
    scanButton.innerText = "Scanning...";
    scanButton.disabled = true;
    scanButton.style.background = "#a0a0a0";

    // Show loading spinner
    loadingSpinner.style.display = "block";
    phishingInfo.style.display = "block";

    // Get API key from backend
    const API_KEY = await getApiKey();
    if (!API_KEY) {
        console.error("API key not available.");
        resetButton();
        return;
    }

    // Query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs.length === 0) {
            console.error("No active tab found.");
            resetButton();
            return;
        }

        let activeTabId = tabs[0].id;

        chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            files: ["content.js"]
        }, async () => {
            if (chrome.runtime.lastError) {
                console.error("Error injecting content script:", chrome.runtime.lastError.message);
                resetButton();
                return;
            }

            chrome.tabs.sendMessage(activeTabId, { action: "getEmailData" }, async (response) => {
                if (chrome.runtime.lastError || !response) {
                    console.error("Error: No email data received.");
                    resetButton();
                    return;
                }

                console.log("Extracted Email Data:", response);
                const analysisResult = await askGemini(response, API_KEY);

                console.log("Gemini API Response:", analysisResult);
                alert("Phishing Analysis Complete:\n" + analysisResult);

                resetButton();
            });
        });
    });

    function resetButton() {
        scanButton.innerHTML = "🛡️ <span>Scan</span>";
        scanButton.disabled = false;
        scanButton.style.background = "#60bad7";
        loadingSpinner.style.display = "none";
        phishingInfo.style.display = "none";
    }
});
