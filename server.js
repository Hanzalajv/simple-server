const express = require('express');
const app = express();
const port = 3000;

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello world' });
});

app.get('/status', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});