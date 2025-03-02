require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const API_KEY = process.env.GEMINI_API_KEY || "API_KEY_NOT_FOUND";

console.log("Loaded API Key:", API_KEY ? "✅ API Key Found" : "❌ API Key NOT Found!");
app.get("/api/get-key", (req, res) => {
    if (!API_KEY) {
        return res.status(500).json({ error: "API Key not found" });
    }
    res.json({ apiKey: API_KEY });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
