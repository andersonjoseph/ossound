import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../src/db';

migrate(db, { migrationsFolder: 'migrations' })
  .then(() => {
    console.log('migrations ran succesfully');
  })
  .catch((err) => {
    console.log('an error has occured:', err);
  });
