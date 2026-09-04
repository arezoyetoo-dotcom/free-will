const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5404;

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🧠 Free Will Interactive Lecture running at http://localhost:${PORT}`);
  console.log(`🌐 Accessible on WSL network at port ${PORT}`);
});
