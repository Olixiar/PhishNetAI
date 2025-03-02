const API_KEY = ""; // Replace with a valid key
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Function to send email data to Gemini API
async function askGemini(emailData) {
    try {
        // Ensure content is within Gemini's limits
        const MAX_LENGTH = 1000;
        emailData.body = emailData.body.length > MAX_LENGTH ? emailData.body.substring(0, MAX_LENGTH) + "..." : emailData.body;

        // Properly formatted question
        const formattedQuestion = `In 150 words. how likely is this email (percentage) is to be a phishing attack based on the content: sender, subject, body, images, links. Analyze if there is any PII, suspicious or obfuscated URLs, sense of urgency, unusual formatting, wrong information, inconsistencies, or sensitive requests. If there are verified/official sender emails or links, lower the percentage accordingly.
Use this information: Sender:${emailData.sender}\nSubject: ${emailData.subject}\nBody: ${emailData.body}\nLinks: ${emailData.links}\nImages: ${emailData.images}\n`;

        // Make the request
        const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: "user",  // Fix request structure
                    parts: [{ text: formattedQuestion }],
                }],
            })
        });

        const data = await response.json();

        // Handle errors properly
        if (!response.ok) {
            console.error("Error in API response:", response.status);
            console.error("Detailed Error:", data);
            return `Error ${response.status}: ${data.error.message}`;
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
                    askGemini(response)
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