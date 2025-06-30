const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from /dist
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route: send index.html for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
