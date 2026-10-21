import dotenv from "dotenv"

dotenv.config();

//Postgres DB connection
export const DB_USER = process.env.DB_USER ?? 'postgres';
export const DB_HOST = process.env.DB_HOST ?? 'localhost';
export const DB_DATABASE = process.env.DB_DATABASE ?? 'measure-manager';
export const DB_PASSWORD = process.env.DB_PASSWORD ?? 'ADMIN';
export const DB_PORT = Number(process.env.DB_PORT) || 5432;

//ENV Settings
export const ENVIRONMENT = process.env.ENVIRONMENT ?? 'LOCAL';

//Express Server Port
export const EXPRESS_PORT = process.env.EXPRESS_PORT ?? 3010;

//Cors Config
export const CORS_ORIGIN = process.env.CORS_ORIGIN;
export const CORS_CREDENTIALS = process.env.CORS_CREDENTIALS ?? "true";

//kpi-manager-connectors-image
export const KPIM_INDICATORS_MANAGER_API_URL = process.env.KPIM_INDICATORS_MANAGER_API_URL ?? 'http://localhost:3009';

//Vault settings
export const VAULT_URL = process.env.VAULT_URL ?? 'https://vault.dev.dev-digital-enabler.eng.it'
export const VAULT_ROLE = process.env.VAULT_ROLE ?? '';
export const VAULT_K8S_JWT = process.env.VAULT_K8S_JWT ?? "";
//Tenant ID
export const TENANT_ID = process.env.TENANT_ID ?? 'dev';
export const KPIM_ADMIN_ROLE_KEYCLOAK = process.env.KPIM_ADMIN_ROLE_KEYCLOAK ?? "kpim-admin"
