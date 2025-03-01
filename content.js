// Email data to be sent to API
function getEmailData() {
    let emailData = {
        sender: "",
        subject: "",
        body: "",
        images: [],
        links: []
    };

    // Get sender email
    let senderElement = document.querySelector("h3 span[email]"); // Gmail uses this for sender emails
    if (senderElement) {
        emailData.sender = senderElement.getAttribute("email");
    }

    // Get email subject
    let subjectElement = document.querySelector("h2.hP");
    if (subjectElement) {
        emailData.subject = subjectElement.innerText;
    }

    // Get email body
    let emailBody = document.querySelector("div.a3s");
    if (emailBody) {
        emailData.body = emailBody.innerText;

        // Get links within the email body
        let linkElements = emailBody.querySelectorAll("a");
        emailLinks = Array.from(linkElements).map(link => link.href);

         // Get the image URLs within the email body
        let imageElements = emailBody.querySelectorAll("img");
        emailData.images = Array.from(imageElements).map(img => img.src);
    }

    return emailData;
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getEmailData") {
        let data = getEmailData();
        console.log("Extracted Email Data:", data);
        sendResponse(data);
    }
});