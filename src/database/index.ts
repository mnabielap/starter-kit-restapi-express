import knex from 'knex';
import { config } from '../config/config';

const dbConfig = {
  client: config.db.client === 'sqlite' ? 'sqlite3' : 'pg',
  connection: config.db.connection,
  useNullAsDefault: true, // Required for SQLite
  migrations: {
    directory: './src/database/migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './src/database/seeds',
  },
};

export const db = knex(dbConfig);