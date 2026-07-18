const express = require('express');
const app = express();
const port = 3000;

// Swap this one line to change storage
// const repository = require('./memory-repository');
const repository = require('./pg-repository');

const repo = new repository();

app.use(express.json());

app.get('/items', async (req, res) => {
  const items = await repo.getAll();
  res.json(items);
});

app.post('/items', async (req, res) => {
  const item = await repo.add(req.body.name);
  res.status(201).json(item);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});