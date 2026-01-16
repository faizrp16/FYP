const express = require("express");
const path = require("path");
const app = express();

// Serve static files from the public directory
app.use(express.static("public"));
app.use(express.json());

// Serve index.html at root
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ FinanceAI server running on http://localhost:${PORT}`);
    console.log(`📊 Watchlist, Calendar & Insights Dashboard ready!`);
});

