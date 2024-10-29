// server.js
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Handle all routes by sending the SPA HTML
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
