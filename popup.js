// // Function to send email data to Google Gemini API
// async function analyzeWithGemini(emailData) {
//     const apiKey = "YOUR_GEMINI_API_KEY"; // Replace with your Google Gemini API key
//     const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateText?key=${apiKey}`;

//     const requestBody = {
//         prompt: `Analyze the following email for phishing:\nSender: ${emailData.sender}\nSubject: ${emailData.subject}\nBody: ${emailData.body}\nLinks: ${emailData.links.join(", ")}\n\nIs this a phishing email? Provide a concise explanation.`,
//         temperature: 0.2
//     };

//     try {
//         const response = await fetch(endpoint, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(requestBody)
//         });

//         const data = await response.json();
//         if (data && data.candidates) {
//             document.getElementById("result").innerText = data.candidates[0].content;
//         } else {
//             document.getElementById("result").innerText = "No response from AI.";
//         }
//     } catch (error) {
//         document.getElementById("result").innerText = "Error analyzing email.";
//     }
// }

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
