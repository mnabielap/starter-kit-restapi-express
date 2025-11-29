import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']),
  PORT: z.coerce.number().default(5000),
  
  // Database
  DB_CLIENT: z.enum(['sqlite', 'pg']).default('sqlite'),
  DB_FILE: z.string().optional().default('./database.sqlite'),
  DB_HOST: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_NAME: z.string().optional(),
  DB_PORT: z.coerce.number().default(5432),
  DB_SSL: z.enum(['true', 'false']).optional().default('true'),
  
  // JWT
  JWT_SECRET: z.string().min(1, 'JWT Secret is required'),
  JWT_ACCESS_EXPIRATION_MINUTES: z.coerce.number().default(30),
  JWT_REFRESH_EXPIRATION_DAYS: z.coerce.number().default(30),
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: z.coerce.number().default(10),
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: z.coerce.number().default(10),
}).refine((data) => {
  if (data.DB_CLIENT === 'pg') {
    return !!(data.DB_HOST && data.DB_USER && data.DB_NAME);
  }
  return true;
}, {
  message: "DB_HOST, DB_USER, and DB_NAME are required when DB_CLIENT is 'pg'",
  path: ['DB_CLIENT'],
});

const envVars = envVarsSchema.parse(process.env);
const useSSL = envVars.DB_SSL !== 'false';

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  db: {
    client: envVars.DB_CLIENT,
    connection: envVars.DB_CLIENT === 'sqlite' 
      ? { filename: envVars.DB_FILE } 
      : {
          host: envVars.DB_HOST,
          user: envVars.DB_USER,
          password: envVars.DB_PASSWORD,
          database: envVars.DB_NAME,
          port: envVars.DB_PORT,
          ssl: useSSL ? { rejectUnauthorized: false } : undefined,
        },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
};