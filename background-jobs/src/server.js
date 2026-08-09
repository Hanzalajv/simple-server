import express from 'express';
import { initDatabase } from './models/database.js';
import { startWorker } from './services/worker.js';
import jobsRouter from './routes/jobs.js';
import { existsSync } from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize database
initDatabase();

// Start background worker
startWorker();
app.get('/reports/:filename', (req, res) => {
  const filePath = join(process.cwd(), 'reports', req.params.filename);
  if (!existsSync(filePath)) return res.status(404).json({ error: 'Report not found' });
  res.sendFile(filePath);
});
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