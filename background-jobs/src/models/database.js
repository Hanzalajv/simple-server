import Database from 'better-sqlite3';

const db = new Database('jobs.db');
db.pragma('journal_mode = WAL');
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      type TEXT DEFAULT 'process',
      status TEXT DEFAULT 'pending',
      input TEXT,
      result TEXT,
      error TEXT,
      retries INTEGER DEFAULT 0,
      max_retries INTEGER DEFAULT 3,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

export function createJob(id, input, type = 'process') {
  const stmt = db.prepare('INSERT INTO jobs (id, input, type, status) VALUES (?, ?, ?, ?)');
  stmt.run(id, input, type, 'pending');
}

export function getJob(id) {
  return db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
}

export function updateJob(id, updates) {
  const fields = [];
  const values = [];
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  values.push(id);
  db.prepare(`UPDATE jobs SET ${fields.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...values);
}