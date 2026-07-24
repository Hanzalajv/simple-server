const express = require('express');
const initSqlJs = require('sql.js');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

let db;
const DB_FILE = 'tasks.db';

async function initDatabase() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(DB_FILE)) {
    const buffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER DEFAULT 0
    )
  `);
  
  const result = db.exec('SELECT COUNT(*) AS count FROM tasks');
  const count = result[0].values[0][0];
  
  if (count === 0) {
    db.run('INSERT INTO tasks (title, done) VALUES (?, ?)', ['Learn SQLite', 0]);
    db.run('INSERT INTO tasks (title, done) VALUES (?, ?)', ['Build a CRUD API', 0]);
    db.run('INSERT INTO tasks (title, done) VALUES (?, ?)', ['Read the documentation', 0]);
    saveDatabase();
  }
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_FILE, buffer);
}

function taskToObject(row) {
  return {
    id: row[0],
    title: row[1],
    done: row[2] === 1
  };
}

function getTaskById(id) {
  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
  stmt.bind([id]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return { id: row.id, title: row.title, done: row.done === 1 };
  }
  stmt.free();
  return null;
}

function getAllTasks() {
  const result = db.exec('SELECT * FROM tasks');
  if (!result.length) return [];
  return result[0].values.map(taskToObject);
}

// Stage 1: Read
app.get('/tasks', (req, res) => {
  res.json(getAllTasks());
});

app.get('/tasks/:id', (req, res) => {
  const task = getTaskById(Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

// Stage 2: Create
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  db.run('INSERT INTO tasks (title) VALUES (?)', [title]);
  saveDatabase();
  const all = getAllTasks();
  const task = all[all.length - 1];
  res.status(201).json(task);
});

// Stage 3: Update
app.put('/tasks/:id', (req, res) => {
  const task = getTaskById(Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const { title, done } = req.body;
  const newTitle = title !== undefined ? title : task.title;
  const newDone = done !== undefined ? (done ? 1 : 0) : (task.done ? 1 : 0);
  db.run('UPDATE tasks SET title = ?, done = ? WHERE id = ?', [newTitle, newDone, Number(req.params.id)]);
  saveDatabase();
  res.json(getTaskById(Number(req.params.id)));
});

// Stage 3: Delete
app.delete('/tasks/:id', (req, res) => {
  const task = getTaskById(Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  db.run('DELETE FROM tasks WHERE id = ?', [Number(req.params.id)]);
  saveDatabase();
  res.status(204).send();
});

initDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});