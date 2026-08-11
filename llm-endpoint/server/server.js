import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { classify } from './llm/classify.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/classify', async (req, res) => {
  try {
    const result = await classify(req.body.text);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running at http://localhost:${process.env.PORT || 3001}`);
});