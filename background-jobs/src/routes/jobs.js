import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createJob, getJob } from '../models/database.js';

const router = Router();

// POST /jobs — Create a new background job
router.post('/', (req, res) => {
  const { input } = req.body;
  
  if (!input) {
    return res.status(400).json({ error: 'Input is required' });
  }
  
  const jobId = uuidv4();
  createJob(jobId, input);
  
  console.log(`[API] Created job ${jobId} for input: "${input}"`);
  
  res.status(202).json({
    job_id: jobId,
    status: 'pending',
    message: 'Job accepted. Check /jobs/:id for status.',
    check_url: `/jobs/${jobId}`
  });
});

// POST /jobs/report — Create a PDF report job
router.post('/report', (req, res) => {
  const jobId = uuidv4();
  createJob(jobId, 'PDF report generation', 'report');

  console.log(`[API] Created report job ${jobId}`);

  res.status(202).json({
    job_id: jobId,
    status: 'pending',
    message: 'Report generation started. Check /jobs/:id for status.',
    check_url: `/jobs/${jobId}`
  });
});

// GET /jobs/:id — Check job status
router.get('/:id', (req, res) => {
  const job = getJob(req.params.id);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  
  const response = {
    job_id: job.id,
    status: job.status,
    input: job.input,
    created_at: job.created_at,
    updated_at: job.updated_at
  };
  
  if (job.status === 'completed') {
    response.result = job.result;
  }
  
  if (job.status === 'failed') {
    response.error = job.error;
    response.retries = job.retries;
  }
  
  res.json(response);
});

export default router;