import { Pool } from 'pg';

// create postgres connection
/* const db = new Pool({
  user: 'postgres',
  host: 'db',
  database: 'reddit',
  password: 'postgres',
  port: 5432,
});
*/
const db = new Pool({
  connectionString: 'postgres://iapjikgy:5M4e8o53dG-7h6s_k7FU-HNH9iBKI4M4@abul.db.elephantsql.com/iapjikgy'
 });
// Ewentualnie port 5432 jak nie zadziała


export default db;
