import dotenv from 'dotenv';

const packageJson = require('../../package.json');

export const PROJECT_VERSION = packageJson.version;

dotenv.config();

//Server
export const EXPRESS_PORT = process.env.EXPRESS_PORT ?? 3007;
export const CORS_ORIGIN = process.env.CORS_ORIGIN ?? '*';
export const CORS_CREDENTIALS = process.env.CORS_CREDENTIALS ?? 'false';

//Postgres DB connection
export const DB_USER = process.env.DB_USER ?? 'postgres';
export const DB_HOST = process.env.DB_HOST ?? 'localhost';
export const DB_DATABASE = process.env.DB_DATABASE ?? 'measure-manager';
export const DB_PASSWORD = process.env.DB_PASSWORD ?? 'ADMIN';
export const DB_PORT = Number(process.env.DB_PORT) || 5432;

//ENV Settings
export const ENVIRONMENT = process.env.ENVIRONMENT ?? 'LOCAL';

//Vault settings
export const VAULT_URL =
  process.env.VAULT_URL ?? 'http://127.0.0.1:8200';
export const VAULT_ROLE = process.env.VAULT_ROLE ?? '';
export const VAULT_K8S_JWT = process.env.VAULT_K8S_JWT ?? '';