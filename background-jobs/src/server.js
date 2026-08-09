import express from 'express';
import { initDatabase } from './models/database.js';
import { startWorker } from './services/worker.js';
import jobsRouter from './routes/jobs.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize database
initDatabase();

// Start background worker
startWorker();

// Routes
app.use('/jobs', jobsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', worker: 'running' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('POST /jobs to create a job');
  console.log('GET /jobs/:id to check status');
});