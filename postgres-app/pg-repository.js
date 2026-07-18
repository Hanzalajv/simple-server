// Postgres storage (what we are switching to)
const { Pool } = require('pg');

class PgRepository {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async getAll() {
    const result = await this.pool.query('SELECT * FROM items ORDER BY id');
    return result.rows;
  }

  async add(name) {
    const result = await this.pool.query(
      'INSERT INTO items (name) VALUES ($1) RETURNING *',
      [name]
    );
    return result.rows[0];
  }
}

module.exports = PgRepository;