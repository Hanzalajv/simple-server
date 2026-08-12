# AI Workflow Builder

A visual workflow system where each node is an AI decision step returning YES or NO. The execution follows the matching edge, creating dynamic branching logic.

## How It Works

1. Add decision nodes on the React Flow canvas
2. Set a prompt for each node (a YES/NO question)
3. Connect nodes with edges
4. Toggle each edge between YES and NO
5. Type an input and click Run Workflow
6. Each node sends its prompt to Groq, gets YES or NO, and follows the matching edge

## Tech Stack

- React + React Flow (frontend)
- Express (backend)
- Groq API (llama-3.3-70b-versatile)
- nodemon (dev server)

## Run Locally

```bash
npm install
npm run dev:server
npm run dev