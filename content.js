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
        sendResponse(emailData);
        return true; // Ensures async response handling in Chrome extensions
    }
});
