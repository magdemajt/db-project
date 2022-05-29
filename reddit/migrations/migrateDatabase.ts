import db from '../dbConnection';
import { opendir, readFile } from 'fs/promises';
import { QueryResult } from 'pg';

// load sql files from current directory
async function readSQL() {
  const sqlFiles: string[] = [];

  const dir = await opendir(__dirname);
  for await (const dirent of dir) {
    if (dirent.isFile() && dirent.name.endsWith('.sql')) {
      const file = await readFile(`${__dirname}/${dirent.name}`, 'utf8');
      sqlFiles.push(file);
    }
  }

  return sqlFiles;

}


async function migrateDatabase() {
  const c = await db.connect();
  const sqls = await readSQL();

  // execute sql files
  const last = await sqls.reduce((promise, sql) => {
    return promise.then((res) => {
      console.log(res);
      return c.query(sql);
    });
  }, Promise.resolve({}));

  console.log(last);
}

migrateDatabase().then(() => {
  console.log('Database migrated');
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
