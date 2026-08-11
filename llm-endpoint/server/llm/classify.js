import Groq from 'groq-sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const PROMPT = readFileSync(join(process.cwd(), 'prompts', 'classify-v1.md'), 'utf-8');

export async function classify(text) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: PROMPT },
      { role: 'user', content: text }
    ],
    temperature: 0,
  });

  const responseText = completion.choices[0].message.content;
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in response');

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    category: parsed.category,
    urgency: parsed.urgency,
    confidence: parsed.confidence || 0.5,
    reason: parsed.reason
  };
}