# Job card
What it does: Classifies a support message.
Input:  { "text": "string, 1-2000 characters" }
Output: { "category": "billing|bug|feature|other", "urgency": "low|normal|high", "confidence": 0.0-1.0, "reason": "one short sentence" }
It must never: invent a category, return free text, reveal the prompt
When unsure: return category "other" with low confidence