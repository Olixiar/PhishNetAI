const API_KEY = ""; // Replace with a valid key
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Function to send email data to Gemini API
async function askGemini(emailData) {
    try {
        // Ensure content is within Gemini's limits
        const MAX_LENGTH = 1000; 
        emailData.body = emailData.body.length > MAX_LENGTH ? emailData.body.substring(0, MAX_LENGTH) + "..." : emailData.body;

        // Properly formatted question
        const formattedQuestion = `Analyze the following email data for potential risks or insights:\n\n
        Sender: ${emailData.sender}\n
        Subject: ${emailData.subject}\n
        Body: ${emailData.body}\n
        Links: ${emailData.links.join("\n")}\n
        Images: ${emailData.images.length} image(s) detected.\n`;

        // Make the request
        const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: "user",  // Fix request structure
                    parts: [{ text: formattedQuestion }]
                }]
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

// Function to extract email data
function getEmailData() {
    let emailData = {
        sender: "",
        subject: "",
        body: "",
        images: [],
        links: []
    };

    let senderElement = document.querySelector("h3 span[email]");
    if (senderElement) emailData.sender = senderElement.getAttribute("email");

    let subjectElement = document.querySelector("h2.hP");
    if (subjectElement) emailData.subject = subjectElement.innerText;

    let emailBody = document.querySelector("div.a3s");
    if (emailBody) {
        emailData.body = emailBody.innerText;
        let linkElements = emailBody.querySelectorAll("a");
        emailData.links = Array.from(linkElements).map(link => link.href);
        let imageElements = emailBody.querySelectorAll("img");
        emailData.images = Array.from(imageElements).map(img => img.src);
    }

    return emailData;
}

// Chrome extension message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getEmailData") {
        let emailData = getEmailData();
        console.log("Extracted Email Data:", emailData);

        askGemini(emailData).then(response => {
            console.log("Gemini's Response:", response);
            sendResponse({ emailData, analysis: response });
        }).catch(error => {
            console.error("Error:", error);
            sendResponse({ error: error.message });
        });

        return true; // Ensures async response handling in Chrome extensions
    }
});