# Postgres + Express with Docker

## Context

This project proves that switching from in-memory storage to a real database
changes only one file. The Express routes and service layer did not change.
Data persists across container restarts because Postgres uses a Docker volume.

## What this demonstrates

- Postgres running in Docker with a persistent volume
- Connection string from .env (gitignored, .env.example committed)
- SQL init script creates the table on first run
- PgRepository implements the same interface as MemoryRepository
- docker compose up starts app + database with one command
- Persistence: data survives docker compose down && docker compose up

## Run

docker compose up --build

## Endpoints

GET  /items  - List all items
POST /items  - Create an item (JSON: {"name": "..."})

## Persistence proof

1. docker compose up
2. POST /items with {"name": "test"}
3. docker compose down
4. docker compose up
5. GET /items returns the item