# PhishNetAI

This phishing detector is a chrome extenstion that helps users detech potential phising gmails. It exracts gmail content, anazlyzes it using gemini api, and provides an assessment of a phising risk

📌 Features
✔ Scan Gmails for Phishing – Extracts gmail sender, subject, body, links, and images.
✔ AI-Powered Analysis – Uses Google Gemini API to detect phishing attempts.
✔ Real-Time Alerts – Provides a phishing likelihood score and warning symbols.
✔ Security Awareness – Displays a link to a phishing awareness site while scanning.
✔ Simple & Fast – Lightweight and easy to use with a single click.

Installation:

1. git clone https://github.com/yourusername/PhishNetAI.git
2. directory : cd PhishNetAI
3. Load as an Unpacked Chrome Extension:
Open Google Chrome and go to chrome://extensions/
Enable Developer Mode (toggle in the top-right corner).
Click "Load unpacked" and select the PhishNetAI/extension folder.
4. Load backend: cd PhishNetAI/server
5. npm install
6. node index.js
7. Create .env in server:
GEMINI_API_KEY=YOUR_API_KEY

How it works:

1. Open a gmail
2. Find the extension icon (next to search bar)
3. Click on "gmail phishing scanner"
4. Now click on the scan button 