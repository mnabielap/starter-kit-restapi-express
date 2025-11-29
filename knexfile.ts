import type { Knex } from 'knex';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const client = process.env.DB_CLIENT === 'sqlite' ? 'sqlite3' : 'pg';
const useSSL = process.env.DB_SSL !== 'false';

const config: Knex.Config = {
  client: client,
  connection:
    client === 'sqlite3'
      ? {
          filename: process.env.DB_FILE || './database.sqlite',
        }
      : {
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          port: Number(process.env.DB_PORT) || 5432,
          ssl: useSSL ? { rejectUnauthorized: false } : undefined,
        },
  useNullAsDefault: true,
  migrations: {
    directory: path.join(__dirname, 'src/database/migrations'),
    extension: 'ts',
  },
  seeds: {
    directory: path.join(__dirname, 'src/database/seeds'),
    extension: 'ts',
  },
};

export default config;