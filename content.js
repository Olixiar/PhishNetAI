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

    // Get subject
    let subjectElement = document.querySelector("h2.hP");
    if (subjectElement) {
        emailData.subject = subjectElement.innerText;
    }

    // Get email body
    let bodyElement = document.querySelector("div.a3s");
    if (bodyElement) {
        emailData.body = bodyElement.innerText;
    }

    // Get all links in the email
    let linkElements = document.querySelectorAll("a");
    emailData.links = Array.from(linkElements).map(link => link.href);

    // Get all image URLs
    let imageElements = document.querySelectorAll("img");
    emailData.images = Array.from(imageElements).map(img => img.src);

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