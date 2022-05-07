import { Pool } from 'pg';

// create postgres connection
const db = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
});

export default db;
