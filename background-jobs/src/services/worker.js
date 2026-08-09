import Database from 'better-sqlite3';
import { getJob, updateJob } from '../models/database.js';

// Simulate a slow AI operation (5 seconds)
async function slowAIProcess(input) {
  console.log(`  [WORKER] Starting slow process for: "${input}"`);
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  if (Math.random() < 0.1) {
    throw new Error('AI service temporarily unavailable');
  }
  
  const result = `Processed: ${input.toUpperCase()} (simulated AI response)`;
  console.log(`  [WORKER] Completed: ${result}`);
  return result;
}

async function processJob(job) {
  console.log(`\n[WORKER] Processing job: ${job.id}`);
  console.log(`  Input: ${job.input}`);
  console.log(`  Attempt: ${job.retries + 1}/${job.max_retries}`);
  
  try {
    updateJob(job.id, { status: 'processing' });
    const result = await slowAIProcess(job.input);
    updateJob(job.id, { status: 'completed', result, retries: job.retries + 1 });
    console.log(`  [WORKER] Job ${job.id} completed successfully`);
  } catch (err) {
    console.error(`  [WORKER] Job ${job.id} failed: ${err.message}`);
    const newRetries = job.retries + 1;
    
    if (newRetries >= job.max_retries) {
      updateJob(job.id, { status: 'failed', error: err.message, retries: newRetries });
      console.error(`  [WORKER] Job ${job.id} permanently failed after ${newRetries} attempts`);
    } else {
      updateJob(job.id, { status: 'pending', error: err.message, retries: newRetries });
      console.log(`  [WORKER] Job ${job.id} will retry (${newRetries}/${job.max_retries})`);
    }
  }
}

function processPendingJobs() {
  const db = new Database('jobs.db');
  const pendingJobs = db.prepare("SELECT * FROM jobs WHERE status = 'pending' LIMIT 1").all();
  db.close();
  
  if (pendingJobs.length > 0) {
    processJob(pendingJobs[0]);
  }
}

export function startWorker() {
  console.log('[WORKER] Background worker started. Polling for jobs every 2 seconds...');
  processPendingJobs();
  setInterval(processPendingJobs, 2000);
}