# SQLite CRUD API

Express API with SQLite database. Same endpoints as the in-memory version.
Only the storage layer changed.

## Why SQLite

Zero installation. Single file database. Perfect for learning how APIs
connect to databases without managing a separate server.

## Database file

tasks.db (created automatically on first run, gitignored)

## Run

npm install
node server.js

## Endpoints

GET    /tasks       List all tasks
GET    /tasks/:id   Get one task
POST   /tasks       Create a task (JSON: {"title": "..."})
PUT    /tasks/:id   Update a task (JSON: {"title": "...", "done": true})
DELETE /tasks/:id   Delete a task

## SQL Queries Run Manually (Stage 4)

SELECT * FROM tasks;
SELECT * FROM tasks WHERE done = 1;
SELECT COUNT(*) FROM tasks;
UPDATE tasks SET done = 1;
DELETE FROM tasks WHERE done = 1;