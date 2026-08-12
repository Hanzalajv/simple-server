import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/run-node', async (req, res) => {
  const { prompt, input } = req.body;
  
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: `You are a decision node in a workflow. Answer ONLY "YES" or "NO".` },
        { role: 'user', content: `Context: "${input}". Question: ${prompt}` }
      ],
      temperature: 0,
      max_tokens: 5,
    });

    const answer = completion.choices[0].message.content.trim().toUpperCase();
    const result = answer.includes('YES') ? 'YES' : 'NO';
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running at http://localhost:${process.env.PORT || 3001}`);
});